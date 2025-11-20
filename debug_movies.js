const TMDB_API_KEY = '716d704f44b5a3eff07788f36a04aed0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function searchMovie(title, year) {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
    });

    if (year) {
      params.append('year', year.toString());
    }

    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return [];
  }
}

async function getMovieDetails(movieId) {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });

    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
}

async function debugMovie(title, year) {
  console.log(`\n=== Debugging: ${title} (${year}) ===`);
  
  const searchResults = await searchMovie(title, year);
  console.log(`Search results: ${searchResults.length} found`);
  
  if (searchResults.length > 0) {
    const firstResult = searchResults[0];
    console.log(`First result: "${firstResult.title}" (${firstResult.release_date})`);
    
    const details = await getMovieDetails(firstResult.id);
    console.log(`Production countries:`, details.production_countries);
  } else {
    console.log('No results found');
  }
}

async function main() {
  // Test the problematic movies you mentioned
  await debugMovie('Volubilis', 2017); // Should be Morocco
  await debugMovie('Taste of Cherry', 1997); // Should be Iran, not France
  await debugMovie('Stalker', 1979); // USSR film, should be Russia
  
  // Let's also test some other search variations
  console.log('\n=== Testing search variations ===');
  await debugMovie('Mirror', 1975); // Try without "The"
  await debugMovie('Zerkalo', 1975); // Russian title
}

main().catch(console.error);