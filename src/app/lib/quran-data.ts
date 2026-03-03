
export type Surah = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
};

export type Ayat = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

export type SurahDetail = Surah & {
  ayat: Ayat[];
  suratSelanjutnya: false | { nomor: number; namaLatin: string };
  suratSebelumnya: false | { nomor: number; namaLatin: string };
};

export type TafsirAyat = {
  ayat: number;
  teks: string;
};

export type TafsirDetail = {
  nomor: number;
  nama: string;
  namaLatin: string;
  tafsir: TafsirAyat[];
};

export const API_BASE_URL = "https://equran.id/api/v2";
