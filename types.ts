export interface FilterState {
    year: number;
    month: number;
    profile: string;
    phase: string;
    site: string;
    zone: string;
    segment: string;
}

export interface FilterOptions {
    years: number[];
    months: { value: number; label: string }[];
    profiles: string[];
    phases: string[];
    sites: string[];
    zones: string[];
    segments: string[];
}

export type Page = 'ExecutiveSummary' | 'Consumption' | 'Commercial' | 'Clients' | 'AdvancedAnalysis' | 'ConnectionPipeline' | 'SiteManagement' | 'CustomerIntelligence';

export type Currency = 'FCFA' | 'EUR';

export interface KPI {
    actual: number;
    budget: number;
}

export interface Revenue {
    subscription: KPI;
    consumption: KPI;
    adjustments: KPI;
    total: KPI;
}

export interface Connections {
    total: KPI;
    newSubscriptions: KPI;
    upgrades: KPI;
    downgrades: KPI;
    inactive: KPI;
    closed: KPI;
    commissioned: KPI;
    removed: KPI;
}

export interface ConsumptionData {
    soldKwh: KPI;
    avgKwhPerConnectionMonth: KPI;
    avgKwhPerConnectionDay: KPI;
    avgPricePerKwh: KPI;
    arpu: KPI;
}

export interface SegmentData {
    connections: Connections;
    revenue: Revenue;
    consumption: ConsumptionData;
}

export type Segmentation = 'Low' | 'Middle' | 'Premium' | 'Pros';

export interface MonthlyData {
    year: number;
    month: number;
    zone: string;
    site: string;
    phase: string;
    profile: string;
    category: string;
    segment: 'Residential & Business' | 'PRO' | 'C&I';
    segmentation: Segmentation;
    connections: Connections;
    revenue: Revenue;
    consumption: ConsumptionData;
    clients: {
        total: number;
        new: number;
        closed: number;
        inactive: number; // Inactive EoP
        wokenUp: number; // Woken Up / Reactivated
        inactiveBoP: number; // Inactive BoP
        newInactive: number;
    }
}

export interface Client {
    id: string;
    name: string;
    formNumber: string;
    connectionDate: string;
    status: 'Active' | 'Inactive' | 'Closed';
    profile: string;
    segment: string;
    zone: string;
    site: string;
    phase: string;
    lastConsumption: number;
    totalRevenue: number;
}