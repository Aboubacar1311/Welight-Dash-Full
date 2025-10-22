
import React, { useMemo } from 'react';
import { MonthlyData } from '../types';
import ChartContainer from '../components/ChartContainer';
import StatCard from '../components/StatCard';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { UsersIcon, ShoppingCartIcon } from '../components/icons';

interface PageProps {
    data: MonthlyData[];
}

const COLORS = ['#44546A', '#FFD966', '#a0aec0', '#f6ad55'];

const Commercial: React.FC<PageProps> = ({ data }) => {
    
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
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};

export default Commercial;