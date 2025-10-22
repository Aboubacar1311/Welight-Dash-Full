import React, { useMemo } from 'react';
import { MonthlyData, FilterState } from '../types';
import ChartContainer from '../components/ChartContainer';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid, PieChart, Pie, Cell, Brush, LineChart, Line } from 'recharts';
import { UsersIcon } from '../components/icons';

interface PageProps {
    data: MonthlyData[];
    allData: MonthlyData[];
    filters: FilterState;
}

const COLORS = ['#44546A', '#FFD966', '#a0aec0', '#f6ad55'];

const Commercial: React.FC<PageProps> = ({ data, allData, filters }) => {
    
    const aggregatedData = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.new += curr.connections.newSubscriptions.actual;
            acc.upgrades += curr.connections.upgrades.actual;
            acc.downgrades += curr.connections.downgrades.actual;
            acc.closed += curr.connections.closed.actual;
            acc.inactive += curr.connections.inactive.actual;
            return acc;
        }, { new: 0, upgrades: 0, downgrades: 0, closed: 0, inactive: 0 });
    }, [data]);

    const activityData = [
        { name: 'New', value: aggregatedData.new },
        { name: 'Upgrades', value: aggregatedData.upgrades },
        { name: 'Downgrades', value: aggregatedData.downgrades },
    ];
    
    const statusByZone = useMemo(() => {
        const byZone = data.reduce((acc, curr) => {
            if (!acc[curr.zone]) {
                acc[curr.zone] = { new: 0, closed: 0, inactive: 0 };
            }
            acc[curr.zone].new += curr.connections.newSubscriptions.actual;
            acc[curr.zone].closed += curr.connections.closed.actual;
            acc[curr.zone].inactive += curr.connections.inactive.actual;
            return acc;
        }, {} as Record<string, { new: number, closed: number, inactive: number }>);
        
        return Object.entries(byZone).map(([name, values]) => ({ name, ...values }));
    }, [data]);

    const commercialTrendData = useMemo(() => {
        const trend: { month: string, new: number, upgrades: number, downgrades: number }[] = [];
        let currentDate = new Date(filters.year, filters.month - 1);

        for (let i = 0; i < 12; i++) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const monthData = allData.filter(d => d.year === year && d.month === month);
            const aggregated = monthData.reduce((acc, curr) => {
                acc.new += curr.connections.newSubscriptions.actual;
                acc.upgrades += curr.connections.upgrades.actual;
                acc.downgrades += curr.connections.downgrades.actual;
                return acc;
            }, { new: 0, upgrades: 0, downgrades: 0 });

            trend.push({
                month: currentDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
                ...aggregated
            });

            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        return trend.reverse();
    }, [allData, filters]);

    const detailedBreakdown = useMemo(() => {
        const breakdown: Record<string, Record<string, {new: number, upgrades: number, downgrades: number, closed: number, inactive: number}>> = {};
        data.forEach(d => {
            if (!breakdown[d.segment]) {
                breakdown[d.segment] = {};
            }
            if (!breakdown[d.segment][d.profile]) {
                breakdown[d.segment][d.profile] = { new: 0, upgrades: 0, downgrades: 0, closed: 0, inactive: 0 };
            }
            breakdown[d.segment][d.profile].new += d.connections.newSubscriptions.actual;
            breakdown[d.segment][d.profile].upgrades += d.connections.upgrades.actual;
            breakdown[d.segment][d.profile].downgrades += d.connections.downgrades.actual;
            breakdown[d.segment][d.profile].closed += d.connections.closed.actual;
            breakdown[d.segment][d.profile].inactive += d.connections.inactive.actual;
        });
        return breakdown;
    }, [data]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="New Connections"
                    value={aggregatedData.new.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-green-500/20"
                />
                 <StatCard 
                    title="Upgrades"
                    value={aggregatedData.upgrades.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-yellow-500/20"
                />
                 <StatCard 
                    title="Downgrades"
                    value={aggregatedData.downgrades.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-red-500/20"
                />
                 <StatCard 
                    title="Closed Connections"
                    value={aggregatedData.closed.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-gray-500/20"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <ChartContainer title="Subscription Changes">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {activityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                             <Legend wrapperStyle={{color: '#4b5563'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Connection Status by Zone">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusByZone} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                            <YAxis tick={{ fill: '#6b7280' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                            <Legend wrapperStyle={{color: '#4b5563'}} />
                            <Bar dataKey="new" stackId="a" fill="#28a745" name="New" />
                            <Bar dataKey="closed" stackId="a" fill="#dc3545" name="Closed" />
                            <Bar dataKey="inactive" stackId="a" fill="#FFD966" name="Inactive" />
                            <Brush dataKey="name" height={30} stroke="#44546A" fill="#f1f5f9" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <ChartContainer title="Commercial Activity Trend (Last 12 Months)">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commercialTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                        <Line type="monotone" dataKey="new" stroke="#28a745" name="New Connections" strokeWidth={2} />
                        <Line type="monotone" dataKey="upgrades" stroke="#FFD966" name="Upgrades" strokeWidth={2} />
                        <Line type="monotone" dataKey="downgrades" stroke="#dc3545" name="Downgrades" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown by Segment & Profile</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3">Segment</th>
                                <th scope="col" className="px-4 py-3">Profile</th>
                                <th scope="col" className="px-4 py-3 text-right">New</th>
                                <th scope="col" className="px-4 py-3 text-right">Upgrades</th>
                                <th scope="col" className="px-4 py-3 text-right">Downgrades</th>
                                <th scope="col" className="px-4 py-3 text-right">Closed</th>
                                <th scope="col" className="px-4 py-3 text-right">Inactive</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(detailedBreakdown).map(([segment, profiles]) => (
                                Object.entries(profiles).map(([profile, values], index) => (
                                    <tr key={`${segment}-${profile}`} className="border-b hover:bg-gray-50">
                                        {index === 0 && (
                                            <td rowSpan={Object.keys(profiles).length} className="px-4 py-3 font-semibold text-gray-900 bg-gray-50 align-top">{segment}</td>
                                        )}
                                        <td className="px-4 py-3">{profile}</td>
                                        <td className="px-4 py-3 text-right">{values.new.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{values.upgrades.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{values.downgrades.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{values.closed.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{values.inactive.toLocaleString()}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Commercial;