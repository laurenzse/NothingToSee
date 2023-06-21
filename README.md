# Minimalist Soundscape Experience

Motivated by my own need for an appropriate working soundscape, I created this web application that plays natural soundscapes with minimal user interaction. The core principle was to make the app act as an „acoustic window" rather than a traditional media player.

Using the current sunrise and sunset times, the app determines the currently appropriate time setting, night, dawn, and day, and selects a soundscape from a curated list each time it is launched. The app has a minimalist interface with only one interaction: muting and unmuting the soundscape - in line with the "window" metaphor mentioned above. When an audio stream ends, the app picks a new one automatically. To get a different soundscape, the user reloads the page.

For more background information, please view this [post](https://laurenzseidel.com/projects/serene-sounds) on my personal web page.

The app is currently hosted on [Vercel](https://vercel.com) and available [online](https://nothing-to-see-phi.vercel.app) for you to try out.

## Development

First, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the running page.

## Adding new soundscapes

You can add new soundscapes by appending YouTube links and the appropriate category to the `public/soundscapes.csv` file. The category is encoded as an integer, where 1 is night, 2 is dawn, and 3 is day.

If you want to batch categorize YouTube videos, you may find the [YouTube Video Categorizer](https://github.com/laurenzse/YouTubeVideoCategorizer) repository helpful.

Feel free to create pull requests for new soundscapes (or other changes and features).
