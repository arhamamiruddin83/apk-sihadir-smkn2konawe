/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslatedScheduleItem {
  day: string;
  time: string;
  period: string; // e.g. "Jam 2-5", "Jam 1-4"
  className: string;
  subjectCode: string;
  subjectName: string;
  teacherCode: string;
  teacherName: string;
}

export const TEACHER_MAP: Record<string, string> = {
  "MUS": "Drs. Muslimin. L, S.Pd.",
  "HRL": "Haerul, S.Pd.",
  "JYS": "I Putu Juniyasa, S.Pd.Mat",
  "ALB": "Ainal Laremba, S.Ag",
  "IMP": "Iman Purnama, ST",
  "ISN": "Isnawati, S.Pd.",
  "AAU": "Andi Asrul Umar, S.Pd.",
  "TTH": "Titik Harumi, S.Pd",
  "MMN": "Muhammad Maimana. L, ST",
  "MOC": "Moch. Yamin, S.Pd.",
  "ELS": "Elis Syarifuddin. B, S.Pd.T",
  "MUT": "Munatar Tabara, S.Pd.",
  "NYM": "Nyoman Suliawati, S.Pd. M.Pd.",
  "NSP": "Nunung Sosilowati Podada, S.Pd.M.Pd.",
  "EVA": "Evasyahtriana, S.Si",
  "SMN": "Saiman, ST.",
  "ARH": "Arham Amiruddin, S.Pd",
  "AKN": "Askin, S.Ag.",
  "TRD": "Triana Daniel, S.Pd.",
  "ARB": "Arbianti, SE.",
  "MHJ": "Muharjun, S.Pd",
  "SLM": "Salmah, S.Pd.I",
  "SFL": "Saiful Arifin, S.Pd.",
  "HIS": "Hiswan Pagala, S.Pd.",
  "SKH": "Sitti Khotijah, S.Pd.",
  "IGP": "I Gusti Ngurah Putu Wahyu Darma, S.Pd.",
  "RUS": "Rusni K. ST",
  "SSR": "Syamsul Sabir, S.Kom",
  "ANG": "Angraeni Desanik, S.Pd.",
  "ADR": "Adrian Sahputra, S.Pd.",
  "CIC": "Cici Murni, S.Pd. (BK)",
  "YOG": "Yoga Nanda Hendrawan, S.Pd. (BK)",
  "IWZ": "Izzat Wahyu Zaldi, S.Pd.",
  "GHK": "Gusti Himawan Kadianto, S.Pd.",
  "PAM": "Putu Anggi Mildayanti, S.Pd. (Guru Pend. Agama Hindu)",
  "ESK": "Epna Septiana Kristina, S.Pd."
};

export const SUBJECT_MAP: Record<string, string> = {
  "1": "Pendidikan Agama (dan Budi Pekerti)",
  "2": "Pendidikan Kewarganegaraan/Pancasila",
  "3": "Bahasa Indonesia",
  "4": "Pendidikan Jasmani & Orkes",
  "5": "Sejarah",
  "6": "Seni Budaya",
  "7": "Matematika",
  "8": "Bahasa Inggris",
  "9": "IPAS",
  "10": "Informatika",
  "A": "Mata Pelajaran Umum",
  "B": "Dasar Program Keahlian",
  "C": "Mata Pelajaran Keahlian",
  "D": "Kreativitas, Inovasi dan Kewirausahaan",
  "E": "Mata Pelajaran Pilihan"
};

// Official SMK Negeri 2 Konawe Master Schedule Semester Ganjil T.A 2026/2027
// Adjusted and verified against official schedule document with new teachers & schedule updates
export const OFFICIAL_SMK2_SCHEDULES: TranslatedScheduleItem[] = [
  // ================= SENIN (MONDAY) =================
  // KELAS X
  { day: "Senin", time: "07:55 - 10:50", period: "Jam 2-5", className: "X TKR A", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Senin", time: "10:50 - 13:30", period: "Jam 6-9", className: "X TKR A", subjectCode: "9", subjectName: "IPAS", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Senin", time: "07:55 - 09:15", period: "Jam 2-3", className: "X TKR B", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Senin", time: "09:15 - 13:30", period: "Jam 4-9", className: "X TKR B", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "X TSM", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Senin", time: "10:10 - 11:30", period: "Jam 5-6", className: "X TSM", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "X TSM", subjectCode: "9", subjectName: "IPAS", teacherCode: "EVA", teacherName: "Evasyahtriana, S.Si" },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "X DKV", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Senin", time: "10:10 - 11:30", period: "Jam 5-6", className: "X DKV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "X DKV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Senin", time: "07:55 - 11:30", period: "Jam 2-6", className: "X DPIB", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "ELS", teacherName: "Elis Syarifuddin. B, S.Pd.T" },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "X DPIB", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Senin", time: "07:55 - 11:30", period: "Jam 2-6", className: "X TAV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "RUS", teacherName: "Rusni K. ST" },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "X TAV", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },

  // KELAS XI
  { day: "Senin", time: "07:55 - 10:50", period: "Jam 2-5", className: "XI TKR A", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Senin", time: "10:50 - 12:10", period: "Jam 6-7", className: "XI TKR A", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Senin", time: "12:10 - 13:30", period: "Jam 8-9", className: "XI TKR A", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XI TKR B", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Senin", time: "10:10 - 11:30", period: "Jam 5-6", className: "XI TKR B", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "XI TKR B", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Senin", time: "07:55 - 09:15", period: "Jam 2-3", className: "XI TSM A", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Senin", time: "09:15 - 11:30", period: "Jam 4-6", className: "XI TSM A", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "ALB", teacherName: "Ainal Laremba, S.Ag" },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "XI TSM A", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Senin", time: "07:55 - 10:50", period: "Jam 2-5", className: "XI TSM B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Senin", time: "10:50 - 13:30", period: "Jam 6-9", className: "XI TSM B", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XI DKV", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Senin", time: "10:10 - 13:30", period: "Jam 5-9", className: "XI DKV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XI DPIB", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Senin", time: "10:10 - 13:30", period: "Jam 5-9", className: "XI DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XI TAV", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Senin", time: "10:10 - 13:30", period: "Jam 5-9", className: "XI TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },

  // KELAS XII
  { day: "Senin", time: "07:55 - 12:10", period: "Jam 2-7", className: "XII TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ADR", teacherName: "Adrian Sahputra, S.Pd." },
  { day: "Senin", time: "12:10 - 13:30", period: "Jam 8-9", className: "XII TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Senin", time: "07:55 - 12:10", period: "Jam 2-7", className: "XII TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ADR", teacherName: "Adrian Sahputra, S.Pd." },
  { day: "Senin", time: "12:10 - 13:30", period: "Jam 8-9", className: "XII TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XII TSM", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Senin", time: "10:10 - 11:30", period: "Jam 5-6", className: "XII TSM", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Senin", time: "11:30 - 13:30", period: "Jam 7-9", className: "XII TSM", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XII DPIB", subjectCode: "7", subjectName: "Matematika", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Senin", time: "10:10 - 13:30", period: "Jam 5-9", className: "XII DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Senin", time: "07:55 - 09:55", period: "Jam 2-4", className: "XII TAV", subjectCode: "7", subjectName: "Matematika", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Senin", time: "10:10 - 13:30", period: "Jam 5-9", className: "XII TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "RUS", teacherName: "Rusni K. ST" },

  // ================= SELASA (TUESDAY) =================
  // KELAS X
  { day: "Selasa", time: "07:15 - 09:30", period: "Jam 1-3", className: "X TKR A", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Selasa", time: "09:30 - 12:00", period: "Jam 4-6", className: "X TKR A", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TKR A", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Selasa", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TKR B", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TKR B", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Selasa", time: "07:15 - 09:30", period: "Jam 1-3", className: "X TSM", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Selasa", time: "09:30 - 13:30", period: "Jam 4-8", className: "X TSM", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Selasa", time: "07:15 - 08:45", period: "Jam 1-2", className: "X DKV", subjectCode: "6", subjectName: "Seni Budaya", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Selasa", time: "08:45 - 10:15", period: "Jam 3-4", className: "X DKV", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "X DKV", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Selasa", time: "07:15 - 08:45", period: "Jam 1-2", className: "X DPIB", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Selasa", time: "08:45 - 10:15", period: "Jam 3-4", className: "X DPIB", subjectCode: "6", subjectName: "Seni Budaya", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "X DPIB", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Selasa", time: "07:15 - 08:45", period: "Jam 1-2", className: "X TAV", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Selasa", time: "08:45 - 10:15", period: "Jam 3-4", className: "X TAV", subjectCode: "6", subjectName: "Seni Budaya", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TAV", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },

  // KELAS XI
  { day: "Selasa", time: "07:15 - 09:30", period: "Jam 1-3", className: "XI TKR A", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Selasa", time: "09:30 - 13:30", period: "Jam 4-8", className: "XI TKR A", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ARB", teacherName: "Arbianti, SE." },
  { day: "Selasa", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TKR B", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Selasa", time: "10:30 - 12:00", period: "Jam 5-6", className: "XI TKR B", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "XI TKR B", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Selasa", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TSM A", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TSM A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Selasa", time: "07:15 - 09:30", period: "Jam 1-3", className: "XI TSM B", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Selasa", time: "09:30 - 11:15", period: "Jam 4-5", className: "XI TSM B", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Selasa", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TSM B", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Selasa", time: "07:15 - 09:30", period: "Jam 1-3", className: "XI DKV", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Selasa", time: "09:30 - 12:00", period: "Jam 4-6", className: "XI DKV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "XI DKV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Selasa", time: "07:15 - 12:00", period: "Jam 1-6", className: "XI DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ELS", teacherName: "Elis Syarifuddin. B, S.Pd.T" },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "XI DPIB", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Selasa", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TAV", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Selasa", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TAV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "EVA", teacherName: "Evasyahtriana, S.Si" },

  // KELAS XII
  { day: "Selasa", time: "07:15 - 08:45", period: "Jam 1-2", className: "XII TKR A", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Selasa", time: "08:45 - 11:15", period: "Jam 3-5", className: "XII TKR A", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Selasa", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Selasa", time: "07:15 - 08:45", period: "Jam 1-2", className: "XII TKR B", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Selasa", time: "08:45 - 11:15", period: "Jam 3-5", className: "XII TKR B", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Selasa", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Selasa", time: "07:15 - 11:15", period: "Jam 1-5", className: "XII TSM", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Selasa", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII TSM", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "ALB", teacherName: "Ainal Laremba, S.Ag" },
  { day: "Selasa", time: "07:15 - 12:00", period: "Jam 1-6", className: "XII DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "XII DPIB", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Selasa", time: "07:15 - 12:00", period: "Jam 1-6", className: "XII TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },
  { day: "Selasa", time: "12:00 - 13:30", period: "Jam 7-8", className: "XII TAV", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },

  // ================= RABU (WEDNESDAY) =================
  // KELAS X
  { day: "Rabu", time: "07:15 - 08:45", period: "Jam 1-2", className: "X TKR A", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Rabu", time: "08:45 - 13:30", period: "Jam 3-8", className: "X TKR A", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Rabu", time: "07:15 - 09:30", period: "Jam 1-3", className: "X TKR B", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Rabu", time: "09:30 - 12:00", period: "Jam 4-6", className: "X TKR B", subjectCode: "9", subjectName: "IPAS", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Rabu", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TKR B", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TSM", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TSM", subjectCode: "A", subjectName: "Matematika / Umum", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "X DKV", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X DKV", subjectCode: "A", subjectName: "Dasar Program Keahlian / Umum", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "X DPIB", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X DPIB", subjectCode: "A", subjectName: "Dasar Program Keahlian / Umum", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TAV", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TAV", subjectCode: "A", subjectName: "Dasar Program Keahlian / Umum", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },

  // KELAS XI
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TKR A", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ADR", teacherName: "Adrian Sahputra, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TKR B", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TSM A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TSM A", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI TSM B", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XI TSM B", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Rabu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI DKV", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ELS", teacherName: "Elis Syarifuddin. B, S.Pd.T" },
  { day: "Rabu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI DKV", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Rabu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI DPIB", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ELS", teacherName: "Elis Syarifuddin. B, S.Pd.T" },
  { day: "Rabu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI DPIB", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Rabu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI TAV", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ELS", teacherName: "Elis Syarifuddin. B, S.Pd.T" },
  { day: "Rabu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },

  // KELAS XII
  { day: "Rabu", time: "07:15 - 09:30", period: "Jam 1-3", className: "XII TKR A", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Rabu", time: "09:30 - 13:30", period: "Jam 4-8", className: "XII TKR A", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Rabu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XII TKR B", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "RUS", teacherName: "Rusni K. ST" },
  { day: "Rabu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII TKR B", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Rabu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XII TSM", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Rabu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XII TSM", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Rabu", time: "07:15 - 09:30", period: "Jam 1-3", className: "XII DPIB", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Rabu", time: "09:30 - 12:45", period: "Jam 4-7", className: "XII DPIB", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Rabu", time: "07:15 - 09:30", period: "Jam 1-3", className: "XII TAV", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "SLM", teacherName: "Salmah, S.Pd.I" },
  { day: "Rabu", time: "09:30 - 12:45", period: "Jam 4-7", className: "XII TAV", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },

  // ================= KAMIS (THURSDAY) =================
  // KELAS X
  { day: "Kamis", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TKR A", subjectCode: "A", subjectName: "Matematika / Umum", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Kamis", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TKR A", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Kamis", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TKR B", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Kamis", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TKR B", subjectCode: "A", subjectName: "Matematika / Umum", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Kamis", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TSM", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Kamis", time: "10:30 - 12:00", period: "Jam 5-6", className: "X TSM", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TSM", subjectCode: "9", subjectName: "IPAS", teacherCode: "EVA", teacherName: "Evasyahtriana, S.Si" },
  { day: "Kamis", time: "07:15 - 12:00", period: "Jam 1-6", className: "X DKV", subjectCode: "9", subjectName: "IPAS", teacherCode: "EVA", teacherName: "Evasyahtriana, S.Si" },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "X DKV", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Kamis", time: "07:15 - 12:00", period: "Jam 1-6", className: "X DPIB", subjectCode: "9", subjectName: "IPAS", teacherCode: "EVA", teacherName: "Evasyahtriana, S.Si" },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "X DPIB", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Kamis", time: "07:15 - 12:00", period: "Jam 1-6", className: "X TAV", subjectCode: "9", subjectName: "IPAS", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TAV", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },

  // KELAS XI
  { day: "Kamis", time: "07:15 - 08:45", period: "Jam 1-2", className: "XI TKR A", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Kamis", time: "08:45 - 11:15", period: "Jam 3-5", className: "XI TKR A", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Kamis", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TKR A", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Kamis", time: "07:15 - 09:30", period: "Jam 1-3", className: "XI TKR B", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Kamis", time: "09:30 - 13:30", period: "Jam 4-8", className: "XI TKR B", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ARB", teacherName: "Arbianti, SE." },
  { day: "Kamis", time: "07:15 - 08:45", period: "Jam 1-2", className: "XI TSM A", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Kamis", time: "08:45 - 13:30", period: "Jam 3-8", className: "XI TSM A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Kamis", time: "07:15 - 08:45", period: "Jam 1-2", className: "XI TSM B", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Kamis", time: "08:45 - 13:30", period: "Jam 3-8", className: "XI TSM B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Kamis", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI DKV", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Kamis", time: "10:30 - 12:00", period: "Jam 5-6", className: "XI DKV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "XI DKV", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Kamis", time: "07:15 - 10:15", period: "Jam 1-4", className: "XI DPIB", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "TRD", teacherName: "Triana Daniel, S.Pd." },
  { day: "Kamis", time: "10:30 - 12:00", period: "Jam 5-6", className: "XI DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Kamis", time: "12:00 - 13:30", period: "Jam 7-8", className: "XI DPIB", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Kamis", time: "07:15 - 09:30", period: "Jam 1-3", className: "XI TAV", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Kamis", time: "09:30 - 11:15", period: "Jam 4-5", className: "XI TAV", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Kamis", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TAV", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },

  // KELAS XII
  { day: "Kamis", time: "07:15 - 09:30", period: "Jam 1-3", className: "XII TKR A", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Kamis", time: "09:30 - 12:45", period: "Jam 4-7", className: "XII TKR A", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Kamis", time: "07:15 - 09:30", period: "Jam 1-3", className: "XII TKR B", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Kamis", time: "09:30 - 12:45", period: "Jam 4-7", className: "XII TKR B", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Kamis", time: "07:15 - 13:30", period: "Jam 1-8", className: "XII TSM", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Kamis", time: "07:15 - 11:15", period: "Jam 1-5", className: "XII DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },
  { day: "Kamis", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII DPIB", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Kamis", time: "07:15 - 11:15", period: "Jam 1-5", className: "XII TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },
  { day: "Kamis", time: "11:15 - 13:30", period: "Jam 6-8", className: "XII TAV", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },

  // ================= JUMAT (FRIDAY) =================
  // KELAS X
  { day: "Jumat", time: "07:20 - 10:00", period: "Jam 1-4", className: "X TKR A", subjectCode: "7", subjectName: "Matematika", teacherCode: "JYS", teacherName: "I Putu Juniyasa, S.Pd.Mat" },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "X TKR A", subjectCode: "9", subjectName: "IPAS", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Jumat", time: "07:20 - 09:20", period: "Jam 1-3", className: "X TKR B", subjectCode: "9", subjectName: "IPAS", teacherCode: "ISN", teacherName: "Isnawati, S.Pd." },
  { day: "Jumat", time: "09:20 - 11:30", period: "Jam 4-6", className: "X TKR B", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "ALB", teacherName: "Ainal Laremba, S.Ag" },
  { day: "Jumat", time: "07:20 - 09:20", period: "Jam 1-3", className: "X TSM", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "AKN", teacherName: "Askin, S.Ag." },
  { day: "Jumat", time: "09:20 - 11:30", period: "Jam 4-6", className: "X TSM", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "X DKV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Jumat", time: "08:40 - 11:30", period: "Jam 3-6", className: "X DKV", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "X DPIB", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Jumat", time: "08:40 - 11:30", period: "Jam 3-6", className: "X DPIB", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Jumat", time: "07:20 - 10:00", period: "Jam 1-4", className: "X TAV", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "NSP", teacherName: "Nunung Sosilowati Podada, S.Pd.M.Pd." },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "X TAV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "RUS", teacherName: "Rusni K. ST" },

  // KELAS XI
  { day: "Jumat", time: "07:20 - 11:30", period: "Jam 1-6", className: "XI TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ADR", teacherName: "Adrian Sahputra, S.Pd." },
  { day: "Jumat", time: "07:20 - 11:30", period: "Jam 1-6", className: "XI TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Jumat", time: "07:20 - 10:00", period: "Jam 1-4", className: "XI TSM A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "HIS", teacherName: "Hiswan Pagala, S.Pd." },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XI TSM A", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "MHJ", teacherName: "Muharjun, S.Pd" },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "XI TSM B", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Jumat", time: "08:40 - 11:30", period: "Jam 3-6", className: "XI TSM B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "XI DKV", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Jumat", time: "08:40 - 10:00", period: "Jam 3-4", className: "XI DKV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XI DKV", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "XI DPIB", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Jumat", time: "08:40 - 10:00", period: "Jam 3-4", className: "XI DPIB", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XI DPIB", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },
  { day: "Jumat", time: "07:20 - 08:40", period: "Jam 1-2", className: "XI TAV", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "NYM", teacherName: "Nyoman Suliawati, S.Pd. M.Pd." },
  { day: "Jumat", time: "08:40 - 10:00", period: "Jam 3-4", className: "XI TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XI TAV", subjectCode: "5", subjectName: "Sejarah", teacherCode: "ESK", teacherName: "Epna Septiana Kristina, S.Pd." },

  // KELAS XII
  { day: "Jumat", time: "07:20 - 10:00", period: "Jam 1-4", className: "XII TKR A", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XII TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Jumat", time: "07:20 - 10:00", period: "Jam 1-4", className: "XII TKR B", subjectCode: "8", subjectName: "Bahasa Inggris", teacherCode: "MOC", teacherName: "Moch. Yamin, S.Pd." },
  { day: "Jumat", time: "10:10 - 11:30", period: "Jam 5-6", className: "XII TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Jumat", time: "07:20 - 09:20", period: "Jam 1-3", className: "XII TSM", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Jumat", time: "09:20 - 10:50", period: "Jam 4-5", className: "XII TSM", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ARB", teacherName: "Arbianti, SE." },
  { day: "Jumat", time: "07:20 - 10:50", period: "Jam 1-5", className: "XII DPIB", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },
  { day: "Jumat", time: "07:20 - 10:50", period: "Jam 1-5", className: "XII TAV", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },

  // ================= SABTU (SATURDAY) =================
  // KELAS X
  { day: "Sabtu", time: "07:15 - 08:45", period: "Jam 1-2", className: "X TKR A", subjectCode: "6", subjectName: "Seni Budaya", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Sabtu", time: "08:45 - 10:15", period: "Jam 3-4", className: "X TKR A", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Sabtu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TKR A", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "IGP", teacherName: "I Gusti Ngurah Putu Wahyu Darma, S.Pd." },
  { day: "Sabtu", time: "07:15 - 08:45", period: "Jam 1-2", className: "X TKR B", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Sabtu", time: "08:45 - 10:15", period: "Jam 3-4", className: "X TKR B", subjectCode: "6", subjectName: "Seni Budaya", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Sabtu", time: "10:30 - 13:30", period: "Jam 5-8", className: "X TKR B", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "SFL", teacherName: "Saiful Arifin, S.Pd." },
  { day: "Sabtu", time: "07:15 - 10:15", period: "Jam 1-4", className: "X TSM", subjectCode: "3", subjectName: "Bahasa Indonesia", teacherCode: "MUS", teacherName: "Drs. Muslimin. L, S.Pd." },
  { day: "Sabtu", time: "10:30 - 12:00", period: "Jam 5-6", className: "X TSM", subjectCode: "6", subjectName: "Seni Budaya / BK", teacherCode: "CIC", teacherName: "Cici Murni, S.Pd. (BK)" },
  { day: "Sabtu", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TSM", subjectCode: "2", subjectName: "Pancasila / PPKn", teacherCode: "HRL", teacherName: "Haerul, S.Pd." },
  { day: "Sabtu", time: "07:15 - 09:30", period: "Jam 1-3", className: "X DKV", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Sabtu", time: "09:30 - 12:00", period: "Jam 4-6", className: "X DKV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Sabtu", time: "12:00 - 13:30", period: "Jam 7-8", className: "X DKV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Sabtu", time: "07:15 - 09:30", period: "Jam 1-3", className: "X DPIB", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Sabtu", time: "09:30 - 12:00", period: "Jam 4-6", className: "X DPIB", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },
  { day: "Sabtu", time: "12:00 - 13:30", period: "Jam 7-8", className: "X DPIB", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },
  { day: "Sabtu", time: "07:15 - 09:30", period: "Jam 1-3", className: "X TAV", subjectCode: "4", subjectName: "Pendidikan Jasmani & Orkes", teacherCode: "MUT", teacherName: "Munatar Tabara, S.Pd." },
  { day: "Sabtu", time: "09:30 - 12:00", period: "Jam 4-6", className: "X TAV", subjectCode: "B", subjectName: "Dasar Program Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },
  { day: "Sabtu", time: "12:00 - 13:30", period: "Jam 7-8", className: "X TAV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "SSR", teacherName: "Syamsul Sabir, S.Kom" },

  // KELAS XI
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XI TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ADR", teacherName: "Adrian Sahputra, S.Pd." },
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XI TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "ARH", teacherName: "Arham Amiruddin, S.Pd" },
  { day: "Sabtu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI TSM A", subjectCode: "D", subjectName: "Kreativitas, Inovasi & Kewirausahaan", teacherCode: "ARB", teacherName: "Arbianti, SE." },
  { day: "Sabtu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TSM A", subjectCode: "7", subjectName: "Matematika", teacherCode: "SKH", teacherName: "Sitti Khotijah, S.Pd." },
  { day: "Sabtu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI TSM B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "SMN", teacherName: "Saiman, ST." },
  { day: "Sabtu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI TSM B", subjectCode: "7", subjectName: "Matematika", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XI DKV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IWZ", teacherName: "Izzat Wahyu Zaldi, S.Pd." },
  { day: "Sabtu", time: "07:15 - 11:15", period: "Jam 1-5", className: "XI DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Sabtu", time: "11:15 - 13:30", period: "Jam 6-8", className: "XI DPIB", subjectCode: "1", subjectName: "Pendidikan Agama", teacherCode: "ALB", teacherName: "Ainal Laremba, S.Ag" },
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XI TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "RUS", teacherName: "Rusni K. ST" },

  // KELAS XII
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XII TKR A", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Sabtu", time: "07:15 - 13:30", period: "Jam 1-8", className: "XII TKR B", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "AAU", teacherName: "Andi Asrul Umar, S.Pd." },
  { day: "Sabtu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XII TSM", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "ANG", teacherName: "Angraeni Desanik, S.Pd." },
  { day: "Sabtu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XII TSM", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "GHK", teacherName: "Gusti Himawan Kadianto, S.Pd." },
  { day: "Sabtu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XII DPIB", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "TTH", teacherName: "Titik Harumi, S.Pd" },
  { day: "Sabtu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XII DPIB", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "IMP", teacherName: "Iman Purnama, ST" },
  { day: "Sabtu", time: "07:15 - 10:15", period: "Jam 1-4", className: "XII TAV", subjectCode: "C", subjectName: "Mata Pelajaran Keahlian", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" },
  { day: "Sabtu", time: "10:30 - 13:30", period: "Jam 5-8", className: "XII TAV", subjectCode: "E", subjectName: "Mata Pelajaran Pilihan", teacherCode: "MMN", teacherName: "Muhammad Maimana. L, ST" }
];
