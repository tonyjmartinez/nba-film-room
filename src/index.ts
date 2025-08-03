import express from 'express';
import puppeteer from 'puppeteer';

interface Game {
  gameId: string;
  slug: string;
}

interface GameResult extends Game {
  videos: string[];
}

async function getGames(date: string): Promise<Game[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(`https://www.nba.com/games?date=${date}`, { waitUntil: 'domcontentloaded' });
    const content = await page.content();
    
    const matches = Array.from(content.matchAll(/href="\/game\/([^"]+)"/g)) as RegExpMatchArray[];
    const slugs = Array.from(new Set(matches.map(m => m[1])));
    const games: Game[] = slugs.map(slug => {
      const idMatch = slug.match(/(\d{10})$/);
      return { slug, gameId: idMatch ? idMatch[1] : slug };
    });
    return games;
  } finally {
    await browser.close();
  }
}

async function getPlayByPlayVideos(slug: string): Promise<string[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(`https://www.nba.com/game/${slug}/play-by-play`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const content = await page.content();
    
    const videoMatches = Array.from(content.matchAll(/https:[^"']+\.mp4/g)) as RegExpMatchArray[];
    const videos = Array.from(new Set(videoMatches.map(m => m[0])));
    return videos;
  } finally {
    await browser.close();
  }
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
