"use client";

import React, { useState, useEffect } from "react";
import { ProcessedMovieData } from "@/services/dataProcessor";
import countriesData from "@/data/countries.json";

interface AddMovieModalProps {
  onSave: (movie: ProcessedMovieData) => void;
  onCancel: () => void;
}

interface Country {
  code: string;
  name: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

interface TMDBCountry {
  iso_3166_1: string;
  name: string;
}

const ALL_COUNTRIES: Country[] = countriesData;

export default function AddMovieModal({
  onSave,
  onCancel,
}: AddMovieModalProps) {
  const [movieName, setMovieName] = useState("");
  const [movieYear, setMovieYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [watchedDate, setWatchedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [letterboxdUri, setLetterboxdUri] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // TMDB search state
  const [tmdbResults, setTmdbResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTmdbMovie, setSelectedTmdbMovie] = useState<TMDBMovie | null>(
    null
  );
  const [tmdbMovieId, setTmdbMovieId] = useState<number | null>(null);
  const [posterPath, setPosterPath] = useState<string | null>(null);

  const filteredCountries = ALL_COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TMDB search functionality
  const searchTMDB = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setTmdbResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${
          process.env.NEXT_PUBLIC_TMDB_API_KEY
        }&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );

      if (response.ok) {
        const data = await response.json();
        setTmdbResults(data.results.slice(0, 5)); // Show top 5 results
      }
    } catch (error) {
      console.error("TMDB search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get movie details including production countries
  const getMovieDetails = async (movieId: number) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
      );

      if (response.ok) {
        const movieDetails = await response.json();
        return movieDetails;
      }
    } catch (error) {
      console.error("TMDB movie details error:", error);
    }
    return null;
  };

  // Handle TMDB movie selection
  const handleTmdbMovieSelect = async (movie: TMDBMovie) => {
    setSelectedTmdbMovie(movie);
    setMovieName(movie.title);
    setMovieYear(movie.release_date ? movie.release_date.split("-")[0] : "");
    setTmdbMovieId(movie.id);
    setPosterPath(movie.poster_path);

    // Get detailed movie info including production countries
    const movieDetails = await getMovieDetails(movie.id);
    if (
      movieDetails &&
      movieDetails.production_countries &&
      movieDetails.production_countries.length > 0
    ) {
      // Set the first production country as default
      setSelectedCountry(movieDetails.production_countries[0].iso_3166_1);
    }

    // Generate Letterboxd URI
    setLetterboxdUri(`https://letterboxd.com/tmdb/${movie.id}/`);

    // Clear search results
    setTmdbResults([]);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (movieName && !selectedTmdbMovie) {
        searchTMDB(movieName);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [movieName, selectedTmdbMovie]);

  // Clear TMDB selection when movie name changes
  const handleMovieNameChange = (value: string) => {
    setMovieName(value);
    if (selectedTmdbMovie && value !== selectedTmdbMovie.title) {
      setSelectedTmdbMovie(null);
      setTmdbMovieId(null);
      setPosterPath(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!movieName.trim()) {
      newErrors.movieName = "Movie name is required";
    }

    if (!movieYear.trim()) {
      newErrors.movieYear = "Year is required";
    } else {
      const year = parseInt(movieYear);
      if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
        newErrors.movieYear = "Please enter a valid year";
      }
    }

    if (!selectedCountry) {
      newErrors.selectedCountry = "Please select a country";
    }

    if (!watchedDate) {
      newErrors.watchedDate = "Watched date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newMovie: ProcessedMovieData = {
      name: movieName.trim(),
      year: parseInt(movieYear),
      date: watchedDate,
      letterboxdUri:
        letterboxdUri.trim() ||
        `https://letterboxd.com/film/${movieName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")}/`,
      productionCountries: [selectedCountry],
      tmdbId: tmdbMovieId || undefined,
      posterPath: posterPath || undefined,
    };

    onSave(newMovie);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Add Movie</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Add a movie manually to your collection
          </p>
        </div>

        <div className="p-4 space-y-3">
          {/* Movie Name */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Movie Name *</div>
            <input
              type="text"
              value={movieName}
              onChange={(e) => handleMovieNameChange(e.target.value)}
              placeholder="Enter movie title to search TMDB"
              className={`w-full p-2 bg-gray-800 text-white rounded text-sm border ${
                errors.movieName ? "border-red-500" : "border-gray-700"
              } focus:border-gray-600 focus:outline-none`}
            />
            {errors.movieName && (
              <p className="text-red-400 text-xs mt-1">{errors.movieName}</p>
            )}

            {/* TMDB Search Results */}
            {isSearching && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                Searching TMDB...
              </div>
            )}

            {tmdbResults.length > 0 && (
              <div className="mt-2 bg-gray-800 rounded border border-gray-700 max-h-48 overflow-y-auto">
                <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
                  Select from TMDB results:
                </div>
                {tmdbResults.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleTmdbMovieSelect(movie)}
                    className="w-full p-2 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-8 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {movie.title}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {movie.release_date
                            ? movie.release_date.split("-")[0]
                            : "Unknown year"}
                        </div>
                        {movie.overview && (
                          <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {movie.overview.length > 100
                              ? `${movie.overview.substring(0, 100)}...`
                              : movie.overview}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedTmdbMovie && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-700 rounded text-xs">
                <div className="text-green-400">✓ Selected from TMDB:</div>
                <div className="text-white">
                  {selectedTmdbMovie.title} (
                  {selectedTmdbMovie.release_date?.split("-")[0]})
                </div>
              </div>
            )}
          </div>

          {/* Year & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Year *</div>
              <input
                type="number"
                value={movieYear}
                onChange={(e) => setMovieYear(e.target.value)}
                placeholder="2023"
                min="1888"
                max={currentYear + 5}
                className={`w-full p-2 bg-gray-800 text-white rounded text-sm border ${
                  errors.movieYear ? "border-red-500" : "border-gray-700"
                } focus:border-gray-600 focus:outline-none`}
              />
              {errors.movieYear && (
                <p className="text-red-400 text-xs mt-1">{errors.movieYear}</p>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Date Watched *</div>
              <input
                type="date"
                value={watchedDate}
                onChange={(e) => setWatchedDate(e.target.value)}
                className={`w-full p-2 bg-gray-800 text-white rounded text-sm border ${
                  errors.watchedDate ? "border-red-500" : "border-gray-700"
                } focus:border-gray-600 focus:outline-none`}
              />
              {errors.watchedDate && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.watchedDate}
                </p>
              )}
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <div className="text-xs text-gray-400 mb-1">
              Production Country *
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded text-sm border border-gray-700 focus:border-gray-600 focus:outline-none mb-2"
            />

            {/* Country List */}
            <div
              className={`max-h-32 overflow-y-auto bg-gray-800 rounded border ${
                errors.selectedCountry ? "border-red-500" : "border-gray-700"
              }`}
            >
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`w-full text-left p-2 hover:bg-gray-700 transition-colors text-sm ${
                    selectedCountry === country.code
                      ? "bg-gray-700 text-white"
                      : "text-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-500">
                      {country.code}
                    </span>
                  </div>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-2 text-gray-400 text-center text-sm">
                  No countries found
                </div>
              )}
            </div>
            {errors.selectedCountry && (
              <p className="text-red-400 text-xs mt-1">
                {errors.selectedCountry}
              </p>
            )}
          </div>

          {/* Letterboxd URI (Optional) */}
          <div>
            <div className="text-xs text-gray-400 mb-1">
              Letterboxd URL (Optional)
            </div>
            <input
              type="url"
              value={letterboxdUri}
              onChange={(e) => setLetterboxdUri(e.target.value)}
              placeholder="https://letterboxd.com/film/movie-name/"
              className="w-full p-2 bg-gray-800 text-white rounded text-sm border border-gray-700 focus:border-gray-600 focus:outline-none"
            />
            <p className="text-gray-500 text-xs mt-1">
              Auto-generated if empty
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Add Movie
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
