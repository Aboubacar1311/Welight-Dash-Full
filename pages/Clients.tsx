import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import StatCard from '../components/StatCard';
import { UsersIcon } from '../components/icons';
import ChartContainer from '../components/ChartContainer';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PageProps {
    clients: Client[];
}

type SortKey = keyof Client;

const COLORS = ['#28a745', '#FFD966', '#dc3545', '#6c757d'];

const getStatusColor = (status: Client['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Inactive': return 'bg-yellow-100 text-yellow-800';
        case 'Closed': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const Clients: React.FC<PageProps> = ({ clients }) => {
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

    const clientStats = useMemo(() => {
        return clients.reduce((acc, client) => {
            acc.total++;
            if (client.status === 'Active') acc.active++;
            else if (client.status === 'Inactive') acc.inactive++;
            else if (client.status === 'Closed') acc.closed++;
            return acc;
        }, { total: 0, active: 0, inactive: 0, closed: 0 });
    }, [clients]);
    
    const statusDistributionData = [
        { name: 'Active', value: clientStats.active },
        { name: 'Inactive', value: clientStats.inactive },
        { name: 'Closed', value: clientStats.closed },
    ];

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.formNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const sortedClients = useMemo(() => {
        let sortableItems = [...filteredClients];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredClients, sortConfig]);
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const headers: { key: SortKey; label: string }[] = [
        { key: 'id', label: 'Client ID' },
        { key: 'name', label: 'Name' },
        { key: 'formNumber', label: 'Form No.' },
        { key: 'status', label: 'Status' },
        { key: 'profile', label: 'Profile' },
        { key: 'zone', label: 'Zone' },
        { key: 'site', label: 'Site' },
        { key: 'totalRevenue', label: 'Total Revenue' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Clients"
                    value={clientStats.total.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-blue-500/20"
                />
                <StatCard 
                    title="Active Clients"
                    value={clientStats.active.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-green-500/20"
                />
                <StatCard 
                    title="Inactive Clients"
                    value={clientStats.inactive.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-yellow-500/20"
                />
                <StatCard 
                    title="Closed Clients"
                    value={clientStats.closed.toLocaleString()}
                    icon={<UsersIcon className="h-8 w-8" />}
                    colorClass="bg-red-500/20"
                />
            </div>
            
            <ChartContainer title="Client Status Distribution">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            // FIX: Cast `value` to `number` to resolve a TypeScript error. The `value` from recharts' render prop is not strictly typed.
                            label={({ name, value }) => `${name} ${clientStats.total > 0 ? (((value as number) / clientStats.total) * 100).toFixed(0) : 0}%`}
                        >
                            {statusDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                        <Legend wrapperStyle={{color: '#4b5563'}} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Client Database</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-500 text-sm">Showing: {sortedClients.length} clients</span>
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {headers.map(({ key, label }) => (
                                    <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key)}>
                                        {label} {getSortIndicator(key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedClients.map((client) => (
                                <tr key={client.id} className="bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{client.id}</td>
                                    <td className="px-6 py-4">{client.name}</td>
                                    <td className="px-6 py-4">{client.formNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{client.profile}</td>
                                    <td className="px-6 py-4">{client.zone}</td>
                                    <td className="px-6 py-4">{client.site}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(client.totalRevenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Clients;