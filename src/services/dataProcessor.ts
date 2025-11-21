import Papa from "papaparse";
import { searchMovie, getMovieDetails } from "./tmdb";
import { mapCountryCode } from "../utils/countryMapping";

export interface MovieData {
  date: string;
  name: string;
  year: number;
  letterboxdUri: string;
}

export interface ProcessedMovieData extends MovieData {
  tmdbId?: number;
  posterPath?: string;
  productionCountries: string[];
}

export interface CountryData {
  movieCount: number;
  movies: ProcessedMovieData[];
}

export interface ProcessingProgress {
  processed: number;
  total: number;
  currentMovie: string;
}

export class DataProcessor {
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress;
  }

  async loadCSVData(): Promise<MovieData[]> {
    try {
      const response = await fetch("/watched.csv");
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const movies: MovieData[] = results.data.map((row: any) => ({
              date: row.Date,
              name: row.Name,
              year: parseInt(row.Year),
              letterboxdUri: row["Letterboxd URI"],
            }));
            resolve(movies);
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error("Error loading CSV data:", error);
      throw error;
    }
  }

  async processMovieData(
    movies: MovieData[]
  ): Promise<{
    countryData: Map<string, CountryData>;
    allMovies: ProcessedMovieData[];
  }> {
    const countryDataMap = new Map<string, CountryData>();
    const processedMovies: ProcessedMovieData[] = [];

    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];

      if (this.onProgress) {
        this.onProgress({
          processed: i,
          total: movies.length,
          currentMovie: movie.name,
        });
      }

      try {
        const searchResults = await searchMovie(movie.name, movie.year);

        if (searchResults.length > 0) {
          const tmdbMovie = searchResults[0];
          const movieDetails = await getMovieDetails(tmdbMovie.id);

          const processedMovie: ProcessedMovieData = {
            ...movie,
            tmdbId: tmdbMovie.id,
            posterPath: movieDetails.poster_path,
            productionCountries: movieDetails.production_countries.map((c) =>
              mapCountryCode(c.iso_3166_1)
            ),
          };

          processedMovies.push(processedMovie);

          const primary = this.getOriginOrPrimaryCountry(movieDetails);

          if (primary) {
            const mappedCountry = mapCountryCode(primary.iso_3166_1);

            if (!countryDataMap.has(mappedCountry)) {
              countryDataMap.set(mappedCountry, {
                movieCount: 0,
                movies: [],
              });
            }

            const countryData = countryDataMap.get(mappedCountry)!;
            countryData.movieCount++;
            countryData.movies.push(processedMovie);
          }
        } else {
          const processedMovie: ProcessedMovieData = {
            ...movie,
            productionCountries: [],
          };
          processedMovies.push(processedMovie);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing movie "${movie.name}":`, error);

        const processedMovie: ProcessedMovieData = {
          ...movie,
          productionCountries: [],
        };
        processedMovies.push(processedMovie);
      }
    }

    if (this.onProgress) {
      this.onProgress({
        processed: movies.length,
        total: movies.length,
        currentMovie: "Complete",
      });
    }

    return { countryData: countryDataMap, allMovies: processedMovies };
  }

  async processAllData(): Promise<Map<string, CountryData>> {
    const movies = await this.loadCSVData();
    const result = await this.processMovieData(movies);
    return result.countryData;
  }

  private getOriginOrPrimaryCountry(movieDetails: any) {
    if (movieDetails.origin_country && movieDetails.origin_country.length > 0) {
      const mappedCountry = mapCountryCode(movieDetails.origin_country[0]);
      return {
        iso_3166_1: mappedCountry,
        name: mappedCountry,
      };
    }

    return this.getPrimaryProductionCountry(movieDetails.production_countries);
  }

  private getPrimaryProductionCountry(
    countries: Array<{ iso_3166_1: string; name: string }>
  ): { iso_3166_1: string; name: string } | null {
    if (countries.length === 0) return null;

    // Priority countries for selection
    const priorityCountries = [
      "IR",
      "MA",
      "SU",
      "RU",
      "JP",
      "KR",
      "CN",
      "HK",
      "IN",
    ];

    for (const country of countries) {
      const mappedCode = mapCountryCode(country.iso_3166_1);
      if (
        priorityCountries.includes(country.iso_3166_1) ||
        priorityCountries.includes(mappedCode)
      ) {
        return {
          iso_3166_1: mappedCode,
          name: mappedCode,
        };
      }
    }

    // If no priority country found, return the first one with mapping applied
    const firstCountry = countries[0];
    const mappedCode = mapCountryCode(firstCountry.iso_3166_1);
    return {
      iso_3166_1: mappedCode,
      name: mappedCode,
    };
  }
}
