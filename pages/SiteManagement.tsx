import React, { useMemo } from 'react';
import { MonthlyData, FilterState } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface PageProps {
    allData: MonthlyData[];
    filters: FilterState;
}

const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

const ChangeCell: React.FC<{ value: number }> = ({ value }) => {
    if (value === Infinity) return <span className="text-green-600">N/A</span>;
    if (isNaN(value) || !isFinite(value)) return <span className="text-gray-500">-</span>;
    
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
        <span className={color}>
            {value.toFixed(1)}%
        </span>
    );
};

const SiteManagement: React.FC<PageProps> = ({ allData, filters }) => {
    const { formatCurrency } = useCurrency();

    const siteData = useMemo(() => {
        const uniqueSites = [...new Map(allData.map(item => [`${item.site}-${item.phase}`, item])).values()];

        const getAggregatedSiteData = (data: MonthlyData[]) => {
            return data.reduce((acc, curr) => {
                acc.revenue += curr.revenue.total.actual;
                acc.revenueBudget += curr.revenue.total.budget;
                acc.arpuBase += curr.consumption.arpu.actual * curr.connections.total.actual;
                acc.connections += curr.connections.total.actual;
                acc.newSubs += curr.connections.newSubscriptions.actual;
                acc.newSubsBudget += curr.connections.newSubscriptions.budget;
                acc.kwh += curr.consumption.soldKwh.actual;
                return acc;
            }, { revenue: 0, revenueBudget: 0, arpuBase: 0, connections: 0, newSubs: 0, newSubsBudget: 0, kwh: 0 });
        };

        return uniqueSites.map(siteInfo => {
            const { site, phase } = siteInfo;
            const sitePhaseData = allData.filter(d => d.site === site && d.phase === phase);
            
            const { year, month } = filters;
            const data_YTD = sitePhaseData.filter(d => d.year === year && d.month <= month);
            const data_M = data_YTD.filter(d => d.month === month);
            const data_M_1 = sitePhaseData.filter(d => d.year === (month === 1 ? year - 1 : year) && d.month === (month === 1 ? 12 : month - 1));
            const data_Y_1_M = sitePhaseData.filter(d => d.year === year - 1 && d.month === month);
            
            const kpi_YTD = getAggregatedSiteData(data_YTD);
            const kpi_M = getAggregatedSiteData(data_M);
            const kpi_M_1 = getAggregatedSiteData(data_M_1);
            const kpi_Y_1_M = getAggregatedSiteData(data_Y_1_M);

            const getArpu = (base: number, connections: number) => connections > 0 ? base / connections : 0;
            const getPricePerKwh = (revenue: number, kwh: number) => kwh > 0 ? revenue / kwh : 0;
            const getPurchasePerCustomer = (kwh: number, connections: number) => connections > 0 ? kwh / connections : 0;

            return {
                site, phase,
                arpu_ytd_actual: getArpu(kpi_YTD.arpuBase, kpi_YTD.connections),
                arpu_m_actual: getArpu(kpi_M.arpuBase, kpi_M.connections),
                arpu_m_1_actual: getArpu(kpi_M_1.arpuBase, kpi_M_1.connections),
                arpu_y_1_actual: getArpu(kpi_Y_1_M.arpuBase, kpi_Y_1_M.connections),
                
                rev_ytd_actual: kpi_YTD.revenue,
                rev_ytd_budget: kpi_YTD.revenueBudget,
                rev_m_actual: kpi_M.revenue,
                rev_m_budget: kpi_M.revenueBudget, // Note: using monthly budget from `data_M`
                rev_m_1_actual: kpi_M_1.revenue,
                rev_y_1_actual: kpi_Y_1_M.revenue,

                newsub_ytd_actual: kpi_YTD.newSubs,
                newsub_ytd_budget: kpi_YTD.newSubsBudget,
                newsub_m_actual: kpi_M.newSubs,
                newsub_m_budget: kpi_M.newSubsBudget,
                newsub_m_1_actual: kpi_M_1.newSubs,
                newsub_y_1_actual: kpi_Y_1_M.newSubs,
                
                price_kwh_m_actual: getPricePerKwh(kpi_M.revenue, kpi_M.kwh),
                price_kwh_y_1_actual: getPricePerKwh(kpi_Y_1_M.revenue, kpi_Y_1_M.kwh),

                purchase_cust_m_actual: getPurchasePerCustomer(kpi_M.kwh, kpi_M.connections),
                purchase_cust_y_1_actual: getPurchasePerCustomer(kpi_Y_1_M.kwh, kpi_Y_1_M.connections),
            };
        }).sort((a,b) => a.site.localeCompare(b.site) || a.phase.localeCompare(b.phase));
    }, [allData, filters]);

    const euro = 'EUR';

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Site Management Performance</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 text-center">
                        <tr>
                            <th rowSpan={2} className="px-3 py-3 border sticky left-0 bg-gray-50 z-10 text-left">Site</th>
                            <th rowSpan={2} className="px-3 py-3 border sticky left-24 bg-gray-50 z-10 text-left">Phase</th>
                            <th colSpan={3} className="px-3 py-2 border">ARPU YTD en Euro</th>
                            <th colSpan={4} className="px-3 py-2 border">ARPU MtoM en Euro</th>
                            <th colSpan={2} className="px-3 py-2 border">ARPU YoY en Euro</th>
                            <th colSpan={3} className="px-3 py-2 border">REVENUE YTD en Euro</th>
                            <th colSpan={4} className="px-3 py-2 border">REVENUE MtoM en Euro</th>
                            <th colSpan={2} className="px-3 py-2 border">REVENUE YoY en Euro</th>
                            <th colSpan={3} className="px-3 py-2 border">NEW SUBS YTD</th>
                            <th colSpan={4} className="px-3 py-2 border">NEW SUBS MtoM</th>
                            <th colSpan={2} className="px-3 py-2 border">NEW SUBS YoY</th>
                            <th colSpan={2} className="px-3 py-2 border">PRICE per kWh YoY en Euro</th>
                            <th colSpan={2} className="px-3 py-2 border">Purchase per customer YoY (kWh)</th>
                        </tr>
                        <tr className="text-[10px] font-semibold">
                            <th className="px-2 py-2 border">Actual YTD</th><th className="px-2 py-2 border">Budget</th><th className="px-2 py-2 border">Prog.</th>
                            <th className="px-2 py-2 border">Actual M-1</th><th className="px-2 py-2 border">Actual M</th><th className="px-2 py-2 border">Var. vs M-1</th><th className="px-2 py-2 border">Var. vs Budget</th>
                            <th className="px-2 py-2 border">Actual Y-1</th><th className="px-2 py-2 border">Var.</th>
                            <th className="px-2 py-2 border">Actual YTD</th><th className="px-2 py-2 border">Budget</th><th className="px-2 py-2 border">Prog.</th>
                            <th className="px-2 py-2 border">Actual M-1</th><th className="px-2 py-2 border">Actual M</th><th className="px-2 py-2 border">Var. vs M-1</th><th className="px-2 py-2 border">Var. vs Budget</th>
                            <th className="px-2 py-2 border">Actual Y-1</th><th className="px-2 py-2 border">Var.</th>
                            <th className="px-2 py-2 border">Actual YTD</th><th className="px-2 py-2 border">Budget</th><th className="px-2 py-2 border">Prog.</th>
                            <th className="px-2 py-2 border">Actual M-1</th><th className="px-2 py-2 border">Actual M</th><th className="px-2 py-2 border">Var. vs M-1</th><th className="px-2 py-2 border">Var. vs Budget</th>
                            <th className="px-2 py-2 border">Actual Y-1</th><th className="px-2 py-2 border">Var.</th>
                            <th className="px-2 py-2 border">Actual Y-1</th><th className="px-2 py-2 border">Var.</th>
                            <th className="px-2 py-2 border">Actual Y-1</th><th className="px-2 py-2 border">Var.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-right">
                        {siteData.map(d => (
                            <tr key={`${d.site}-${d.phase}`} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border sticky left-0 bg-white hover:bg-gray-50 z-10 text-left font-medium text-gray-900">{d.site}</td>
                                <td className="px-3 py-2 border sticky left-24 bg-white hover:bg-gray-50 z-10 text-left">{d.phase}</td>
                                
                                {/* ARPU YTD */}
                                <td className="px-2 py-2 border">{formatCurrency(d.arpu_ytd_actual, euro)}</td>
                                <td className="px-2 py-2 border">-</td>
                                <td className="px-2 py-2 border">-</td>
                                
                                {/* ARPU MtoM */}
                                <td className="px-2 py-2 border">{formatCurrency(d.arpu_m_1_actual, euro)}</td>
                                <td className="px-2 py-2 border">{formatCurrency(d.arpu_m_actual, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.arpu_m_actual, d.arpu_m_1_actual)} /></td>
                                <td className="px-2 py-2 border">-</td>
                                
                                {/* ARPU YoY */}
                                <td className="px-2 py-2 border">{formatCurrency(d.arpu_y_1_actual, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.arpu_m_actual, d.arpu_y_1_actual)} /></td>

                                {/* REVENUE YTD */}
                                <td className="px-2 py-2 border">{formatCurrency(d.rev_ytd_actual, euro)}</td>
                                <td className="px-2 py-2 border">{formatCurrency(d.rev_ytd_budget, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.rev_ytd_actual, d.rev_ytd_budget)} /></td>
                                
                                {/* REVENUE MtoM */}
                                <td className="px-2 py-2 border">{formatCurrency(d.rev_m_1_actual, euro)}</td>
                                <td className="px-2 py-2 border">{formatCurrency(d.rev_m_actual, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.rev_m_actual, d.rev_m_1_actual)} /></td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.rev_m_actual, d.rev_m_budget)} /></td>
                                
                                {/* REVENUE YoY */}
                                <td className="px-2 py-2 border">{formatCurrency(d.rev_y_1_actual, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.rev_m_actual, d.rev_y_1_actual)} /></td>
                                
                                {/* NEW SUBS YTD */}
                                <td className="px-2 py-2 border">{d.newsub_ytd_actual.toLocaleString()}</td>
                                <td className="px-2 py-2 border">{d.newsub_ytd_budget.toLocaleString()}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.newsub_ytd_actual, d.newsub_ytd_budget)} /></td>
                                
                                {/* NEW SUBS MtoM */}
                                <td className="px-2 py-2 border">{d.newsub_m_1_actual.toLocaleString()}</td>
                                <td className="px-2 py-2 border">{d.newsub_m_actual.toLocaleString()}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.newsub_m_actual, d.newsub_m_1_actual)} /></td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.newsub_m_actual, d.newsub_m_budget)} /></td>
                                
                                {/* NEW SUBS YoY */}
                                <td className="px-2 py-2 border">{d.newsub_y_1_actual.toLocaleString()}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.newsub_m_actual, d.newsub_y_1_actual)} /></td>
                                
                                {/* PRICE per kWh YoY */}
                                <td className="px-2 py-2 border">{formatCurrency(d.price_kwh_y_1_actual, euro)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.price_kwh_m_actual, d.price_kwh_y_1_actual)} /></td>
                                
                                {/* Purchase per customer YoY */}
                                <td className="px-2 py-2 border">{d.purchase_cust_y_1_actual.toFixed(2)}</td>
                                <td className="px-2 py-2 border"><ChangeCell value={calculateChange(d.purchase_cust_m_actual, d.purchase_cust_y_1_actual)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SiteManagement;
