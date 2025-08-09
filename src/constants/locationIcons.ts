/**
 * Centralized location icons and colors for consistent UI across the app
 */

export const LOCATION_ICONS = {
  'Hà Nội': '🏢',
  'Hồ Chí Minh': '🌆',
  hanoi: '🏢',
  hcm: '🌆',
  HN: '🏢',
  HCM: '🌆',
} as const;

export const LOCATION_COLORS = {
  'Hà Nội': {
    text: 'text-blue-400',
    border: 'border-blue-500',
    bg: 'bg-blue-500/20',
    gradient: 'from-blue-600 to-blue-800',
    hover: 'hover:from-blue-700 hover:to-blue-900',
  },
  'Hồ Chí Minh': {
    text: 'text-orange-400',
    border: 'border-orange-500',
    bg: 'bg-orange-500/20',
    gradient: 'from-green-600 to-green-800',
    hover: 'hover:from-green-700 hover:to-green-900',
  },
  hanoi: {
    text: 'text-blue-400',
    border: 'border-blue-500',
    bg: 'bg-blue-500/20',
    gradient: 'from-blue-600 to-blue-800',
    hover: 'hover:from-blue-700 hover:to-blue-900',
  },
  hcm: {
    text: 'text-orange-400',
    border: 'border-orange-500',
    bg: 'bg-orange-500/20',
    gradient: 'from-green-600 to-green-800',
    hover: 'hover:from-green-700 hover:to-green-900',
  },
  HN: {
    text: 'text-blue-400',
    border: 'border-blue-500',
    bg: 'bg-blue-500/20',
    gradient: 'from-blue-600 to-blue-800',
    hover: 'hover:from-blue-700 hover:to-blue-900',
  },
  HCM: {
    text: 'text-orange-400',
    border: 'border-orange-500',
    bg: 'bg-orange-500/20',
    gradient: 'from-green-600 to-green-800',
    hover: 'hover:from-green-700 hover:to-green-900',
  },
} as const;

export type LocationKey = keyof typeof LOCATION_ICONS;
export type LocationColorKey = keyof typeof LOCATION_COLORS;

/**
 * Get icon for location
 */
export const getLocationIcon = (location: LocationKey): string => {
  return LOCATION_ICONS[location] || '📍';
};

/**
 * Get colors for location
 */
export const getLocationColors = (location: LocationColorKey) => {
  return LOCATION_COLORS[location] || LOCATION_COLORS['Hà Nội'];
};
