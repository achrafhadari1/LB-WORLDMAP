"use client";

import { useState, useEffect } from "react";
import WorldMap from "@/components/WorldMap";
import MovieEditor from "@/components/MovieEditor";
import AddMovieModal from "@/components/AddMovieModal";
import { MdModeEditOutline } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdOutlineSaveAlt } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { MdOutlineFileUpload } from "react-icons/md";
import FileUpload from "@/components/FileUpload";
import {
  DataProcessor,
  CountryData,
  ProcessedMovieData,
  ProcessingProgress,
  MovieData,
} from "@/services/dataProcessor";
import { DataStorage, UserEdit } from "@/services/dataStorage";

export default function Home() {
  const [countryData, setCountryData] = useState<Map<
    string,
    CountryData
  > | null>(null);
  const [allMovies, setAllMovies] = useState<ProcessedMovieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ProcessedMovieData | null>(
    null
  );
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const processMoviesData = async (movies: MovieData[], fileName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const processor = new DataProcessor((progress) => {
        setProgress(progress);
      });

      const { countryData: processedCountryData, allMovies: processedMovies } =
        await processor.processMovieData(movies);

      // Apply any existing edits
      const edits = DataStorage.loadEdits();
      const customMovies = DataStorage.loadCustomMovies();

      // Combine original movies with custom movies
      const combinedMovies = [...processedMovies, ...customMovies];

      const { countryData: finalCountryData, updatedMovies } = applyEditsToData(
        processedCountryData,
        edits,
        combinedMovies
      );

      setCountryData(finalCountryData);
      setAllMovies(updatedMovies);
      setHasUploadedFile(true);
      setFileName(fileName);
      setIsLoading(false);
      setProgress(null);

      // Save to storage
      DataStorage.saveData({
        movies: updatedMovies,
        countryData: finalCountryData,
        lastUpdated: new Date().toISOString(),
        originalFileName: fileName,
      });
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Failed to process movie data. Please try again.");
      setIsLoading(false);
      setProgress(null);
    }
  };

  const applyEditsToData = (
    originalData: Map<string, CountryData>,
    edits: UserEdit[],
    allMovies: ProcessedMovieData[]
  ): {
    countryData: Map<string, CountryData>;
    updatedMovies: ProcessedMovieData[];
  } => {
    const newData = new Map<string, CountryData>();

    // Create a copy of all movies to avoid mutating the original
    const moviesCopy = allMovies.map((movie) => ({
      ...movie,
      productionCountries: [...movie.productionCountries],
    }));

    // Process each movie with edits applied
    moviesCopy.forEach((movie) => {
      const movieId = `${movie.name}-${movie.year}`;
      const edit = edits.find((e) => e.movieId === movieId);

      let targetCountry = movie.productionCountries[0];
      if (edit) {
        targetCountry = edit.newCountry;
        // Update the movie's production countries to reflect the edit
        movie.productionCountries = [
          edit.newCountry,
          ...movie.productionCountries.slice(1),
        ];
      }

      if (targetCountry) {
        if (!newData.has(targetCountry)) {
          newData.set(targetCountry, { movieCount: 0, movies: [] });
        }

        const countryData = newData.get(targetCountry)!;
        countryData.movieCount++;
        countryData.movies.push(movie);
      }
    });

    // If no movies were processed, return the original data
    if (newData.size === 0 && originalData.size > 0) {
      console.warn(
        "No movies found after applying edits, returning original data"
      );
      return { countryData: originalData, updatedMovies: moviesCopy };
    }

    return { countryData: newData, updatedMovies: moviesCopy };
  };

  useEffect(() => {
    // Check if we have stored data first
    const storedData = DataStorage.loadData();
    if (storedData && storedData.movies.length > 0) {
      console.log("Loading stored data:", storedData.movies.length, "movies");
      setCountryData(storedData.countryData);
      setAllMovies(storedData.movies);
      setFileName(storedData.originalFileName || "");
      setHasUploadedFile(true);
      setIsLoading(false);
      return;
    }

    // Try to load default CSV if no stored data
    const loadDefaultData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/data/movies.csv");
        if (!response.ok) {
          throw new Error("Failed to load default data");
        }

        const csvText = await response.text();
        const Papa = (await import("papaparse")).default;

        const result = Papa.parse<MovieData>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            const headerMap: { [key: string]: string } = {
              Date: "date",
              Name: "name",
              Year: "year",
              "Letterboxd URI": "letterboxdUri",
              "Production Countries": "productionCountries",
            };
            return headerMap[header] || header;
          },
        });

        if (result.errors.length > 0) {
          console.warn("CSV parsing warnings:", result.errors);
        }

        await processMoviesData(result.data, "movies.csv");
      } catch (err) {
        console.error("Error loading default data:", err);
        setError(
          "Failed to load default movie data. Please upload your own CSV file."
        );
        setIsLoading(false);
        setProgress(null);
      }
    };

    loadDefaultData();
  }, []);

  const handleFileUpload = (movies: MovieData[], fileName: string) => {
    processMoviesData(movies, fileName);
  };

  const handleFileError = (error: string) => {
    setError(error);
    setIsLoading(false);
    setProgress(null);
  };

  const handleEditMovie = (movie: ProcessedMovieData) => {
    setEditingMovie(movie);
  };

  const handleSaveMovieEdit = (
    movie: ProcessedMovieData,
    newCountry: string
  ) => {
    const movieId = `${movie.name}-${movie.year}`;
    const edit: UserEdit = {
      movieId,
      originalCountry: movie.productionCountries[0],
      newCountry,
      timestamp: new Date().toISOString(),
    };

    DataStorage.saveEdit(edit);

    // Reapply all edits to rebuild the map
    const edits = DataStorage.loadEdits();

    // Make sure we have movies to work with
    if (allMovies.length === 0) {
      console.error("No movies available to apply edits to");
      return;
    }

    const { countryData: updatedCountryData, updatedMovies } = applyEditsToData(
      countryData || new Map(),
      edits,
      allMovies
    );

    setCountryData(updatedCountryData);
    setAllMovies(updatedMovies);
    setEditingMovie(null);

    // Update storage with the updated country data
    DataStorage.saveData({
      movies: updatedMovies,
      countryData: updatedCountryData,
      lastUpdated: new Date().toISOString(),
      originalFileName: fileName,
    });
  };

  const handleAddMovie = (movie: ProcessedMovieData) => {
    DataStorage.saveCustomMovie(movie);

    // Add to current movies and rebuild country data
    const moviesWithNew = [...allMovies, movie];
    const edits = DataStorage.loadEdits();
    const { countryData: updatedCountryData, updatedMovies } = applyEditsToData(
      countryData || new Map(),
      edits,
      moviesWithNew
    );

    setAllMovies(updatedMovies);
    setCountryData(updatedCountryData);
    setShowAddMovie(false);

    // Update storage
    DataStorage.saveData({
      movies: updatedMovies,
      countryData: updatedCountryData,
      lastUpdated: new Date().toISOString(),
      originalFileName: fileName,
    });
  };

  const handleExportCSV = () => {
    const csv = DataStorage.exportAsCSV(allMovies);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `letterboxd-worldmap-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This will remove your uploaded file and all edits."
      )
    ) {
      DataStorage.clearAllData();
      setCountryData(null);
      setAllMovies([]);
      setHasUploadedFile(false);
      setIsEditMode(false);
      setFileName("");
    }
  };

  // Recovery function for corrupted data
  const handleRecoverData = () => {
    console.log("Attempting to recover data...");

    // Try to load just the movies without country data
    const storedData = DataStorage.loadData();
    if (storedData && storedData.movies.length > 0) {
      console.log("Found movies in storage, rebuilding country data...");

      // Rebuild country data from movies
      const newCountryData = new Map<string, CountryData>();

      storedData.movies.forEach((movie) => {
        const country = movie.productionCountries[0];
        if (country) {
          if (!newCountryData.has(country)) {
            newCountryData.set(country, { movieCount: 0, movies: [] });
          }
          const countryData = newCountryData.get(country)!;
          countryData.movieCount++;
          countryData.movies.push(movie);
        }
      });

      // Apply any edits
      const edits = DataStorage.loadEdits();
      const { countryData: finalCountryData, updatedMovies } = applyEditsToData(
        newCountryData,
        edits,
        storedData.movies
      );

      setCountryData(finalCountryData);
      setAllMovies(updatedMovies);
      setHasUploadedFile(true);

      // Save the recovered data
      DataStorage.saveData({
        movies: updatedMovies,
        countryData: finalCountryData,
        lastUpdated: new Date().toISOString(),
        originalFileName: storedData.originalFileName || "",
      });

      console.log("Data recovered successfully");
    } else {
      console.log("No recoverable data found");
      handleClearData();
    }
  };

  // Show upload interface if no file has been uploaded
  if (!hasUploadedFile && !isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Letterboxd World Map
            </h1>
            <p className="text-gray-300">
              Upload your Letterboxd CSV export to visualize your movies by
              country
            </p>
          </div>

          <FileUpload
            onFileLoaded={handleFileUpload}
            onError={handleFileError}
            isLoading={isLoading}
          />

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Export your data from{" "}
              <a
                href="https://letterboxd.com/settings/data/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Letterboxd Settings
              </a>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Check if we have data but it's corrupted (empty movies but has uploaded file)
  if (hasUploadedFile && allMovies.length === 0 && !isLoading && !error) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">
            Data Recovery Needed
          </h1>
          <p className="text-gray-300 mb-4">
            Your data appears to be corrupted. We can try to recover it or you
            can start fresh.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRecoverData}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Try Recovery
            </button>
            <button
              onClick={() => setHasUploadedFile(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Upload New File
            </button>
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => setError(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
            <button
              onClick={handleRecoverData}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Try Recovery
            </button>
            <button
              onClick={() => {
                setError(null);
                setHasUploadedFile(false);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Upload New File
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {progress ? `Processing ${progress.currentMovie}...` : "Loading..."}
          </h1>
          {progress && (
            <div className="max-w-md mx-auto">
              <div className="bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.processed / progress.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-gray-300 text-sm">
                {progress.processed} / {progress.total} movies processed
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-900">
      {/* Minimalistic header */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          {fileName || "Default Data"} • {allMovies.length} movies
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isEditMode
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          >
            {isEditMode ? <MdDone /> : <MdModeEditOutline />}
          </button>

          <button
            onClick={() => setShowAddMovie(true)}
            className="px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Add movie"
          >
            <MdAddCircle />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Export CSV"
          >
            <MdOutlineSaveAlt />
          </button>

          <button
            onClick={() => setHasUploadedFile(false)}
            className="px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Upload new file"
          >
            <MdOutlineFileUpload />
          </button>

          <button
            onClick={handleClearData}
            className="px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Clear all data"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-20 bg-blue-600/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          Edit Mode Active • Click countries to view and edit movies
        </div>
      )}

      {/* World Map */}
      <WorldMap
        countryData={countryData}
        isEditMode={isEditMode}
        onEditMovie={handleEditMovie}
      />

      {/* Movie Editor Modal */}
      {editingMovie && (
        <MovieEditor
          movie={editingMovie}
          onSave={handleSaveMovieEdit}
          onCancel={() => setEditingMovie(null)}
        />
      )}

      {/* Add Movie Modal */}
      {showAddMovie && (
        <AddMovieModal
          onSave={handleAddMovie}
          onCancel={() => setShowAddMovie(false)}
        />
      )}
    </main>
  );
}
