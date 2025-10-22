import React, { useMemo, useState } from 'react';
import { MonthlyData, FilterState, Segmentation } from '../types';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, CartesianGrid, ComposedChart, Brush } from 'recharts';
import { DollarSignIcon, UsersRoundIcon, PlugZapIcon } from '../components/icons';
import { useCurrency } from '../contexts/CurrencyContext';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

type ViewMode = 'chart' | 'table';

const aggregateData = (data: MonthlyData[]) => {
    return data.reduce((acc, curr) => {
        acc.totalRevenue += curr.revenue.total.actual;
        acc.totalConnections += curr.connections.total.actual;
        acc.totalConsumption += curr.consumption.soldKwh.actual;
        acc.totalClients += curr.clients.total;
        acc.arpu += curr.consumption.arpu.actual * curr.connections.total.actual; // Weighted ARPU
        acc.commissioned += curr.connections.commissioned.actual;
        acc.revenueBudget += curr.revenue.total.budget;
        return acc;
    }, { totalRevenue: 0, totalConnections: 0, totalConsumption: 0, totalClients: 0, arpu: 0, commissioned: 0, revenueBudget: 0 });
};

const SitePhasePerformance: React.FC<{ allData: MonthlyData[], filters: FilterState }> = ({ allData, filters }) => {
    const { formatCurrency } = useCurrency();
    const [view, setView] = useState<ViewMode>('table');

    const dataBySiteAndPhase = useMemo(() => {
        // ... (data aggregation logic remains the same)
        const getAggregated = (year: number, month: number) => {
            const filtered = allData.filter(d => d.year === year && d.month === month);
            return filtered.reduce((acc, curr) => {
                const key = `${curr.site}-${curr.phase}`;
                if (!acc[key]) {
                    acc[key] = { site: curr.site, phase: curr.phase, arpu: 0, commissioned: 0, connections: 0 };
                }
                acc[key].commissioned += curr.connections.commissioned.actual;
                acc[key].arpu += curr.consumption.arpu.actual * curr.connections.total.actual;
                acc[key].connections += curr.connections.total.actual;
                return acc;
            }, {} as Record<string, { site: string, phase: string, arpu: number, commissioned: number, connections: number }>);
        };

        const currentMonthData = getAggregated(filters.year, filters.month);
        const prevMonth = filters.month === 1 ? 12 : filters.month - 1;
        const prevMonthYear = filters.month === 1 ? filters.year - 1 : filters.year;
        const prevMonthData = getAggregated(prevMonthYear, prevMonth);
        const prevYearData = getAggregated(filters.year - 1, filters.month);
        const allKeys = new Set([...Object.keys(currentMonthData), ...Object.keys(prevMonthData), ...Object.keys(prevYearData)]);
        
        return Array.from(allKeys).map(key => {
            const current = currentMonthData[key];
            const prev = prevMonthData[key];
            const prevY = prevYearData[key];

            return {
                name: `${current?.site || prev?.site || prevY?.site} - ${current?.phase || prev?.phase || prevY?.phase}`,
                site: current?.site || prev?.site || prevY?.site,
                phase: current?.phase || prev?.phase || prevY?.phase,
                arpu_current: current ? (current.arpu / (current.connections || 1)) : 0,
                comm_current: current?.commissioned || 0,
                arpu_prev: prev ? (prev.arpu / (prev.connections || 1)) : 0,
                comm_prev: prev?.commissioned || 0,
                arpu_prevY: prevY ? (prevY.arpu / (prevY.connections || 1)) : 0,
                comm_prevY: prevY?.commissioned || 0,
            };
        }).sort((a,b) => a.site.localeCompare(b.site) || a.phase.localeCompare(b.phase));
    }, [allData, filters]);

    return (
        <ChartContainer title="Site/Phase Performance Comparison" view={view} onViewChange={setView}>
            {view === 'chart' ? (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dataBySiteAndPhase} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis yAxisId="left" tick={{ fill: '#6b7280' }} label={{ value: 'Commissioned', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280' }} tickFormatter={(value) => formatCurrency(value, undefined, 'compact')} label={{ value: 'ARPU', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value, name) => (name.toString().includes('ARPU') ? formatCurrency(value as number) : value.toLocaleString())} />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Bar yAxisId="left" dataKey="comm_current" fill="#44546A" name="Commissioned (Current M)" />
                        <Bar yAxisId="left" dataKey="comm_prev" fill="#a0aec0" name="Commissioned (M-1)" />
                        <Line yAxisId="right" type="monotone" dataKey="arpu_current" stroke="#FFD966" strokeWidth={3} name="ARPU (Current M)" />
                        <Line yAxisId="right" type="monotone" dataKey="arpu_prev" stroke="#f6ad55" strokeWidth={2} name="ARPU (M-1)" strokeDasharray="5 5" />
                        <Brush dataKey="name" height={30} stroke="#44546A" fill="#f1f5f9" />
                    </ComposedChart>
                </ResponsiveContainer>
            ) : (
                <div className="overflow-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Site</th>
                                <th className="px-4 py-3">Phase</th>
                                <th className="px-4 py-3 text-right">ARPU (Current M)</th>
                                <th className="px-4 py-3 text-right">Commissioned (Current M)</th>
                                <th className="px-4 py-3 text-right">ARPU (M-1)</th>
                                <th className="px-4 py-3 text-right">Commissioned (M-1)</th>
                                <th className="px-4 py-3 text-right">ARPU (Y-1)</th>
                                <th className="px-4 py-3 text-right">Commissioned (Y-1)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dataBySiteAndPhase.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-900">{row.site}</td>
                                    <td className="px-4 py-2">{row.phase}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.arpu_current)}</td>
                                    <td className="px-4 py-2 text-right">{row.comm_current.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.arpu_prev)}</td>
                                    <td className="px-4 py-2 text-right">{row.comm_prev.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(row.arpu_prevY)}</td>
                                    <td className="px-4 py-2 text-right">{row.comm_prevY.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ChartContainer>
    );
};

const ExecutiveSummary: React.FC<PageProps> = ({ data, allData, filters }) => {
    const { formatCurrency } = useCurrency();
    const [revenueView, setRevenueView] = useState<ViewMode>('chart');
    const [arpuView, setArpuView] = useState<ViewMode>('chart');

    const currentPeriodData = useMemo(() => {
        const aggregated = aggregateData(data);
        if (aggregated.totalConnections > 0) {
            aggregated.arpu = aggregated.arpu / aggregated.totalConnections;
        }
        return aggregated;
    }, [data]);
    
    const previousMonthData = useMemo(() => {
        const prevMonth = filters.month === 1 ? 12 : filters.month - 1;
        const prevYear = filters.month === 1 ? filters.year - 1 : filters.year;
        const prevData = allData.filter(d => d.year === prevYear && d.month === prevMonth);
        return aggregateData(prevData);
    }, [allData, filters]);

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    
    const revenueChange = calculateChange(currentPeriodData.totalRevenue, previousMonthData.totalRevenue);
    const clientsChange = calculateChange(currentPeriodData.totalClients, previousMonthData.totalClients);
    const consumptionChange = calculateChange(currentPeriodData.totalConsumption, previousMonthData.totalConsumption);
    
    const monthlyTrendData = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthData = allData.filter(d => d.year === filters.year && d.month === month);
            const aggregated = aggregateData(monthData);
            return {
                name: new Date(filters.year, i, 1).toLocaleString('default', { month: 'short' }),
                Actual: aggregated.totalRevenue,
                Budget: aggregated.revenueBudget,
            };
        });
    }, [allData, filters.year]);

    const arpuSeasonalityData = useMemo(() => {
        const monthlyArpu: { [key: number]: { totalArpu: number, totalConnections: number } } = {};
        for(let i=1; i<=12; i++) {
            monthlyArpu[i] = { totalArpu: 0, totalConnections: 0 };
        }
        
        allData.forEach(d => {
            monthlyArpu[d.month].totalArpu += d.consumption.arpu.actual * d.connections.total.actual;
            monthlyArpu[d.month].totalConnections += d.connections.total.actual;
        });

        return Object.entries(monthlyArpu).map(([month, monthData]) => ({
            name: new Date(2000, parseInt(month)-1, 1).toLocaleString('default', { month: 'short' }),
            ARPU: monthData.totalConnections > 0 ? monthData.totalArpu / monthData.totalConnections : 0,
        }));
    }, [allData]);

    const segmentationData = useMemo(() => {
        const segments: Segmentation[] = ['Low', 'Middle', 'Premium', 'Pros'];
        return segments.map(seg => {
            const filteredData = data.filter(d => d.segmentation === seg);
            const aggregated = aggregateData(filteredData);
            return {
                name: seg,
                Revenue: aggregated.totalRevenue,
                Connections: aggregated.totalConnections,
                ARPU: aggregated.totalConnections > 0 ? (aggregated.arpu / aggregated.totalConnections) : 0,
            }
        });
    }, [data]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(currentPeriodData.totalRevenue, undefined, 'standard')}
                    change={revenueChange}
                    icon={<DollarSignIcon />}
                    colorClass="bg-green-500/20"
                />
                 <StatCard 
                    title="Active Clients" 
                    value={currentPeriodData.totalClients.toLocaleString()}
                    change={clientsChange}
                    icon={<UsersRoundIcon />}
                    colorClass="bg-blue-500/20"
                />
                 <StatCard 
                    title="Energy Sold (kWh)" 
                    value={currentPeriodData.totalConsumption.toLocaleString()}
                    change={consumptionChange}
                    icon={<PlugZapIcon />}
                    colorClass="bg-yellow-500/20"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title={`Actual vs Budget Revenue - ${filters.year}`} view={revenueView} onViewChange={setRevenueView}>
                    {revenueView === 'chart' ? (
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={monthlyTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                                <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(value) => formatCurrency(value, undefined, 'compact')} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                                    labelStyle={{ color: '#1f2937' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{color: '#4b5563'}} />
                                <Bar dataKey="Actual" fill="#44546A" />
                                <Bar dataKey="Budget" fill="#a0aec0" />
                                <Brush dataKey="name" height={30} stroke="#44546A" fill="#f1f5f9" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="overflow-auto h-full">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Month</th>
                                        <th className="px-4 py-3 text-right">Actual Revenue</th>
                                        <th className="px-4 py-3 text-right">Budget Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyTrendData.map(row => (
                                        <tr key={row.name} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(row.Actual)}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(row.Budget)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ChartContainer>
                <ChartContainer title="ARPU Seasonality" view={arpuView} onViewChange={setArpuView}>
                     {arpuView === 'chart' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={arpuSeasonalityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                                <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                                    labelStyle={{ color: '#1f2937' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{color: '#4b5563'}} />
                                <Line type="monotone" dataKey="ARPU" stroke="#FFD966" strokeWidth={3} />
                                <Brush dataKey="name" height={30} stroke="#FFD966" fill="#f1f5f9" />
                            </LineChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="overflow-auto h-full">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Month</th>
                                        <th className="px-4 py-3 text-right">ARPU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arpuSeasonalityData.map(row => (
                                        <tr key={row.name} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(row.ARPU)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     )}
                </ChartContainer>
            </div>

            <SitePhasePerformance allData={allData} filters={filters} />
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recap by Segmentation</h3>
                <div className="overflow-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Segment</th>
                                <th className="px-4 py-3 text-right">Total Revenue</th>
                                <th className="px-4 py-3 text-right">Total Connections</th>
                                <th className="px-4 py-3 text-right">ARPU</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {segmentationData.map(row => (
                               <tr key={row.name} className="hover:bg-gray-50">
                                   <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                   <td className="px-4 py-3 text-right">{formatCurrency(row.Revenue)}</td>
                                   <td className="px-4 py-3 text-right">{row.Connections.toLocaleString()}</td>
                                   <td className="px-4 py-3 text-right">{formatCurrency(row.ARPU)}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ExecutiveSummary;