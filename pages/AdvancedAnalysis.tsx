import React, { useMemo, useState } from 'react';
import { MonthlyData, FilterState } from '../types';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

// --- Helper Functions ---
const getQuarter = (month: number) => Math.floor((month - 1) / 3) + 1;

const getMonthsForQuarter = (quarter: number) => {
    if (quarter === 1) return [1, 2, 3];
    if (quarter === 2) return [4, 5, 6];
    if (quarter === 3) return [7, 8, 9];
    return [10, 11, 12];
};

const aggregateKpis = (data: MonthlyData[]) => {
    return data.reduce((acc, curr) => {
        acc.revenue += curr.revenue.total.actual;
        acc.consumption += curr.consumption.soldKwh.actual;
        acc.connections += curr.connections.total.actual;
        return acc;
    }, { revenue: 0, consumption: 0, connections: 0 });
};

const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

const ChangeIndicator: React.FC<{change: number}> = ({ change }) => {
    if (change === Infinity) return <span className="text-green-600 text-xs">N/A</span>;
    if (isNaN(change) || !isFinite(change)) return <span className="text-gray-500 text-xs">-</span>;
    
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const symbol = isPositive ? '▲' : '▼';
    
    return (
        <span className={`${color} font-medium text-xs`}>
            {symbol} {Math.abs(change).toFixed(1)}%
        </span>
    );
};

const AdvancedAnalysis: React.FC<PageProps> = ({ data, allData, filters }) => {
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'Monthly' | 'Quarterly'>('Monthly');

    const aggregatedData = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.revenueActual += curr.revenue.total.actual;
            acc.revenueBudget += curr.revenue.total.budget;
            acc.consumptionActual += curr.consumption.soldKwh.actual;
            acc.consumptionBudget += curr.consumption.soldKwh.budget;
            acc.connectionsActual += curr.connections.total.actual;
            acc.connectionsBudget += curr.connections.total.budget;
            return acc;
        }, {
            revenueActual: 0, revenueBudget: 0,
            consumptionActual: 0, consumptionBudget: 0,
            connectionsActual: 0, connectionsBudget: 0,
        });
    }, [data]);

    const budgetComparisonData = [
        { name: 'Revenue', Actual: aggregatedData.revenueActual, Budget: aggregatedData.revenueBudget, isCurrency: true },
        { name: 'Consumption (kWh)', Actual: aggregatedData.consumptionActual, Budget: aggregatedData.consumptionBudget, isCurrency: false },
        { name: 'Connections', Actual: aggregatedData.connectionsActual, Budget: aggregatedData.connectionsBudget, isCurrency: false },
    ];
    
    const monthlyComparisonData = useMemo(() => {
        const currentKpis = aggregateKpis(data);

        const prevMonth = filters.month === 1 ? 12 : filters.month - 1;
        const prevYear = filters.month === 1 ? filters.year - 1 : filters.year;
        const prevMonthRaw = allData.filter(d => d.year === prevYear && d.month === prevMonth);
        const prevMonthKpis = aggregateKpis(prevMonthRaw);

        const prevYearRaw = allData.filter(d => d.year === filters.year - 1 && d.month === filters.month);
        const prevYearKpis = aggregateKpis(prevYearRaw);

        return { current: currentKpis, previous: prevMonthKpis, yearAgo: prevYearKpis };
    }, [data, allData, filters]);

    const quarterlyComparisonData = useMemo(() => {
        const currentQuarter = getQuarter(filters.month);
        const currentQuarterMonths = getMonthsForQuarter(currentQuarter);
        
        const currentQuarterRaw = allData.filter(d => d.year === filters.year && currentQuarterMonths.includes(d.month));
        const currentQuarterKpis = aggregateKpis(currentQuarterRaw);
        
        const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const prevQuarterYear = currentQuarter === 1 ? filters.year - 1 : filters.year;
        const prevQuarterMonths = getMonthsForQuarter(prevQuarter);
        const prevQuarterRaw = allData.filter(d => d.year === prevQuarterYear && prevQuarterMonths.includes(d.month));
        const prevQuarterKpis = aggregateKpis(prevQuarterRaw);
        
        const yearAgoQuarterRaw = allData.filter(d => d.year === filters.year - 1 && currentQuarterMonths.includes(d.month));
        const yearAgoQuarterKpis = aggregateKpis(yearAgoQuarterRaw);
        
        return { current: currentQuarterKpis, previous: prevQuarterKpis, yearAgo: yearAgoQuarterKpis };
    }, [allData, filters]);
    
    const activeComparisonData = activeTab === 'Monthly' ? monthlyComparisonData : quarterlyComparisonData;
    const periodLabels = activeTab === 'Monthly' 
        ? { current: 'Current Month', previous: 'Previous Month (M-1)', yearAgo: 'Same Month (Y-1)' }
        : { current: `Current Quarter (Q${getQuarter(filters.month)})`, previous: 'Previous Quarter (Q-1)', yearAgo: 'Same Quarter (Y-1)' };

    const tableRows = [
        {
            label: 'Total Revenue',
            current: formatCurrency(activeComparisonData.current.revenue),
            previous: formatCurrency(activeComparisonData.previous.revenue),
            changeVsPrevious: calculateChange(activeComparisonData.current.revenue, activeComparisonData.previous.revenue),
            yearAgo: formatCurrency(activeComparisonData.yearAgo.revenue),
            changeVsYearAgo: calculateChange(activeComparisonData.current.revenue, activeComparisonData.yearAgo.revenue),
        },
        {
            label: 'Energy Sold (kWh)',
            current: activeComparisonData.current.consumption.toLocaleString(),
            previous: activeComparisonData.previous.consumption.toLocaleString(),
            changeVsPrevious: calculateChange(activeComparisonData.current.consumption, activeComparisonData.previous.consumption),
            yearAgo: activeComparisonData.yearAgo.consumption.toLocaleString(),
            changeVsYearAgo: calculateChange(activeComparisonData.current.consumption, activeComparisonData.yearAgo.consumption),
        },
        {
            label: 'Connections',
            current: activeComparisonData.current.connections.toLocaleString(),
            previous: activeComparisonData.previous.connections.toLocaleString(),
            changeVsPrevious: calculateChange(activeComparisonData.current.connections, activeComparisonData.previous.connections),
            yearAgo: activeComparisonData.yearAgo.connections.toLocaleString(),
            changeVsYearAgo: calculateChange(activeComparisonData.current.connections, activeComparisonData.yearAgo.connections),
        },
    ];

    const kpiChartData = {
        Revenue: [
            { name: periodLabels.current, value: activeComparisonData.current.revenue },
            { name: periodLabels.previous, value: activeComparisonData.previous.revenue },
            { name: periodLabels.yearAgo, value: activeComparisonData.yearAgo.revenue },
        ],
        Consumption: [
            { name: periodLabels.current, value: activeComparisonData.current.consumption },
            { name: periodLabels.previous, value: activeComparisonData.previous.consumption },
            { name: periodLabels.yearAgo, value: activeComparisonData.yearAgo.consumption },
        ],
        Connections: [
            { name: periodLabels.current, value: activeComparisonData.current.connections },
            { name: periodLabels.previous, value: activeComparisonData.previous.connections },
            { name: periodLabels.yearAgo, value: activeComparisonData.yearAgo.connections },
        ],
    };


    return (
        <div className="space-y-8">
            <ChartContainer title="Actual vs. Budget Performance">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetComparisonData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(value, index) => {
                            const item = budgetComparisonData[index] || budgetComparisonData[0];
                            return item.isCurrency ? formatCurrency(value, undefined, 'compact') : new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
                        }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                            formatter={(value: number, name, props) => {
                                return props.payload.isCurrency ? formatCurrency(value) : value.toLocaleString();
                            }}
                        />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Bar dataKey="Actual" fill="#44546A" />
                        <Bar dataKey="Budget" fill="#a0aec0" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Time-Based KPI Analysis</h3>
                    <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg p-0.5">
                        <button onClick={() => setActiveTab('Monthly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'Monthly' ? 'bg-brand-blue-dark text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                            Monthly Analysis
                        </button>
                        <button onClick={() => setActiveTab('Quarterly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'Quarterly' ? 'bg-brand-blue-dark text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                            Quarterly Analysis
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">KPI</th>
                                <th className="px-4 py-3 text-right">{periodLabels.current}</th>
                                <th className="px-4 py-3 text-right">{periodLabels.previous}</th>
                                <th className="px-4 py-3 text-right">% Change vs Prev.</th>
                                <th className="px-4 py-3 text-right">{periodLabels.yearAgo}</th>
                                <th className="px-4 py-3 text-right">% Change vs Y-1</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                           {tableRows.map(row => (
                               <tr key={row.label} className="hover:bg-gray-50">
                                   <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                                   <td className="px-4 py-3 text-right font-semibold text-gray-800">{row.current}</td>
                                   <td className="px-4 py-3 text-right">{row.previous}</td>
                                   <td className="px-4 py-3 text-right"><ChangeIndicator change={row.changeVsPrevious} /></td>
                                   <td className="px-4 py-3 text-right">{row.yearAgo}</td>
                                   <td className="px-4 py-3 text-right"><ChangeIndicator change={row.changeVsYearAgo} /></td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ChartContainer title="Revenue Comparison">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kpiChartData.Revenue} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6b7280' }} tickFormatter={(value) => formatCurrency(value, undefined, 'compact')} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280' }} width={120} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="value" fill="#44546A" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Consumption (kWh) Comparison">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kpiChartData.Consumption} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6b7280' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280' }} width={120} />
                                <Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="value" fill="#a0aec0" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Connections Comparison">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kpiChartData.Connections} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6b7280' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280' }} width={120} />
                                <Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="value" fill="#FFD966" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

            </div>
        </div>
    );
};

export default AdvancedAnalysis;
