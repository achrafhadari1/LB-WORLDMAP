import Papa from 'papaparse';
import { getMovieByTitleAndYear, Movie } from './tmdb';

export interface WatchedMovie {
  date: string;
  name: string;
  year: number;
  letterboxdUri: string;
}

export interface CountryData {
  countryCode: string;
  countryName: string;
  movieCount: number;
  movies: Array<{
    title: string;
    year: number;
  }>;
}

export async function loadWatchedMovies(): Promise<WatchedMovie[]> {
  try {
    const response = await fetch('/watched.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const movies: WatchedMovie[] = results.data.map((row: any) => ({
            date: row.Date,
            name: row.Name,
            year: parseInt(row.Year),
            letterboxdUri: row['Letterboxd URI'],
          }));
          resolve(movies);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading watched movies:', error);
    return [];
  }
}

export async function getMovieCountriesData(watchedMovies: WatchedMovie[]): Promise<CountryData[]> {
  const countryMap = new Map<string, CountryData>();
  
  // For demo purposes, limit to first 25 movies to avoid long loading times
  const moviesToProcess = watchedMovies.slice(0, 25);
  console.log(`Processing ${moviesToProcess.length} movies (limited for demo)...`);
  
  // Process movies in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < moviesToProcess.length; i += batchSize) {
    const batch = moviesToProcess.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (watchedMovie) => {
        try {
          const movieDetails = await getMovieByTitleAndYear(watchedMovie.name, watchedMovie.year);
          
          if (movieDetails && movieDetails.production_countries) {
            movieDetails.production_countries.forEach((country) => {
              const countryCode = country.iso_3166_1;
              const countryName = country.name;
              
              if (!countryMap.has(countryCode)) {
                countryMap.set(countryCode, {
                  countryCode,
                  countryName,
                  movieCount: 0,
                  movies: [],
                });
              }
              
              const countryData = countryMap.get(countryCode)!;
              countryData.movieCount++;
              countryData.movies.push({
                title: watchedMovie.name,
                year: watchedMovie.year,
              });
            });
          }
        } catch (error) {
          console.error(`Error processing movie "${watchedMovie.name}":`, error);
        }
      })
    );
    
    // Add a small delay between batches to be respectful to the API
    if (i + batchSize < watchedMovies.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Processed ${Math.min(i + batchSize, watchedMovies.length)} / ${watchedMovies.length} movies`);
  }
  
  return Array.from(countryMap.values()).sort((a, b) => b.movieCount - a.movieCount);
}

// ISO 3166-1 alpha-2 to alpha-3 mapping for react-simple-maps
export const countryCodeMapping: Record<string, string> = {
  'AD': 'AND', 'AE': 'ARE', 'AF': 'AFG', 'AG': 'ATG', 'AI': 'AIA', 'AL': 'ALB',
  'AM': 'ARM', 'AO': 'AGO', 'AQ': 'ATA', 'AR': 'ARG', 'AS': 'ASM', 'AT': 'AUT',
  'AU': 'AUS', 'AW': 'ABW', 'AX': 'ALA', 'AZ': 'AZE', 'BA': 'BIH', 'BB': 'BRB',
  'BD': 'BGD', 'BE': 'BEL', 'BF': 'BFA', 'BG': 'BGR', 'BH': 'BHR', 'BI': 'BDI',
  'BJ': 'BEN', 'BL': 'BLM', 'BM': 'BMU', 'BN': 'BRN', 'BO': 'BOL', 'BQ': 'BES',
  'BR': 'BRA', 'BS': 'BHS', 'BT': 'BTN', 'BV': 'BVT', 'BW': 'BWA', 'BY': 'BLR',
  'BZ': 'BLZ', 'CA': 'CAN', 'CC': 'CCK', 'CD': 'COD', 'CF': 'CAF', 'CG': 'COG',
  'CH': 'CHE', 'CI': 'CIV', 'CK': 'COK', 'CL': 'CHL', 'CM': 'CMR', 'CN': 'CHN',
  'CO': 'COL', 'CR': 'CRI', 'CU': 'CUB', 'CV': 'CPV', 'CW': 'CUW', 'CX': 'CXR',
  'CY': 'CYP', 'CZ': 'CZE', 'DE': 'DEU', 'DJ': 'DJI', 'DK': 'DNK', 'DM': 'DMA',
  'DO': 'DOM', 'DZ': 'DZA', 'EC': 'ECU', 'EE': 'EST', 'EG': 'EGY', 'EH': 'ESH',
  'ER': 'ERI', 'ES': 'ESP', 'ET': 'ETH', 'FI': 'FIN', 'FJ': 'FJI', 'FK': 'FLK',
  'FM': 'FSM', 'FO': 'FRO', 'FR': 'FRA', 'GA': 'GAB', 'GB': 'GBR', 'GD': 'GRD',
  'GE': 'GEO', 'GF': 'GUF', 'GG': 'GGY', 'GH': 'GHA', 'GI': 'GIB', 'GL': 'GRL',
  'GM': 'GMB', 'GN': 'GIN', 'GP': 'GLP', 'GQ': 'GNQ', 'GR': 'GRC', 'GS': 'SGS',
  'GT': 'GTM', 'GU': 'GUM', 'GW': 'GNB', 'GY': 'GUY', 'HK': 'HKG', 'HM': 'HMD',
  'HN': 'HND', 'HR': 'HRV', 'HT': 'HTI', 'HU': 'HUN', 'ID': 'IDN', 'IE': 'IRL',
  'IL': 'ISR', 'IM': 'IMN', 'IN': 'IND', 'IO': 'IOT', 'IQ': 'IRQ', 'IR': 'IRN',
  'IS': 'ISL', 'IT': 'ITA', 'JE': 'JEY', 'JM': 'JAM', 'JO': 'JOR', 'JP': 'JPN',
  'KE': 'KEN', 'KG': 'KGZ', 'KH': 'KHM', 'KI': 'KIR', 'KM': 'COM', 'KN': 'KNA',
  'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KY': 'CYM', 'KZ': 'KAZ', 'LA': 'LAO',
  'LB': 'LBN', 'LC': 'LCA', 'LI': 'LIE', 'LK': 'LKA', 'LR': 'LBR', 'LS': 'LSO',
  'LT': 'LTU', 'LU': 'LUX', 'LV': 'LVA', 'LY': 'LBY', 'MA': 'MAR', 'MC': 'MCO',
  'MD': 'MDA', 'ME': 'MNE', 'MF': 'MAF', 'MG': 'MDG', 'MH': 'MHL', 'MK': 'MKD',
  'ML': 'MLI', 'MM': 'MMR', 'MN': 'MNG', 'MO': 'MAC', 'MP': 'MNP', 'MQ': 'MTQ',
  'MR': 'MRT', 'MS': 'MSR', 'MT': 'MLT', 'MU': 'MUS', 'MV': 'MDV', 'MW': 'MWI',
  'MX': 'MEX', 'MY': 'MYS', 'MZ': 'MOZ', 'NA': 'NAM', 'NC': 'NCL', 'NE': 'NER',
  'NF': 'NFK', 'NG': 'NGA', 'NI': 'NIC', 'NL': 'NLD', 'NO': 'NOR', 'NP': 'NPL',
  'NR': 'NRU', 'NU': 'NIU', 'NZ': 'NZL', 'OM': 'OMN', 'PA': 'PAN', 'PE': 'PER',
  'PF': 'PYF', 'PG': 'PNG', 'PH': 'PHL', 'PK': 'PAK', 'PL': 'POL', 'PM': 'SPM',
  'PN': 'PCN', 'PR': 'PRI', 'PS': 'PSE', 'PT': 'PRT', 'PW': 'PLW', 'PY': 'PRY',
  'QA': 'QAT', 'RE': 'REU', 'RO': 'ROU', 'RS': 'SRB', 'RU': 'RUS', 'RW': 'RWA',
  'SA': 'SAU', 'SB': 'SLB', 'SC': 'SYC', 'SD': 'SDN', 'SE': 'SWE', 'SG': 'SGP',
  'SH': 'SHN', 'SI': 'SVN', 'SJ': 'SJM', 'SK': 'SVK', 'SL': 'SLE', 'SM': 'SMR',
  'SN': 'SEN', 'SO': 'SOM', 'SR': 'SUR', 'SS': 'SSD', 'ST': 'STP', 'SV': 'SLV',
  'SX': 'SXM', 'SY': 'SYR', 'SZ': 'SWZ', 'TC': 'TCA', 'TD': 'TCD', 'TF': 'ATF',
  'TG': 'TGO', 'TH': 'THA', 'TJ': 'TJK', 'TK': 'TKL', 'TL': 'TLS', 'TM': 'TKM',
  'TN': 'TUN', 'TO': 'TON', 'TR': 'TUR', 'TT': 'TTO', 'TV': 'TUV', 'TW': 'TWN',
  'TZ': 'TZA', 'UA': 'UKR', 'UG': 'UGA', 'UM': 'UMI', 'US': 'USA', 'UY': 'URY',
  'UZ': 'UZB', 'VA': 'VAT', 'VC': 'VCT', 'VE': 'VEN', 'VG': 'VGB', 'VI': 'VIR',
  'VN': 'VNM', 'VU': 'VUT', 'WF': 'WLF', 'WS': 'WSM', 'YE': 'YEM', 'YT': 'MYT',
  'ZA': 'ZAF', 'ZM': 'ZMB', 'ZW': 'ZWE'
};

export function convertCountryCode(iso2: string): string {
  return countryCodeMapping[iso2] || iso2;
}