# Chess Think Time Analyzer

Scans your Chess.com game history and surfaces the moves you spent the most time thinking about.

## Setup

You need [Node.js](https://nodejs.org) installed (v18+ recommended).

```bash
# 1. Install dependencies (one time only)
npm install

# 2. Run the app
npm start
```

## Usage

1. Enter your Chess.com username
2. Select a time class (Bullet / Blitz / Rapid / All)
3. Optionally check specific time controls (3+0, 5+0, etc.)
4. Optionally set a date range
5. Set how many results you want (default 20, max 50)
6. Click **Analyze Games**

The app scans your archives month by month and updates the results live as it goes.
"View game" buttons open the game in your browser to the move in question.

## Notes

- Analysis is done entirely on your machine — no data is sent anywhere except Chess.com's public API
- Large histories (5+ years) can take a few minutes depending on game count
- Use the **Stop** button to halt early and keep whatever was found so far
- Daily chess games are included but clock times may be absent for older games
