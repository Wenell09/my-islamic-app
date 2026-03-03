
import { PrayerResponse, PRAYER_API_BASE } from "@/app/lib/prayer-data";

export const prayerService = {
  getProvinces: async (): Promise<string[]> => {
    const res = await fetch(`${PRAYER_API_BASE}/provinsi`);
    const result = await res.json();
    return result.code === 200 ? result.data : [];
  },

  getCities: async (provinsi: string): Promise<string[]> => {
    const res = await fetch(`${PRAYER_API_BASE}/kabkota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi }),
    });
    const result = await res.json();
    return result.code === 200 ? result.data : [];
  },

  getSchedules: async (provinsi: string, kabkota: string): Promise<PrayerResponse['data'] | null> => {
    const res = await fetch(PRAYER_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi, kabkota }),
    });
    const result = await res.json();
    return result.code === 200 ? result.data : null;
  }
};
