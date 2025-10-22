
import { MonthlyData, FilterState } from '../types';

export const filterData = (data: MonthlyData[], filters: FilterState): MonthlyData[] => {
    return data.filter(d => {
        const yearMatch = d.year === filters.year;
        const monthMatch = d.month === filters.month;
        const profileMatch = filters.profile === 'All' || d.profile === filters.profile;
        const phaseMatch = filters.phase === 'All' || d.phase === filters.phase;
        const siteMatch = filters.site === 'All' || d.site === filters.site;
        const zoneMatch = filters.zone === 'All' || d.zone === filters.zone;
        const segmentMatch = filters.segment === 'All' || d.segment === filters.segment;

        return yearMatch && monthMatch && profileMatch && phaseMatch && siteMatch && zoneMatch && segmentMatch;
    });
};


const flattenObject = (obj: any, parentKey = '', sep = '_'): Record<string, any> => {
    const items: Record<string, any> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = parentKey ? parentKey + sep + key : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(items, flattenObject(obj[key], newKey, sep));
            } else {
                items[newKey] = obj[key];
            }
        }
    }
    return items;
};

const convertToCSV = (data: MonthlyData[]): string => {
    if (data.length === 0) return '';

    const flattenedData = data.map(row => flattenObject(row));
    const headers = Object.keys(flattenedData[0]);
    
    const csvRows = [
        headers.join(','), // header row
        ...flattenedData.map(row => 
            headers.map(header => {
                let cell = row[header] === null || row[header] === undefined ? '' : row[header];
                // Escape commas and quotes
                cell = String(cell).replace(/"/g, '""');
                if (String(cell).includes(',')) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(',')
        )
    ];
    
    return csvRows.join('\n');
};

export const exportDataToCsv = (data: MonthlyData[], filename: string): void => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
