"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { CountryData, ProcessedMovieData } from "@/services/dataProcessor";
import MovieDrawer from "./MovieDrawer";

// World map TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/**
 * Universal mapping: TopoJSON country names → ISO 3166-1 alpha-2 codes.
 * Matches every country from the world-atlas dataset.
 */
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  Afghanistan: "AF",
  Albania: "AL",
  Algeria: "DZ",
  Angola: "AO",
  Argentina: "AR",
  Armenia: "AM",
  Australia: "AU",
  Austria: "AT",
  Azerbaijan: "AZ",
  Bahamas: "BS",
  Bangladesh: "BD",
  Belarus: "BY",
  Belgium: "BE",
  Belize: "BZ",
  Benin: "BJ",
  Bhutan: "BT",
  Bolivia: "BO",
  "Bosnia and Herzegovina": "BA",
  Botswana: "BW",
  Brazil: "BR",
  Brunei: "BN",
  Bulgaria: "BG",
  "Burkina Faso": "BF",
  Burundi: "BI",
  Cambodia: "KH",
  Cameroon: "CM",
  Canada: "CA",
  "Central African Republic": "CF",
  Chad: "TD",
  Chile: "CL",
  China: "CN",
  Colombia: "CO",
  "Costa Rica": "CR",
  Croatia: "HR",
  Cuba: "CU",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  Djibouti: "DJ",
  "Dominican Republic": "DO",
  Ecuador: "EC",
  Egypt: "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  Eritrea: "ER",
  Estonia: "EE",
  Eswatini: "SZ",
  Ethiopia: "ET",
  Finland: "FI",
  France: "FR",
  Gabon: "GA",
  Gambia: "GM",
  Georgia: "GE",
  Germany: "DE",
  Ghana: "GH",
  Greece: "GR",
  Guatemala: "GT",
  Guinea: "GN",
  "Guinea-Bissau": "GW",
  Guyana: "GY",
  Haiti: "HT",
  Honduras: "HN",
  Hungary: "HU",
  Iceland: "IS",
  India: "IN",
  Indonesia: "ID",
  Iran: "IR",
  Iraq: "IQ",
  Ireland: "IE",
  Israel: "IL",
  Italy: "IT",
  Jamaica: "JM",
  Japan: "JP",
  Jordan: "JO",
  Kazakhstan: "KZ",
  Kenya: "KE",
  Kuwait: "KW",
  Kyrgyzstan: "KG",
  Laos: "LA",
  Latvia: "LV",
  Lebanon: "LB",
  Lesotho: "LS",
  Liberia: "LR",
  Libya: "LY",
  Lithuania: "LT",
  Luxembourg: "LU",
  Madagascar: "MG",
  Malawi: "MW",
  Malaysia: "MY",
  Mali: "ML",
  Mauritania: "MR",
  Mexico: "MX",
  Moldova: "MD",
  Mongolia: "MN",
  Montenegro: "ME",
  Morocco: "MA",
  Mozambique: "MZ",
  Myanmar: "MM",
  Namibia: "NA",
  Nepal: "NP",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Nicaragua: "NI",
  Niger: "NE",
  Nigeria: "NG",
  "North Korea": "KP",
  "North Macedonia": "MK",
  Norway: "NO",
  Oman: "OM",
  Pakistan: "PK",
  Panama: "PA",
  "Papua New Guinea": "PG",
  Paraguay: "PY",
  Peru: "PE",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Qatar: "QA",
  Romania: "RO",
  Russia: "RU",
  Rwanda: "RW",
  "Saudi Arabia": "SA",
  Senegal: "SN",
  Serbia: "RS",
  "Sierra Leone": "SL",
  Singapore: "SG",
  Slovakia: "SK",
  Slovenia: "SI",
  Somalia: "SO",
  "South Africa": "ZA",
  "South Sudan": "SS",
  Spain: "ES",
  "Sri Lanka": "LK",
  Sudan: "SD",
  Suriname: "SR",
  Sweden: "SE",
  Switzerland: "CH",
  Syria: "SY",
  Taiwan: "TW",
  Tajikistan: "TJ",
  Tanzania: "TZ",
  Thailand: "TH",
  Togo: "TG",
  Tunisia: "TN",
  Turkey: "TR",
  Turkmenistan: "TM",
  Uganda: "UG",
  Ukraine: "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States of America": "US",
  Uruguay: "UY",
  Uzbekistan: "UZ",
  Venezuela: "VE",
  Vietnam: "VN",
  Yemen: "YE",
  Zambia: "ZM",
  Zimbabwe: "ZW",
};

interface HoverData {
  country: string;
  movieCount: number;
  x: number;
  y: number;
}

interface DrawerData {
  country: string;
  movies: ProcessedMovieData[];
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
      movies: info.movies,
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div className="absolute top-8 left-8 text-white z-10">
        <h1 className="text-4xl font-bold mb-2">World Map</h1>
        <p className="text-gray-300">
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
      <MovieDrawer
        isOpen={!!drawerData}
        onClose={() => setDrawerData(null)}
        country={drawerData?.country || ""}
        movies={drawerData?.movies || []}
        onEditMovie={onEditMovie}
        isEditMode={isEditMode}
      />
    </div>
  );
}
