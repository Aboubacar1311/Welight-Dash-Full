import React, { useMemo } from 'react';
import { MonthlyData, FilterState } from '../types';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid, LineChart, Line } from 'recharts';
import { ClockIcon, UsersIcon, ZapIcon } from '../components/icons';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

const ConnectionPipeline: React.FC<PageProps> = ({ data, allData, filters }) => {

    const pipelineData = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.newSubscriptions += curr.connections.newSubscriptions.actual;
            acc.commissioned += curr.connections.commissioned.actual;
            return acc;
        }, { newSubscriptions: 0, commissioned: 0 });
    }, [data]);

    const pendingConnections = pipelineData.newSubscriptions - pipelineData.commissioned;
    const commissioningRate = pipelineData.newSubscriptions > 0 ? (pipelineData.commissioned / pipelineData.newSubscriptions) * 100 : 0;

    const pipelineByZone = useMemo(() => {
        const byZone = data.reduce((acc, curr) => {
            if (!acc[curr.zone]) {
                acc[curr.zone] = { new: 0, commissioned: 0 };
            }
            acc[curr.zone].new += curr.connections.newSubscriptions.actual;
            acc[curr.zone].commissioned += curr.connections.commissioned.actual;
            return acc;
        }, {} as Record<string, { new: number, commissioned: number }>);
        
        return Object.entries(byZone).map(([name, values]) => ({ 
            name, 
            "New Subscriptions": values.new,
            "Commissioned": values.commissioned,
            "Pending": values.new - values.commissioned,
        }));
    }, [data]);

    const pipelineTrend = useMemo(() => {
        const trend: { month: string, pending: number }[] = [];
        let currentDate = new Date(filters.year, filters.month - 1);

        for (let i = 0; i < 12; i++) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const monthData = allData.filter(d => d.year === year && d.month === month);
            const aggregated = monthData.reduce((acc, curr) => {
                acc.new += curr.connections.newSubscriptions.actual;
                acc.commissioned += curr.connections.commissioned.actual;
                return acc;
            }, { new: 0, commissioned: 0 });

            trend.push({
                month: currentDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
                pending: aggregated.new - aggregated.commissioned
            });

            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        return trend.reverse();
    }, [allData, filters]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Pending Connections"
                    value={pendingConnections.toLocaleString()}
                    icon={<ClockIcon className="h-8 w-8" />}
                    colorClass="bg-yellow-500/20"
                />
                <StatCard 
                    title="New Subscriptions (Current Month)"
                    value={pipelineData.newSubscriptions.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-blue-500/20"
                />
                <StatCard 
                    title="Commissioning Rate (Current Month)"
                    value={`${commissioningRate.toFixed(1)}%`}
                    icon={<ZapIcon className="h-8 w-8" />}
                    colorClass="bg-green-500/20"
                />
            </div>

            <ChartContainer title="Connection Pipeline by Zone">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineByZone} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Bar dataKey="New Subscriptions" fill="#44546A" />
                        <Bar dataKey="Commissioned" fill="#28a745" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Pending Connections Trend (Last 12 Months)">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pipelineTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Line type="monotone" dataKey="pending" stroke="#FFD966" name="Pending Connections" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

export default ConnectionPipeline;
