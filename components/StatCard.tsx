
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeLabel, icon, colorClass }) => {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between shadow-sm">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                 {change !== undefined && (
                    <div className="flex items-center mt-2">
                         <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                            {isPositive ? '▲' : '▼'} {change.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-400 ml-2">{changeLabel || 'vs last month'}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
};

export default StatCard;