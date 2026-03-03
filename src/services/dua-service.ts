
import { API_DOA_URL, Dua } from "@/app/lib/duas-data";

export const duaService = {
  getDuas: async (): Promise<Dua[]> => {
    const res = await fetch(API_DOA_URL);
    const result = await res.json();
    return result.status === "success" ? result.data : [];
  },
  getDuaDetail: async (id: string): Promise<Dua | null> => {
    const res = await fetch(`${API_DOA_URL}/${id}`);
    const result = await res.json();
    return result.status === "success" ? result.data : null;
  }
};
