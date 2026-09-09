// Country name → emoji flag + ISO code. Keys are UPPERCASE canonical.
// Used everywhere we render a nationality (player card, list, national squad).

const map: Record<string, { flag: string; iso: string; name: string }> = {
  FRANCE:     { flag: '🇫🇷', iso: 'FR', name: 'France' },
  SPAIN:      { flag: '🇪🇸', iso: 'ES', name: 'Spain' },
  ENGLAND:    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso: 'EN', name: 'England' },
  GERMANY:    { flag: '🇩🇪', iso: 'DE', name: 'Germany' },
  ITALY:      { flag: '🇮🇹', iso: 'IT', name: 'Italy' },
  PORTUGAL:   { flag: '🇵🇹', iso: 'PT', name: 'Portugal' },
  BRAZIL:     { flag: '🇧🇷', iso: 'BR', name: 'Brazil' },
  ARGENTINA:  { flag: '🇦🇷', iso: 'AR', name: 'Argentina' },
  BELGIUM:    { flag: '🇧🇪', iso: 'BE', name: 'Belgium' },
  NETHERLANDS:{ flag: '🇳🇱', iso: 'NL', name: 'Netherlands' },
  SLOVENIA:   { flag: '🇸🇮', iso: 'SI', name: 'Slovenia' },
  SLOVAKIA:   { flag: '🇸🇰', iso: 'SK', name: 'Slovakia' },
  URUGUAY:    { flag: '🇺🇾', iso: 'UY', name: 'Uruguay' },
  PARAGUAY:   { flag: '🇵🇾', iso: 'PY', name: 'Paraguay' },
  COLOMBIA:   { flag: '🇨🇴', iso: 'CO', name: 'Colombia' },
  MEXICO:     { flag: '🇲🇽', iso: 'MX', name: 'Mexico' },
  USA:        { flag: '🇺🇸', iso: 'US', name: 'USA' },
  CANADA:     { flag: '🇨🇦', iso: 'CA', name: 'Canada' },
  IRELAND:    { flag: '🇮🇪', iso: 'IE', name: 'Ireland' },
  SCOTLAND:   { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso: 'SC', name: 'Scotland' },
  WALES:      { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', iso: 'WL', name: 'Wales' },
  DENMARK:    { flag: '🇩🇰', iso: 'DK', name: 'Denmark' },
  NORWAY:     { flag: '🇳🇴', iso: 'NO', name: 'Norway' },
  SWEDEN:     { flag: '🇸🇪', iso: 'SE', name: 'Sweden' },
  POLAND:     { flag: '🇵🇱', iso: 'PL', name: 'Poland' },
  UKRAINE:    { flag: '🇺🇦', iso: 'UA', name: 'Ukraine' },
  CROATIA:    { flag: '🇭🇷', iso: 'HR', name: 'Croatia' },
  SERBIA:     { flag: '🇷🇸', iso: 'RS', name: 'Serbia' },
  SERVIA:     { flag: '🇷🇸', iso: 'RS', name: 'Serbia' },
  HUNGARY:    { flag: '🇭🇺', iso: 'HU', name: 'Hungary' },
  CZECH_REPUBLIC: { flag: '🇨🇿', iso: 'CZ', name: 'Czech Republic' },
  AUSTRIA:    { flag: '🇦🇹', iso: 'AT', name: 'Austria' },
  GREECE:     { flag: '🇬🇷', iso: 'GR', name: 'Greece' },
  TURKEY:     { flag: '🇹🇷', iso: 'TR', name: 'Turkey' },
  MOROCCO:    { flag: '🇲🇦', iso: 'MA', name: 'Morocco' },
  MORROCO:    { flag: '🇲🇦', iso: 'MA', name: 'Morocco' },
  SENEGAL:    { flag: '🇸🇳', iso: 'SN', name: 'Senegal' },
  ALGERIA:    { flag: '🇩🇿', iso: 'DZ', name: 'Algeria' },
  NIGERIA:    { flag: '🇳🇬', iso: 'NG', name: 'Nigeria' },
  CAMEROON:   { flag: '🇨🇲', iso: 'CM', name: 'Cameroon' },
  CAMERON:    { flag: '🇨🇲', iso: 'CM', name: 'Cameroon' },
  GHANA:      { flag: '🇬🇭', iso: 'GH', name: 'Ghana' },
  IVORY_COAST:{ flag: '🇨🇮', iso: 'CI', name: 'Ivory Coast' },
  GAMBIA:     { flag: '🇬🇲', iso: 'GM', name: 'Gambia' },
  GABON:      { flag: '🇬🇦', iso: 'GA', name: 'Gabon' },
  SOUTH_KOREA:{ flag: '🇰🇷', iso: 'KR', name: 'South Korea' },
  JAPAN:      { flag: '🇯🇵', iso: 'JP', name: 'Japan' },
  AUSTRALIA:  { flag: '🇦🇺', iso: 'AU', name: 'Australia' },
  RUMANIA:    { flag: '🇷🇴', iso: 'RO', name: 'Romania' },
  ROMANIA:    { flag: '🇷🇴', iso: 'RO', name: 'Romania' },
  RUSSIA:     { flag: '🇷🇺', iso: 'RU', name: 'Russia' },
  BULGARIA:   { flag: '🇧🇬', iso: 'BG', name: 'Bulgaria' },
  REP_DOM:    { flag: '🇩🇴', iso: 'DO', name: 'Dominican Republic' },
  YUGOSLAVIA: { flag: '🇷🇸', iso: 'YU', name: 'Yugoslavia' },
};

function canonical(input?: string | null): string {
  return String(input ?? '').trim().toUpperCase().replace(/\s+/g, '_');
}

export function flagFor(nationality?: string | null): string {
  const c = map[canonical(nationality)];
  return c?.flag ?? '🏳️';
}

export function niceName(nationality?: string | null): string {
  const c = map[canonical(nationality)];
  return c?.name ?? (nationality ?? '?');
}

export function isoFor(nationality?: string | null): string {
  const c = map[canonical(nationality)];
  return c?.iso ?? '';
}
