/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gift, Cake, Sparkles, Heart, Send, X, PartyPopper, Calendar } from "lucide-react";
import { MOCK_TEACHERS } from "../mockData";
import { Teacher } from "../types";

interface TeacherBirthdayMatch {
  id: string;
  name: string;
  role: string;
  subject?: string;
  birthDateFormatted: string;
  age: number;
  whatsApp?: string;
}

const MONTH_MAP: Record<string, number> = {
  januari: 1, jan: 1,
  februari: 2, feb: 2,
  maret: 3, mar: 3,
  april: 4, apr: 4,
  mei: 5,
  juni: 6, jun: 6,
  juli: 7, jul: 7,
  agustus: 8, agu: 8, ags: 8,
  september: 9, sep: 9, sept: 9,
  oktober: 10, okt: 10,
  november: 11, nov: 11,
  desember: 12, des: 12
};

export function BirthdayGreetingBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedSimulatedTeacherId, setSelectedSimulatedTeacherId] = useState<string | null>(null);
  const [showSimulationSelector, setShowSimulationSelector] = useState(false);

  // Parse birth date details from Teacher object or NIP or birthInfo string
  const parseTeacherBirth = (t: Partial<Teacher> & { birthInfo?: string }): { month: number; day: number; year: number } | null => {
    // 1. Direct birthDate YYYY-MM-DD
    if (t.birthDate && t.birthDate.includes("-")) {
      const parts = t.birthDate.split("-");
      if (parts.length === 3) {
        return {
          year: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10),
          day: parseInt(parts[2], 10)
        };
      }
    }

    // 2. Parse from NIP (e.g. 19850727 201001 1 003 or 19850727...)
    if (t.nip) {
      const cleanNip = t.nip.replace(/\D/g, "");
      if (cleanNip.length >= 8) {
        const y = parseInt(cleanNip.substring(0, 4), 10);
        const m = parseInt(cleanNip.substring(4, 6), 10);
        const d = parseInt(cleanNip.substring(6, 8), 10);
        if (y > 1940 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return { year: y, month: m, day: d };
        }
      }
    }

    // 3. Parse from birthInfo (e.g., "Kendari, 27 Juli 1985" or "28 Februari 1985")
    if (t.birthInfo) {
      const text = t.birthInfo.toLowerCase();
      // Look for day, month_name, year
      const match = text.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
      if (match) {
        const day = parseInt(match[1], 10);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        const month = MONTH_MAP[monthName];
        if (month && day >= 1 && day <= 31) {
          return { year, month, day };
        }
      }
    }

    return null;
  };

  // Get current list of teachers
  const getAllTeachers = (): Teacher[] => {
    try {
      const saved = localStorage.getItem("simpati_teachers_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return MOCK_TEACHERS;
  };

  const teachersList = getAllTeachers();

  // Find teachers celebrating today
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();

  const getBirthdayTeachers = (): TeacherBirthdayMatch[] => {
    const matches: TeacherBirthdayMatch[] = [];

    teachersList.forEach((t) => {
      const birth = parseTeacherBirth(t);
      if (birth) {
        const isTodayBirthday = birth.month === currentMonth && birth.day === currentDay;
        const isSimulated = selectedSimulatedTeacherId === t.id;

        if (isTodayBirthday || isSimulated) {
          const age = currentYear - birth.year;
          matches.push({
            id: t.id,
            name: t.name,
            role: t.role || "Guru & Tenaga Pendidik",
            subject: t.subject,
            birthDateFormatted: `${birth.day} ${getIndonesianMonthName(birth.month)} ${birth.year}`,
            age: age > 0 ? age : 38,
            whatsApp: t.whatsApp
          });
        }
      }
    });

    return matches;
  };

  const birthdayTeachers = getBirthdayTeachers();

  if (isDismissed || birthdayTeachers.length === 0) {
    // Show a small button in admin/simulation bar if not visible, so admins can trigger/test it
    return (
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={() => {
            setIsDismissed(false);
            setShowSimulationSelector(true);
          }}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
        >
          <PartyPopper className="h-3 w-3 text-amber-500 animate-bounce" />
          <span>Simulasi Ucapan Ulang Tahun Guru</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/10 mb-4 animate-in fade-in slide-in-from-top-3 duration-500">
      <div className="relative bg-white dark:bg-slate-900 rounded-[15px] p-4 sm:p-5">
        
        {/* Confetti & Sparkles Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-rose-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Main Birthday Message Section */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-rose-500 text-white rounded-2xl shadow-md shrink-0 flex items-center justify-center animate-pulse">
              <Cake className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/50 uppercase tracking-wide">
                  <Sparkles className="h-3 w-3 text-amber-500 animate-spin" />
                  Momen Spesial Hari Ini
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-rose-500" />
                  {today.getDate()} {getIndonesianMonthName(today.getMonth() + 1)} {today.getFullYear()}
                </span>
              </div>

              {birthdayTeachers.map((bt) => (
                <div key={bt.id} className="pt-0.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-1.5 leading-snug">
                    <span>SELAMAT ULANG TAHUN KE-{bt.age}!</span>
                    <span className="text-rose-600 dark:text-rose-400">🎉</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                    {bt.name} <span className="font-medium text-slate-500 dark:text-slate-400">({bt.role})</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
                    "Selamat Ulang Tahun yang ke-<strong>{bt.age}</strong>! 🎂✨ Semoga sehat selalu, panjang umur, dan senantiasa diberi kemudahan serta keberkahan dalam melaksanakan aktivitas keseharian mendidik putra-putri SMK Negeri 2 Konawe."
                  </p>

                  {/* Send WhatsApp Wishes Button */}
                  {bt.whatsApp && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://wa.me/${bt.whatsApp.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                          `Selamat Ulang Tahun ke-${bt.age} Bapak/Ibu ${bt.name}! 🎉🎂 Semoga sehat selalu, panjang umur, dan senantiasa diberikan kemudahan & kelancaran dalam beraktivitas. Salam hangat dari keluarga besar SMK Negeri 2 Konawe.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all hover:scale-105"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim Ucapan WA ke {bt.name.split(",")[0]}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls & Simulation selector */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
            <button
              type="button"
              onClick={() => setShowSimulationSelector(!showSimulationSelector)}
              className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Pilih guru untuk melihat simulasi ucapan ulang tahun"
            >
              Simulasi
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Tutup ucapan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Simulation Selector Bar */}
        {showSimulationSelector && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Pilih Guru (Tes Ucapan):</span>
              <select
                value={selectedSimulatedTeacherId || ""}
                onChange={(e) => setSelectedSimulatedTeacherId(e.target.value || null)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold focus:outline-none"
              >
                <option value="">-- Hari Ini ({today.getDate()} {getIndonesianMonthName(today.getMonth() + 1)}) --</option>
                {teachersList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.role || "Guru"})
                  </option>
                ))}
              </select>
            </div>
            {selectedSimulatedTeacherId && (
              <button
                type="button"
                onClick={() => setSelectedSimulatedTeacherId(null)}
                className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                Reset Ke Tanggal Asli
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function getIndonesianMonthName(monthNumber: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return months[monthNumber - 1] || "Januari";
}
