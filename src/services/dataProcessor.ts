import Papa from "papaparse";
import { searchMovie, getMovieDetails } from "./tmdb";

export interface MovieData {
  date: string;
  name: string;
  year: number;
  letterboxdUri: string;
}

export interface ProcessedMovieData extends MovieData {
  tmdbId?: number;
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
  ): Promise<Map<string, CountryData>> {
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
            productionCountries: movieDetails.production_countries.map(
              (c) => c.iso_3166_1
            ),
          };

          processedMovies.push(processedMovie);

          const primary = this.getOriginOrPrimaryCountry(movieDetails);

          if (primary) {
            const mappedCountry = this.mapCountryCode(primary.iso_3166_1);

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

    return countryDataMap;
  }

  async processAllData(): Promise<Map<string, CountryData>> {
    const movies = await this.loadCSVData();
    return await this.processMovieData(movies);
  }

  private getOriginOrPrimaryCountry(movieDetails: any) {
    if (movieDetails.origin_country && movieDetails.origin_country.length > 0) {
      return {
        iso_3166_1: movieDetails.origin_country[0],
        name: movieDetails.origin_country[0],
      };
    }

    return this.getPrimaryProductionCountry(movieDetails.production_countries);
  }

  private getPrimaryProductionCountry(
    countries: Array<{ iso_3166_1: string; name: string }>
  ): { iso_3166_1: string; name: string } | null {
    if (countries.length === 0) return null;

    for (const country of countries) {
      if (country.iso_3166_1 === "IR") return country;
      if (country.iso_3166_1 === "MA") return country;
      if (country.iso_3166_1 === "SU" || country.iso_3166_1 === "RU")
        return country;
      if (country.iso_3166_1 === "JP") return country;
      if (country.iso_3166_1 === "KR") return country;
      if (country.iso_3166_1 === "CN") return country;
      if (country.iso_3166_1 === "IN") return country;
    }

    return countries[0];
  }

  private mapCountryCode(code: string): string {
    const mappings: Record<string, string> = {
      SU: "RU",
      CS: "CZ",
      YU: "RS",
      DD: "DE",
    };

    return mappings[code] || code;
  }
}
