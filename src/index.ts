import express from 'express';
import { chromium } from 'playwright';

interface Game {
  gameId: string;
  slug: string;
}

interface GameResult extends Game {
  videos: string[];
}

async function getGames(date: string): Promise<Game[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  await page.goto(`https://www.nba.com/games?date=${date}`, { waitUntil: 'domcontentloaded' });
  const content = await page.content();
  await browser.close();

  const matches = Array.from(content.matchAll(/href="\/game\/([^"]+)"/g));
  const slugs = Array.from(new Set(matches.map(m => m[1])));
  const games: Game[] = slugs.map(slug => {
    const idMatch = slug.match(/(\d{10})$/);
    return { slug, gameId: idMatch ? idMatch[1] : slug };
  });
  return games;
}

async function getPlayByPlayVideos(slug: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  await page.goto(`https://www.nba.com/game/${slug}/play-by-play`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const content = await page.content();
  await browser.close();
  const videoMatches = Array.from(content.matchAll(/https:[^"']+\.mp4/g));
  const videos = Array.from(new Set(videoMatches.map(m => m[0])));
  return videos;
}

async function scrape(date: string): Promise<GameResult[]> {
  const games = await getGames(date);
  const results: GameResult[] = [];
  for (const game of games) {
    try {
      const videos = await getPlayByPlayVideos(game.slug);
      results.push({ ...game, videos });
    } catch (err) {
      results.push({ ...game, videos: [] });
    }
  }
  return results;
}

const app = express();
app.get('/api/videos', async (req, res) => {
  const date = req.query.date as string | undefined;
  if (!date) {
    return res.status(400).json({ error: 'date query parameter required' });
  }
  try {
    const data = await scrape(date);
    res.json({ date, games: data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
