
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Currency } from '../types';

const FCFA_TO_EUR_RATE = 655.957;

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    rate: number;
    formatCurrency: (value: number, currencyOverride?: Currency, format?: 'standard' | 'compact') => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>('FCFA');

    const formatCurrency = (value: number, currencyOverride?: Currency, format: 'standard' | 'compact' = 'standard') => {
        const targetCurrency = currencyOverride || currency;
        let displayValue = value;
        
        if (targetCurrency === 'EUR') {
            displayValue = value / FCFA_TO_EUR_RATE;
        }

        // Use 'XOF' for 'FCFA' as it's the correct ISO 4217 code.
        const isoCurrencyCode = targetCurrency === 'FCFA' ? 'XOF' : targetCurrency;

        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: isoCurrencyCode,
        };

        if (format === 'compact') {
            options.notation = 'compact';
            options.maximumFractionDigits = 2;
        } else {
             options.maximumFractionDigits = targetCurrency === 'FCFA' ? 0 : 2;
        }
        
        // Use 'fr' locale for better formatting of EUR and FCFA
        const formatted = new Intl.NumberFormat('fr-FR', options).format(displayValue);

        if (targetCurrency === 'FCFA') {
            // The default format for XOF with 'fr-FR' is "F CFA", we want to display just "F".
            return formatted.replace(/cfa/i, '').trim();
        }
        
        return formatted;
    };


    const value = {
        currency,
        setCurrency,
        rate: FCFA_TO_EUR_RATE,
        formatCurrency,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
