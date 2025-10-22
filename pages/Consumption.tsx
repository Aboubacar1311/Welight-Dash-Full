import React, { useMemo, useState } from 'react';
import { MonthlyData, FilterState } from '../types';
import ChartContainer from '../components/ChartContainer';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell, CartesianGrid, LineChart, Line } from 'recharts';
import { ZapIcon, DollarSignIcon, PlugZapIcon } from '../components/icons';
import { useCurrency } from '../contexts/CurrencyContext';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

const COLORS = ['#44546A', '#FFD966', '#a0aec0', '#f6ad55'];

type ViewMode = 'chart' | 'table';

const Consumption: React.FC<PageProps> = ({ data, allData, filters }) => {
    const [view1, setView1] = useState<ViewMode>('chart');
    const [view2, setView2] = useState<ViewMode>('chart');
    const { formatCurrency } = useCurrency();

    const aggregatedDataBySegment = useMemo(() => {
        const bySegment = data.reduce((acc, curr) => {
            if (!acc[curr.segment]) {
                acc[curr.segment] = { soldKwh: 0, revenue: 0, connections: 0 };
            }
            acc[curr.segment].soldKwh += curr.consumption.soldKwh.actual;
            acc[curr.segment].revenue += curr.revenue.consumption.actual;
            acc[curr.segment].connections += curr.connections.total.actual;
            return acc;
        }, {} as Record<string, { soldKwh: number, revenue: number, connections: number }>);
        
        return Object.entries(bySegment).map(([name, values]) => ({ name, ...values }));
    }, [data]);

    const totalConsumption = useMemo(() => aggregatedDataBySegment.reduce((sum, item) => sum + item.soldKwh, 0), [aggregatedDataBySegment]);
    const totalRevenue = useMemo(() => aggregatedDataBySegment.reduce((sum, item) => sum + item.revenue, 0), [aggregatedDataBySegment]);
    const totalConnections = useMemo(() => aggregatedDataBySegment.reduce((sum, item) => sum + item.connections, 0), [aggregatedDataBySegment]);
    
    const avgPriceKwh = totalConsumption > 0 ? totalRevenue / totalConsumption : 0;
    const avgConsumptionConnection = totalConnections > 0 ? totalConsumption / totalConnections : 0;

    const detailedAggregates = useMemo(() => {
        const segments: Array<'Residential & Business' | 'PRO' | 'C&I'> = ['Residential & Business', 'PRO', 'C&I'];
        const result: Record<string, any> = {};

        segments.forEach(seg => {
            const segmentData = data.filter(d => d.segment === seg);
            const totalConnections = segmentData.reduce((sum, d) => sum + d.connections.total.actual, 0);
            const totalSoldKwh = segmentData.reduce((sum, d) => sum + d.consumption.soldKwh.actual, 0);
            const totalConsumptionRevenue = segmentData.reduce((sum, d) => sum + d.revenue.consumption.actual, 0);

            result[seg] = {
                connections: totalConnections,
                removed: segmentData.reduce((sum, d) => sum + d.connections.removed.actual, 0),
                newSubscriptions: segmentData.reduce((sum, d) => sum + d.connections.newSubscriptions.actual, 0),
                commissioned: segmentData.reduce((sum, d) => sum + d.connections.commissioned.actual, 0),
                upgrades: segmentData.reduce((sum, d) => sum + d.connections.upgrades.actual, 0),
                downgrades: segmentData.reduce((sum, d) => sum + d.connections.downgrades.actual, 0),
                inactiveBoP: segmentData.reduce((sum, d) => sum + d.clients.inactiveBoP, 0),
                newInactive: segmentData.reduce((sum, d) => sum + d.clients.newInactive, 0),
                wokenUp: segmentData.reduce((sum, d) => sum + d.clients.wokenUp, 0),
                purchase: totalSoldKwh,
                purchasePerConnectionMonth: totalConnections > 0 ? totalSoldKwh / totalConnections : 0,
                purchasePerConnectionDay: totalConnections > 0 ? (totalSoldKwh / totalConnections) / 30 : 0,
                revenueSubscription: segmentData.reduce((sum, d) => sum + d.revenue.subscription.actual, 0),
                revenueConsumption: totalConsumptionRevenue,
                arpu: totalConnections > 0 ? totalConsumptionRevenue / totalConnections : 0,
                pricePerKwh: totalSoldKwh > 0 ? totalConsumptionRevenue / totalSoldKwh : 0,
                revenueTotal: segmentData.reduce((sum, d) => sum + d.revenue.total.actual, 0),
            };
        });
        
        const totalAggregates = {
            connections: segments.reduce((sum, seg) => sum + result[seg].connections, 0),
            removed: segments.reduce((sum, seg) => sum + result[seg].removed, 0),
            newSubscriptions: segments.reduce((sum, seg) => sum + result[seg].newSubscriptions, 0),
            commissioned: segments.reduce((sum, seg) => sum + result[seg].commissioned, 0),
            upgrades: segments.reduce((sum, seg) => sum + result[seg].upgrades, 0),
            downgrades: segments.reduce((sum, seg) => sum + result[seg].downgrades, 0),
            inactiveBoP: segments.reduce((sum, seg) => sum + result[seg].inactiveBoP, 0),
            newInactive: segments.reduce((sum, seg) => sum + result[seg].newInactive, 0),
            wokenUp: segments.reduce((sum, seg) => sum + result[seg].wokenUp, 0),
            purchase: segments.reduce((sum, seg) => sum + result[seg].purchase, 0),
            revenueSubscription: segments.reduce((sum, seg) => sum + result[seg].revenueSubscription, 0),
            revenueConsumption: segments.reduce((sum, seg) => sum + result[seg].revenueConsumption, 0),
            revenueTotal: segments.reduce((sum, seg) => sum + result[seg].revenueTotal, 0),
        };

        result['Total'] = {
            ...totalAggregates,
            purchasePerConnectionMonth: totalAggregates.connections > 0 ? totalAggregates.purchase / totalAggregates.connections : 0,
            purchasePerConnectionDay: totalAggregates.connections > 0 ? (totalAggregates.purchase / totalAggregates.connections) / 30 : 0,
            arpu: totalAggregates.connections > 0 ? totalAggregates.revenueConsumption / totalAggregates.connections : 0,
            pricePerKwh: totalAggregates.purchase > 0 ? totalAggregates.revenueConsumption / totalAggregates.purchase : 0,
        };

        return result;

    }, [data]);
    
    const yearlyEvolutionData = useMemo(() => {
        const yearData = allData.filter(d => d.year === filters.year);
        return Array.from({length: 12}, (_, i) => {
            const month = i + 1;
            const dataForMonth = yearData.filter(d => d.month === month);
            const consumption = dataForMonth.reduce((sum, d) => sum + d.consumption.soldKwh.actual, 0);
            const revenue = dataForMonth.reduce((sum, d) => sum + d.revenue.consumption.actual, 0);
            return {
                name: new Date(filters.year, i, 1).toLocaleString('default', { month: 'short' }),
                Consumption: consumption,
                Revenue: revenue,
            };
        });
    }, [allData, filters.year]);

    const analysisRows = [
        { header: "Connections" },
        { label: "Connections (connected or not) EoP", key: "connections", format: (v:number) => v.toLocaleString() },
        { label: "Cumulated Removed Connections EoP", key: "removed", format: (v:number) => v.toLocaleString() },
        { label: "New subscriptions EoP", key: "newSubscriptions", format: (v:number) => v.toLocaleString() },
        { label: "Commissioned Connections EoP", key: "commissioned", format: (v:number) => v.toLocaleString() },
        { header: "Profile Change EoP" },
        { label: "Upgrade", key: "upgrades", format: (v:number) => v.toLocaleString(), indent: true },
        { label: "Downgrade", key: "downgrades", format: (v:number) => v.toLocaleString(), indent: true },
        { header: "Inactive Connections" },
        { label: "Inactive Connections BoP (90 D)", key: "inactiveBoP", format: (v:number) => v.toLocaleString(), indent: true },
        { label: "New Inactive Connections", key: "newInactive", format: (v:number) => v.toLocaleString(), indent: true },
        { label: "Woken Up Connections EoP", key: "wokenUp", format: (v:number) => v.toLocaleString(), indent: true },
        { header: "Purchase" },
        { label: "Purchase (kWh)", key: "purchase", format: (v:number) => v.toLocaleString() },
        { label: "Purchase per connection per month", key: "purchasePerConnectionMonth", format: (v:number) => v.toFixed(2) },
        { label: "Purchase per connection per day", key: "purchasePerConnectionDay", format: (v:number) => v.toFixed(2) },
        { header: "Revenue" },
        { label: "Revenue subscription HT", key: "revenueSubscription", format: (v:number) => formatCurrency(v) },
        { label: "Revenue consumption HT", key: "revenueConsumption", format: (v:number) => formatCurrency(v) },
        { label: "ARPU consumption HT", key: "arpu", format: (v:number) => formatCurrency(v) },
        { label: "Price per kWh purchased HT", key: "pricePerKwh", format: (v:number) => formatCurrency(v) },
        { label: "Revenue HT (subscription+consumption)", key: "revenueTotal", format: (v:number) => formatCurrency(v) },
    ];
    
    const renderTableFromData = (chartData: any[], valueKey: string, nameKey: string, valueLabel: string) => (
        <div className="overflow-y-auto h-full">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">Segment</th>
                        <th scope="col" className="px-6 py-3 text-right">{valueLabel}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {chartData.map((item, index) => (
                        <tr key={index} className="bg-white hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-900">{item[nameKey]}</td>
                            <td className="px-6 py-3 text-right">{item[valueKey].toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Avg. Price / kWh"
                    value={formatCurrency(avgPriceKwh)}
                    icon={<DollarSignIcon className="h-8 w-8" />}
                    colorClass="bg-green-500/20"
                />
                <StatCard 
                    title="Avg. Consumption / Connection (kWh)"
                    value={avgConsumptionConnection.toFixed(2)}
                    icon={<ZapIcon className="h-8 w-8" />}
                    colorClass="bg-yellow-500/20"
                />
                <StatCard 
                    title="Total Energy Sold (kWh)"
                    value={totalConsumption.toLocaleString()}
                    icon={<PlugZapIcon className="h-8 w-8" />}
                    colorClass="bg-blue-500/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Consumption by Segment (kWh)" view={view1} onViewChange={setView1}>
                    {view1 === 'chart' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedDataBySegment} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6b7280' }} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                                <Legend wrapperStyle={{color: '#4b5563'}} />
                                <Bar dataKey="soldKwh" fill="#44546A" name="Energy Sold (kWh)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        renderTableFromData(aggregatedDataBySegment, 'soldKwh', 'name', 'Energy Sold (kWh)')
                    )}
                </ChartContainer>

                <ChartContainer title="Consumption Share by Segment" view={view2} onViewChange={setView2}>
                    {view2 === 'chart' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aggregatedDataBySegment}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="soldKwh"
                                    nameKey="name"
                                    // Fix: Manually calculate percentage to avoid type errors with the `percent` prop.
                                    label={({ name, value }) => `${name} ${totalConsumption > 0 ? ((value / totalConsumption) * 100).toFixed(0) : 0}%`}
                                >
                                    {aggregatedDataBySegment.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                                <Legend wrapperStyle={{color: '#4b5563'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        renderTableFromData(aggregatedDataBySegment, 'soldKwh', 'name', 'Energy Sold (kWh)')
                    )}
                </ChartContainer>
            </div>
            
             <ChartContainer title={`Yearly Consumption Evolution - ${filters.year}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyEvolutionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                        <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280' }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value, undefined, 'compact')} tick={{ fill: '#6b7280' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                            formatter={(value: number, name: string) => [name.includes('Revenue') ? formatCurrency(value) : value.toLocaleString(undefined, {maximumFractionDigits: 0}), name]}
                        />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Line yAxisId="left" type="monotone" dataKey="Consumption" stroke="#44546A" strokeWidth={2} name="Consumption (kWh)" />
                        <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#FFD966" strokeWidth={2} name="Revenue" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Indicator</th>
                                <th scope="col" className="px-4 py-3 text-right">Residential & Business</th>
                                <th scope="col" className="px-4 py-3 text-right">PRO</th>
                                <th scope="col" className="px-4 py-3 text-right">C&I</th>
                                <th scope="col" className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {analysisRows.map((row, index) => {
                                if ('header' in row) {
                                    return (
                                        <tr key={index} className="bg-gray-100">
                                            <td colSpan={5} className="px-4 py-2 font-semibold text-gray-800 text-base">{row.header}</td>
                                        </tr>
                                    );
                                }
                                const segments = ['Residential & Business', 'PRO', 'C&I', 'Total'];
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className={`px-4 py-2 font-medium text-gray-600 ${row.indent ? 'pl-8' : ''}`}>{row.label}</td>
                                        {segments.map(seg => (
                                            <td key={seg} className="px-4 py-2 text-right">
                                                {row.format(detailedAggregates[seg][row.key])}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default Consumption;