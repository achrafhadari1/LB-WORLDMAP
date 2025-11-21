"use client";

import React, { useState, useEffect } from "react";
import { ProcessedMovieData } from "@/services/dataProcessor";
import countriesData from "@/data/countries.json";

interface MovieEditorProps {
  movie: ProcessedMovieData;
  onSave: (movie: ProcessedMovieData, newCountry: string) => void;
  onCancel: () => void;
}

interface Country {
  code: string;
  name: string;
}

const ALL_COUNTRIES: Country[] = countriesData;

export default function MovieEditor({
  movie,
  onSave,
  onCancel,
}: MovieEditorProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    movie.productionCountries[0] || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomCountry, setIsCustomCountry] = useState(false);
  const [customCountryCode, setCustomCountryCode] = useState("");

  const filteredCountries = ALL_COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const countryToSave = isCustomCountry ? customCountryCode : selectedCountry;
    if (countryToSave) {
      onSave(movie, countryToSave);
    }
  };

  const currentCountryName = ALL_COUNTRIES.find(
    (c) => c.code === selectedCountry
  )?.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Edit Movie</h2>
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
          <div className="text-gray-300 text-sm">
            <div className="font-medium">{movie.name}</div>
            <div className="text-gray-400">
              {movie.year} •{" "}
              {movie.date
                ? new Date(movie.date).toLocaleDateString()
                : "Unknown"}
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Current Country */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Current Country</div>
            <div className="text-white text-sm">
              {movie.productionCountries.length > 0 ? (
                currentCountryName || selectedCountry
              ) : (
                <span className="text-gray-400">No country assigned</span>
              )}
            </div>
          </div>

          {/* Country Selection */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">New Country</div>

            {/* Toggle */}
            <div className="flex gap-1 mb-3 bg-gray-800 p-1 rounded-md">
              <button
                onClick={() => setIsCustomCountry(false)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  !isCustomCountry
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Select
              </button>
              <button
                onClick={() => setIsCustomCountry(true)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  isCustomCountry
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Custom
              </button>
            </div>

            {!isCustomCountry ? (
              <>
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-white rounded text-sm border border-gray-700 focus:border-gray-600 focus:outline-none mb-2"
                />

                {/* Country List */}
                <div className="max-h-40 overflow-y-auto bg-gray-800 rounded border border-gray-700">
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
              </>
            ) : (
              <input
                type="text"
                placeholder="Country code (e.g., US)"
                value={customCountryCode}
                onChange={(e) =>
                  setCustomCountryCode(e.target.value.toUpperCase())
                }
                className="w-full p-2 bg-gray-800 text-white rounded text-sm border border-gray-700 focus:border-gray-600 focus:outline-none"
                maxLength={2}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!selectedCountry && !customCountryCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Save
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
