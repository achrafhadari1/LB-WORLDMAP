# Movie World Map

An interactive choropleth world map visualization showing movies watched by production country, inspired by Letterboxd's movie map feature.

## Features

- **Interactive World Map**: Built with react-simple-maps and D3.js
- **Choropleth Visualization**: Countries colored based on movie count
- **TMDB Integration**: Fetches movie details and production countries from The Movie Database API
- **Hover Tooltips**: Shows movie count and list of films when hovering over countries
- **Dark Theme**: Matches the aesthetic of the reference design
- **Responsive Design**: Works on different screen sizes

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-simple-maps** - SVG-based world map components
- **D3.js** - Data visualization and color scaling
- **TMDB API** - Movie data source
- **Papa Parse** - CSV parsing

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your watched movies CSV file to `public/watched.csv` with columns:
   - Date
   - Name (movie title)
   - Year
   - Letterboxd URI
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## CSV Format

The application expects a CSV file with the following columns:
```csv
Date,Name,Year,Letterboxd URI
2023-01-15,The Godfather,1972,https://letterboxd.com/film/the-godfather/
2023-01-16,Pulp Fiction,1994,https://letterboxd.com/film/pulp-fiction/
```

## Configuration

- **Movie Limit**: Currently limited to 25 movies for demo purposes. Remove the `.slice(0, 25)` in `src/lib/movieData.ts` to process all movies.
- **TMDB API Key**: The API key is included for demo purposes. For production use, add your own key to environment variables.

## How It Works

1. **Data Loading**: Reads the CSV file containing watched movies
2. **API Integration**: For each movie, queries TMDB API to get production countries
3. **Data Processing**: Aggregates movies by country and counts
4. **Visualization**: Maps country codes to ISO-3166-1 alpha-3 format for the world map
5. **Choropleth Coloring**: Uses D3 linear scale to color countries from gray (0 movies) to green (max movies)
6. **Interactivity**: Hover tooltips show detailed information

## Customization

- **Colors**: Modify the color scale in `src/components/WorldMap.tsx`
- **Movie Processing**: Adjust batch size and rate limiting in `src/lib/movieData.ts`
- **Styling**: Update Tailwind classes for different themes
- **Map Data**: Uses Natural Earth 110m resolution world map data

## Performance Notes

- API calls are batched to avoid rate limiting
- Processing is limited to 25 movies by default for faster loading
- Country code conversion handles various ISO formats
- Caching could be added for production use

## License

MIT License - feel free to use and modify for your own projects.
