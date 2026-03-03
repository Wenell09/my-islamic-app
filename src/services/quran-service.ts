
import { API_BASE_URL, Surah, SurahDetail, TafsirDetail } from "@/app/lib/quran-data";

export const quranService = {
  getSurahs: async (): Promise<Surah[]> => {
    const res = await fetch(`${API_BASE_URL}/surat`);
    const result = await res.json();
    return result.code === 200 ? result.data : [];
  },
  getSurahDetail: async (id: string): Promise<SurahDetail | null> => {
    const res = await fetch(`${API_BASE_URL}/surat/${id}`);
    const result = await res.json();
    return result.code === 200 ? result.data : null;
  },
  getTafsir: async (id: string): Promise<TafsirDetail | null> => {
    const res = await fetch(`${API_BASE_URL}/tafsir/${id}`);
    const result = await res.json();
    return result.code === 200 ? result.data : null;
  }
};
