import React from 'react';
import { getLocationColors, getLocationIcon } from '../constants/locationIcons';

interface LocationTabsProps {
  activeLocation: 'hanoi' | 'hcm';
  onLocationChange: (location: 'hanoi' | 'hcm') => void;
  className?: string;
}

const LOCATION_CONFIG = {
  hanoi: {
    label: 'Hà Nội',
    icon: getLocationIcon('hanoi'),
    description: 'Thống kê văn phòng Hà Nội',
    color: `${getLocationColors('hanoi').text} ${getLocationColors('hanoi').border}`,
  },
  hcm: {
    label: 'Hồ Chí Minh',
    icon: getLocationIcon('hcm'),
    description: 'Thống kê văn phòng Hồ Chí Minh',
    color: `${getLocationColors('hcm').text} ${getLocationColors('hcm').border}`,
  },
};

export const LocationTabs: React.FC<LocationTabsProps> = ({
  activeLocation,
  onLocationChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-700 ${className}`}>
      <nav className="flex space-x-8" aria-label="Location tabs">
        {Object.entries(LOCATION_CONFIG).map(([key, config]) => {
          const isActive = activeLocation === key;
          const locationKey = key as 'hanoi' | 'hcm';

          return (
            <button
              key={key}
              onClick={() => onLocationChange(locationKey)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? `${config.color}`
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-base mr-2">{config.icon}</span>
              <span>{config.label}</span>
              {isActive && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                  Đang xem
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default LocationTabs;
