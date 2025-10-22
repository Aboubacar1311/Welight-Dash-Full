
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MonthlyData, Client, FilterOptions, Segmentation } from '../types';

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// This file provides test data to the application. API fetching has been
// removed to allow the dashboard to run in any environment.
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const getFilterOptions = (data: MonthlyData[]): FilterOptions => {
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => b - a);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
    ];
    const profiles = ['All', ...new Set(data.map(d => d.profile))];
    const phases = ['All', ...new Set(data.map(d => d.phase))];
    const sites = ['All', ...new Set(data.map(d => d.site))];
    const zones = ['All', ...new Set(data.map(d => d.zone))];
    const segments = ['All', ...[...new Set(data.map(d => d.segment))]];
    return { years, months, profiles, phases, sites, zones, segments };
};

export interface DataContextType {
    loading: boolean;
    rawData: MonthlyData[];
    clients: Client[];
    filterOptions: FilterOptions;
}

const DataContext = createContext<DataContextType | null>(null);

// --- --- --- --- MOCK DATA GENERATION --- --- --- ---

const ZONES = ['Zone A', 'Zone B', 'Zone C'];
const SITES_PER_ZONE = 3;
const PHASES = ['Phase 1', 'Phase 2'];
const PROFILES = ['BC', 'BC+', 'MC', 'MC+', 'HC', 'Pro mono', 'Pro Tri', 'Industrial'];
const SEGMENTS = ['Residential & Business', 'PRO', 'C&I'] as const;
const CATEGORIES = ['LV', 'MV', 'HV'];

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const getSegmentation = (profile: string): Segmentation => {
    if (['BC', 'BC+'].includes(profile)) return 'Low';
    if (['MC'].includes(profile)) return 'Middle';
    if (['MC+', 'HC'].includes(profile)) return 'Premium';
    return 'Pros';
};

const generateMonthlyData = (): MonthlyData[] => {
    const data: MonthlyData[] = [];
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 2, 0, 1);

    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        for (const zone of ZONES) {
            for (let i = 1; i <= SITES_PER_ZONE; i++) {
                const site = `${zone} Site ${i}`;
                for (const phase of PHASES) {
                    for (const profile of PROFILES) {
                        const segment = profile.startsWith('Pro') ? 'PRO' : (profile === 'Industrial' ? 'C&I' : 'Residential & Business');
                        const category = segment === 'C&I' ? 'HV' : (segment === 'PRO' ? 'MV' : 'LV');
                        
                        const actualConnections = random(50, 200);
                        const budgetConnections = Math.floor(actualConnections * randomFloat(0.9, 1.1));
                        
                        const actualRevenueTotal = random(500000, 2000000);
                        const budgetRevenueTotal = Math.floor(actualRevenueTotal * randomFloat(0.9, 1.1));

                        const actualKwh = random(10000, 50000);
                        const budgetKwh = Math.floor(actualKwh * randomFloat(0.9, 1.1));
                        
                        const inactiveBoP = random(8, 20);
                        const newInactive = random(2, 7);
                        const wokenUp = random(1, 5);
                        const inactiveEoP = inactiveBoP + newInactive - wokenUp;

                        const newSubscriptions = random(5, 20);
                        const commissioned = Math.floor(newSubscriptions * randomFloat(0.8, 1.0));

                        const record: MonthlyData = {
                            year,
                            month,
                            zone,
                            site,
                            phase,
                            profile,
                            category,
                            segment,
                            segmentation: getSegmentation(profile),
                            connections: {
                                total: { actual: actualConnections, budget: budgetConnections },
                                newSubscriptions: { actual: newSubscriptions, budget: random(4, 18) },
                                upgrades: { actual: random(1, 5), budget: random(1, 4) },
                                downgrades: { actual: random(1, 3), budget: random(1, 2) },
                                inactive: { actual: inactiveEoP, budget: random(2, 8) },
                                closed: { actual: random(1, 5), budget: random(1, 4) },
                                commissioned: { actual: commissioned, budget: Math.floor(commissioned * 0.95) },
                                removed: { actual: random(20, 100), budget: random(20, 100) },
                            },
                            revenue: {
                                total: { actual: actualRevenueTotal, budget: budgetRevenueTotal },
                                subscription: { actual: actualRevenueTotal * 0.3, budget: budgetRevenueTotal * 0.3 },
                                consumption: { actual: actualRevenueTotal * 0.65, budget: budgetRevenueTotal * 0.65 },
                                adjustments: { actual: actualRevenueTotal * 0.05, budget: budgetRevenueTotal * 0.05 },
                            },
                            consumption: {
                                soldKwh: { actual: actualKwh, budget: budgetKwh },
                                avgKwhPerConnectionMonth: { actual: actualKwh / actualConnections, budget: budgetKwh / budgetConnections },
                                avgKwhPerConnectionDay: { actual: (actualKwh / actualConnections) / 30, budget: (budgetKwh / budgetConnections) / 30 },
                                avgPricePerKwh: { actual: (actualRevenueTotal * 0.65) / actualKwh, budget: (budgetRevenueTotal * 0.65) / budgetKwh },
                                arpu: { actual: (actualRevenueTotal * 0.65) / actualConnections, budget: (budgetRevenueTotal * 0.65) / budgetConnections },
                            },
                            clients: {
                                total: random(200, 500),
                                new: random(10, 30),
                                closed: random(5, 15),
                                inactive: inactiveEoP,
                                wokenUp: wokenUp,
                                inactiveBoP: inactiveBoP,
                                newInactive: newInactive,
                            }
                        };
                        data.push(record);
                    }
                }
            }
        }
    }
    return data;
};

const generateClients = (count: number): Client[] => {
    const clients: Client[] = [];
    const statuses: Client['status'][] = ['Active', 'Active', 'Active', 'Inactive', 'Closed'];
    for (let i = 0; i < count; i++) {
        const zone = ZONES[random(0, ZONES.length - 1)];
        const site = `${zone} Site ${random(1, SITES_PER_ZONE)}`;
        const profile = PROFILES[random(0, PROFILES.length-1)];
        const segment = profile.startsWith('Pro') ? 'PRO' : (profile === 'Industrial' ? 'C&I' : 'Residential & Business');

        clients.push({
            id: `CLI-${1000 + i}`,
            name: `Client ${1000 + i}`,
            formNumber: `F-${random(10000, 99999)}`,
            connectionDate: new Date(random(2020, 2024), random(0, 11), random(1, 28)).toISOString().split('T')[0],
            status: statuses[random(0, statuses.length - 1)],
            profile,
            segment,
            zone,
            site,
            phase: PHASES[random(0, PHASES.length - 1)],
            lastConsumption: random(50, 1000),
            totalRevenue: random(50000, 500000),
        });
    }
    return clients;
}


export const ApiDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState<MonthlyData[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        years: [], months: [], profiles: [], phases: [], sites: [], zones: [], segments: []
    });

    useEffect(() => {
        setLoading(true);
        // Using generated test data as requested to ensure the app works without a backend.
        const dashboardData = generateMonthlyData();
        const clientsData = generateClients(200);
        
        setRawData(dashboardData);
        setClients(clientsData);
        setFilterOptions(getFilterOptions(dashboardData));
        setLoading(false);
    }, []);

    const value = { loading, rawData, clients, filterOptions };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within an ApiDataProvider');
    }
    return context;
};
