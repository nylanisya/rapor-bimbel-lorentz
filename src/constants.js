export const A4_WIDTH_PX = 793.7;
export const A4_HEIGHT_PX = 1122.5;

export const FONT = "'Tinos', 'Times New Roman', Times, serif";

// ====== KONFIGURASI LOGIN (ubah sesuai keinginan kamu) ======
export const LOGIN_USERNAME = "tutor";
export const LOGIN_PASSWORD = "lorentz2026";
export const AUTH_STORAGE_KEY = "bimbelAuth";
// ==============================================================

export const defaultSubjects = () => [
  { mapel: "Matematika", nilai: "" },
  { mapel: "Bahasa Indonesia", nilai: "" },
  { mapel: "Bahasa Inggris", nilai: "" },
  { mapel: "IPA", nilai: "" },
  { mapel: "IPS", nilai: "" },
];

export const createEmptyPage = () => ({
  nama: "",
  kelas: "",
  semester: "",
  tahunAjar: "",
  subjects: defaultSubjects(),
  sakit: "",
  izin: "",
  alpa: "",
  catatan: "",
  tempat: "Pekanbaru",
  tanggal: "",
  namaTutor: "",
  namaOrtu: "",
  namaOwner: "Laurentia Dwi Prantanti",
  peringkat: "",
});
