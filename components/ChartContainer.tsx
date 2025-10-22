
import React from 'react';

type ViewMode = 'chart' | 'table';

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
    view?: ViewMode;
    onViewChange?: (view: ViewMode) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, view, onViewChange }) => {
    const baseButtonClass = "px-3 py-1 text-xs font-medium rounded-md transition-colors";
    const activeButtonClass = "bg-brand-blue-dark text-white";
    const inactiveButtonClass = "bg-white text-gray-700 hover:bg-gray-200";

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {onViewChange && view && (
                     <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg p-0.5">
                        <button 
                            onClick={() => onViewChange('chart')} 
                            className={`${baseButtonClass} ${view === 'chart' ? activeButtonClass : inactiveButtonClass}`}>
                            Chart
                        </button>
                        <button 
                            onClick={() => onViewChange('table')} 
                            className={`${baseButtonClass} ${view === 'table' ? activeButtonClass : inactiveButtonClass}`}>
                            Table
                        </button>
                    </div>
                )}
            </div>
            <div className="h-80 w-full flex-1">
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;