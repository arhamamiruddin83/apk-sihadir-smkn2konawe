export interface WaliKelasMapping {
  className: string;
  namaWaliKelas: string;
}

export const WALI_KELAS_LIST: WaliKelasMapping[] = [
  { className: "X TKR A", namaWaliKelas: "HISWAN PAGALA, S.Pd" },
  { className: "X TKR B", namaWaliKelas: "MUHARJUN, S.Sos" },
  { className: "X TSM", namaWaliKelas: "SITTI KHOTIJAH, S.Pd." },
  { className: "X TAV", namaWaliKelas: "SALMA, S.Pd.I" },
  { className: "X DPIB", namaWaliKelas: "I PUTU JUNIASA, S.Pd. Mat." },
  { className: "X DKV", namaWaliKelas: "ARBIANTI, SE. Gr" },
  { className: "XI TKR B", namaWaliKelas: "SAIFUL ARIFIN, S.Pd" },
  { className: "XI TKR A", namaWaliKelas: "ARHAM AMIRUDDIN, S.Pd, Gr." },
  { className: "XI TSM A", namaWaliKelas: "I GUSTI PUTU NGURAH WAHYU DARMA, S.Pd." },
  { className: "XI TSM B", namaWaliKelas: "TRIANA DANIEL, S.Pd." },
  { className: "XI TAV", namaWaliKelas: "ISNAWATI, S.Pd." },
  { className: "XI DPIB", namaWaliKelas: "EVA SYAHTRIANA, S.Pd." },
  { className: "XI DKV", namaWaliKelas: "DRS MUSLIMIN L, S.Pd." },
  { className: "XII TKR A", namaWaliKelas: "HAERUL, S.Pd" },
  { className: "XII TKR B", namaWaliKelas: "NUNUNG SOSILOWATI PODAA, S.Pd,M.Pd" },
  { className: "XII TSM", namaWaliKelas: "Syamsul Sabir, S. Kom" },
  { className: "XII TAV", namaWaliKelas: "Nyoman Suliawati, S.Pd, M.Pd" },
  { className: "XII DPIB", namaWaliKelas: "Elis Syarifuddin B S.Pd.T" }
];

export function getWaliKelasForClass(className: string): string {
  if (!className) return "-";
  const clean = className.trim().toUpperCase();
  const match = WALI_KELAS_LIST.find(w => w.className.trim().toUpperCase() === clean);
  return match ? match.namaWaliKelas : "-";
}

export function getWaliKelasPerwalianClass(teacherNameOrUsername: string): string | null {
  if (!teacherNameOrUsername) return null;
  const clean = teacherNameOrUsername.trim().toLowerCase();

  // Keyword check
  if (clean.includes("arbianti")) return "X DKV";
  if (clean.includes("hiswan") || clean.includes("pagala")) return "X TKR A";
  if (clean.includes("muharjun")) return "X TKR B";
  if (clean.includes("khotijah")) return "X TSM";
  if (clean.includes("salma")) return "X TAV";
  if (clean.includes("juniasa") || clean.includes("juniyasa") || (clean.includes("putu") && !clean.includes("ngurah"))) return "X DPIB";
  if (clean.includes("saiful")) return "XI TKR B";
  if (clean.includes("arham")) return "XI TKR A";
  if (clean.includes("wahyu") || clean.includes("ngurah")) return "XI TSM A";
  if (clean.includes("eva") || clean.includes("syahtriana") || clean.includes("evasyatriana")) return "XI DPIB";
  if (clean.includes("daniel") || (clean.includes("triana") && !clean.includes("eva") && !clean.includes("syah"))) return "XI TSM B";
  if (clean.includes("isnawati")) return "XI TAV";
  if (clean.includes("muslimin")) return "XI DKV";
  if (clean.includes("haerul")) return "XII TKR A";
  if (clean.includes("nunung")) return "XII TKR B";
  if (clean.includes("syamsul")) return "XII TSM";
  if (clean.includes("suliawati") || clean.includes("nyoman")) return "XII TAV";
  if (clean.includes("elis")) return "XII DPIB";

  return null;
}
