import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegionSelectionPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const regions = [
    {
      id: 'director',
      name: 'Trưởng Phòng',
      description: 'Khổng Đức Mạnh'
    },
    {
      id: 'hanoi',
      name: 'Hà Nội',
      description: 'Khu vực miền Bắc'
    },
    {
      id: 'hcm',
      name: 'Hồ Chí Minh',
      description: 'Khu vực miền Nam'
    }
  ];

  const handleRegionSelect = (regionId: string) => {
    if (isAnimating) return;
    
    setSelectedRegion(regionId);
    setIsAnimating(true);

    // Animation delay before navigation
    setTimeout(() => {
      switch (regionId) {
        case 'director':
          navigate('/auth/director-login');
          break;
        case 'hanoi':
          navigate('/auth/team-selection?location=Hà Nội');
          break;
        case 'hcm':
          navigate('/auth/team-selection?location=Hồ Chí Minh');
          break;
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        {/* Empty header for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Header with staggered animation */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl font-medium text-gray-900 mb-2 animate-slide-down">
              Chọn khu vực của bạn
            </h1>
            <p className="text-gray-600 animate-fade-in animate-stagger-1">
              Vui lòng chọn khu vực để tiếp tục
            </p>
          </div>

          {/* Regions with enhanced animations */}
          <div className="space-y-4">
            {regions.map((region, index) => (
              <button
                key={region.id}
                className={`
                  w-full p-6 text-left bg-white border border-gray-200 rounded-lg
                  interactive-scale interactive-lift
                  hover:border-blue-300 hover:bg-blue-50
                  transition-all-smooth focus-ring
                  animate-slide-up
                  ${selectedRegion === region.id
                    ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                    : 'shadow-sm'
                  }
                  ${isAnimating && selectedRegion !== region.id
                    ? 'opacity-30 scale-95'
                    : ''
                  }
                  ${isAnimating && selectedRegion === region.id
                    ? 'border-blue-600 bg-blue-100'
                    : ''
                  }
                `}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
                onClick={() => handleRegionSelect(region.id)}
                disabled={isAnimating}
              >
                <div className="flex items-center relative">
                  {/* Content */}
                  <div className="flex-1 transition-transform-smooth">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 transition-colors-smooth">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-500 transition-colors-smooth">
                      {region.description}
                    </p>
                  </div>

                  {/* Arrow with enhanced animation */}
                  <div className={`
                    text-gray-400 transition-all-smooth
                    ${selectedRegion === region.id
                      ? 'text-blue-600 transform rotate-90 scale-110'
                      : 'group-hover:text-blue-600 group-hover:translate-x-1'
                    }
                  `}>
                    <svg
                      className="w-5 h-5 transition-transform-smooth"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>


                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Loading State */}
          {isAnimating && (
            <div className="mt-8 text-center animate-scale-bounce">
              <div className="inline-flex items-center px-6 py-3 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
                <span className="text-gray-700 font-medium">Đang chuyển hướng...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6">
        {/* Empty footer for spacing */}
      </footer>
    </div>
  );
}
