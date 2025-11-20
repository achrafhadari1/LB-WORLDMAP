const TMDB_API_KEY = '716d704f44b5a3eff07788f36a04aed0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  production_countries: ProductionCountry[];
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SearchResult {
  id: number;
  title: string;
  release_date: string;
}

export async function searchMovie(title: string, year?: number): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
    });
    
    if (year) {
      params.append('year', year.toString());
    }

    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movie:', error);
    return [];
  }
}

export async function getMovieDetails(movieId: number): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

export async function getMovieByTitleAndYear(title: string, year: number): Promise<Movie | null> {
  try {
    // First search for the movie
    const searchResults = await searchMovie(title, year);
    
    if (searchResults.length === 0) {
      console.warn(`No results found for "${title}" (${year})`);
      return null;
    }
    
    // Find the best match (exact year match preferred)
    let bestMatch = searchResults[0];
    for (const result of searchResults) {
      const resultYear = new Date(result.release_date).getFullYear();
      if (resultYear === year) {
        bestMatch = result;
        break;
      }
    }
    
    // Get detailed information including production countries
    return await getMovieDetails(bestMatch.id);
  } catch (error) {
    console.error(`Error fetching movie "${title}" (${year}):`, error);
    return null;
  }
}