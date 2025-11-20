const TMDB_API_KEY = '716d704f44b5a3eff07788f36a04aed0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBSearchResult {
  id: number;
  title: string;
  release_date: string;
  overview: string;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  production_companies: Array<{
    id: number;
    name: string;
    origin_country: string;
  }>;
}

export async function searchMovie(title: string, year?: number): Promise<TMDBSearchResult[]> {
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
    console.error(`Error searching for movie "${title}":`, error);
    return [];
  }
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });

    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
}