"use client";

import React, { useState, useMemo, memo, useCallback } from "react";
import { ProcessedMovieData } from "@/services/dataProcessor";
import { getPosterUrl, getLetterboxdUrl } from "@/services/tmdb";
import { useDebounce } from "@/hooks/useDebounce";
import LazyImage from "./LazyImage";

interface MovieDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  country: string;
  movies: ProcessedMovieData[];
  onEditMovie?: (movie: ProcessedMovieData) => void;
  isEditMode?: boolean;
}

interface MovieItemProps {
  movie: ProcessedMovieData;
  index: number;
  isEditMode: boolean;
  onEditMovie?: (movie: ProcessedMovieData) => void;
}

// Memoized movie item component for better performance
const MovieItem = memo(
  ({ movie, index, isEditMode, onEditMovie }: MovieItemProps) => {
    const handleEdit = useCallback(() => {
      if (onEditMovie) {
        onEditMovie(movie);
      }
    }, [movie, onEditMovie]);

    return (
      <div
        key={`${movie.name}-${movie.year}-${index}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
      >
        {/* Movie Poster */}
        <div className="w-12 h-16 bg-gray-600 rounded flex-shrink-0 overflow-hidden relative">
          {getPosterUrl(movie.posterPath, "w154") ? (
            <LazyImage
              src={getPosterUrl(movie.posterPath, "w154")!}
              alt={movie.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="flex-1 min-w-0">
          {!isEditMode && movie.tmdbId ? (
            <a
              href={getLetterboxdUrl(movie.tmdbId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium text-sm truncate hover:text-blue-400 transition-colors block"
            >
              {movie.name}
            </a>
          ) : (
            <h3 className="text-white font-medium text-sm truncate">
              {movie.name}
            </h3>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{movie.year}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {movie.productionCountries.join(", ")}
          </div>
        </div>

        {/* Edit Button */}
        {isEditMode && onEditMovie && (
          <button
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-400 transition-all p-1"
            title="Edit country"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

MovieItem.displayName = "MovieItem";

const MovieDrawer = memo(function MovieDrawer({
  isOpen,
  onClose,
  country,
  movies,
  onEditMovie,
  isEditMode = false,
}: MovieDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "year">("name");

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter((movie) =>
      movie.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "year":
          return b.year - a.year;
        default:
          return 0;
      }
    });

    return filtered;
  }, [movies, debouncedSearchTerm, sortBy]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-96 bg-gray-800 shadow-2xl z-50 transform transition-transform flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">{country}</h2>
            <button
              onClick={onClose}
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

          <p className="text-gray-300 text-sm mb-3">
            {movies.length} movie{movies.length !== 1 ? "s" : ""}
            {isEditMode && " • Edit mode active"}
          </p>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "year")}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="year">Sort by Year</option>
          </select>
        </div>

        {/* Movie List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredAndSortedMovies.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchTerm ? "No movies match your search" : "No movies found"}
            </div>
          ) : (
            <div className="p-2">
              {filteredAndSortedMovies.map((movie, index) => (
                <MovieItem
                  key={`${movie.name}-${movie.year}-${index}`}
                  movie={movie}
                  index={index}
                  isEditMode={isEditMode}
                  onEditMovie={onEditMovie}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredAndSortedMovies.length > 0 && (
          <div className="border-t border-gray-700 p-3 text-center text-xs text-gray-400 flex-shrink-0">
            Showing {filteredAndSortedMovies.length} of {movies.length} movies
          </div>
        )}
      </div>
    </>
  );
});

export default MovieDrawer;
