# NBA Film Room

This project exposes a small Express API that uses Playwright to scrape NBA.com for game play-by-play videos.

## Backend Usage

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

## Simple Frontend

This repository includes a small HTML file under `public/index.html` that can call the API directly from your browser. Its contents are shown below.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NBA Film Room</title>
</head>
<body>
  <input type="date" id="date" />
  <button id="load">Load Videos</button>
  <pre id="output"></pre>
  <script>
    document.getElementById('load').onclick = async () => {
      const date = document.getElementById('date').value;
      if (!date) return;
      const res = await fetch(`/api/videos?date=${date}`);
      document.getElementById('output').textContent =
        JSON.stringify(await res.json(), null, 2);
    };
  </script>
</body>
</html>
```

Start the API and then open `public/index.html` in a browser to view the scraped results.

## Deploying from your phone

The quickest mobile-friendly option is to use [Replit](https://replit.com/):

1. Open Replit on your phone and create a new Node.js project.
2. Upload this repository or import it from GitHub.
3. Run `npm install` to install dependencies.
4. Start the server with `npm start`. Replit will provide a public URL that you can visit from your phone.

This approach lets you deploy and test the API without needing a laptop.
