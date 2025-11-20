'use client';

import { useState, useEffect } from 'react';
import WorldMap from '@/components/WorldMap';
import { DataProcessor, CountryData, ProcessingProgress } from '@/services/dataProcessor';

export default function Home() {
  const [countryData, setCountryData] = useState<Map<string, CountryData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const processor = new DataProcessor((progress) => {
          setProgress(progress);
        });
        
        const data = await processor.processAllData();
        setCountryData(data);
        setIsLoading(false);
        setProgress(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load movie data. Please try again.');
        setIsLoading(false);
        setProgress(null);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-8">Loading Movie Data</h1>
          {progress && (
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm">
                  Processing {progress.processed} of {progress.total} movies
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Current: {progress.currentMovie}
                </p>
              </div>
            </div>
          )}
          <p className="text-gray-400 text-sm">
            Fetching production countries from TMDB API...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <WorldMap countryData={countryData} />
    </main>
  );
}
