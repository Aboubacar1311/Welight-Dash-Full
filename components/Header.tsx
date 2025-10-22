
import React from 'react';
import { FilterState, FilterOptions, MonthlyData } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { exportDataToCsv } from '../utils/filterData';
import { DownloadIcon } from './icons';

interface HeaderProps {
    filters: FilterState;
    onFilterChange: (newFilters: Partial<FilterState>) => void;
    filterOptions: FilterOptions;
    filteredData: MonthlyData[];
}

const FilterSelect: React.FC<{
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string | number; label: string }[];
}> = ({ label, value, onChange, options }) => (
    <div className="flex flex-col">
        <label className="text-xs text-gray-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="bg-brand-blue-dark border border-gray-500 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);


const Header: React.FC<HeaderProps> = ({ filters, onFilterChange, filterOptions, filteredData }) => {
    const { currency, setCurrency } = useCurrency();

    const handleExport = () => {
        const date = new Date();
        const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const filename = `welight_data_${timestamp}.csv`;
        exportDataToCsv(filteredData, filename);
    };
    
    return (
        <header className="bg-brand-blue-dark h-20 flex-shrink-0">
            <div className="flex items-center justify-between h-full px-6">
                <div className="flex-1">
                    {/* Placeholder for title or other elements if needed */}
                </div>
                <div className="flex items-center space-x-2">
                    <FilterSelect 
                        label="Year"
                        value={filters.year}
                        onChange={e => onFilterChange({ year: parseInt(e.target.value) })}
                        options={filterOptions.years.map(y => ({ value: y, label: y.toString() }))}
                    />
                    <FilterSelect 
                        label="Month"
                        value={filters.month}
                        onChange={e => onFilterChange({ month: parseInt(e.target.value) })}
                        options={filterOptions.months}
                    />
                    <FilterSelect 
                        label="Segment"
                        value={filters.segment}
                        onChange={e => onFilterChange({ segment: e.target.value })}
                        options={filterOptions.segments.map(p => ({ value: p, label: p }))}
                    />
                    <FilterSelect 
                        label="Profile"
                        value={filters.profile}
                        onChange={e => onFilterChange({ profile: e.target.value })}
                        options={filterOptions.profiles.map(p => ({ value: p, label: p }))}
                    />
                    <FilterSelect 
                        label="Phase"
                        value={filters.phase}
                        onChange={e => onFilterChange({ phase: e.target.value })}
                        options={filterOptions.phases.map(p => ({ value: p, label: p }))}
                    />
                    <FilterSelect 
                        label="Site"
                        value={filters.site}
                        onChange={e => onFilterChange({ site: e.target.value })}
                        options={filterOptions.sites.map(s => ({ value: s, label: s }))}
                    />
                    <FilterSelect 
                        label="Zone"
                        value={filters.zone}
                        onChange={e => onFilterChange({ zone: e.target.value })}
                        options={filterOptions.zones.map(z => ({ value: z, label: z }))}
                    />
                     <div className="pl-4">
                        <FilterSelect
                            label="Currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as 'FCFA' | 'EUR')}
                            options={[{value: 'FCFA', label: 'FCFA'}, {value: 'EUR', label: 'EUR'}]}
                        />
                    </div>
                    <div className="pl-4 flex items-end self-stretch">
                        <button
                            onClick={handleExport}
                            disabled={filteredData.length === 0}
                            className="flex items-center justify-center bg-brand-yellow text-brand-blue-dark font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors h-[38px] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-gray-600"
                            aria-label="Export data to CSV"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            <span>Export Data</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
