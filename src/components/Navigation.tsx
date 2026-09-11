/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SIHADIR_THEMES, ThemeId } from "../utils/themeConfig";
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  FileText, 
  Users, 
  GraduationCap, 
  PieChart, 
  MessageSquare,
  Wrench,
  Menu,
  X,
  UserCheck,
  Shield,
  Briefcase,
  ClipboardList,
  LogOut,
  Settings2,
  Award,
  User,
  ShieldAlert,
  HeartHandshake,
  Inbox,
  Send,
  Mail
} from "lucide-react";
import { getStudentCaptainClass } from "../data/classCaptains";

interface NavigationProps {
  currentRole: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRoleChange: (role: string) => void;
  username?: string;
  onLogout?: () => void;
}

export function Navigation({
  currentRole,
  activeTab,
  setActiveTab,
  onRoleChange,
  username = "Guru",
  onLogout
}: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<string>(() => {
    return localStorage.getItem("sihadir_bg_theme") || "blue";
  });

  // Automatically sync theme changes from storage across all tabs
  React.useEffect(() => {
    const handleStorageChange = () => {
      setAppTheme(localStorage.getItem("sihadir_bg_theme") || "blue");
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getThemeBgClass = () => {
    const matched = SIHADIR_THEMES[appTheme as ThemeId];
    if (matched?.app?.sidebarBg) {
      return matched.app.sidebarBg;
    }
    return "bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white border-r border-blue-700/60 shadow-lg";
  };

  const isWhiteTheme = appTheme === "minimal-light";
  const themeBgClass = getThemeBgClass();

  // Hanya Admin Utama (ARHAM AMIRUDDIN / admin) yang dapat melihat & beralih ke SEMUA peran kerja/akun di sistem!
  // Waka Kurikulum, Waka Kesiswaan & pengguna lain hanya dapat mengakses peran yang ditugaskan kepada mereka.
  const isAdminUser = (() => {
    if (!username) return currentRole === "admin";
    const u = username.toLowerCase().trim();
    if (u.includes("sakti") || u.includes("adelia") || u.includes("saktinani") || u.includes("pusparini")) return false;
    return u === "admin" || u === "arham" || u === "alam" || u.includes("arham");
  })();

  const isSaktiOrAdeliaUser = (() => {
    const u = (username || "").toLowerCase().trim();
    return u.includes("sakti") || u.includes("adelia") || u.includes("saktinani") || u.includes("pusparini");
  })();

  const allRoles = [
    { id: "tu", label: isSaktiOrAdeliaUser ? "Admin Tata Usaha (TU)" : "Staf Tata Usaha", desc: "Rekap & Arsip Laporan Kehadiran Murid" },
    { id: "admin", label: "Administrator Utama", desc: "Akses Penuh Semua Modul, Pengaturan & Data Master" },
    { id: "siswa", label: "Akses Murid", desc: "Lihat Rekap Presensi & Konsultasi" },
    { id: "bk", label: "Bimbingan Konseling (BK)", desc: "Analisis Karakter & Rekap Presensi" },
    { id: "guru", label: "Guru Mata Pelajaran", desc: "Modul Ajar, Soal & Jurnal" },
    { id: "piket", label: "Guru Piket", desc: "Monitor KBM, Absen Kelas, Izin Murid & Jurnal" },
    { id: "guru_wali", label: "Guru Wali", desc: "Layanan Pembimbingan & Presensi" },
    { id: "kepsek", label: "Kepala Sekolah", desc: "Statistik, Kehadiran & Audit Kurikulum" },
    { id: "ketua_kelas", label: "Ketua Kelas", desc: "Laporan harian mandiri & broadcast WA" },
    { id: "wali", label: "Wali Kelas", desc: "Absensi & Laporan OrangTua (WA)" },
    { id: "kesiswaan", label: "Waka Kesiswaan", desc: "Kedisiplinan & Tata Tertib Murid" },
    { id: "kurikulum", label: "Waka Kurikulum", desc: "Atur Kurikulum, Data Master & Monitor" }
  ].sort((a, b) => a.label.localeCompare(b.label, "id"));

  // Check if current user is Arham Amiruddin / Administrator Utama
  const isTeacherAdmin = (() => {
    if (username) {
      const u = username.toLowerCase().trim();
      if (u === "admin" || u === "arham" || u === "alam" || u.includes("arham")) return true;
    }
    return false;
  })();

  // Load active teacher's selected duties from localStorage dynamically
  const activeDuties = (() => {
    if (username) {
      const profileKey = `sihadir_teacher_profile_${username.trim().toLowerCase() || "default"}`;
      const saved = localStorage.getItem(profileKey);
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          const duty = profile.additionalDuty;
          if (Array.isArray(duty)) return duty;
          if (typeof duty === "string") {
            return duty === "Tidak Ada" ? [] : [duty];
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    const globalDuty = localStorage.getItem("sihadir_active_teacher_duty");
    if (globalDuty) {
      try {
        const parsed = JSON.parse(globalDuty);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return globalDuty === "Tidak Ada" ? [] : [globalDuty];
    }
    return [];
  })();

  // Check if current logged in user is a student who holds an additional task as Ketua Kelas
  const userCaptainClass = getStudentCaptainClass(username) || 
    (username === "ketuakelas" ? (localStorage.getItem("sihadir_ketua_kelas_class") || "XI TKR A") : null);
  const isUserClassCaptain = Boolean(userCaptainClass);

  // Check if current user is BK teacher
  const isBkTeacher = (() => {
    const u = (username || "").toLowerCase();
    return (
      u.includes("cici") ||
      u.includes("yoga") ||
      u.includes("suci") ||
      u.includes("bk") ||
      currentRole === "bk" ||
      activeDuties.includes("Guru BK")
    );
  })();

  // If Admin/Kurikulum, they can choose from allRoles. If not, show active role & additional duty roles
  const roles = (() => {
    if (isSaktiOrAdeliaUser || currentRole === "tu") {
      return allRoles.filter(r => r.id === "tu");
    }
    
    let result: typeof allRoles;

    if (isAdminUser) {
      if (isBkTeacher) {
        result = allRoles.filter(r => r.id !== "guru");
      } else {
        result = [...allRoles];
      }
      if (currentRole === "siswa" && !isUserClassCaptain) {
        result = result.filter(r => r.id !== "ketua_kelas");
      }
    } else {
      // Default allowed roles is the currentRole
      const allowedRoleIds = new Set<string>([currentRole]);
      
      // If current role is a teacher role, also allow switching to "guru" and any active duties roles
      const isTeacherRole = ["guru", "wali", "guru_wali", "bk", "piket", "admin", "kurikulum", "kesiswaan"].includes(currentRole);
      if (isTeacherRole) {
        if (!isBkTeacher) {
          allowedRoleIds.add("guru"); // allow general subject teacher role only for non-BK teachers
        }
        if (activeDuties.includes("Wali Kelas")) {
          allowedRoleIds.add("wali");
        }
        if (activeDuties.includes("Guru Wali")) {
          allowedRoleIds.add("guru_wali");
        }
        if (activeDuties.includes("Guru BK") || isBkTeacher) {
          allowedRoleIds.add("bk");
        }
        if (activeDuties.includes("Guru Piket")) {
          allowedRoleIds.add("piket");
        }
        if (isTeacherAdmin) {
          allowedRoleIds.add("admin");
        }
        const isNyoman = username.toLowerCase().includes("nyoman") || username.toLowerCase().includes("suliawati");
        if (!isNyoman && (activeDuties.includes("Waka Kurikulum") || username.toLowerCase().includes("asrul") || username.toLowerCase().includes("kurikulum"))) {
          allowedRoleIds.add("kurikulum");
        }
        if (!username.toLowerCase().includes("asrul") && (activeDuties.includes("Waka Kesiswaan") || isNyoman || username.toLowerCase().includes("kesiswaan"))) {
          allowedRoleIds.add("kesiswaan");
        }
      }

      // Only allow student who is genuinely a designated Ketua Kelas to access both roles
      if (isUserClassCaptain) {
        allowedRoleIds.add("murid");
        allowedRoleIds.add("ketua_kelas");
      } else {
        allowedRoleIds.delete("ketua_kelas");
        if (currentRole === "siswa" || currentRole === "ketua_kelas") {
          allowedRoleIds.add("murid");
        }
      }
      
      result = allRoles.filter(r => allowedRoleIds.has(r.id));
    }

    if (!isUserClassCaptain && currentRole !== "ketua_kelas" && !isAdminUser && currentRole !== "tu") {
      result = result.filter(r => r.id !== "ketua_kelas");
    }

    if (isBkTeacher) {
      result = result.filter(r => r.id !== "guru");
    }
    if (username.toLowerCase().includes("asrul")) {
      result = result.filter(r => r.id !== "kesiswaan");
    }
    if (username.toLowerCase().includes("nyoman") || username.toLowerCase().includes("suliawati")) {
      result = result.filter(r => r.id !== "kurikulum");
    }
    return result;
  })();

  // Map tabs based on current role
  const getMenuItems = () => {
    let items: Array<{ id: string; label: string; icon: any }> = [];

    switch (currentRole) {
      case "ketua_kelas":
        items = [
          { id: "ketua-kelas-dashboard", label: `Dasbor & Scan QR Kelas ${userCaptainClass ? `(${userCaptainClass})` : ""}`, icon: ClipboardList },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "student-attendance", label: "Presensi Harian Murid", icon: Users },
          { id: "refleksi-siswa", label: "Refleksi Harian Murid", icon: MessageSquare }
        ];
        break;
      case "admin":
        items = [
          { id: "profil-guru", label: "Dasbor Admin Utama", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin },
          { id: "student-attendance", label: "Presensi Mapel & Jadwal Guru", icon: Users },
          { id: "ketua-kelas-dashboard", label: "Jurnal KBM & Monitoring Guru", icon: ClipboardList },
          { id: "kredit-pelanggaran", label: "Kredit Pelanggaran & SP (0-100)", icon: ShieldAlert },
          { id: "master-data", label: "Atur Data Master", icon: Settings2 },
          { id: "rekap-laporan", label: "Rekap Laporan Presensi", icon: ClipboardList }
        ];
        break;
      case "tu":
        items = [
          { id: "profil-guru", label: "Profil Admin TU", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "rekap-laporan", label: "Rekap Laporan & Scanner QR TU", icon: ClipboardList },
          { id: "arsip-surat", label: "Arsip Surat Digital TU", icon: FileText },
          { id: "master-data", label: "Data Master (Lihat)", icon: Settings2 }
        ];
        break;
      case "kurikulum":
        items = [
          { id: "profil-guru", label: "Dasbor Waka Kurikulum", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin },
          { id: "student-attendance", label: "Presensi Mapel & Jadwal Guru", icon: Users },
          { id: "ketua-kelas-dashboard", label: "Jurnal KBM & Monitoring Guru", icon: ClipboardList },
          { id: "rekap-laporan", label: "Rekap Laporan Kurikulum", icon: ClipboardList }
        ];
        break;
      case "kesiswaan":
        items = [
          { id: "profil-guru", label: "Dasbor Waka Kesiswaan", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin },
          { id: "student-attendance", label: "Presensi Mapel & Jadwal Guru", icon: Users },
          { id: "ketua-kelas-dashboard", label: "Jurnal KBM & Monitoring Guru", icon: ClipboardList },
          { id: "kredit-pelanggaran", label: "Kredit Pelanggaran & SP Murid", icon: ShieldAlert },
          { id: "rekap-laporan", label: "Rekap Laporan Kedisiplinan", icon: ClipboardList }
        ];
        break;
      case "piket":
        items = [
          { id: "guru-piket-dashboard", label: "Menu Kerja & Scan QR Piket", icon: ShieldAlert },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "profil-guru", label: "Profil Guru Piket", icon: User },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin }
        ];
        break;
      case "wali":
        items = [
          { id: "kerjaan-wali-kelas", label: "Menu Kerjaan Wali Kelas", icon: Users },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "kredit-pelanggaran", label: "Poin Pelanggaran Murid Perwalian", icon: ShieldAlert },
          { id: "profil-guru", label: "Profil Wali Kelas", icon: User },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin },
          { id: "parent-report", label: "Laporan WA Ortu", icon: MessageSquare }
        ];
        break;
      case "guru_wali":
        items = [
          { id: "kerjaan-guru-wali", label: "Menu Kerja Guru Wali", icon: HeartHandshake },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "kredit-pelanggaran", label: "Poin Pelanggaran Murid Binaan", icon: ShieldAlert },
          { id: "profil-guru", label: "Profil Guru Wali", icon: User },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin }
        ];
        break;
      case "guru":
        items = [
          { id: "profil-guru", label: "Dasbor & Profil Guru", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "absensi-guru", label: "Guru absen disini", icon: MapPin }
        ];
        break;
      case "bk":
        items = [
          { id: "kelas-bimbingan", label: "Menu Kerja & Scan QR BK", icon: HeartHandshake },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "profil-guru", label: "Profil Guru BK", icon: User },
          { id: "kredit-pelanggaran", label: "Kredit Pelanggaran & SP Murid", icon: ShieldAlert },
          { id: "rekap-laporan", label: "Rekap Laporan Murid BK", icon: ClipboardList }
        ];
        break;
      case "kepsek":
        items = [
          { id: "profil-guru", label: "Dasbor Kepala Sekolah", icon: User },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "rekap-laporan", label: "Rekap Laporan Sekolah", icon: ClipboardList }
        ];
        break;
      case "siswa": {
        items = [
          { id: "student-attendance", label: "Murid Absen Disini", icon: ClipboardList },
          { id: "chat-sekolah", label: "Kolom Chatting Sihadir", icon: MessageSquare },
          { id: "refleksi-siswa", label: "Refleksi Harian Murid", icon: MessageSquare }
        ];
        if (isUserClassCaptain) {
          items.unshift({ 
            id: "ketua-kelas-dashboard", 
            label: `Dasbor Ketua Kelas (${userCaptainClass || "Tugas Tambahan"})`, 
            icon: ClipboardList 
          });
        }
        break;
      }
      default:
        return [];
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Left Sidebar Panel */}
      <aside className={`hidden md:flex flex-col w-64 ${themeBgClass} p-4 shadow-lg shrink-0 justify-between h-screen sticky top-0`} id="desktop-sidebar">
        
        <div className="space-y-5">
          {/* Logo Brand - Centered and transparent without white background */}
          <div className={`flex flex-col items-center gap-2 pb-3 border-b text-center ${isWhiteTheme ? "border-slate-200" : "border-white/10"}`}>
            <div className="flex items-center justify-center w-16 h-16 shrink-0 transition-transform hover:scale-105 duration-200">
              <img 
                src="https://i.ibb.co.com/TMkWkNY4/LOGO-SMKN-2-KONAWE-BARU.png" 
                alt="Logo SMK 2" 
                className="w-full h-full object-cover rounded-full drop-shadow-md"
                style={{ clipPath: "circle(50% at 50% 50%)" }}
                onError={(e) => {
                  e.currentTarget.src = "https://i.ibb.co/L8N2LpL/SMKN2.png";
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className={`text-[20px] font-black tracking-widest leading-none ${isWhiteTheme ? "text-slate-900" : "text-white"}`}>
                SIHADIR
              </h1>
              <span className={`text-[13px] font-bold block mt-1 ${isWhiteTheme ? "text-slate-500" : "text-gray-300"}`}>Absensi Digital</span>
              <p className="text-[14px] text-orange-500 font-extrabold mt-1 uppercase tracking-wider">SMK NEGERI 2 KONAWE</p>
            </div>
          </div>

          {/* Quick Role Select Option - Compact dropdown to prevent crowding */}
          <div className={`space-y-1.5 p-2 rounded-xl border shadow-inner ${isWhiteTheme ? "bg-slate-100 border-slate-200" : "bg-black/20 border-white/5"}`}>
            <span className={`text-[9px] uppercase font-black tracking-wider block px-1 ${isWhiteTheme ? "text-slate-600" : "text-orange-400"}`}>
              Peran Kerja Utama
            </span>
            <div className="relative">
              <select
                id="role-select-desktop"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as any)}
                className={`w-full text-[11px] rounded-lg p-2 font-bold cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none pr-7 ${
                  isWhiteTheme 
                    ? "bg-white border-slate-350 text-slate-800 hover:bg-slate-50" 
                    : "bg-slate-900/95 border border-white/10 text-white hover:bg-slate-950 [color-scheme:dark]"
                }`}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white font-semibold py-1">
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 w-4 flex items-center justify-center pointer-events-none text-slate-400">
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    id={`sidebar-btn-${item.id}`}
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? appTheme === "green"
                          ? "bg-emerald-600 text-white shadow-md font-extrabold"
                          : "bg-indigo-650 text-white shadow font-bold" 
                        : isWhiteTheme
                          ? "text-slate-600 hover:text-indigo-600 hover:bg-slate-200/50"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : isWhiteTheme ? "text-slate-550" : "text-gray-400 group-hover:text-white"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Source Check & Footer widgets */}
        <div className={`space-y-3 pt-3 border-t ${isWhiteTheme ? "border-slate-200" : "border-white/5"}`}>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold transition-all cursor-pointer rounded-xl border bg-white hover:bg-slate-50 border-white text-[#de0027] shadow-sm`}
            >
              <LogOut className="h-3.5 w-3.5 text-[#de0027]" />
              <span className="text-[#de0027]">Keluar (Logout)</span>
            </button>
          )}
          <div className={`p-3 rounded-lg border text-center ${isWhiteTheme ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/30 border-white/5"}`}>
            <p className={`text-[12px] font-bold leading-tight ${isWhiteTheme ? "text-slate-500" : "text-[#f1f1f1]"}`}>SMK Negeri 2 Konawe 2026/2027</p>
          </div>
        </div>

      </aside>

      {/* Mobile Topbar and Menu Panel */}
      <div className={`md:hidden ${
        appTheme === "green"
          ? "bg-gradient-to-r from-emerald-800 via-emerald-900 to-green-950 text-white border-b border-emerald-700"
          : isWhiteTheme 
            ? "bg-slate-50 border-b border-slate-200 text-slate-800" 
            : "bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800"
      } flex justify-between items-center px-4 py-3 sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <div>
            <span className={`text-sm font-black block leading-none ${isWhiteTheme ? "text-slate-900" : "text-white"}`}>SIHADIR</span>
            <span className={`text-[9px] uppercase font-black block mt-1.5 ${isWhiteTheme ? "text-slate-500" : "text-gray-400"}`}>SMK NEGERI 2 KONAWE</span>
            <span className={`text-[8px] uppercase font-bold block ${isWhiteTheme ? "text-slate-400" : "text-gray-500"}`}>2026/2027</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`p-1 ${isWhiteTheme ? "text-slate-600 hover:text-slate-900" : "text-gray-350 hover:text-white"}`}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Floating Mobile Panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`absolute top-12 left-0 right-0 border-b p-4 space-y-4 shadow-xl ${
                appTheme === "green"
                  ? "bg-gradient-to-b from-emerald-900 to-green-950 border-emerald-800 text-white"
                  : isWhiteTheme
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-white"
              }`}
              id="mobile-navigation-dropdown"
            >
              {/* Role selection dropdown */}
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${isWhiteTheme ? "text-slate-500" : "text-gray-300"}`}>Ganti Workspace</span>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    onRoleChange(e.target.value as any);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-xs rounded-lg p-2.5 font-bold ${
                    isWhiteTheme
                      ? "bg-slate-50 border border-slate-300 text-slate-800"
                      : "bg-slate-900 border border-slate-750 text-white [color-scheme:dark]"
                  }`}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>

              </div>

              {/* Menu items row */}
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${isWhiteTheme ? "text-slate-500" : "text-gray-300"}`}>Modul Menu</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {menuItems.map((item) => (
                    <button
                      id={`mob-btn-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileOpen(false);
                      }}
                      className={`text-left p-2 rounded-lg text-[11px] font-bold ${
                        activeTab === item.id 
                          ? "bg-indigo-600 text-white" 
                          : isWhiteTheme
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-slate-900 text-gray-300 hover:text-white border border-white/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout button (Mobile) */}
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isWhiteTheme
                      ? "bg-red-50 hover:bg-red-100 text-rose-655 border-red-200"
                      : "bg-rose-955/40 hover:bg-rose-900/50 text-rose-350 border-slate-800"
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar / Logout</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
