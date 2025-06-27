'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

export interface Property {
  id: number;
  name: string;
  type: string;
  units: number;
  occupied_units: number;
  monthly_income: number;
  yearly_income: number;
  expenses: number;
  net_income: number;
  yield_rate: number;
  location: string;
  address: string;
  build_year: number;
  structure: string;
  total_floors: number;
  // 他のプロパティのフィールドも必要に応じて追加
}

interface PropertyContextType {
  properties: Property[];
  fetchProperties: () => Promise<void>;
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error(error);
      setProperties([]); // エラー時は空にする
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <PropertyContext.Provider value={{ properties, fetchProperties, isLoading }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}; 