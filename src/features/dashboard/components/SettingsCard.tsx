interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'red';
  onClick?: () => void;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    icon: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  green: {
    bg: 'bg-green-500/20',
    icon: 'text-green-400',
    button: 'bg-green-600 hover:bg-green-700'
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    icon: 'text-yellow-400',
    button: 'bg-yellow-600 hover:bg-yellow-700'
  },
  purple: {
    bg: 'bg-purple-500/20',
    icon: 'text-purple-400',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  indigo: {
    bg: 'bg-indigo-500/20',
    icon: 'text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-700'
  },
  red: {
    bg: 'bg-red-500/20',
    icon: 'text-red-400',
    button: 'bg-red-600 hover:bg-red-700'
  }
};

export function SettingsCard({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonColor, 
  onClick, 
  fullWidth = false,
  children 
}: SettingsCardProps) {
  const colors = colorClasses[buttonColor];
  
  return (
    <div className={`bg-gray-800 rounded-lg border ${buttonColor === 'red' ? 'border-red-700' : 'border-gray-700'} p-4 md:p-6 hover:bg-gray-700 transition-all ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mr-3`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white">{title}</h4>
          {!children && <p className="text-gray-400 text-sm">{description}</p>}
        </div>
        {children}
      </div>
      {!children && (
        <>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
          <button
            onClick={onClick}
            className={`w-full ${colors.button} text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium`}
          >
            {buttonText}
          </button>
        </>
      )}
    </div>
  );
}
