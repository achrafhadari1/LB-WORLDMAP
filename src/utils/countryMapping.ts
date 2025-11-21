// Map historical/regional countries to modern equivalents
export function mapCountryCode(code: string): string {
  const mappings: Record<string, string> = {
    SU: "RU", // USSR → Russia
    CS: "CZ", // Czechoslovakia → Czech Republic
    YU: "RS", // Yugoslavia → Serbia
    DD: "DE", // East Germany → Germany
    HK: "CN", // Hong Kong → China
  };

  return mappings[code] || code;
}
