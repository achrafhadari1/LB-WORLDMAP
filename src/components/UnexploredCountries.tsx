"use client";

import React, { useState, useMemo } from "react";
import { CountryData } from "@/services/dataProcessor";
import countriesData from "@/data/countries.json";

interface UnexploredCountriesProps {
  countryData: Map<string, CountryData> | null;
  isVisible: boolean;
  onClose: () => void;
}

interface Country {
  code: string;
  name: string;
}

export default function UnexploredCountries({
  countryData,
  isVisible,
  onClose,
}: UnexploredCountriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "continent">(
    "alphabetical"
  );

  // Get list of countries with movies (using 2-letter codes)
  const countriesWithMovies = useMemo(() => {
    if (!countryData) return new Set<string>();
    return new Set(Array.from(countryData.keys()));
  }, [countryData]);

  // Filter countries that have no movies
  const unexploredCountries = useMemo(() => {
    const allCountries: Country[] = countriesData;

    return allCountries.filter(
      (country) => !countriesWithMovies.has(country.code)
    );
  }, [countriesWithMovies]);

  // Filter and sort countries based on search and sort preferences
  const filteredAndSortedCountries = useMemo(() => {
    let filtered = unexploredCountries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Add continent sorting later if needed

    return filtered;
  }, [unexploredCountries, searchTerm, sortBy]);

  // Get continent for a country (simplified mapping)
  const getContinent = (countryCode: string): string => {
    const continentMap: Record<string, string> = {
      // Europe
      AD: "Europe",
      AL: "Europe",
      AT: "Europe",
      BA: "Europe",
      BE: "Europe",
      BG: "Europe",
      BY: "Europe",
      CH: "Europe",
      CZ: "Europe",
      DE: "Europe",
      DK: "Europe",
      EE: "Europe",
      ES: "Europe",
      FI: "Europe",
      FR: "Europe",
      GB: "Europe",
      GR: "Europe",
      HR: "Europe",
      HU: "Europe",
      IE: "Europe",
      IS: "Europe",
      IT: "Europe",
      LI: "Europe",
      LT: "Europe",
      LU: "Europe",
      LV: "Europe",
      MC: "Europe",
      MD: "Europe",
      ME: "Europe",
      MK: "Europe",
      MT: "Europe",
      NL: "Europe",
      NO: "Europe",
      PL: "Europe",
      PT: "Europe",
      RO: "Europe",
      RS: "Europe",
      RU: "Europe",
      SE: "Europe",
      SI: "Europe",
      SK: "Europe",
      SM: "Europe",
      UA: "Europe",
      VA: "Europe",
      XK: "Europe",

      // Asia
      AF: "Asia",
      AM: "Asia",
      AZ: "Asia",
      BD: "Asia",
      BH: "Asia",
      BN: "Asia",
      BT: "Asia",
      CN: "Asia",
      GE: "Asia",
      HK: "Asia",
      ID: "Asia",
      IL: "Asia",
      IN: "Asia",
      IQ: "Asia",
      IR: "Asia",
      JO: "Asia",
      JP: "Asia",
      KG: "Asia",
      KH: "Asia",
      KP: "Asia",
      KR: "Asia",
      KW: "Asia",
      KZ: "Asia",
      LA: "Asia",
      LB: "Asia",
      LK: "Asia",
      MM: "Asia",
      MN: "Asia",
      MO: "Asia",
      MV: "Asia",
      MY: "Asia",
      NP: "Asia",
      OM: "Asia",
      PH: "Asia",
      PK: "Asia",
      PS: "Asia",
      QA: "Asia",
      SA: "Asia",
      SG: "Asia",
      SY: "Asia",
      TH: "Asia",
      TJ: "Asia",
      TL: "Asia",
      TM: "Asia",
      TR: "Asia",
      TW: "Asia",
      UZ: "Asia",
      VN: "Asia",
      YE: "Asia",

      // Africa
      AO: "Africa",
      BF: "Africa",
      BI: "Africa",
      BJ: "Africa",
      BW: "Africa",
      CD: "Africa",
      CF: "Africa",
      CG: "Africa",
      CI: "Africa",
      CM: "Africa",
      CV: "Africa",
      DJ: "Africa",
      DZ: "Africa",
      EG: "Africa",
      EH: "Africa",
      ER: "Africa",
      ET: "Africa",
      GA: "Africa",
      GH: "Africa",
      GM: "Africa",
      GN: "Africa",
      GQ: "Africa",
      GW: "Africa",
      KE: "Africa",
      KM: "Africa",
      LR: "Africa",
      LS: "Africa",
      LY: "Africa",
      MA: "Africa",
      MG: "Africa",
      ML: "Africa",
      MR: "Africa",
      MU: "Africa",
      MW: "Africa",
      MZ: "Africa",
      NA: "Africa",
      NE: "Africa",
      NG: "Africa",
      RW: "Africa",
      SC: "Africa",
      SD: "Africa",
      SL: "Africa",
      SN: "Africa",
      SO: "Africa",
      SS: "Africa",
      ST: "Africa",
      SZ: "Africa",
      TD: "Africa",
      TG: "Africa",
      TN: "Africa",
      TZ: "Africa",
      UG: "Africa",
      ZA: "Africa",
      ZM: "Africa",
      ZW: "Africa",

      // North America
      AG: "North America",
      BB: "North America",
      BZ: "North America",
      CA: "North America",
      CR: "North America",
      CU: "North America",
      DM: "North America",
      DO: "North America",
      GD: "North America",
      GT: "North America",
      HN: "North America",
      HT: "North America",
      JM: "North America",
      KN: "North America",
      LC: "North America",
      MX: "North America",
      NI: "North America",
      PA: "North America",
      SV: "North America",
      TT: "North America",
      US: "North America",
      VC: "North America",

      // South America
      AR: "South America",
      BO: "South America",
      BR: "South America",
      CL: "South America",
      CO: "South America",
      EC: "South America",
      FK: "South America",
      GF: "South America",
      GY: "South America",
      PE: "South America",
      PY: "South America",
      SR: "South America",
      UY: "South America",
      VE: "South America",

      // Oceania
      AS: "Oceania",
      AU: "Oceania",
      CK: "Oceania",
      FJ: "Oceania",
      FM: "Oceania",
      GU: "Oceania",
      KI: "Oceania",
      MH: "Oceania",
      MP: "Oceania",
      NC: "Oceania",
      NF: "Oceania",
      NR: "Oceania",
      NU: "Oceania",
      NZ: "Oceania",
      PF: "Oceania",
      PG: "Oceania",
      PN: "Oceania",
      PW: "Oceania",
      SB: "Oceania",
      TK: "Oceania",
      TO: "Oceania",
      TV: "Oceania",
      UM: "Oceania",
      VU: "Oceania",
      WF: "Oceania",
      WS: "Oceania",
    };

    return continentMap[countryCode] || "Other";
  };

  // Group countries by continent
  const countriesByContinent = useMemo(() => {
    const grouped: Record<string, Country[]> = {};

    filteredAndSortedCountries.forEach((country) => {
      const continent = getContinent(country.code);
      if (!grouped[continent]) {
        grouped[continent] = [];
      }
      grouped[continent].push(country);
    });

    // Sort countries within each continent
    Object.keys(grouped).forEach((continent) => {
      grouped[continent].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [filteredAndSortedCountries]);

  const totalCountries = countriesData.length;
  const exploredCount = countriesWithMovies.size;
  const unexploredCount = unexploredCountries.length;
  const explorationPercentage = Math.round(
    (exploredCount / totalCountries) * 100
  );

  // Get motivational message based on exploration percentage
  const getMotivationalMessage = () => {
    if (explorationPercentage >= 80) return "You've covered most of the world";
    if (explorationPercentage >= 60) return "Solid global coverage so far";
    if (explorationPercentage >= 40)
      return "Getting into some interesting territories";
    if (explorationPercentage >= 20) return "Good variety across regions";
    return "Plenty of countries to discover";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Unexplored Countries
              </h2>
              <div className="text-gray-300 space-y-1">
                <p>
                  You've explored{" "}
                  <span className="text-green-400 font-semibold">
                    {exploredCount}
                  </span>{" "}
                  out of{" "}
                  <span className="text-blue-400 font-semibold">
                    {totalCountries}
                  </span>{" "}
                  countries
                </p>
                <p>
                  <span className="text-orange-400 font-semibold">
                    {unexploredCount}
                  </span>{" "}
                  countries waiting to be discovered
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="bg-gray-700 rounded-full h-2 w-32">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${explorationPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    {explorationPercentage}% explored
                  </span>
                </div>
                <p className="text-sm text-blue-300 mt-1 italic">
                  {getMotivationalMessage()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
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

        {/* Search and Sort Controls */}
        <div className="p-4 border-b border-gray-700 bg-gray-750">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "alphabetical" | "continent")
                }
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="alphabetical">Alphabetical</option>
                <option value="continent">By Continent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Countries List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {sortBy === "continent" ? (
            // Continent view
            <div className="space-y-6">
              {Object.entries(countriesByContinent)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([continent, countries]) => (
                  <div key={continent}>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-700 pb-1">
                      {continent} ({countries.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {countries.map((country) => (
                        <div
                          key={country.code}
                          className="relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 cursor-pointer group border border-gray-600 hover:border-gray-500"
                        >
                          <div className="p-4">
                            <div>
                              <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                                {country.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {country.code}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // Alphabetical view
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAndSortedCountries.map((country) => (
                <div
                  key={country.code}
                  className="relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 cursor-pointer group border border-gray-600 hover:border-gray-500"
                >
                  <div className="p-4">
                    <div>
                      <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                        {country.name}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-400">{country.code}</p>
                        <p className="text-xs text-gray-500">
                          {getContinent(country.code)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ))}
            </div>
          )}

          {filteredAndSortedCountries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                {searchTerm
                  ? "No countries found matching your search"
                  : "All countries explored! 🎉"}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-750">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>
              Showing {filteredAndSortedCountries.length} of {unexploredCount}{" "}
              unexplored countries
            </span>
            <span>
              {unexploredCount > 100
                ? "Lots to discover"
                : unexploredCount > 50
                ? "Getting there"
                : "Almost complete"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
