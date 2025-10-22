
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from './services/mockData';
import { FilterState, Page, MonthlyData } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ExecutiveSummary from './pages/ExecutiveSummary';
import Consumption from './pages/Consumption';
import Commercial from './pages/Commercial';
import Clients from './pages/Clients';
import AdvancedAnalysis from './pages/AdvancedAnalysis';
import { filterData } from './utils/filterData';
import { ZapIcon } from './components/icons';
import { CurrencyProvider } from './contexts/CurrencyContext';

const App: React.FC = () => {
    const { rawData, clients, filterOptions, loading } = useData();
    const [activePage, setActivePage] = useState<Page>('ExecutiveSummary');
    const [filters, setFilters] = useState<FilterState>({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        profile: 'All',
        phase: 'All',
        site: 'All',
        zone: 'All',
        segment: 'All',
    });

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const filteredData: MonthlyData[] = useMemo(() => {
        if (loading || !rawData) return [];
        return filterData(rawData, filters);
    }, [rawData, filters, loading]);

    const renderPage = () => {
        const props = { data: filteredData, allData: rawData, filters };
        switch (activePage) {
            case 'ExecutiveSummary':
                return <ExecutiveSummary {...props} />;
            case 'Consumption':
                return <Consumption {...props} />;
            case 'Commercial':
                return <Commercial {...props} />;
            case 'Clients':
                return <Clients clients={clients || []} />;
            case 'AdvancedAnalysis':
                return <AdvancedAnalysis {...props} />;
            default:
                return <ExecutiveSummary {...props} />;
        }
    };

    return (
        <CurrencyProvider>
            <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
                <Sidebar activePage={activePage} setActivePage={setActivePage} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions} filteredData={filteredData} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <ZapIcon className="h-16 w-16 text-brand-yellow animate-pulse mx-auto" />
                                    <p className="mt-4 text-lg font-semibold">Loading Welight Data...</p>
                                </div>
                            </div>
                        ) : renderPage()}
                    </main>
                </div>
            </div>
        </CurrencyProvider>
    );
};

export default App;
