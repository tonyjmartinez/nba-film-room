# NBA Film Room

This project exposes a small Express API that uses Playwright to scrape NBA.com for game play-by-play videos.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the API:
   ```bash
   npm start -- --date=2025-02-05
   ```
3. Query the API:
   ```bash
   curl 'http://localhost:3000/api/videos?date=2025-02-05'
   ```

The API responds with all games for the specified date and any play-by-play video links found for each game.
