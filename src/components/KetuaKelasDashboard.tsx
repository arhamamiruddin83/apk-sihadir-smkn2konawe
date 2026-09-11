/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { OFFICIAL_CLASSES, CLASS_CAPTAIN_MAP, getStudentCaptainClass } from "../data/classCaptains";
import { MOCK_STUDENTS } from "../mockData";
import { getStoredSchedules } from "../utils/scheduleHelper";
import { 
  Sparkles, 
  Send, 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ClipboardList, 
  UserCheck, 
  ChevronRight, 
  FileText, 
  Plus, 
  Trash2,
  Settings,
  HelpCircle,
  MessageSquare,
  X,
  RefreshCw,
  Building,
  Zap,
  Calendar,
  QrCode
} from "lucide-react";
import { QrScannerModal } from "./QrScannerModal";

interface TeacherStatus {
  id: string;
  name: string;
  subject: string;
  status: "Belum Masuk" | "Sementara Berlangsung" | "Sudah Selesai" | "Berhalangan (Tugas)" | "Alpa (Tanpa Kabar)";
}

interface StudentStatus {
  id: string;
  name: string;
  nis: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alpa" | "Terlambat" | "Bolos";
  note: string;
}

interface KetuaKelasDashboardProps {
  username?: string;
}

export function KetuaKelasDashboard({ username }: KetuaKelasDashboardProps = {}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const [activeTab, setActiveTab] = useState<"input" | "reports" | "config">("input");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  
  // Official list of 18 classes
  const KETUA_KELAS_CLASSES = OFFICIAL_CLASSES;

  // Class information - dynamically loaded from official class captain map or localStorage
  const [className, setClassName] = useState(() => {
    if (username) {
      const captainCls = getStudentCaptainClass(username);
      if (captainCls) return captainCls;
      const studentMatch = MOCK_STUDENTS.find(s => s.name.toUpperCase() === username.toUpperCase());
      if (studentMatch?.className) return studentMatch.className;
    }
    const savedClass = localStorage.getItem("sihadir_ketua_kelas_class");
    if (savedClass) return savedClass;
    return "X TKR A";
  });

  const [classCaptain, setClassCaptain] = useState(() => {
    if (username && username.toLowerCase() !== "ketuakelas" && username.toLowerCase() !== "admin") {
      return username;
    }
    const savedName = localStorage.getItem("sihadir_ketua_kelas_name");
    if (savedName) return savedName;
    const savedClass = localStorage.getItem("sihadir_ketua_kelas_class") || "X TKR A";
    return CLASS_CAPTAIN_MAP[savedClass] || "MUH. ZAKIR ASSAJAD";
  });

  // Keep state synchronized with props and storage
  useEffect(() => {
    if (username && username.toLowerCase() !== "ketuakelas" && username.toLowerCase() !== "admin") {
      setClassCaptain(username);
      const captainCls = getStudentCaptainClass(username);
      if (captainCls) {
        setClassName(captainCls);
        localStorage.setItem("sihadir_ketua_kelas_class", captainCls);
        localStorage.setItem("sihadir_ketua_kelas_name", username);
        return;
      }
      const studentMatch = MOCK_STUDENTS.find(s => s.name.toUpperCase() === username.toUpperCase());
      if (studentMatch?.className) {
        setClassName(studentMatch.className);
        localStorage.setItem("sihadir_ketua_kelas_class", studentMatch.className);
        localStorage.setItem("sihadir_ketua_kelas_name", username);
        return;
      }
    }

    const savedClass = localStorage.getItem("sihadir_ketua_kelas_class");
    if (savedClass) {
      setClassName(savedClass);
    }
    const defaultCaptain = CLASS_CAPTAIN_MAP[className] || CLASS_CAPTAIN_MAP[savedClass || "X TKR A"];
    const savedName = localStorage.getItem("sihadir_ketua_kelas_name");
    if (savedName && savedName !== "MUHAMAD SHIDIQ FATHONI" && savedName !== "ALFIN SEPRIANTO") {
      setClassCaptain(savedName);
    } else if (defaultCaptain) {
      setClassCaptain(defaultCaptain);
      localStorage.setItem("sihadir_ketua_kelas_name", defaultCaptain);
    }
  }, [username, className]);

  const getMajorFromClass = (cls: string) => {
    const uppercaseCls = cls.toUpperCase();
    if (uppercaseCls.includes("TKR")) return "Teknik Kendaraan Ringan (Otomotif)";
    if (uppercaseCls.includes("TSM")) return "Teknik Sepeda Motor (Otomotif)";
    if (uppercaseCls.includes("DPIB")) return "Desain Pemodelan & Informasi Bangunan";
    if (uppercaseCls.includes("TAV")) return "Teknik Audio Video";
    if (uppercaseCls.includes("DKV")) return "Desain Komunikasi Visual";
    return "Kejuruan Terdaftar";
  };

  const majorName = getMajorFromClass(className);

  // Fonnte target configuration
  const [fonnteApiKey, setFonnteApiKey] = useState(() => localStorage.getItem("simpati_fonnte_api_key") || "LMJoXs8WD3g78VGgFuTM");
  const [fonnteTarget, setFonnteTarget] = useState(() => {
    const stored = localStorage.getItem("simpati_fonnte_target");
    if (!stored || stored === "12036319875412356@g.us" || stored === "12036329384729384-tu@g.us" || stored === "6282271225802-1625324042@g.us") {
      return "120363155477246592@g.us";
    }
    return stored;
  });
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // List of pre-registered/custom WA groups saved in localStorage
  const [waGroups, setWaGroups] = useState<{name: string, target: string, desc?: string}[]>(() => {
    const defaults = [
      { name: "Grup Admin Tata Usaha SMK 2 (Baru)", target: "120363155477246592@g.us", desc: "Grup WhatsApp Tata Usaha aktif baru Anda" }
    ];

    const raw = localStorage.getItem("sihadir_wa_groups");
    if (raw) {
      try {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
          // Filter out deprecated non-Admin TU groups from stored data
          const filteredStored = stored.filter(g => 
            g.target !== "6282271225802-1625324042@g.us" && 
            g.target !== "120363209195240392@g.us" && 
            g.target !== "12036329384729384-tu@g.us"
          );
          const merged = [...filteredStored];
          // Ensure defaults are always integrated
          defaults.forEach(def => {
            if (!merged.some(g => g.target === def.target)) {
              merged.push(def);
            }
          });
          // Update localStorage with filtered groups
          localStorage.setItem("sihadir_wa_groups", JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        // Fallback
      }
    }
    return defaults;
  });

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTarget, setNewGroupTarget] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  // States for Fonnte sending feedback modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalInfo, setSuccessModalInfo] = useState<{
    targetName: string;
    targetId: string;
    messageExcerpt: string;
    timestamp: string;
  } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);
  const [isFonnteConnected, setIsFonnteConnected] = useState(true);
  const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(() => localStorage.getItem("simpati_auto_send") !== "false");
  const [isCheckingDevice, setIsCheckingDevice] = useState(false);
  const [deviceStatusInfo, setDeviceStatusInfo] = useState<{
    device: string;
    device_status: string;
    quota: number;
    expired: string;
    status: boolean;
    name?: string;
    reason?: string;
    message?: string;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-select WhatsApp Group matching the active Class
  const autoSelectGroupForClass = (cls: string, groupsList: {name: string, target: string}[] = waGroups) => {
    if (!groupsList || groupsList.length === 0) return null;

    const normalizedClass = cls.toLowerCase().replace(/[^a-z0-9]/g, ""); // e.g. "xitkra"
    
    // Attempt 1: Exact alphanumeric match of the class
    let match = groupsList.find(g => {
      const normalizedGroupName = g.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedGroupName.includes(normalizedClass);
    });

    // Attempt 2: Match containing class parts, e.g. "xi" and "tkr" and "a"
    if (!match) {
      const parts = cls.toLowerCase().split(/\s+/);
      match = groupsList.find(g => {
        const normalizedGroupName = g.name.toLowerCase();
        return parts.every(part => normalizedGroupName.includes(part));
      });
    }

    // Attempt 3: Match containing main class parts, e.g. "tkra" or "tkr a"
    if (!match) {
      const majorPart = cls.toUpperCase().replace("X", "").replace("I", "").trim(); // "TKR A"
      if (majorPart) {
        match = groupsList.find(g => {
          return g.name.toUpperCase().includes(majorPart);
        });
      }
    }

    if (match) {
      setFonnteTarget(match.target);
      localStorage.setItem("simpati_fonnte_target", match.target);
      return match;
    }

    // Fallback: If no match, check if we have a default or use the first registered group
    if (groupsList.length > 0) {
      const firstGroup = groupsList[0];
      setFonnteTarget(firstGroup.target);
      localStorage.setItem("simpati_fonnte_target", firstGroup.target);
      return firstGroup;
    }
    return null;
  };

  const handleFetchFonnteGroups = async () => {
    if (!fonnteApiKey) {
      alert("Harap masukkan API Key Fonnte terlebih dahulu pada pengaturan di bawah.");
      return;
    }
    
    setIsFetchingGroups(true);
    try {
      const response = await fetch("/api/whatsapp/fetch-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customToken: fonnteApiKey })
      });
      const resData = await response.json();
      
      if (resData.status === true || (resData.hasOwnProperty("data") && Array.isArray(resData.data))) {
        // Fonnte returns groups in the "data" field as an array
        // Each group typically has: { id: "...", name: "...", member: ... } or similar
        const fetched = resData.data || [];
        if (fetched.length === 0) {
          triggerToast("Berhasil terhubung, namun tidak ada grup WhatsApp terdeteksi pada nomor pengirim.");
          return;
        }

        const formattedGroups = fetched.map((item: any) => ({
          name: item.name || "Grup Tanpa Nama",
          target: item.id || item.target,
          desc: `Grup Fonnte dengan ${item.member || 0} anggota`
        }));

        // Merge fetched groups with the current ones (avoid duplicates by target ID)
        const merged = [...waGroups];
        formattedGroups.forEach((fg: any) => {
          const existsIdx = merged.findIndex(g => g.target === fg.target);
          if (existsIdx > -1) {
            merged[existsIdx] = fg; // update existing
          } else {
            merged.push(fg); // add new
          }
        });

        setWaGroups(merged);
        localStorage.setItem("sihadir_wa_groups", JSON.stringify(merged));
        
        // Auto-select group matching active class dynamically
        const selectedMatch = autoSelectGroupForClass(className, merged);
        if (selectedMatch) {
          triggerToast(`Berhasil sinkronisasi! Target langsung diarahkan ke grup: "${selectedMatch.name}"`);
        } else {
          triggerToast(`Berhasil menarik ${formattedGroups.length} grup dari Fonnte!`);
        }
      } else {
        const errorMsg = resData.reason || resData.message || "Gagal mengambil daftar grup dari server Fonnte.";
        alert(`Fonnte API Menolak: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan koneksi saat memuat grup: ${err.message}`);
    } finally {
      setIsFetchingGroups(false);
    }
  };

  const handleCheckDeviceStatus = async (customKey?: string) => {
    const keyToUse = customKey || fonnteApiKey;
    if (!keyToUse) return;
    
    setIsCheckingDevice(true);
    try {
      const response = await fetch("/api/whatsapp/device-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customToken: keyToUse })
      });
      const data = await response.json();
      if (data) {
        setDeviceStatusInfo(data);
        if (data.status === true || data.device_status === "connect" || data.device_status === "active") {
          setIsFonnteConnected(true);
        } else {
          setIsFonnteConnected(false);
        }
      }
    } catch (e) {
      console.error("Gagal memeriksa status perangkat:", e);
    } finally {
      setIsCheckingDevice(false);
    }
  };

  // Helper to generate dynamic students list for any class
  const getStudentsForClass = (cls: string): StudentStatus[] => {
    let allStuds = MOCK_STUDENTS;
    const saved = localStorage.getItem("simpati_students_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allStuds = parsed;
        }
      } catch (e) {}
    }

    const classMatches = allStuds.filter(s => (s.className || "").toUpperCase() === cls.toUpperCase());
    if (classMatches.length > 0) {
      return classMatches.map(s => ({
        id: s.id || `S-${s.name}`,
        name: s.name,
        nis: s.nis || "",
        status: "Hadir",
        note: ""
      }));
    }

    // 2. Fallback generator with official class captain at the top
    const firstNames = ["Aditya", "Bagus", "Cahyo", "Dedi", "Eko", "Fajar", "Guntur", "Hendra", "Irfan", "Joko", "Kurnia", "Lukman", "Mulyono", "Nugroho", "Oki", "Prabowo", "Rian", "Satria", "Taufik", "Wahyu"];
    const lastNames = ["Pratama", "Setiawan", "Cahyono", "Purwanto", "Ramadan", "Wibowo", "Wijaya", "Hakim", "Nulhakim", "Saputra", "Hidayat", "Kurniawan", "Sanjaya", "Rizki", "Utomo", "Budiman", "Nugraha", "Laksana", "Fitrianto", "Pamungkas"];

    const seed = cls.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const generated: StudentStatus[] = [];

    const officialCaptain = CLASS_CAPTAIN_MAP[cls];
    if (officialCaptain) {
      generated.push({
        id: `S-${cls}-1`,
        name: officialCaptain,
        nis: `${24001 + (seed % 100)}`,
        status: "Hadir",
        note: ""
      });
    }

    for (let i = generated.length; i < 10; i++) {
      const firstIdx = (seed + i * 7) % firstNames.length;
      const lastIdx = (seed + i * 13) % lastNames.length;
      const name = `${firstNames[firstIdx]} ${lastNames[lastIdx]}`;
      const nis = `${24000 + i + (seed % 100)}`;
      generated.push({
        id: `S-${cls}-${i + 1}`,
        name,
        nis,
        status: "Hadir",
        note: ""
      });
    }
    return generated;
  };

  const getTeacherListForClass = (clsName: string): TeacherStatus[] => {
    const allSchedules = getStoredSchedules();
    const clsUpper = (clsName || "").trim().toUpperCase();
    const classSchedules = allSchedules.filter(s => (s.className || "").trim().toUpperCase() === clsUpper);

    const daysInIndonesian = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const currentDay = daysInIndonesian[new Date().getDay()];
    const todaySchedules = classSchedules.filter(s => s.day === currentDay);

    const selectedSchedules = todaySchedules.length > 0 ? todaySchedules : classSchedules;

    if (selectedSchedules.length === 0) {
      return [
        { id: "T-def-1", name: "", subject: "Mata Pelajaran Keahlian", status: "Belum Masuk" }
      ];
    }

    // Deduplicate by subject + teacherName
    const uniqueList: TeacherStatus[] = [];
    const seenKeys = new Set<string>();

    selectedSchedules.forEach((sch, idx) => {
      const key = `${(sch.subject || "").trim().toUpperCase()}___${(sch.teacherName || "").trim().toUpperCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueList.push({
          id: `T-${sch.id || idx}`,
          name: sch.teacherName || "",
          subject: sch.subject || "Mata Pelajaran",
          status: "Belum Masuk"
        });
      }
    });

    return uniqueList;
  };

  const DAYS_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const getTodayDayName = () => {
    const daysInIndonesian = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = daysInIndonesian[new Date().getDay()];
    return DAYS_LIST.includes(dayName) ? dayName : "Senin";
  };

  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>(getTodayDayName());

  // 1. Teachers Status State - dynamically populated from master schedule for className
  const [teachers, setTeachers] = useState<TeacherStatus[]>(() => getTeacherListForClass(className));

  // 2. Student List State - dynamically populated
  const [students, setStudents] = useState<StudentStatus[]>(() => getStudentsForClass(className));

  // Get schedule items for selected day and class from master data
  const currentClassSchedules = getStoredSchedules().filter(s => 
    (s.className || "").trim().toUpperCase() === (className || "").trim().toUpperCase() &&
    (s.day || "").trim().toLowerCase() === (selectedScheduleDay || "").trim().toLowerCase()
  );

  // Regenerate student list and teacher schedule when class name changes
  useEffect(() => {
    setStudents(getStudentsForClass(className));
    setTeachers(getTeacherListForClass(className));
  }, [className]);

  // Auto-migrate and register user's newly provided Fonnte token and group target ID
  useEffect(() => {
    let activeKey = "LMJoXs8WD3g78VGgFuTM";
    const storedApiKey = localStorage.getItem("simpati_fonnte_api_key");
    const storedTarget = localStorage.getItem("simpati_fonnte_target");

    // Automatically set default to user's real credentials if empty or using old demo credentials
    if (!storedApiKey || storedApiKey === "ypkaCVkd5uLo3fkEWtnb" || storedApiKey === "azYnZj8rnnTB5cDFVwz5" || storedApiKey === "HxwVVhAM4qJjsB1KzkeD") {
      localStorage.setItem("simpati_fonnte_api_key", "LMJoXs8WD3g78VGgFuTM");
      setFonnteApiKey("LMJoXs8WD3g78VGgFuTM");
      activeKey = "LMJoXs8WD3g78VGgFuTM";
    } else {
      activeKey = storedApiKey;
    }

    if (!storedTarget || storedTarget === "6282271225802-1625324042@g.us" || storedTarget === "12036329384729384-tu@g.us" || storedTarget === "120363209195240392@g.us") {
      localStorage.setItem("simpati_fonnte_target", "120363155477246592@g.us");
      setFonnteTarget("120363155477246592@g.us");
    }

    // Auto check device status on boot
    handleCheckDeviceStatus(activeKey);
  }, []);

  // General class notes
  const [classNotes, setClassNotes] = useState("Situasi belajar mengajar berjalan kondusif. Praktikum dilaksanakan sesuai modul.");

  // Save/Load reports
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    const raw = localStorage.getItem("sihadir_ketua_kelas_reports");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const handleUpdateTeacherStatus = (teacherId: string, newStatus: TeacherStatus["status"]) => {
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, status: newStatus } : t));
    triggerToast(`Status Bpk/Ibu Guru diperbarui.`);
  };

  const handleUpdateStudentStatus = (studentId: string, newStatus: StudentStatus["status"]) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleUpdateStudentNote = (studentId: string, noteText: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, note: noteText } : s));
  };

  // Generate Report Message Text
  const generateBroadcastText = () => {
    const totalCount = students.length;
    const countHadir = students.filter(s => s.status === "Hadir").length;
    const countSakit = students.filter(s => s.status === "Sakit").length;
    const countIzin = students.filter(s => s.status === "Izin").length;
    const countAlpa = students.filter(s => s.status === "Alpa").length;
    const countTerlambat = students.filter(s => s.status === "Terlambat").length;
    const countBolos = students.filter(s => s.status === "Bolos").length;

    const sakitList = students.filter(s => s.status === "Sakit").map(s => `• ${s.name} ${s.note ? `(${s.note})` : ""}`).join("\n");
    const izinList = students.filter(s => s.status === "Izin").map(s => `• ${s.name} ${s.note ? `(${s.note})` : ""}`).join("\n");
    const alpaList = students.filter(s => s.status === "Alpa").map(s => `• ${s.name} ${s.note ? `(${s.note})` : ""}`).join("\n");
    const terlambatList = students.filter(s => s.status === "Terlambat").map(s => `• ${s.name} ${s.note ? `(${s.note})` : ""}`).join("\n");
    const bolosList = students.filter(s => s.status === "Bolos").map(s => `• ${s.name} ${s.note ? `(${s.note})` : ""}`).join("\n");

    let teacherReport = "";
    teachers.forEach((t, i) => {
      let statusIcon = "⚪";
      if (t.status === "Sementara Berlangsung") statusIcon = "🟡";
      if (t.status === "Sudah Selesai") statusIcon = "🟢";
      if (t.status === "Berhalangan (Tugas)") statusIcon = "🔵";
      if (t.status === "Alpa (Tanpa Kabar)") statusIcon = "🔴";

      const nameStr = t.name ? `${t.name} - ` : "";
      teacherReport += `${i + 1}. ${nameStr}*${t.status}* (${t.subject}) ${statusIcon}\n`;
    });

    return `*📢 LAPORAN JURNAL HARIAN KETUA KELAS - ${className.toUpperCase()}*\n` +
           `📅 *Tanggal:* ${formattedDate}\n` +
           `👤 *Melaporkan:* ${classCaptain}\n` +
           `🏫 *Kelas:* ${className} - ${majorName}\n\n` +
           `===============================\n\n` +
           `*🟢 STATUS PENGAJARAN GURU:* \n` +
           `${teacherReport}\n` +
           `*🔴 REKAPITULASI KEHADIRAN MURID:*\n` +
           `• Total Murid: *${totalCount}*\n` +
           `• Hadir: *${countHadir}*\n` +
           `• Sakit: *${countSakit}*\n` +
           `• Izin: *${countIzin}*\n` +
           `• Alfa (Tanpa Keterangan): *${countAlpa}*\n` +
           `• Terlambat: *${countTerlambat}*\n` +
           `• Bolos Jam Pelajaran: *${countBolos}*\n\n` +
           `*📋 DAFTAR DETAIL MURID:* \n` +
           (countSakit > 0 ? `*Sakit (${countSakit}):*\n${sakitList}\n` : "") +
           (countIzin > 0 ? `*Izin (${countIzin}):*\n${izinList}\n` : "") +
           (countAlpa > 0 ? `*Alfa (${countAlpa}):*\n${alpaList}\n` : "") +
           (countTerlambat > 0 ? `*Terlambat (${countTerlambat}):*\n${terlambatList}\n` : "") +
           (countBolos > 0 ? `*Bolos (${countBolos}):*\n${bolosList}\n` : "") +
           (countSakit + countIzin + countAlpa + countTerlambat + countBolos === 0 ? `_Semua murid hadir tepat waktu._\n` : "") +
           `\n*📝 CATATAN SITUASI KELAS:* \n` +
           `"${classNotes}"\n\n` +
           `_Laporan Resmi Ketua Kelas disinkronkan otomatis dengan SIHADIR SMK Negeri 2 Konawe._`;
  };

  const handleSaveReport = () => {
    const reportText = generateBroadcastText();
    const countHadir = students.filter(s => s.status === "Hadir").length;
    const countAbsent = students.filter(s => s.status !== "Hadir").length;

    const newReport = {
      id: "KK-REP-" + Date.now(),
      date: todayStr,
      className,
      majorName,
      reportedBy: classCaptain,
      teachers: [...teachers],
      students: [...students],
      classNotes,
      reportText,
      countHadir,
      countAbsent,
      createdAt: new Date().toISOString()
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(updated));

    triggerToast("🚀 Laporan berhasil disimpan ke database lokal dan dibagikan ke Wali Kelas, Guru BK, Kurikulum, & Kepala Sekolah!");
  };

  const handleDeleteReport = (id: string) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(updated));
    triggerToast("Laporan dihapus.");
  };

  const handleSendFonnte = async (overrideTarget?: string) => {
    const textMsg = generateBroadcastText();
    if (!isFonnteConnected) {
      setErrorModalMsg("Koneksi WhatsApp Terputus. Silakan hubungkan kembali Fonnte Gateway Anda di panel kontrol.");
      setShowErrorModal(true);
      return;
    }
    if (!fonnteApiKey) {
      setErrorModalMsg("Fonnte API Key kosong atau belum dimasukkan. Silakan isi API Key Anda di tab Pengaturan Fonnte.");
      setShowErrorModal(true);
      return;
    }
    const targetToUse = overrideTarget || fonnteTarget;
    if (!targetToUse) {
      setErrorModalMsg("Target nomor WhatsApp atau ID grup tujuan kosong. Silakan isi target Anda di tab Pengaturan Fonnte.");
      setShowErrorModal(true);
      return;
    }

    setIsSendingWA(true);
    // Determine the exact clean target format
    const processedTarget = targetToUse.includes("@") || targetToUse.includes("-") 
      ? targetToUse.trim() 
      : targetToUse.replace(/[^0-9]/g, "");

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: processedTarget,
          message: textMsg,
          customToken: fonnteApiKey
        })
      });
      const data = await response.json();
      
      if (data.status === true || data.status === "true" || (data.hasOwnProperty("status") && data.status !== false)) {
        // Automatically save the report as history so the user doesn't have to double-click
        const countHadir = students.filter(s => s.status === "Hadir").length;
        const countAbsent = students.filter(s => s.status !== "Hadir").length;
        const targetForName = overrideTarget || fonnteTarget;
        const groupName = waGroups.find(g => g.target === targetForName)?.name || "Grup / Nomor Kustom";

        const newReport = {
          id: "KK-REP-" + Date.now(),
          date: todayStr,
          className,
          majorName,
          reportedBy: classCaptain,
          teachers: [...teachers],
          students: [...students],
          classNotes,
          reportText: textMsg,
          countHadir,
          countAbsent,
          createdAt: new Date().toISOString(),
          isSentWA: true,
          waTarget: processedTarget,
          waTargetName: groupName
        };

        const updated = [newReport, ...savedReports];
        setSavedReports(updated);
        localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(updated));

        // Display beautiful in-app success modal
        setSuccessModalInfo({
          targetName: groupName,
          targetId: processedTarget,
          messageExcerpt: textMsg.length > 150 ? textMsg.substring(0, 150) + "..." : textMsg,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA"
        });
        setShowSuccessModal(true);
        triggerToast("Laporan otomatis tersimpan & terkirim ke WhatsApp!");
      } else {
        const err = data.reason || data.message || "Fonnte Gateway menolak permintaan pengiriman.";
        setErrorModalMsg(err);
        setShowErrorModal(true);
      }
    } catch (e: any) {
      console.error(e);
      setErrorModalMsg(`Gagal terhubung ke server proxy: ${e.message}`);
      setShowErrorModal(true);
    } finally {
      setIsSendingWA(false);
    }
  };

  const handleLaunchWAWeb = () => {
    const textMsg = encodeURIComponent(generateBroadcastText());
    // If it is a phone number, use wa.me, otherwise open general WhatsApp Web share link
    const isPhoneNumber = fonnteTarget && !fonnteTarget.includes("@") && /^[0-9+-\s]+$/.test(fonnteTarget);
    if (isPhoneNumber) {
      const phone = fonnteTarget.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${phone}?text=${textMsg}`, "_blank");
    } else {
      window.open(`https://web.whatsapp.com/send?text=${textMsg}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 bg-slate-900 border border-emerald-500 text-white text-xs px-4 py-3.5 rounded-xl shadow-2xl z-[99999] flex items-center gap-2 max-w-sm animate-bounce">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-955 to-slate-950 p-6 rounded-3xl border border-indigo-950/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded leading-none">
              Hak Akses Ketua Kelas
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded border border-emerald-500/20 leading-none flex items-center gap-1">
              👤 {classCaptain}
            </span>
          </div>
          <h2 className="text-xl font-black mt-2 tracking-tight">SIHADIR Jurnal Kelas & Monitoring Guru</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <p className="text-[11px] text-indigo-200 uppercase font-semibold tracking-wider">
              Monitoring Jurnal KBM: <span className="text-orange-400 font-black">{className} ({majorName})</span>
            </p>
            <div className="flex items-center gap-1.5 bg-indigo-900/90 border border-indigo-400/30 px-2.5 py-1 rounded-xl">
              <span className="text-[10px] font-black uppercase text-indigo-200">Pilih Kelas:</span>
              <select
                value={className}
                onChange={(e) => {
                  const selectedCls = e.target.value;
                  setClassName(selectedCls);
                  localStorage.setItem("sihadir_ketua_kelas_class", selectedCls);
                  const defaultCaptain = CLASS_CAPTAIN_MAP[selectedCls] || "Ketua Kelas";
                  if (!username || username.toLowerCase() === "admin" || username.toLowerCase() === "tu" || username.toLowerCase() === "ketuakelas") {
                    setClassCaptain(defaultCaptain);
                    localStorage.setItem("sihadir_ketua_kelas_name", defaultCaptain);
                  }
                  triggerToast(`Menampilkan Jurnal KBM & Monitoring Guru Kelas ${selectedCls}`);
                }}
                className="bg-slate-900 text-white font-bold text-xs py-0.5 px-2 rounded-lg border border-indigo-500/40 focus:outline-none cursor-pointer"
              >
                {KETUA_KELAS_CLASSES.map(cls => (
                  <option key={cls} value={cls} className="bg-slate-900 text-white font-semibold">
                    {cls} — {CLASS_CAPTAIN_MAP[cls] || "Ketua Kelas"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-1.5 animate-pulse"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan QR Code Kelas</span>
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "input" 
                ? "bg-white text-indigo-950 shadow-md font-black" 
                : "bg-white/10 hover:bg-white/15 text-indigo-100"
            }`}
          >
            Input Laporan Harian
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "reports" 
                ? "bg-white text-indigo-950 shadow-md font-black" 
                : "bg-white/10 hover:bg-white/15 text-indigo-100"
            }`}
          >
            Riwayat Jurnal Kelas ({savedReports.length})
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "config" 
                ? "bg-white text-indigo-950 shadow-md font-black" 
                : "bg-white/10 hover:bg-white/15 text-indigo-100"
            }`}
          >
            <Settings className="h-4 w-4 inline" />
          </button>
        </div>
      </div>

      {activeTab === "input" && (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* SECTION 0: MONITOR JADWAL MATA PELAJARAN KELAS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Jadwal Mata Pelajaran Kelas {className}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pantau jadwal mata pelajaran, guru pengajar, dan jam mengajar per hari (Senin–Sabtu).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Hari Ini: <span className="underline font-black">{getTodayDayName()}</span>
                  </span>
                </div>
              </div>

              {/* Day Selector Buttons (Senin - Sabtu) */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                {DAYS_LIST.map((day) => {
                  const isToday = day === getTodayDayName();
                  const isSelected = day === selectedScheduleDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedScheduleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isSelected ? "bg-white text-indigo-700" : "bg-emerald-500 text-white"
                        }`}>
                          Hari Ini
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Schedule Item List */}
              {currentClassSchedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentClassSchedules.map((sch, idx) => (
                    <div 
                      key={sch.id || idx} 
                      className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/70 hover:bg-slate-50 transition-all flex items-start gap-3"
                    >
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">
                            {sch.subject}
                          </h4>
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            {sch.period}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium flex items-center gap-1">
                          <span className="text-slate-400">Guru:</span>
                          <span className="font-bold text-slate-800">{sch.teacherName || "Belum ditentukan"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Tidak ada jadwal mata pelajaran untuk hari <span className="font-bold text-slate-700">{selectedScheduleDay}</span> di kelas <span className="font-bold text-slate-700">{className}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 1: TEACHER ATTENDANCE JOURNAL */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">1. Pelaporan Masuk & Mengajar Guru</h3>
                    <p className="text-[11px] text-slate-500">Pilih status mengajar bapak/ibu guru hari ini secara real-time.</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                  {teachers.length} Mapel / Guru Terdaftar
                </span>
              </div>

              <div className="space-y-4">
                {teachers.map((teacher) => {
                  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                  if (teacher.status === "Sementara Berlangsung") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                  if (teacher.status === "Sudah Selesai") badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  if (teacher.status === "Berhalangan (Tugas)") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                  if (teacher.status === "Alpa (Tanpa Kabar)") badgeColor = "bg-rose-100 text-rose-800 border-rose-200";

                  return (
                    <div key={teacher.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{teacher.subject}</span>
                          <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${badgeColor}`}>
                            {teacher.status}
                          </span>
                        </div>
                        {teacher.name ? (
                          <p className="text-[10px] text-slate-500 mt-1">Guru: <span className="font-bold text-slate-700">{teacher.name}</span></p>
                        ) : null}
                      </div>

                      {/* Interactive click states */}
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleUpdateTeacherStatus(teacher.id, "Belum Masuk")}
                          className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            teacher.status === "Belum Masuk"
                              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                              : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          Belum Masuk
                        </button>
                        <button
                          onClick={() => handleUpdateTeacherStatus(teacher.id, "Sementara Berlangsung")}
                          className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            teacher.status === "Sementara Berlangsung"
                              ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                              : "bg-white hover:bg-amber-50 text-amber-600 border-slate-200"
                          }`}
                        >
                          Sedang Mengajar 🟡
                        </button>
                        <button
                          onClick={() => handleUpdateTeacherStatus(teacher.id, "Sudah Selesai")}
                          className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            teacher.status === "Sudah Selesai"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white hover:bg-emerald-50 text-emerald-600 border-slate-200"
                          }`}
                        >
                          Sudah Selesai 🟢
                        </button>
                        <button
                          onClick={() => handleUpdateTeacherStatus(teacher.id, "Berhalangan (Tugas)")}
                          className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            teacher.status === "Berhalangan (Tugas)"
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white hover:bg-blue-50 text-blue-600 border-slate-200"
                          }`}
                        >
                          Izin Ada Tugas 🔵
                        </button>
                        <button
                          onClick={() => handleUpdateTeacherStatus(teacher.id, "Alpa (Tanpa Kabar)")}
                          className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                            teacher.status === "Alpa (Tanpa Kabar)"
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "bg-white hover:bg-red-50 text-red-600 border-slate-200"
                          }`}
                        >
                          Alpa (Tanpa Kabar) 🔴
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: STUDENT ATTENDANCE AND VIOLATIONS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">2. Laporan Ketidakhadiran & Perilaku Murid</h3>
                    <p className="text-[11px] text-slate-500">Klik status kehadiran setiap murid. Tambah alasan jika tidak hadir (sakit, izin, alpa, terlambat, atau bolos).</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  10 Murid Terdaftar
                </span>
              </div>

              {/* Real-time statistics counters */}
              <div className="grid grid-cols-3 gap-2 text-center mb-5 pb-4 border-b border-slate-100">
                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-emerald-700 block">Hadir</span>
                  <span className="text-sm font-black text-emerald-800 font-mono">
                    {students.filter(s => s.status === "Hadir").length} murid
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-amber-700 block">Sakit/Izin</span>
                  <span className="text-sm font-black text-amber-800 font-mono">
                    {students.filter(s => s.status === "Sakit" || s.status === "Izin").length} murid
                  </span>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-2 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-rose-700 block">Alpa/Bolos/Telat</span>
                  <span className="text-sm font-black text-rose-800 font-mono">
                    {students.filter(s => s.status === "Bolos" || s.status === "Alpa" || s.status === "Terlambat").length} murid
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {students.map((student, idx) => {
                  let rowBorder = "border-slate-150 bg-white";
                  if (student.status === "Sakit") rowBorder = "border-amber-200 bg-amber-50/10";
                  if (student.status === "Izin") rowBorder = "border-blue-250 bg-blue-50/10";
                  if (student.status === "Alpa") rowBorder = "border-red-200 bg-red-50/10";
                  if (student.status === "Terlambat") rowBorder = "border-yellow-250 bg-yellow-50/10";
                  if (student.status === "Bolos") rowBorder = "border-purple-200 bg-purple-50/10";

                  return (
                    <div key={student.id} className={`p-4 rounded-2xl border transition-all ${rowBorder}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-400 font-mono">#{idx+1}</span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{student.name}</h4>
                            <p className="text-[9px] text-slate-400 font-mono">NIS: {student.nis}</p>
                          </div>
                        </div>

                        {/* Student status buttons */}
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Hadir")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Hadir"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Sakit")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Sakit"
                                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Izin")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Izin"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Alpa")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Alpa"
                                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Alpa
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Terlambat")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Terlambat"
                                ? "bg-yellow-500 text-slate-900 border-yellow-500 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Terlambat
                          </button>
                          <button
                            onClick={() => handleUpdateStudentStatus(student.id, "Bolos")}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              student.status === "Bolos"
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            Bolos ⚠️
                          </button>
                        </div>
                      </div>

                      {/* Optional note text box if student is not "Hadir" */}
                      {student.status !== "Hadir" && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            value={student.note}
                            onChange={(e) => handleUpdateStudentNote(student.id, e.target.value)}
                            placeholder={`Tulis alasan/keterangan ${student.status} (misal: Demam tinggi, izin nikah kakak, terlambat karena motor mogok, membolos jam ke-4)...`}
                            className="w-full text-[11px] p-2 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: CLASS SITUATION NOTES */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-3">
                3. Catatan Kejadian Penting / Situasi Kelas
              </h3>
              <textarea
                value={classNotes}
                onChange={(e) => setClassNotes(e.target.value)}
                rows={3}
                placeholder="Tuliskan catatan kejadian penting hari ini (misal: semua murid tertib, praktikum perbaikan injeksi EFI berjalan lancar, ada kunjungan tim kurikulum ke bengkel)..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
              />

              <div className="mt-4">
                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block mb-2">
                  ⚡ PILIHAN CEPAT SITUASI KELAS (TINGGAL DI KLIK):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Pembelajaran kondusif, aman tanpa ada gangguan, terkendali hingga selesai belajar.",
                    "Kondisi kelas kacau karena tdk ada guru, banyak yang keluar ke kantin, beberapa ada yang bolos.",
                    "Sementara mengerjakan tugas mandiri/kelompok dari guru secara tertib di kelas.",
                    "Guru mata pelajaran hanya memberikan catatan materi di papan tulis/buku tanpa penjelasan langsung.",
                    "Guru mata pelajaran masuk kelas memberikan tugas dan memantau pengerjaan murid.",
                    "Sementara melakukan praktek produktif secara langsung di dalam bengkel / laboratorium sekolah.",
                    "Belajar mandiri dengan tertib, tenang, dan disiplin di dalam ruang perpustakaan sekolah.",
                    "Kelas kosong karena guru berhalangan hadir (sakit/tugas luar), namun tugas yang diberikan telah selesai dikerjakan."
                  ].map((preset, idx) => {
                    const isActive = classNotes === preset;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setClassNotes(preset)}
                        className={`text-[11px] text-left p-3 rounded-2xl border transition-all cursor-pointer leading-relaxed flex items-start gap-2 ${
                          isActive
                            ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm animate-pulse-once"
                            : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-slate-100 text-slate-700 font-medium"
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${isActive ? "bg-indigo-800 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                          #{idx + 1}
                        </span>
                        <span className="flex-1">{preset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AUTO-SEND CONTROLLER PANEL & UNIFIED SAVE-SEND BUTTON */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-indigo-950">Auto-Send ke Tata Usaha (Aktif)</h3>
                    <p className="text-[10px] text-slate-500">Kirim laporan otomatis tanpa ribet via Fonnte Gateway</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAutoSendEnabled}
                    onChange={(e) => {
                      setIsAutoSendEnabled(e.target.checked);
                      localStorage.setItem("simpati_auto_send", String(e.target.checked));
                      triggerToast(e.target.checked ? "Auto-Send diaktifkan!" : "Auto-Send dinonaktifkan.");
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-3.5 bg-white border border-indigo-100 rounded-2xl text-[11px] leading-relaxed text-indigo-900 font-semibold space-y-1.5 shadow-2xs">
                <p>💡 <strong>Cara Kerja:</strong> Sekali klik tombol di bawah, data laporan harian Anda akan disimpan ke riwayat jurnal sekolah DAN langsung terkirim otomatis ke WhatsApp tujuan:</p>
                <div className="flex items-center gap-1.5 font-mono text-[10px] bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-indigo-950 mt-1">
                  <Building className="h-4 w-4 text-indigo-700" />
                  <span>{waGroups.find(g => g.target === fonnteTarget)?.name || "Grup Tata Usaha"}</span>
                  <span className="text-slate-400">({fonnteTarget})</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSendingWA}
                onClick={async () => {
                  setIsSendingWA(true);
                  try {
                    // Save local report history
                    const reportText = generateBroadcastText();
                    const countHadir = students.filter(s => s.status === "Hadir").length;
                    const countAbsent = students.filter(s => s.status !== "Hadir").length;

                    const newReport = {
                      id: "KK-REP-" + Date.now(),
                      date: todayStr,
                      className,
                      majorName,
                      reportedBy: classCaptain,
                      teachers: [...teachers],
                      students: [...students],
                      classNotes,
                      reportText,
                      countHadir,
                      countAbsent,
                      createdAt: new Date().toISOString()
                    };

                    const updated = [newReport, ...savedReports];
                    setSavedReports(updated);
                    localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(updated));

                    triggerToast("💾 Laporan berhasil disimpan ke database lokal!");

                    // Automatically trigger the WhatsApp send
                    await handleSendFonnte(fonnteTarget);
                  } catch (err) {
                    console.error("Gagal melakukan Auto-Send:", err);
                    triggerToast("⚠️ Laporan tersimpan, namun gagal mengirim WhatsApp.");
                  } finally {
                    setIsSendingWA(false);
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-indigo-700 animate-pulse-once"
              >
                <Zap className="h-5 w-5 text-amber-300 animate-pulse" />
                <span>{isSendingWA ? "Sedang Menyimpan & Mengirim..." : "Simpan & Auto-Kirim Laporan ke Tata Usaha ⚡"}</span>
              </button>
              <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-2">
                <HelpCircle className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-900 leading-normal font-semibold">
                  <strong>Penting:</strong> Menyimpan laporan akan menyinkronkannya langsung ke rekap harian Guru Wali, Wali Kelas, Guru BK, Waka Kurikulum, dan Kepala Sekolah.
                </p>
              </div>

            </div>

        </div>
      )}

      {activeTab === "reports" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5.5 w-5.5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Riwayat Jurnal Harian Kelas</h3>
                <p className="text-xs text-slate-500">Semua laporan harian yang telah dikirim dan diarsipkan oleh Ketua Kelas.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total: {savedReports.length} Laporan
            </span>
          </div>

          {savedReports.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Belum ada laporan yang disimpan untuk kelas ini. Gunakan tab "Input Laporan Harian" untuk memulai.
            </div>
          ) : (
            <div className="space-y-6">
              {savedReports.map((report) => (
                <div key={report.id} className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                  
                  {/* Report Card Header */}
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 font-mono tracking-wider">ID: {report.id}</span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">Laporan Jurnal Tanggal: {report.date}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dilaporkan oleh: <span className="font-bold text-slate-700">{report.reportedBy}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                        title="Hapus Laporan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Report Card Body */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Visual Statistics */}
                    <div className="md:col-span-4 space-y-4 border-r border-slate-100 pr-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Statistik Murid</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
                            <span className="text-[10px] text-emerald-800 font-extrabold block">Hadir</span>
                            <span className="text-lg font-black text-emerald-950 font-mono">{report.countHadir}</span>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-center">
                            <span className="text-[10px] text-indigo-800 font-extrabold block">Sakit / Absen</span>
                            <span className="text-lg font-black text-indigo-950 font-mono">{report.countAbsent}</span>
                          </div>
                        </div>
                      </div>

                      {/* Teachers list and notes */}
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Guru Mengajar Hari Ini</span>
                        <div className="space-y-2 mt-2">
                          {report.teachers?.map((t: any) => (
                            <div key={t.id} className="text-[11px] font-semibold flex justify-between">
                              <span className="text-slate-700 truncate max-w-[150px]">{t.name}</span>
                              <span className="text-slate-900 font-bold">{t.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Full Raw Message Text */}
                    <div className="md:col-span-8 bg-slate-50 p-4 border rounded-2xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                      {report.reportText}
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "config" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 border-b pb-3 mb-1 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-indigo-600" />
              <span>Pengaturan Identitas & Grup WA (Ketua Kelas)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Konfigurasi kelas Anda dan kelola daftar nomor HP atau ID grup WA Fonnte yang telah terdaftar untuk uji coba.
            </p>
          </div>
          
          <div className="space-y-5">
            {/* 1. Identity Persistence Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">1. Identitas Ketua Kelas</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-150 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Terintegrasi
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo-950 tracking-wider block">Pilih Kelas Anda</label>
                  <select
                    value={className}
                    onChange={(e) => {
                      const selectedCls = e.target.value;
                      setClassName(selectedCls);
                      localStorage.setItem("sihadir_ketua_kelas_class", selectedCls);
                      const defaultCaptain = CLASS_CAPTAIN_MAP[selectedCls];
                      if (defaultCaptain) {
                        setClassCaptain(defaultCaptain);
                        localStorage.setItem("sihadir_ketua_kelas_name", defaultCaptain);
                      }
                      triggerToast(`Kelas diperbarui ke ${selectedCls}`);
                    }}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    {KETUA_KELAS_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        {cls} — {CLASS_CAPTAIN_MAP[cls] || "Ketua Kelas"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo-950 tracking-wider block">Nama Lengkap Anda</label>
                  <input
                    type="text"
                    value={classCaptain}
                    onChange={(e) => {
                      setClassCaptain(e.target.value);
                      localStorage.setItem("sihadir_ketua_kelas_name", e.target.value);
                    }}
                    placeholder="Nama Ketua Kelas..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Fonnte Credentials Card */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">2. API Credentials Gateway</span>
              
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                {/* Connection Status Box */}
                <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span className="flex items-center gap-1.5">📡 Status Cloud Gateway (Fonnte)</span>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide flex items-center gap-1 ${
                      isFonnteConnected 
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700" 
                        : "bg-rose-100 border-rose-300 text-rose-700"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isFonnteConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"} shrink-0`} />
                      {isFonnteConnected ? "Terkoneksi / Aktif" : "Terputus / Perlu Scan"}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-slate-700 space-y-1.5 font-medium bg-white p-2.5 rounded-lg border border-slate-150">
                    {isCheckingDevice ? (
                      <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-indigo-650 font-bold">
                        <span className="h-3 w-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                        <span>Sedang memverifikasi koneksi Fonnte...</span>
                      </div>
                    ) : deviceStatusInfo ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Perangkat WA:</span>
                          <span className="font-bold font-mono text-slate-800">{deviceStatusInfo.device || "Tidak Terdeteksi"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Status Fonnte:</span>
                          <span className={`font-bold uppercase text-[10px] ${
                            deviceStatusInfo.device_status === "connect" || deviceStatusInfo.device_status === "active"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}>{deviceStatusInfo.device_status || (deviceStatusInfo.status ? "Active" : "Disconnected")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Sisa Kuota:</span>
                          <span className="font-bold text-indigo-600">{deviceStatusInfo.quota !== undefined ? `${deviceStatusInfo.quota} Pesan` : "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10px]">Masa Aktif:</span>
                          <span className="font-bold text-slate-600">{deviceStatusInfo.expired || "-"}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-[10px] text-center leading-relaxed">
                        Klik tombol di bawah untuk memeriksa status WhatsApp Anda secara real-time dari server Fonnte.
                      </p>
                    )}
                  </div>

                  {deviceStatusInfo && !isFonnteConnected && (
                    <div className="p-2.5 bg-rose-50 border border-rose-150 rounded-lg text-[9.5px] text-rose-950 leading-relaxed space-y-1">
                      <p className="font-bold text-rose-800">⚠️ Solusi Masalah Koneksi Fonnte Anda:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-rose-900 font-medium pl-1">
                        <li>Pastikan nomor WhatsApp Anda sudah discan QR di <strong>Fonnte.com</strong>.</li>
                        <li>Pastikan Token <code>HxwVVhAM...</code> Anda benar dan cocok dengan akun Fonnte.</li>
                        <li>Agar bisa kirim ke grup ID <code>{fonnteTarget}</code>, nomor WhatsApp pengirim Fonnte <strong>HARUS SUDAH MASUK</strong> sebagai anggota grup tersebut.</li>
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={isCheckingDevice}
                      onClick={() => handleCheckDeviceStatus()}
                      className="text-center py-2 px-3 rounded-lg text-[10px] font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <span>🔄 Cek Koneksi Real-time</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isFonnteConnected;
                        setIsFonnteConnected(nextState);
                        triggerToast(nextState ? "Koneksi Fonnte diaktifkan secara paksa!" : "Koneksi diputus sementara.");
                      }}
                      className={`text-center py-2 px-3 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        isFonnteConnected
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-150"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-150"
                      }`}
                    >
                      {isFonnteConnected ? "Putus Paksa 🔌" : "Hubungkan Paksa ⚡"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider block">Fonnte API Token</label>
                    <span className="text-[8px] text-indigo-600 bg-indigo-50 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">Aktif & Terpilih</span>
                  </div>
                  <input
                    type="text"
                    value={fonnteApiKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setFonnteApiKey(val);
                      localStorage.setItem("simpati_fonnte_api_key", val);
                      handleCheckDeviceStatus(val);
                    }}
                    placeholder="Masukkan API Token Fonnte..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-inner font-bold text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">
                    Token aktif terhubung langsung dengan gateway Fonnte Anda. Default menggunakan token baru Anda.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-150">
                  <label className="text-[10px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                    <span className="p-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black">ID</span>
                    <span>ID Target WhatsApp (Grup ID atau No HP)</span>
                  </label>
                  <input
                    type="text"
                    value={fonnteTarget}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setFonnteTarget(val);
                      localStorage.setItem("simpati_fonnte_target", val);
                    }}
                    placeholder="Masukkan ID Grup WA (cth: 12036329384729384-tu@g.us) atau No HP Pribadi (cth: 628123456789)"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-slate-800 shadow-xs"
                  />
                  
                  <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 text-[10px] text-amber-950 leading-relaxed space-y-1.5">
                    <div>
                      ⚠️ <strong>Aturan Penting Pengiriman Fonnte:</strong>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[9.5px] text-amber-900 font-medium">
                      <li><strong>Fonnte mewajibkan sinkronisasi grup terlebih dahulu</strong> sebelum Anda melakukan pengiriman, agar data ID grup dapat terdaftar di server Fonnte dan menghindari error <code>"invalid group id"</code>.</li>
                      <li><strong>Jika ke Grup:</strong> Nomor WA pengirim di akun Fonnte Anda <strong>harus sudah bergabung</strong> di grup tersebut sebagai anggota. Format ID Grup biasanya diakhiri dengan <code>@g.us</code>.</li>
                      <li><strong>Jika ke Nomor Pribadi:</strong> Langsung masukkan nomor HP dengan format kode negara (cth: <code>6281234567890</code>). Ini solusi terbaik jika Anda tidak ingin bergabung ke grup WA!</li>
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFetchFonnteGroups}
                  disabled={isFetchingGroups}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>{isFetchingGroups ? "Menghubungkan ke Fonnte..." : "Tarik & Sinkronkan Daftar Grup Sekarang 🔄"}</span>
                </button>
              </div>
            </div>

            {/* 3. WA Groups Selector & Management */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">3. Kelola Grup WA Uji Coba Terdaftar</span>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-150">
                {/* Active Group Highlight */}
                <div className="p-4 bg-emerald-500/10">
                  <span className="text-[9px] uppercase font-black text-emerald-800 block mb-2 tracking-wider">Grup / Kontak Terpilih Saat Ini:</span>
                  <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-500/20 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                        <MessageSquare className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 truncate">
                          {waGroups.find(g => g.target === fonnteTarget)?.name || "Grup / Nomor Kustom (Belum Terdaftar)"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{fonnteTarget}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded leading-none uppercase shrink-0 animate-pulse">
                      Aktif
                    </span>
                  </div>
                </div>

                {/* Registered List */}
                <div className="p-4 space-y-2 max-h-[220px] overflow-y-auto bg-slate-50/50">
                  <span className="text-[9px] font-bold text-slate-500 block mb-1">Pilih dari Daftar Terdaftar (Klik untuk Mengaktifkan):</span>
                  {waGroups.map((g, idx) => {
                    const isActive = g.target === fonnteTarget;
                    return (
                      <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl transition-all border text-left bg-white ${isActive ? "border-emerald-500 shadow-xs bg-emerald-50/20" : "border-slate-200 hover:border-slate-300"}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setFonnteTarget(g.target);
                            localStorage.setItem("simpati_fonnte_target", g.target);
                            triggerToast(`Target diset ke: ${g.name}`);
                          }}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">{g.name}</span>
                            {isActive && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block truncate mt-0.5">{g.target}</span>
                          {g.desc && <span className="text-[9px] text-slate-400 block italic leading-tight mt-0.5">{g.desc}</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = waGroups.filter((_, i) => i !== idx);
                            setWaGroups(updated);
                            localStorage.setItem("sihadir_wa_groups", JSON.stringify(updated));
                            triggerToast("Grup terdaftar dihapus.");
                            if (isActive && updated.length > 0) {
                              setFonnteTarget(updated[0].target);
                              localStorage.setItem("simpati_fonnte_target", updated[0].target);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0 cursor-pointer"
                          title="Hapus dari registry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom WA Group to Registry */}
                <div className="p-4 bg-white space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-950 block">Daftarkan Grup Baru ke Sistem:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Nama Grup WA / Kontak</label>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Contoh: GRUP KELAS X TKR B"
                        className="w-full text-[11px] p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Nomor HP / Target ID Grup Fonnte</label>
                      <input
                        type="text"
                        value={newGroupTarget}
                        onChange={(e) => setNewGroupTarget(e.target.value)}
                        placeholder="Contoh: 12036319875@g.us atau 628..."
                        className="w-full text-[11px] p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500">Deskripsi Tambahan (Opsional)</label>
                    <input
                      type="text"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="Contoh: Grup uji coba untuk absensi mandiri murid"
                      className="w-full text-[11px] p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newGroupName.trim() || !newGroupTarget.trim()) {
                        alert("Harap isi Nama Grup dan Nomor Target ID Grup.");
                        return;
                      }
                      const updated = [
                        ...waGroups,
                        {
                          name: newGroupName.trim(),
                          target: newGroupTarget.trim(),
                          desc: newGroupDesc.trim() || undefined
                        }
                      ];
                      setWaGroups(updated);
                      localStorage.setItem("sihadir_wa_groups", JSON.stringify(updated));
                      
                      // Auto-select the newly added group
                      setFonnteTarget(newGroupTarget.trim());
                      localStorage.setItem("simpati_fonnte_target", newGroupTarget.trim());

                      setNewGroupName("");
                      setNewGroupTarget("");
                      setNewGroupDesc("");
                      triggerToast("Grup baru berhasil didaftarkan & dipilih!");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Daftarkan & Pilih Grup WA Ini</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerToast("Seluruh pengaturan berhasil disimpan!");
                setActiveTab("input");
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer"
            >
              Simpan & Kembali ke Panel Absensi
            </button>
          </div>
        </div>
      )}

      {/* 4. SUCCESS BROADCAST MODAL */}
      {showSuccessModal && successModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowSuccessModal(false)}
          />
          
          {/* Content Card */}
          <div className="relative bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full p-6 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-250">
            {/* Emerald Header Accent Block */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            
            {/* Close Button */}
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mt-3 space-y-4">
              {/* Success Ring Indicator */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">Siaran Laporan Terkirim!</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Laporan harian KBM berhasil disiarkan otomatis lewat gateway Fonnte WA.
                </p>
              </div>

              {/* Delivery Details Card */}
              <div className="bg-slate-50/80 border border-slate-150 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between items-start text-xs border-b border-slate-150 pb-2">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Grup / Kontak Tujuan</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block max-w-[200px]">
                      {successModalInfo.targetName}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200/50 px-1.5 py-0.5 rounded leading-none uppercase">
                    Aktif
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">ID Target WA</span>
                    <span className="font-mono font-bold text-slate-700 block truncate">{successModalInfo.targetId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Waktu Pengiriman</span>
                    <span className="font-semibold text-slate-700 block">{successModalInfo.timestamp}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[8px] uppercase font-black text-slate-400 block tracking-wider mb-1">Cuplikan Isi Pesan</span>
                  <div className="bg-white border border-slate-150 rounded-xl p-2.5 text-[9px] font-mono text-slate-600 max-h-[80px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {successModalInfo.messageExcerpt}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab("reports");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer border border-slate-250 flex items-center justify-center gap-1.5"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Lihat Riwayat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Selesai</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-[9px] text-slate-400 font-semibold italic flex items-center justify-center gap-1">
                <span>⚡ Didukung oleh Fonnte WhatsApp API Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ERROR BROADCAST MODAL (WITH FALLBACK OPTION) */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowErrorModal(false)}
          />
          
          {/* Content Card */}
          <div className="relative bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-md w-full p-6 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-250">
            {/* Amber/Rose Header Accent Block */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />
            
            {/* Close Button */}
            <button 
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mt-3 space-y-4">
              {/* Error Ring Indicator */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 animate-pulse">
                <AlertCircle className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">Gagal Kirim Otomatis</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sistem tidak dapat menyelesaikan pengiriman otomatis via API Fonnte.
                </p>
              </div>

              {/* Error Message Details */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-left space-y-2">
                <span className="text-[9px] uppercase font-black text-amber-800 block tracking-wider">Detail Hambatan:</span>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {errorModalMsg || "Koneksi terputus atau token tidak memiliki izin."}
                </p>
                {errorModalMsg?.toLowerCase().includes("group id") && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] p-2.5 rounded-xl font-medium leading-relaxed space-y-2">
                    <div>
                      💡 <strong>Analisis:</strong> Hambatan <code>invalid group id</code> berarti ID target grup WA Anda tidak valid atau nomor WA pengirim Fonnte belum tergabung ke grup tersebut.
                    </div>
                    <div className="pt-1.5 border-t border-emerald-500/20 font-semibold text-indigo-900">
                      ✅ <strong>Solusi Tanpa Gabung Grup:</strong> Anda bisa mengirimkan laporan langsung ke <strong>nomor WhatsApp pribadi</strong> Admin Tata Usaha atau nomor HP pribadi Anda (misal: <code>62852XXXXXXXX</code>).
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-slate-500 pt-1 leading-relaxed border-t border-amber-100/50 mt-1">
                  💡 <strong>Saran Solusi:</strong> Ubah target ke nomor WhatsApp pribadi Admin TU di tab Pengaturan, atau tarik daftar grup aktif Anda dengan tombol hijau di bawah, atau gunakan kirim manual.
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setShowErrorModal(false);
                    await handleFetchFonnteGroups();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 animate-spin-slow" />
                  <span>Tarik Daftar Grup Aktif dari WA Anda 🔄</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowErrorModal(false);
                    handleLaunchWAWeb();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Gunakan Kirim Manual via WhatsApp Web</span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowErrorModal(false);
                      setActiveTab("config");
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] py-2 rounded-xl transition-all cursor-pointer border border-slate-250 flex items-center justify-center gap-1.5"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                    <span>Perbaiki Token</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowErrorModal(false)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Qr Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        role="Ketua Kelas"
        defaultClassName={className}
      />

    </div>
  );
}
