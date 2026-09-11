/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, ArrowRight, Check, X, Sparkles, UserCheck } from "lucide-react";

interface QuickRoleSwitcherProps {
  currentRole: string;
  currentUsername: string;
  onRoleSwitch: (username: string, role: string) => void;
}

export function QuickRoleSwitcher({ currentRole, currentUsername, onRoleSwitch }: QuickRoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { name: "Admin TU — SAKTINANI DJUNAID", username: "SAKTINANI DJUNAID", role: "tu", desc: "Rekap & Arsip Laporan Kehadiran Murid" },
    { name: "Admin Utama — ARHAM AMIRUDDIN", username: "ARHAM AMIRUDDIN", role: "admin", desc: "Akses Penuh Administrator Utama SIHADIR" },
    { name: "Guru (Terhubung All-In-One) — Isnawati", username: "Isnawati, S.Pd.", role: "guru", desc: "Terhubung: Guru Mapel, Guru Wali, Guru Piket & Wali Kelas" },
    { name: "Guru Wali — Ibu Arbianti, SE", username: "ARBIANTI, SE", role: "guru_wali", desc: "Murid Perwalian Guru Wali: XII DPIB (11 Murid Bimbingan)" },
    { name: "Guru Wali — I Putu Juniyasa, S.Pd.", username: "I Putu Juniyasa, S.Pd.Mat", role: "guru_wali", desc: "Presensi Harian & Pembimbingan (16 Murid Bimbingan)" },
    { name: "Guru Piket Jum'at — Ainal Laremba, S.Ag", username: "Ainal Laremba, S.Ag", role: "piket", desc: "Petugas Piket Hari Jum'at (Pak Ainal & 5 Rekan)" },
    { name: "Guru Piket Rabu — Hiswan Pagala, S.Pd.", username: "Hiswan Pagala, S.Pd.", role: "piket", desc: "Monitor KBM, Absen Kelas & Jurnal Harian (Terhubung)" },
    { name: "Wali Kelas — Haerul, S.Pd.", username: "Haerul, S.Pd.", role: "wali", desc: "Kirim laporan WA ke Orang Tua (Terhubung)" },
    { name: "Guru BK 1 — Ibu Cici Murni, S.Pd.", username: "Cici Murni, S.Pd.", role: "bk", desc: "Khusus BK: CICI MURNI & YOGA NANDA HERMAWAN" },
    { name: "Guru BK 2 — Pak Yoga Nanda Hermawan", username: "Yoga Nanda Hermawan, S.Pd.", role: "bk", desc: "Khusus BK: CICI MURNI & YOGA NANDA HERMAWAN" },
    { name: "Kepala Sekolah — Drs. H. ABD. MANAN, M.M.", username: "Drs. H. ABD. MANAN, M.M.", role: "kepsek", desc: "Statistik kehadiran guru & audit kurikulum" },
    { name: "Ketua Kelas — MUHAMAD SHIDIQ FATHONI", username: "MUHAMAD SHIDIQ FATHONI (Ketua Kelas XI TKR A)", role: "ketua_kelas", desc: "Presensi harian mandiri & broadcast WA" },
    { name: "Murid — Aditya Pratama", username: "Aditya Pratama", role: "siswa", desc: "Akses Mandiri Presensi Masuk/Pulang & E-Rapor Murid" },
    { name: "Waka Kurikulum — Andi Asrul Umar, S.Pd.", username: "Andi Asrul Umar, S.Pd.", role: "kurikulum", desc: "Arsip CP/ATP & Monitoring Kelas" },
    { name: "Waka Kesiswaan — Nyoman Suliawati, S.Pd., M.Pd.", username: "Nyoman Suliawati, S.Pd., M.Pd.", role: "kesiswaan", desc: "Ketertiban & Pembinaan Kedisiplinan Murid" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            className="absolute bottom-16 right-0 w-80 bg-slate-900 text-white rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black tracking-tight text-white uppercase">Switcher Peran Cepat</h3>
                    <p className="text-[10px] text-indigo-200 font-medium">Beralih peran secara instan untuk melacak alur kerja</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Presets List */}
            <div className="p-2.5 max-h-[380px] overflow-y-auto space-y-1.5 custom-scrollbar">
              {presets.map((p) => {
                const isCurrent = currentUsername.toLowerCase() === p.username.toLowerCase();
                return (
                  <button
                    key={p.username}
                    onClick={() => {
                      onRoleSwitch(p.username, p.role);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isCurrent 
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-xs" 
                        : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black ${
                      isCurrent ? "bg-indigo-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-400"
                    }`}>
                      {isCurrent ? <Check className="h-3.5 w-3.5" /> : p.username.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold block truncate leading-none">{p.name}</span>
                        <span className={`text-[8px] px-1 py-0.5 rounded uppercase font-black tracking-wider leading-none shrink-0 ${
                          isCurrent ? "bg-indigo-500 text-white" : "bg-slate-700/60 text-slate-300"
                        }`}>
                          {p.role}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-tight font-medium">
                        {p.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status Footer */}
            <div className="bg-slate-950 p-2.5 text-center text-[10px] text-slate-500 font-semibold border-t border-slate-800 flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-500" />
              <span>Sesi Aktif: <strong className="text-slate-300">{currentUsername} ({currentRole})</strong></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-tr from-indigo-900 to-indigo-700 hover:from-indigo-800 hover:to-indigo-600 text-white rounded-full p-3.5 shadow-2xl relative border border-indigo-400/30 cursor-pointer shadow-indigo-500/20"
        title="Beralih Peran Instan (Demo Mode)"
      >
        <ShieldAlert className="h-5 w-5 animate-pulse text-yellow-400 shrink-0" />
        <span className="text-xs font-black uppercase tracking-wider hidden md:inline-block pr-1.5 selection:bg-transparent">
          Beralih Peran
        </span>
      </motion.button>
    </div>
  );
}
