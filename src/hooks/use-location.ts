
import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  PROV: 'myislamic_prov',
  CITY: 'myislamic_city'
};

const DEFAULTS = {
  PROV: 'DKI Jakarta',
  CITY: 'Kota Jakarta'
};

export function useLocation() {
  const [location, setLocation] = useState({ 
    province: DEFAULTS.PROV, 
    city: DEFAULTS.CITY 
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProv = localStorage.getItem(STORAGE_KEYS.PROV);
    const savedCity = localStorage.getItem(STORAGE_KEYS.CITY);

    if (savedProv && savedCity) {
      setLocation({ province: savedProv, city: savedCity });
    } else {
      localStorage.setItem(STORAGE_KEYS.PROV, DEFAULTS.PROV);
      localStorage.setItem(STORAGE_KEYS.CITY, DEFAULTS.CITY);
    }
    setIsLoaded(true);
  }, []);

  const updateLocation = (newProv: string, newCity: string) => {
    setLocation({ province: newProv, city: newCity });
    localStorage.setItem(STORAGE_KEYS.PROV, newProv);
    localStorage.setItem(STORAGE_KEYS.CITY, newCity);
  };

  return { ...location, updateLocation, isLoaded };
}
