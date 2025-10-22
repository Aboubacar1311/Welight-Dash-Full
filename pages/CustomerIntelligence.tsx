import React, { useMemo } from 'react';
import { MonthlyData, FilterState, Segmentation } from '../types';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { UsersIcon, BrainCircuitIcon } from '../components/icons';
import { useCurrency } from '../contexts/CurrencyContext';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

const COLORS = ['#44546A', '#FFD966', '#a0aec0', '#f6ad55', '#38B2AC'];

const aggregateClientData = (data: MonthlyData[]) => {
    return data.reduce((acc, curr) => {
        acc.total += curr.clients.total;
        acc.new += curr.clients.new;
        acc.closed += curr.clients.closed;
        acc.inactive += curr.clients.inactive;
        acc.wokenUp += curr.clients.wokenUp;
        acc.inactiveBoP += curr.clients.inactiveBoP;
        acc.newInactive += curr.clients.newInactive;
        acc.revenue += curr.revenue.total.actual;
        acc.consumption += curr.consumption.soldKwh.actual;
        return acc;
    }, { total: 0, new: 0, closed: 0, inactive: 0, wokenUp: 0, inactiveBoP: 0, newInactive: 0, revenue: 0, consumption: 0 });
};

const CustomerIntelligence: React.FC<PageProps> = ({ data, allData, filters }) => {
    const { formatCurrency } = useCurrency();

    const clientHealthKPIs = useMemo(() => {
        const currentMonthData = aggregateClientData(data);

        const prevMonth = filters.month === 1 ? 12 : filters.month - 1;
        const prevYear = filters.month === 1 ? filters.year - 1 : filters.year;
        const prevMonthRaw = allData.filter(d => d.year === prevYear && d.month === prevMonth);
        const prevMonthData = aggregateClientData(prevMonthRaw);

        const totalClientsBoP = prevMonthData.total;
        
        const netGrowth = currentMonthData.new - currentMonthData.closed;
        const churnRate = totalClientsBoP > 0 ? (currentMonthData.closed / totalClientsBoP) * 100 : 0;
        const inactivityRate = currentMonthData.total > 0 ? (currentMonthData.inactive / currentMonthData.total) * 100 : 0;
        const reactivationRate = currentMonthData.inactiveBoP > 0 ? (currentMonthData.wokenUp / currentMonthData.inactiveBoP) * 100 : 0;
        
        return { netGrowth, churnRate, inactivityRate, reactivationRate };
    }, [data, allData, filters]);

    const healthTrendData = useMemo(() => {
        const trend: any[] = [];
        let currentDate = new Date(filters.year, filters.month - 1);

        for (let i = 0; i < 12; i++) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const monthData = allData.filter(d => d.year === year && d.month === month);
            const aggregated = aggregateClientData(monthData);

            const prevM = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
            const prevY = currentDate.getMonth() === 0 ? year - 1 : year;
            const prevMonthData = aggregateClientData(allData.filter(d => d.year === prevY && d.month === prevM));

            const totalClientsBoP = prevMonthData.total;
            const churnRate = totalClientsBoP > 0 ? (aggregated.closed / totalClientsBoP) * 100 : 0;
            const inactivityRate = aggregated.total > 0 ? (aggregated.inactive / aggregated.total) * 100 : 0;

            trend.push({
                name: currentDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
                'Churn Rate': churnRate,
                'Inactivity Rate': inactivityRate,
            });
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        return trend.reverse();
    }, [allData, filters]);

    const segmentationData = useMemo(() => {
        const segments: Segmentation[] = ['Low', 'Middle', 'Premium', 'Pros'];
        const totalRevenue = data.reduce((sum, d) => sum + d.revenue.total.actual, 0);
        const totalClients = data.reduce((sum, d) => sum + d.clients.total, 0);

        return segments.map(seg => {
            const segmentData = data.filter(d => d.segmentation === seg);
            const aggregated = aggregateClientData(segmentData);
            return {
                name: seg,
                clientCount: aggregated.total,
                clientPercent: totalClients > 0 ? (aggregated.total / totalClients) * 100 : 0,
                revenue: aggregated.revenue,
                revenuePercent: totalRevenue > 0 ? (aggregated.revenue / totalRevenue) * 100 : 0,
                arpu: aggregated.total > 0 ? aggregated.revenue / aggregated.total : 0,
                avgConsumption: aggregated.total > 0 ? aggregated.consumption / aggregated.total : 0,
            };
        });
    }, [data]);

    const monthlyFlowData = useMemo(() => {
        const current = aggregateClientData(data);
        const prevMonth = filters.month === 1 ? 12 : filters.month - 1;
        const prevYear = filters.month === 1 ? filters.year - 1 : filters.year;
        const prevMonthRaw = allData.filter(d => d.year === prevYear && d.month === prevMonth);
        const prev = aggregateClientData(prevMonthRaw);
        
        return {
            totalBoP: prev.total,
            inactiveBoP: current.inactiveBoP,
            activeBoP: prev.total - current.inactiveBoP,
            new: current.new,
            wokenUp: current.wokenUp,
            newInactive: current.newInactive,
            closed: current.closed,
            netChange: current.new - current.closed,
            totalEoP: current.total,
            inactiveEoP: current.inactive,
            activeEoP: current.total - current.inactive,
        };
    }, [data, allData, filters]);


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Net Client Growth" value={clientHealthKPIs.netGrowth.toLocaleString()} icon={<UsersIcon className="h-8 w-8" />} colorClass="bg-blue-500/20" />
                <StatCard title="Churn Rate" value={`${clientHealthKPIs.churnRate.toFixed(2)}%`} icon={<UsersIcon className="h-8 w-8 text-red-500" />} colorClass="bg-red-500/20" />
                <StatCard title="Inactivity Rate" value={`${clientHealthKPIs.inactivityRate.toFixed(2)}%`} icon={<UsersIcon className="h-8 w-8 text-yellow-500" />} colorClass="bg-yellow-500/20" />
                <StatCard title="Reactivation Rate" value={`${clientHealthKPIs.reactivationRate.toFixed(2)}%`} icon={<UsersIcon className="h-8 w-8 text-green-500" />} colorClass="bg-green-500/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Client Health Trends (Last 12 Months)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} tick={{ fill: '#6b7280' }} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                            <Legend wrapperStyle={{color: '#4b5563'}} />
                            <Line type="monotone" dataKey="Churn Rate" stroke="#dc3545" strokeWidth={2} />
                            <Line type="monotone" dataKey="Inactivity Rate" stroke="#FFD966" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Revenue Contribution by Segmentation">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={segmentationData}
                                cx="50%"
                                cy="50%"
                                dataKey="revenue"
                                nameKey="name"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                paddingAngle={5}
                                // FIX: Cast `percent` to `number` to resolve a TypeScript error. The `percent` from recharts' render prop is not strictly typed.
                                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                            >
                                {segmentationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                             <Legend wrapperStyle={{color: '#4b5563'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <ChartContainer title="Segment Performance Comparison">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Segment</th>
                                        <th className="px-4 py-3 text-right"># Clients</th>
                                        <th className="px-4 py-3 text-right">% of Total</th>
                                        <th className="px-4 py-3 text-right">Total Revenue</th>
                                        <th className="px-4 py-3 text-right">% of Total</th>
                                        <th className="px-4 py-3 text-right">ARPU</th>
                                        <th className="px-4 py-3 text-right">Avg. kWh/Client</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {segmentationData.map(seg => (
                                    <tr key={seg.name} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{seg.name}</td>
                                        <td className="px-4 py-3 text-right">{seg.clientCount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{seg.clientPercent.toFixed(1)}%</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(seg.revenue)}</td>
                                        <td className="px-4 py-3 text-right">{seg.revenuePercent.toFixed(1)}%</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(seg.arpu)}</td>
                                        <td className="px-4 py-3 text-right">{seg.avgConsumption.toFixed(1)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartContainer>
                </div>
                <div className="lg:col-span-2">
                     <ChartContainer title="Monthly Customer Flow">
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left text-gray-500">
                                <tbody className="divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2">Active Clients (Start)</td><td className="px-4 py-2 text-right font-medium">{monthlyFlowData.activeBoP.toLocaleString()}</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2">Inactive Clients (Start)</td><td className="px-4 py-2 text-right font-medium">{monthlyFlowData.inactiveBoP.toLocaleString()}</td></tr>
                                    <tr className="bg-gray-100"><td className="px-4 py-2 font-semibold text-gray-800" colSpan={2}>Movements</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2 text-green-600 pl-8">+ New Clients</td><td className="px-4 py-2 text-right text-green-600">{monthlyFlowData.new.toLocaleString()}</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2 text-green-600 pl-8">+ Reactivated Clients</td><td className="px-4 py-2 text-right text-green-600">{monthlyFlowData.wokenUp.toLocaleString()}</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2 text-yellow-600 pl-8">- Became Inactive</td><td className="px-4 py-2 text-right text-yellow-600">-{monthlyFlowData.newInactive.toLocaleString()}</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2 text-red-600 pl-8">- Closed Clients</td><td className="px-4 py-2 text-right text-red-600">-{monthlyFlowData.closed.toLocaleString()}</td></tr>
                                    <tr className="bg-gray-100"><td className="px-4 py-2 font-semibold text-gray-800" colSpan={2}>End of Month Status</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2">Active Clients (End)</td><td className="px-4 py-2 text-right font-bold text-gray-900">{monthlyFlowData.activeEoP.toLocaleString()}</td></tr>
                                    <tr className="hover:bg-gray-50"><td className="px-4 py-2">Inactive Clients (End)</td><td className="px-4 py-2 text-right font-bold text-gray-900">{monthlyFlowData.inactiveEoP.toLocaleString()}</td></tr>
                                    <tr className="border-t-2 border-gray-300"><td className="px-4 py-2 font-bold">Total Clients (End)</td><td className="px-4 py-2 text-right font-bold">{monthlyFlowData.totalEoP.toLocaleString()}</td></tr>
                                </tbody>
                           </table>
                        </div>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default CustomerIntelligence;