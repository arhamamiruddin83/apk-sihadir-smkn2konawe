/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClassCaptainInfo {
  className: string;
  captainName: string;
  major: string;
}

export const OFFICIAL_CLASS_CAPTAINS: ClassCaptainInfo[] = [
  // Kelas XII
  { className: "XII TKR A", captainName: "ZULHAJI FAJRIN", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "XII TKR B", captainName: "ANDI ASHAR", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "XII TSM", captainName: "RANGGA PRAMONOI", major: "Teknik Sepeda Motor (TSM)" },
  { className: "XII TAV", captainName: "GALIH ADI PRATAMA", major: "Teknik Audio Video (TAV)" },
  { className: "XII DPIB", captainName: "ADE AGUS WILA KUSUMA", major: "Desain Pemodelan & Informasi Bangunan (DPIB)" },

  // Kelas XI
  { className: "XI TKR A", captainName: "MUHAMAD SHIDIQ FATHONI", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "XI TKR B", captainName: "ABDURAFI ASFIRIN", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "XI TSM A", captainName: "BAGAS ARI WASITO", major: "Teknik Sepeda Motor (TSM)" },
  { className: "XI TSM B", captainName: "ASRAN ASIS", major: "Teknik Sepeda Motor (TSM)" },
  { className: "XI TAV", captainName: "KETUT ARYA RENDIAWAN", major: "Teknik Audio Video (TAV)" },
  { className: "XI DPIB", captainName: "HAFIS IBRAHIM", major: "Desain Pemodelan & Informasi Bangunan (DPIB)" },
  { className: "XI DKV", captainName: "RABIATUL ADAWIYAH", major: "Desain Komunikasi Visual (DKV)" },

  // Kelas X
  { className: "X TKR A", captainName: "MUH. ZAKIR ASSAJAD", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "X TKR B", captainName: "ANDI MUHAMMAD HAEKAL", major: "Teknik Kendaraan Ringan (TKR)" },
  { className: "X TSM", captainName: "JONI ARSITO MATIUS", major: "Teknik Sepeda Motor (TSM)" },
  { className: "X TAV", captainName: "RIDHO AKBAR MAULANA", major: "Teknik Audio Video (TAV)" },
  { className: "X DPIB", captainName: "HANAN AFIF", major: "Desain Pemodelan & Informasi Bangunan (DPIB)" },
  { className: "X DKV", captainName: "MUH. NANDA SEPRIAN", major: "Desain Komunikasi Visual (DKV)" },
];

export const OFFICIAL_CLASSES = OFFICIAL_CLASS_CAPTAINS.map(c => c.className);

export const CLASS_CAPTAIN_MAP: Record<string, string> = OFFICIAL_CLASS_CAPTAINS.reduce((acc, curr) => {
  acc[curr.className] = curr.captainName;
  return acc;
}, {} as Record<string, string>);

export const CAPTAIN_TO_CLASS_MAP: Record<string, string> = OFFICIAL_CLASS_CAPTAINS.reduce((acc, curr) => {
  acc[curr.captainName.toUpperCase()] = curr.className;
  return acc;
}, {} as Record<string, string>);

export const getStudentCaptainClass = (studentName: string): string | null => {
  if (!studentName) return null;
  const nameClean = studentName.trim().toUpperCase();
  for (const item of OFFICIAL_CLASS_CAPTAINS) {
    const captainClean = item.captainName.toUpperCase();
    if (captainClean === nameClean || nameClean.includes(captainClean) || captainClean.includes(nameClean)) {
      return item.className;
    }
  }
  // Check localStorage if user manually configured a ketua kelas name
  const customCaptainName = localStorage.getItem("sihadir_ketua_kelas_name");
  const customCaptainClass = localStorage.getItem("sihadir_ketua_kelas_class");
  if (customCaptainName && customCaptainClass) {
    const customClean = customCaptainName.trim().toUpperCase();
    if (customClean === nameClean || nameClean.includes(customClean) || customClean.includes(nameClean)) {
      return customCaptainClass;
    }
  }
  return null;
};
