import React from 'react';

interface InputTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
    description: string;
  }>;
  disabled?: boolean;
}

const InputTabs: React.FC<InputTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !disabled && onTabChange(tab.id)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};

export default InputTabs;