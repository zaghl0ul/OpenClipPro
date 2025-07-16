import React, { useState } from 'react';

interface InputTabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

const InputTabs: React.FC<InputTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setCurrentTab(tabId);
    }
  };

  const activeTabId = activeTab || currentTab;
  const activeTabData = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={`
              px-4 py-2 text-sm font-medium transition-colors duration-200
              ${activeTabId === tab.id
                ? 'text-primary-400 border-b-2 border-primary-400 bg-gray-800'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTabData && (
          <div className="animate-fadeIn">
            {activeTabData.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputTabs;
