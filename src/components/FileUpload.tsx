"use client";

import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { MovieData } from "@/services/dataProcessor";

interface FileUploadProps {
  onFileLoaded: (movies: MovieData[], fileName: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function FileUpload({
  onFileLoaded,
  onError,
  isLoading = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateCSVData = (data: any[]): MovieData[] => {
    const requiredColumns = ["Date", "Name", "Year", "Letterboxd URI"];

    if (data.length === 0) {
      throw new Error("CSV file is empty");
    }

    const firstRow = data[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    return data
      .map((row, index) => {
        const year = parseInt(row.Year);
        if (isNaN(year)) {
          throw new Error(`Invalid year in row ${index + 1}: ${row.Year}`);
        }

        const movieData: any = {
          date: row.Date || "",
          name: row.Name || "",
          year: year,
          letterboxdUri: row["Letterboxd URI"] || "",
        };

        // If Production Countries column exists, include it
        if (row["Production Countries"]) {
          movieData.productionCountries = row["Production Countries"]
            .split(";")
            .map((country: string) => country.trim())
            .filter((country: string) => country.length > 0);
        }

        return movieData;
      })
      .filter((movie) => movie.name.trim() !== ""); // Filter out empty movie names
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError("Please select a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            const errorMessages = results.errors
              .map((err) => err.message)
              .join(", ");
            throw new Error(`CSV parsing errors: ${errorMessages}`);
          }

          const movies = validateCSVData(results.data);

          if (movies.length === 0) {
            throw new Error("No valid movies found in the CSV file");
          }

          onFileLoaded(movies, file.name);
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : "Failed to process CSV file"
          );
        }
      },
      error: (error) => {
        onError(`Failed to read CSV file: ${error.message}`);
      },
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-blue-400 bg-blue-50 bg-opacity-10"
            : "border-gray-600 hover:border-gray-500"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading ? openFileDialog : undefined}
      >
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              {isLoading ? "Processing CSV..." : "Upload Letterboxd CSV"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {isLoading
                ? "Please wait while we process your file"
                : "Drag and drop your CSV file here, or click to browse"}
            </p>

            {!isLoading && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Export your data from Letterboxd</p>
                <p>• Must include: Date, Name, Year, Letterboxd URI columns</p>
                <p>• Maximum file size: 10MB</p>
              </div>
            )}
          </div>

          {/* Button */}
          {!isLoading && (
            <button
              onClick={openFileDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Choose File
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          How to export from Letterboxd:
        </h4>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Go to your Letterboxd profile settings</li>
          <li>Click on "DATA"</li>
          <li>Click "Export your data"</li>
          <li>Download the "watched.csv" file</li>
          <li>Upload it here to visualize your movie map</li>
        </ol>
      </div>
    </div>
  );
}
