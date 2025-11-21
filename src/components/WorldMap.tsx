"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { CountryData, ProcessedMovieData } from "@/services/dataProcessor";
import MovieDrawer from "./MovieDrawer";
import countriesData from "../data/countries.json";

// World map TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Create a mapping from country names to ISO codes using the JSON data
const createCountryMapping = () => {
  const mapping: Record<string, string> = {};

  // First, create direct mappings from the JSON data
  countriesData.forEach((country) => {
    mapping[country.name] = country.code;
  });

  // Handle special cases where TopoJSON names differ from standard names
  const specialMappings: Record<string, string> = {
    "United States of America": "US", // TopoJSON uses full name
    "South Korea": "KR", // TopoJSON might use this instead of "Korea, Republic of"
    "North Korea": "KP", // TopoJSON might use this instead of "Korea, Democratic People's Republic of"
    "Czech Republic": "CZ", // Some maps use this instead of "Czechia"
    "Republic of the Congo": "CG", // Distinguish from Democratic Republic
    "Democratic Republic of the Congo": "CD",
    "Ivory Coast": "CI", // Alternative name for Côte d'Ivoire
    "Cape Verde": "CV", // Alternative name for Cabo Verde
    "East Timor": "TL", // Alternative name for Timor-Leste
    Swaziland: "SZ", // Former name of Eswatini
    Macedonia: "MK", // Former name of North Macedonia
    Burma: "MM", // Former name of Myanmar
  };

  // Add special mappings
  Object.entries(specialMappings).forEach(([name, code]) => {
    mapping[name] = code;
  });

  return mapping;
};

const COUNTRY_NAME_TO_ISO = createCountryMapping();

interface HoverData {
  country: string;
  movieCount: number;
  x: number;
  y: number;
}

interface DrawerData {
  country: string;
  countryIso: string;
}

interface WorldMapProps {
  countryData: Map<string, CountryData> | null;
  isEditMode?: boolean;
  onEditMovie?: (movie: ProcessedMovieData) => void;
}

export default function WorldMap({
  countryData,
  isEditMode = false,
  onEditMovie,
}: WorldMapProps) {
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [drawerData, setDrawerData] = useState<DrawerData | null>(null);

  if (!countryData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading map...
      </div>
    );
  }

  // Compute color scale
  const counts = Array.from(countryData.values()).map((d) => d.movieCount);
  const max = Math.max(...counts, 1);
  const colorScale = scaleLinear<string>()
    .domain([0, max])
    .range(["#204f41", "#22c55e"]);

  const handleMove = (geo: any, e: React.MouseEvent) => {
    const name: string = geo.properties.name;
    const iso = COUNTRY_NAME_TO_ISO[name];

    if (!iso) {
      setHoverData(null);
      return;
    }

    const info = countryData.get(iso);
    if (!info) {
      setHoverData(null);
      return;
    }

    setHoverData({
      country: name,
      movieCount: info.movieCount,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleClick = (geo: any) => {
    const name: string = geo.properties.name;
    const iso = COUNTRY_NAME_TO_ISO[name];

    if (!iso) return;

    const info = countryData.get(iso);
    if (!info) return;

    // Open drawer with movies
    setDrawerData({
      country: name,
      countryIso: iso,
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div
        className="absolute text-white z-10"
        style={{ top: "0.3rem", left: "2rem" }}
      >
        <h1 className="text-2xl xl:text-4xl font-bold mb-1 xl:mb-2">
          World Map
        </h1>
        <p className="text-gray-300 text-xs xl:text-base">
          Movies watched by primary production country • Click a country to view
          movies
        </p>
      </div>

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.name;
              const iso = COUNTRY_NAME_TO_ISO[name];
              const info = iso ? countryData.get(iso) : undefined;

              const fill = info ? colorScale(info.movieCount) : "#1f2937";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#374151"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: info ? "#16a34a" : "#4b5563",
                      cursor: info ? "pointer" : "default",
                    },
                    pressed: { outline: "none" },
                  }}
                  onMouseMove={(e) => handleMove(geo, e)}
                  onMouseLeave={() => setHoverData(null)}
                  onClick={() => handleClick(geo)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Simple hover tooltip */}
      {hoverData && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-50 text-sm"
          style={{
            left: hoverData.x + 10,
            top: hoverData.y - 10,
          }}
        >
          <div className="font-medium">{hoverData.country}</div>
          <div className="text-gray-300">{hoverData.movieCount} movies</div>
        </div>
      )}

      {/* Movie drawer */}
      {drawerData && countryData && countryData.get(drawerData.countryIso) && (
        <MovieDrawer
          isOpen={true}
          onClose={() => setDrawerData(null)}
          country={drawerData.country}
          movies={countryData.get(drawerData.countryIso)?.movies || []}
          onEditMovie={onEditMovie}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
