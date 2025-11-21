"use client";

import React from "react";
import { ProcessedMovieData } from "@/services/dataProcessor";

interface MovieTooltipProps {
  country: string;
  movieCount: number;
  movies: ProcessedMovieData[];
  x: number;
  y: number;
  onClose: () => void;
  onEditMovie?: (movie: ProcessedMovieData) => void;
  isEditMode?: boolean;
  isPinned?: boolean;
}

export default function MovieTooltip({
  country,
  movieCount,
  movies,
  x,
  y,
  onClose,
  onEditMovie,
  isEditMode = false,
  isPinned = false,
}: MovieTooltipProps) {
  const maxDisplayMovies = 8;
  const displayMovies = movies.slice(0, maxDisplayMovies);
  const remainingCount = Math.max(0, movies.length - maxDisplayMovies);

  const isRightSide = x > window.innerWidth / 2;
  const isBottomHalf = y > window.innerHeight / 2;

  return (
    <div
      className={`fixed z-50 bg-gray-800 text-white rounded-xl shadow-2xl border max-w-md min-w-80 ${
        isPinned ? "border-blue-500" : "border-gray-600"
      }`}
      style={{
        left: isRightSide ? x - 320 : x + 12,
        top: isBottomHalf ? y - 200 : y - 10,
        pointerEvents: "auto",
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{country}</h3>
            <p className="text-green-100 text-sm">
              {movieCount} movie{movieCount !== 1 ? "s" : ""} watched
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-green-100 hover:text-white transition-colors p-1 rounded-full hover:bg-green-700"
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
      </div>

      {/* Movies List */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          {displayMovies.map((movie, index) => (
            <div
              key={`${movie.name}-${movie.year}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">
                  {movie.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{movie.year}</span>
                  {movie.date && (
                    <>
                      <span>•</span>
                      <span>
                        Watched {new Date(movie.date).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
                {movie.productionCountries.length > 1 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Co-production: {movie.productionCountries.join(", ")}
                  </div>
                )}
              </div>

              {isEditMode && onEditMovie && (
                <button
                  onClick={() => onEditMovie(movie)}
                  className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                  title="Edit movie"
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
          ))}
        </div>

        {remainingCount > 0 && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-center">
            <span className="text-gray-400 text-sm">
              +{remainingCount} more movie{remainingCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {movies.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No movies found for this country
          </div>
        )}
      </div>

      {/* Footer with additional info */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400 text-center">
          {isPinned ? (
            <>
              Click outside to close •{" "}
              {isEditMode ? "Edit mode active" : "Pinned tooltip"}
            </>
          ) : (
            <>
              Hover to view • Click country to pin •{" "}
              {isEditMode ? "Edit mode active" : ""}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
