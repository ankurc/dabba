import { useState, useEffect } from 'react';

interface GeoLocation {
  country: 'US' | 'CA' | null;
  loading: boolean;
  error: Error | null;
}

export function useGeoLocation() {
  const [state, setState] = useState<GeoLocation>({
    country: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function detectCountry() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Only accept US or CA
        const country = data.country_code === 'US' || data.country_code === 'CA' 
          ? data.country_code 
          : 'US'; // Default to US for other countries
        
        setState({ country, loading: false, error: null });
      } catch (error) {
        setState({ country: 'US', loading: false, error: error as Error });
      }
    }

    detectCountry();
  }, []);

  return state;
} 