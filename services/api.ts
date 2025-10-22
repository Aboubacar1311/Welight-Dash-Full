import { MonthlyData, Client } from '../types';

// The backend server is expected to be running on localhost:8000
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Generic fetch function with error handling.
 */
async function fetchData<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch data from ${endpoint}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        // In a real app, you might want to show a notification to the user
        throw error;
    }
}


/**
 * Fetches combined data for the dashboard.
 * On the backend, this can be an endpoint that aggregates multiple queries.
 * For simplicity here, we fetch the main `commercial-data` source.
 */
export const fetchDashboardData = async (): Promise<MonthlyData[]> => {
    // NOTE: The Django backend provides raw data. The frontend will need to
    // process this into the `MonthlyData` structure. For now, we assume the
    // backend will eventually be shaped to match the frontend's expectations.
    // This is a placeholder for the primary data source.
    const rawCommercialData = await fetchData<any[]>('/commercial-data/');
    
    // Here you would transform the raw SQL result into the nested `MonthlyData` structure.
    // This is a complex task that depends on the final shape of all backend queries.
    // For now, we'll return an empty array and rely on mock data structure as a template.
    // A real implementation would map the fields from rawCommercialData to MonthlyData[].
    console.warn("Data transformation from raw SQL to MonthlyData is not fully implemented.");
    return []; // Replace with transformed data
};

/**
 * Fetches detailed client information.
 * Corresponds to the query on COMMERCIAL_PROD.FICHES_CLIENTS.
 */
export const fetchClientsData = async (): Promise<Client[]> => {
    return fetchData<Client[]>('/clients/');
};

/**
 * Fetches commercial data.
 */
export const fetchCommercialData = async (): Promise<any[]> => {
    return fetchData<any[]>('/commercial-data/');
};

/**
 * Fetches budget data.
 */
export const fetchBudgetData = async (): Promise<any[]> => {
    return fetchData<any[]>('/budget/');
};

// You can add a fetch function for each backend endpoint.
// Example:
// export const fetchCommissionsData = async (): Promise<any[]> => {
//     return fetchData<any[]>('/commissions/');
// };
