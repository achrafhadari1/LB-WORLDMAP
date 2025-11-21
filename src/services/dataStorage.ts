import { ProcessedMovieData, CountryData } from "./dataProcessor";

export interface StoredData {
  movies: ProcessedMovieData[];
  countryData: Map<string, CountryData>;
  lastUpdated: string;
  originalFileName?: string;
}

export interface UserEdit {
  movieId: string; // combination of name + year for uniqueness
  originalCountry?: string;
  newCountry: string;
  timestamp: string;
}

export class DataStorage {
  private static readonly STORAGE_KEY = "lb-worldmap-data";
  private static readonly EDITS_KEY = "lb-worldmap-edits";
  private static readonly CUSTOM_MOVIES_KEY = "lb-worldmap-custom-movies";

  // Check if IndexedDB is available
  private static isIndexedDBAvailable(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  // Save processed data to localStorage
  static saveData(data: StoredData): void {
    try {
      const serializedData = {
        ...data,
        countryData: Array.from(data.countryData.entries()),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedData));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }

  // Load processed data from localStorage
  static loadData(): StoredData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        countryData: new Map(parsed.countryData),
      };
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return null;
    }
  }

  // Save user edits
  static saveEdit(edit: UserEdit): void {
    try {
      const edits = this.loadEdits();
      const existingEditIndex = edits.findIndex(
        (e) => e.movieId === edit.movieId
      );

      if (existingEditIndex >= 0) {
        edits[existingEditIndex] = edit;
      } else {
        edits.push(edit);
      }

      localStorage.setItem(this.EDITS_KEY, JSON.stringify(edits));
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  }

  // Load user edits
  static loadEdits(): UserEdit[] {
    try {
      const stored = localStorage.getItem(this.EDITS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading edits:", error);
      return [];
    }
  }

  // Save custom movies added by user
  static saveCustomMovie(movie: ProcessedMovieData): void {
    try {
      const customMovies = this.loadCustomMovies();
      customMovies.push(movie);
      localStorage.setItem(
        this.CUSTOM_MOVIES_KEY,
        JSON.stringify(customMovies)
      );
    } catch (error) {
      console.error("Error saving custom movie:", error);
    }
  }

  // Load custom movies
  static loadCustomMovies(): ProcessedMovieData[] {
    try {
      const stored = localStorage.getItem(this.CUSTOM_MOVIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading custom movies:", error);
      return [];
    }
  }

  // Clear all stored data
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.EDITS_KEY);
      localStorage.removeItem(this.CUSTOM_MOVIES_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }

  // Export data as JSON
  static exportData(): string {
    const data = this.loadData();
    const edits = this.loadEdits();
    const customMovies = this.loadCustomMovies();

    return JSON.stringify(
      {
        data,
        edits,
        customMovies,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // Export data as CSV (Letterboxd format)
  static exportAsCSV(movies: ProcessedMovieData[]): string {
    const headers = [
      "Date",
      "Name",
      "Year",
      "Letterboxd URI",
      "Production Countries",
    ];

    // Load edits to apply them to the export
    const edits = this.loadEdits();

    const rows = movies.map((movie) => {
      const movieId = `${movie.name}-${movie.year}`;
      const edit = edits.find((e) => e.movieId === movieId);

      // Use edited production countries if available
      let productionCountries = [...movie.productionCountries];
      if (edit) {
        productionCountries = [
          edit.newCountry,
          ...movie.productionCountries.slice(1),
        ];
      }

      return [
        movie.date || "",
        `"${movie.name.replace(/"/g, '""')}"`, // Escape quotes in movie names
        movie.year.toString(),
        movie.letterboxdUri || "",
        productionCountries.join(";"),
      ];
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Rough estimate of available space (5MB typical limit)
      const available = 5 * 1024 * 1024 - used;

      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }
}
