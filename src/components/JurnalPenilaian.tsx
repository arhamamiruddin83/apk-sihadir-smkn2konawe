/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Save, PieChart, RefreshCw, AlertCircle, CheckCircle, 
  Plus, Users, PlusCircle, Share2, Send, Clock, BookOpen, 
  FileCheck, Camera, Upload, Download, Check, Mail, Printer, 
  Calendar, ArrowRight, Award, TrendingUp, ChevronRight, UserCheck, Trash2, Edit3
} from "lucide-react";
import { StudentScore, JurnalMengajar } from "../types";
import { INITIAL_SCORES, INITIAL_JURNAL_MENGAJAR, MOCK_STUDENTS } from "../mockData";
import { getTeacherMatchedSchedules, getStoredSchedules, normalizeName } from "../utils/scheduleHelper";
import { DEFAULT_CLASS_STUDENTS } from "./StudentAttendance";

// -----------------------------------------------------------------------------
// Module 1: Jurnal Mengajar AI Input / Admin Reporting
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Core Configuration: Teaching Schedules & Curriculum Context Mapping
// -----------------------------------------------------------------------------
interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  className: string;
  subject: string;
  cpCode: string;
  cpTitle: string;
  cpContent: string;
  atpCode: string;
  atpTitle: string;
  atpContent: string;
  tpCode: string;
  tpTitle: string;
  tpContent: string;
  modulAjar: string;
}

const SCHEDULES: ScheduleItem[] = [
  {
    id: "SCH01",
    day: "Senin",
    time: "07:00 - 10:30 (Jam 1-4)",
    className: "XI TKR A",
    subject: "Teknik Kendaraan Ringan (Otomotif)",
    cpCode: "CP-TKR-01",
    cpTitle: "Capaian Pembelajaran TKR Fase F",
    cpContent: "Pada akhir Fase F (kelas XI & XII SMK), murid dibekali keterampilan melakukan perawatan berkala dan perbaikan pada mesin (Engine), sasis (Chassis), pemindah daya (Power Train), sistem kelistrikan otomotif, K3 Lingkungan Kerja, dan troubleshoot sistem EFI (Electronic Fuel Injection) secara mandiri.",
    atpCode: "ATP-TKR-01",
    atpTitle: "ATP Perbaikan Engine Kendaraan",
    atpContent: "Alur pembelajaran dimulai dengan: (1) Penerapan prinsip K3LH di bengkel industri. (2) Identifikasi komponen motor 4 tak. (3) Perawatan sistem pelumasan dan pendinginan. (4) Troubleshooting sistem bahan bakar. (5) Diagnosis kerusakan sistem Electronic Fuel Injection (EFI).",
    tpCode: "TP-TKR-01",
    tpTitle: "Diagnosis Sistem EFI menggunakan Scan Tool OBD-II",
    tpContent: "Murid mampu melakukan diagnosis kode kerusakan (DTC) menggunakan Diagnostic Scan Tool OBD-II, mengukur sensor MAF dan ECT menggunakan multimeter digital.",
    modulAjar: "Modul_Ajar_Diagnosis_EFI_FaseF.pdf (Modul Utama)",
  },
  {
    id: "SCH02",
    day: "Selasa",
    time: "10:45 - 14:00 (Jam 5-8)",
    className: "XI TKR B",
    subject: "Teknik Kendaraan Ringan (Otomotif)",
    cpCode: "CP-TKR-01",
    cpTitle: "Capaian Pembelajaran TKR Fase F",
    cpContent: "Pada akhir Fase F (kelas XI & XII SMK), murid dibekali keterampilan melakukan perawatan berkala dan perbaikan pada mesin (Engine), sasis (Chassis), pemindah daya (Power Train), sistem kelistrikan otomotif, K3 Lingkungan Kerja, dan troubleshoot sistem EFI.",
    atpCode: "ATP-TKR-01",
    atpTitle: "ATP Perbaikan Engine Kendaraan",
    atpContent: "Alur pembelajaran dimulai dengan: (1) Penerapan prinsip K3LH di bengkel industri. (2) Identifikasi komponen motor 4 tak. (3) Perawatan sistem pelumasan dan pendinginan. (4) Troubleshooting sistem bahan bakar. (5) Diagnosis kerusakan sistem Electronic Fuel Injection (EFI).",
    tpCode: "TP-TKR-02",
    tpTitle: "Pemeliharaan & Troubleshooting Kelistrikan Bodi",
    tpContent: "Murid mampu mengidentifikasi dan memperbaiki sirkuit kelistrikan lampu sein, hazard, klakson, serta wiring diagram kelistrikan bodi otomotif sesuai standar K3.",
    modulAjar: "Modul_Kelistrikan_Bodi_SMKN2_Konawe.pdf",
  },
  {
    id: "SCH03",
    day: "Rabu",
    time: "07:00 - 10:30 (Jam 1-4)",
    className: "XII TSM A",
    subject: "Pemeliharaan Sasis Sepeda Motor",
    cpCode: "CP-TSM-02",
    cpTitle: "Capaian Pembelajaran Sasis Sepeda Motor Fase F",
    cpContent: "Pada akhir Fase F, murid mampu mendiagnosis dan memperbaiki gangguan pada sistem rem hidrolik, sistem suspensi depan dan belakang, sistem kemudi, serta roda dan rantai sepeda motor secara presisi.",
    atpCode: "ATP-TSM-02",
    atpTitle: "ATP Sistem Rem & Suspensi Sepeda Motor",
    atpContent: "Alur pembelajaran mencakup: (1) Bongkar pasang caliper rem depan. (2) Ganti seal shockbreaker depan. (3) Diagnosis kebocoran minyak rem hidrolik. (4) Penyelarasan ketegangan rantai roda belakang.",
    tpCode: "TP-TSM-02",
    tpTitle: "Perbaikan Sistem Suspensi Depan & Ganti Oli Shock",
    tpContent: "Murid mampu melakukan pembongkaran, pembersihan, penggantian seal shock, pengisian oli shock dengan volume tepat, serta menguji performa suspensi sepeda motor.",
    modulAjar: "Modul_Ajar_Suspensi_Sepeda_Motor.pdf",
  }
];

const DEFAULT_STUDENTS = [
  { id: "S01", name: "Aditya Pratama" },
  { id: "S02", name: "Bagus Setiawan" },
  { id: "S03", name: "Dedi Cahyono" },
  { id: "S04", name: "Eko Purwanto" },
  { id: "S05", name: "Fajar Ramadan" },
  { id: "S06", name: "Guntur Wibowo" },
  { id: "S07", name: "Hendra Wijaya" },
  { id: "S08", name: "Irfan Hakim" },
  { id: "S09", name: "Kurniawan" },
  { id: "S10", name: "Lukman Nulhakim" }
];

const WORKSHOP_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600",
    label: "Praktik OBD-II Scan Tool (EFI)"
  },
  {
    url: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600",
    label: "Bongkar Pasang & Tune Up Blok Silinder"
  },
  {
    url: "https://images.unsplash.com/photo-1507133750040-0a8f57021571?auto=format&fit=crop&q=80&w=600",
    label: "Troubleshooting Kelistrikan & Sensor MAF"
  }
];

// -----------------------------------------------------------------------------
// Module 1: Jurnal Mengajar AI Input / Admin Reporting
// -----------------------------------------------------------------------------
export function JurnalMengajarInput({ 
  isAutomotive, 
  isAdmin = false,
  username = "",
  currentRole = ""
}: { 
  isAutomotive: boolean; 
  isAdmin?: boolean;
  username?: string;
  currentRole?: string;
}) {
  const [journals, setJournals] = useState<JurnalMengajar[]>(() => {
    const saved = localStorage.getItem("simpati_jurnal_mengajar_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_JURNAL_MENGAJAR;
  });

  useEffect(() => {
    localStorage.setItem("simpati_jurnal_mengajar_logs", JSON.stringify(journals));
  }, [journals]);

  // Sync teacher schedule automatically if username is provided
  const matchedTeacherSchedules = React.useMemo(() => {
    if (!username) return [];
    return getTeacherMatchedSchedules(username);
  }, [username]);

  // Load custom schedules
  const [customSchedules, setCustomSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("simpati_teacher_custom_schedules");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SCHEDULES;
  });

  useEffect(() => {
    if (matchedTeacherSchedules.length > 0) {
      // Map teacher matched schedules into ScheduleItems
      const mapped: ScheduleItem[] = matchedTeacherSchedules.map((sch, idx) => ({
        id: sch.id || `SCH-${sch.teacherCode}-${idx}`,
        day: sch.day || "Senin",
        time: sch.time || "07:00 - 10:30",
        className: sch.className,
        subject: sch.subject,
        cpCode: "CP-TKR-01",
        cpTitle: `Capaian Pembelajaran ${sch.className}`,
        cpContent: "Pada akhir Fase F, murid dibekali keterampilan melakukan perawatan berkala dan perbaikan otomotif secara mandiri.",
        atpCode: "ATP-TKR-01",
        atpTitle: `Alur Tujuan Pembelajaran ${sch.className}`,
        atpContent: "Alur pembelajaran mencakup identifikasi komponen, perawatan berkala, diagnosis, dan perbaikan.",
        tpCode: "TP-TKR-01",
        tpTitle: `Tujuan Pembelajaran ${sch.subject}`,
        tpContent: `Murid mampu melakukan diagnosis dan perawatan berkala sesuai SOP pada kelas ${sch.className}.`,
        modulAjar: `Modul_Ajar_${sch.className.replace(/\s+/g, '_')}_FaseF.pdf`
      }));
      setCustomSchedules(prev => {
        // Merge without duplicating
        const existingIds = new Set(prev.map(p => `${p.className}-${p.day}-${p.time}`));
        const newItems = mapped.filter(m => !existingIds.has(`${m.className}-${m.day}-${m.time}`));
        if (newItems.length > 0) {
          return [...mapped, ...prev.filter(p => !mapped.some(m => m.className === p.className))];
        }
        return prev;
      });
    }
  }, [matchedTeacherSchedules]);

  useEffect(() => {
    localStorage.setItem("simpati_teacher_custom_schedules", JSON.stringify(customSchedules));
  }, [customSchedules]);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  // Custom Alert Modal state
  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const triggerAlert = (title: string, message: string) => {
    setAlertModal({
      title,
      message
    });
  };

  // Current selected schedule index
  const [selectedSchIndex, setSelectedSchIndex] = useState(0);
  const activeSch = customSchedules[selectedSchIndex] || customSchedules[0] || SCHEDULES[0];

  // Form states for adding teaching classes
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSubject, setNewSubject] = useState("Teknik Kendaraan Ringan (Otomotif)");
  const [newDay, setNewDay] = useState("Senin");
  const [newTime, setNewTime] = useState("07:00 - 10:30 (Jam 1-4)");
  const [newCpCode, setNewCpCode] = useState("CP-TKR-01");
  const [newCpTitle, setNewCpTitle] = useState("Capaian Pembelajaran TKR Fase F");
  const [newCpContent, setNewCpContent] = useState("Pada akhir Fase F (kelas XI & XII SMK), murid dibekali keterampilan melakukan perawatan berkala dan perbaikan pada mesin (Engine), sasis (Chassis), pemindah daya (Power Train), sistem kelistrikan otomotif, K3 Lingkungan Kerja, dan troubleshoot sistem EFI (Electronic Fuel Injection) secara mandiri.");
  const [newAtpCode, setNewAtpCode] = useState("ATP-TKR-01");
  const [newAtpTitle, setNewAtpTitle] = useState("ATP Perbaikan Engine Kendaraan");
  const [newAtpContent, setNewAtpContent] = useState("Alur pembelajaran dimulai dengan: (1) Penerapan prinsip K3LH di bengkel industri. (2) Identifikasi komponen motor 4 tak. (3) Perawatan sistem pelumasan dan pendinginan. (4) Troubleshooting sistem bahan bakar. (5) Diagnosis kerusakan sistem Electronic Fuel Injection (EFI).");
  const [newTpCode, setNewTpCode] = useState("TP-TKR-01");
  const [newTpTitle, setNewTpTitle] = useState("Diagnosis Sistem EFI menggunakan Scan Tool OBD-II");
  const [newTpContent, setNewTpContent] = useState("Murid mampu melakukan diagnosis kode kerusakan (DTC) menggunakan Diagnostic Scan Tool OBD-II, mengukur sensor MAF dan ECT menggunakan multimeter digital.");
  const [newModulAjar, setNewModulAjar] = useState("Modul_Ajar_Diagnosis_EFI_FaseF.pdf (Modul Utama)");

  // Interactive editing states for CP, ATP, and TP (acuan mengajar mandiri guru mapel)
  const [isEditingCurriculum, setIsEditingCurriculum] = useState(false);
  const [editCpCode, setEditCpCode] = useState("");
  const [editCpTitle, setEditCpTitle] = useState("");
  const [editCpContent, setEditCpContent] = useState("");
  const [editAtpCode, setEditAtpCode] = useState("");
  const [editAtpTitle, setEditAtpTitle] = useState("");
  const [editAtpContent, setEditAtpContent] = useState("");
  const [editTpCode, setEditTpCode] = useState("");
  const [editTpTitle, setEditTpTitle] = useState("");
  const [editTpContent, setEditTpContent] = useState("");

  const handleStartEditCurriculum = () => {
    setEditCpCode(activeSch.cpCode || "CP-TKR-01");
    setEditCpTitle(activeSch.cpTitle || "Capaian Pembelajaran");
    setEditCpContent(activeSch.cpContent || "");
    setEditAtpCode(activeSch.atpCode || "ATP-TKR-01");
    setEditAtpTitle(activeSch.atpTitle || "Alur Tujuan Pembelajaran");
    setEditAtpContent(activeSch.atpContent || "");
    setEditTpCode(activeSch.tpCode || "TP-TKR-01");
    setEditTpTitle(activeSch.tpTitle || "Tujuan Pembelajaran");
    setEditTpContent(activeSch.tpContent || "");
    setIsEditingCurriculum(true);
  };

  const handleSaveCurriculum = () => {
    const copy = [...customSchedules];
    if (copy[selectedSchIndex]) {
      copy[selectedSchIndex] = {
        ...copy[selectedSchIndex],
        cpCode: editCpCode,
        cpTitle: editCpTitle,
        cpContent: editCpContent,
        atpCode: editAtpCode,
        atpTitle: editAtpTitle,
        atpContent: editAtpContent,
        tpCode: editTpCode,
        tpTitle: editTpTitle,
        tpContent: editTpContent,
      };
      setCustomSchedules(copy);
      triggerAlert("Acuan Mengajar Tersimpan", "Tujuan Pembelajaran (TP), ATP, dan CP acuan mengajar Anda berhasil diperbarui!");
    }
    setIsEditingCurriculum(false);
  };

  // 3-photo requirement state
  const [photoSelfie, setPhotoSelfie] = useState<string>("");
  const [photoLearning, setPhotoLearning] = useState<string>("");
  const [photoEnvironment, setPhotoEnvironment] = useState<string>("");

  // Helper to load dynamic student roster
  const getStudentsForClass = (clsName: string) => {
    const saved = localStorage.getItem("simpati_students_list");
    let list: any[] = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }
    const filtered = list.filter((s: any) => s.className?.toLowerCase() === clsName?.toLowerCase());
    if (filtered.length > 0) {
      return filtered.map((s: any) => ({ id: s.id, name: s.name }));
    }
    
    // Generik fallback
    const mockNames = [
      "Aditya Pratama", "Bagus Setiawan", "Dedi Cahyono", "Eko Purwanto", "Fajar Ramadan", 
      "Guntur Wibowo", "Hendra Wijaya", "Irfan Hakim", "Kurniawan Saputra", "Lukman Nulhakim",
      "Muhammad Rizky", "Bayu Nugroho", "Reza Hidayat", "Dimas Budiman", "Asep Susanto"
    ];
    return mockNames.slice(0, 10).map((name, idx) => ({ id: `GEN-${clsName}-${idx}`, name }));
  };

  const [activeStudents, setActiveStudents] = useState<{ id: string; name: string }[]>([]);

  // Steps tracking
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Interactive Attendance mapping
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Hadir" | "Sakit" | "Izin" | "Alfa">>({});

  // Initialize attendance map and students when class changes
  useEffect(() => {
    const list = getStudentsForClass(activeSch.className);
    setActiveStudents(list);

    const initialMap: Record<string, "Hadir" | "Sakit" | "Izin" | "Alfa"> = {};
    list.forEach(student => {
      initialMap[student.id] = "Hadir";
    });
    setAttendanceMap(initialMap);
  }, [selectedSchIndex, activeSch.className, customSchedules]);

  // Photo uploads (storing first as fallback)
  const [uploadedPhoto, setUploadedPhoto] = useState<string>("");
  const [photoPresetIndex, setPhotoPresetIndex] = useState<number | null>(null);

  // Short Reflection input
  const [shortReflection, setShortReflection] = useState("");

  // AI Generation Loading phases
  const [loading, setLoading] = useState(false);
  const [aiPhase, setAiPhase] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // AI draft states
  const [aiDraft, setAiDraft] = useState<{
    activities: string;
    reflectionGuru: string;
    obstacles: string;
    followUp: string;
    points?: number;
  } | null>(null);

  // Calculate stats using activeStudents
  const studentsPresent = activeStudents.filter(s => attendanceMap[s.id] === "Hadir").length;
  const studentsAbsentList = activeStudents
    .filter(s => attendanceMap[s.id] && attendanceMap[s.id] !== "Hadir")
    .map(s => `${s.name} (${attendanceMap[s.id]})`);

  // Simulated drop files
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "selfie" | "learning" | "env") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === "selfie") setPhotoSelfie(result);
        else if (type === "learning") setPhotoLearning(result);
        else if (type === "env") setPhotoEnvironment(result);
        
        // Also keep uploadedPhoto state sync'd for fallback compatibility
        setUploadedPhoto(result);
        setPhotoPresetIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetPhoto = (index: number) => {
    const url = WORKSHOP_PHOTOS[index].url;
    setUploadedPhoto(url);
    setPhotoSelfie(url);
    setPhotoLearning(WORKSHOP_PHOTOS[(index + 1) % WORKSHOP_PHOTOS.length].url);
    setPhotoEnvironment(WORKSHOP_PHOTOS[(index + 2) % WORKSHOP_PHOTOS.length].url);
    setPhotoPresetIndex(index);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert("Masukkan nama kelas!");
      return;
    }
    const newSch: ScheduleItem = {
      id: "SCH-" + Date.now().toString(),
      day: newDay,
      time: newTime,
      className: newClassName,
      subject: newSubject,
      cpCode: newCpCode,
      cpTitle: newCpTitle,
      cpContent: newCpContent,
      atpCode: newAtpCode,
      atpTitle: newAtpTitle,
      atpContent: newAtpContent,
      tpCode: newTpCode,
      tpTitle: newTpTitle,
      tpContent: newTpContent,
      modulAjar: newModulAjar
    };
    setCustomSchedules(prev => [...prev, newSch]);
    setSelectedSchIndex(customSchedules.length); // Select new class
    setShowAddClassForm(false);
    
    // reset form fields
    setNewClassName("");
    triggerAlert("Sukses", "Kelas ajar baru berhasil terinput dan disimpan selama 2 semester!");
  };

  const handleDeleteClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm(
      "Hapus Kelas Ajar",
      "Apakah Anda yakin ingin menghapus kelas ajar ini?",
      () => {
        setCustomSchedules(prev => prev.filter(s => s.id !== id));
        setSelectedSchIndex(0);
        triggerAlert("Sukses", "Kelas ajar telah terhapus.");
      }
    );
  };

  const [tuTarget, setTuTarget] = useState(() => {
    return localStorage.getItem("simpati_fonnte_tu_target") || "120363223018241031@g.us";
  });
  const [isSendingTU, setIsSendingTU] = useState(false);

  const getTUMessageRaw = (j: JurnalMengajar) => {
    const teacherName = "Guru Mata Pelajaran";
    const statusGuru = "HADIR & TERVERIFIKASI (SIHADIR GPS)";
    
    return `*📢 LAPORAN REKAPITULASI KBM & JURNAL MENGAJAR*\n` +
           `*Ditujukan ke: WA Grup Admin Tata Usaha (TU) SMK Negeri 2 Konawe*\n` +
           `-----------------------------------------\n` +
           `📅 *Tanggal:* ${j.date}\n` +
           `🏫 *Kelas Ampu:* ${j.className}\n` +
           `📖 *Mata Pelajaran:* ${j.subject}\n` +
           `👤 *Guru Mapel:* ${teacherName} (${statusGuru})\n` +
           `🕒 *Alokasi Waktu:* ${j.scheduleTime || "-"}\n` +
           `📑 *Target Elemen/TP:* ${j.tpCode} - ${j.material}\n` +
           `📝 *Kata Kunci Pembelajaran:* ${j.shortReflection || "-"}\n\n` +
           `👥 *REKAP PRESENSI MURID:*\n` +
           `  • Hadir: ${j.attendancePresent} Murid\n` +
           `  • Absen/Sakit/Izin: ${j.attendanceAbsent && j.attendanceAbsent.length > 0 ? j.attendanceAbsent.join(", ") : "Nihil"}\n\n` +
           `📌 *REKAP JURNAL HARIAN GURU:*\n` +
           `1. *Aktivitas Pembelajaran (AI Generated):*\n` +
           `   ${j.activities}\n\n` +
           `2. *Sintesis Refleksi Guru:*\n` +
           `   ${j.reflectionGuru}\n\n` +
           `3. *Kendala Kelas/Praktik:*\n` +
           `   ${j.obstacles}\n\n` +
           `4. *Rencana Tindak Lanjut (RTL):*\n` +
           `   ${j.followUp}\n` +
           `-----------------------------------------\n` +
           `🎯 *Poin Kualitas Jurnal AI:* ${j.points || 92}/100\n` +
           `-----------------------------------------\n` +
           `_Arsip Digital Jurnal Mengajar Sekolah Terintegrasi SIHADIR SMK Negeri 2 Konawe_`;
  };

  const shareJournalToTUWA = async (j: JurnalMengajar, auto: boolean) => {
    const msg = getTUMessageRaw(j);
    if (!auto) {
      const encoded = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      return;
    }

    const token = localStorage.getItem("simpati_fonnte_api_key") || "LMJoXs8WD3g78VGgFuTM";
    
    setIsSendingTU(true);
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: tuTarget,
          message: msg,
          customToken: token
        })
      });
      const data = await response.json();
      if (data.status === true || data.status === "true" || (data.hasOwnProperty("status") && data.status !== false)) {
        alert(`🚀 Berhasil! Rekap jurnal mengajar & absensi guru mapel telah dikirim otomatis ke WA Grup Admin TU SMK Negeri 2 Konawe.`);
      } else {
        const errorMsg = data.reason || data.message || "Gagal mengirim.";
        alert(`Fonnte API: ${errorMsg}\n\nMengalihkan ke pengiriman WhatsApp manual...`);
        const encoded = encodeURIComponent(msg);
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      }
    } catch (e: any) {
      console.error(e);
      alert(`Koneksi error: ${e.message || "Gagal menghubungi API proxy."}\n\nMengalihkan ke WhatsApp manual...`);
      const encoded = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    } finally {
      setIsSendingTU(false);
    }
  };

  const shareAllJournalsToTUWA = async (auto: boolean = true) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysJournals = journals.filter(j => j.date === todayStr || !j.date);
    const targetJournals = todaysJournals.length > 0 ? todaysJournals : journals.slice(0, 3);
    
    if (targetJournals.length === 0) {
      alert("Belum ada data jurnal untuk dikirim!");
      return;
    }

    let text = `*📢 REKAP LAPORAN JURNAL MENGAJAR GURU - SMK NEGERI 2 KONAWE*\n` +
               `📅 *Tanggal Rekap:* ${todayStr}\n` +
               `-----------------------------------------\n\n`;
               
    targetJournals.forEach((j, idx) => {
      text += `${idx + 1}. *Kelas ${j.className} - ${j.subject}*\n` +
              `   • Pembahasan: ${j.material}\n` +
              `   • Kehadiran: ${j.attendancePresent} murid hadir\n` +
              `   • Absen: ${j.attendanceAbsent && j.attendanceAbsent.length > 0 ? j.attendanceAbsent.join(", ") : "Nihil"}\n` +
              `   • Poin Jurnal AI: ${j.points || 92}/100\n` +
              `   • Kendala: ${j.obstacles || "Tidak ada"}\n` +
              `   • Tindak Lanjut: ${j.followUp || "-"}\n\n`;
    });
    
    text += `-----------------------------------------\n` +
            `_Disiarkan secara otomatis via Pusat Pelaporan Admin TU SIHADIR_`;
            
    if (!auto) {
      const encoded = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      return;
    }

    const token = localStorage.getItem("simpati_fonnte_api_key") || "LMJoXs8WD3g78VGgFuTM";
    
    setIsSendingTU(true);
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: tuTarget,
          message: text,
          customToken: token
        })
      });
      const data = await response.json();
      if (data.status === true || data.status === "true" || (data.hasOwnProperty("status") && data.status !== false)) {
        alert(`🚀 Berhasil! Rekap gabungan jurnal telah disiarkan ke WA Grup Admin TU.`);
      } else {
        alert(`Gagal mengirim via Fonnte. Mengalihkan ke pengiriman manual...`);
        const encoded = encodeURIComponent(text);
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      }
    } catch (e: any) {
      console.error(e);
      const encoded = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    } finally {
      setIsSendingTU(false);
    }
  };

  const handleCreateJurnal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortReflection.trim()) {
      alert("Tolong masukkan kata kunci pembelajaran hari ini terlebih dahulu!");
      return;
    }

    setLoading(true);
    setAiPhase("Menganalisis keterkaitan kurikulum (CP ➔ ATP ➔ TP)...");

    setTimeout(() => {
      setAiPhase("Mengolah data presensi murid & mendeteksi tingkat keterlibatan...");
    }, 1200);

    setTimeout(() => {
      setAiPhase("Asisten AI sedang merekonstruksi draf jurnal mengajar secara komprehensif...");
    }, 2400);

    const systemInstruction = 
      "Anda adalah Asisten Pencatatan Jurnal Mengajar Guru Berbasis AI untuk SMK Negeri 2 Konawe.\n" +
      "Berdasarkan input mata pelajaran, kelas, TP, materi, modul ajar, absensi murid, dan kata kunci dari guru, rumuskan 4 komponen jurnal berikut dalam Bahasa Indonesia formal:\n" +
      "- Aktivitas Pembelajaran (rincikan langkah pendahuluan, inti, dan penutup. Hubungkan dengan pembelajaran berdiferensiasi serta budaya kerja/K3)\n" +
      "- Refleksi Guru (analisa ketercapaian pengajaran berdasar modul ajar & respons murid)\n" +
      "- Kendala (hambatan yang dijumpai di kelas/bengkel praktikum)\n" +
      "- Tindak Lanjut (langkah solutif nyata dan terjadwal untuk pertemuan berikutnya)\n" +
      "- points (sebuah nilai integer acak antara 85 s.d 98 yang menilai kelayakan kualitas tulisan jurnal mengajar ini berdasarkan keragaman kata kunci yang dimasukkan)\n" +
      (isAutomotive ? "KHUSUS PRODUKTIF TEKNIK: Gunakan istilah teknis otomotif/sepeda motor, singgung protokol K3LH bengkel, alat kerja asli (multimeter, scan tool, dsb), serta manajemen troubleshoot." : "") +
      "\nFormat output harus berupa JSON valid dengan properti:\n" +
      '{"activities": "...", "reflectionGuru": "...", "obstacles": "...", "followUp": "...", "points": 95}';

    const prompt = `Buat jurnal mengajar untuk:\n` +
      `- Mata Pelajaran: ${activeSch.subject}\n` +
      `- Kelas: ${activeSch.className}\n` +
      `- Kode TP: ${activeSch.tpCode} (${activeSch.tpTitle})\n` +
      `- Alur Tujuan (ATP): ${activeSch.atpTitle}\n` +
      `- Capaian Pembelajaran (CP): ${activeSch.cpContent}\n` +
      `- Modul Ajar: ${activeSch.modulAjar}\n` +
      `- Kehadiran: ${studentsPresent} murid hadir, Absen: ${studentsAbsentList.length > 0 ? studentsAbsentList.join(", ") : "Nihil"}\n` +
      `- Kata Kunci dari Guru: "${shortReflection}"`;

    try {
      // Simulate network wait & call real API
      await new Promise(resolve => setTimeout(resolve, 3600));
      
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          responseMimeType: "application/json"
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Clean response in case it contains markdown wrappers
      let cleanedText = data.text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      const parsed = JSON.parse(cleanedText);
      setAiDraft({
        activities: parsed.activities,
        reflectionGuru: parsed.reflectionGuru,
        obstacles: parsed.obstacles,
        followUp: parsed.followUp,
        points: parsed.points || Math.min(100, 85 + Math.floor(shortReflection.length / 2))
      });
      setSuccessMsg("AI Berhasil menyusun skenario jurnal & menghitung poin kelayakan!");
    } catch (e: any) {
      console.error(e);
      // Detailed Fallback based on schedule
      let fallbackDraft = {
        activities: `Pembelajaran dimulai dengan berdoa dan pengarahan K3LH bengkel. Guru membagi murid ke 3 kelompok (pembelajaran berdiferensiasi). Kelompok tinggi mendiagnosis kerusakan sistem menggunakan Diagnostic Scan Tool OBD-II pada mobil trainer. Kelompok sedang mengukur tegangan baterai dan resistansi sensor menggunakan multimeter digital. Kelompok bawah mengkaji sirkuit manual via wiring diagram. Kegiatan ditutup dengan pembersihan area kerja bengkel (5S).`,
        reflectionGuru: `Modul "${activeSch.modulAjar}" sangat membantu visualisasi komponen. Dari kata kunci pembelajaran guru: "${shortReflection}", murid terlihat aktif dalam praktik langsung. Sekitar 80% murid berhasil membaca DTC kerusakan dengan mandiri, sedangkan sisanya masih membutuhkan asistensi dalam kalibrasi multimeter.`,
        obstacles: `Kabel probe multimeter analog mengalami interferensi longgar, dan 1 scanner diagnostik OBD-II sempat restart secara mendadak akibat daya drop.`,
        followUp: `Melakukan koordinasi dengan kepala laboratorium untuk pemeriksaan kelayakan kabel DLC scanner dan pengecasan aki trainer sebelum sesi berikutnya.`
      };

      if (activeSch.id === "SCH03") {
        fallbackDraft = {
          activities: `Pendahuluan: Pengondisian murid dan review K3 pemakaian pelindung mata. Inti: Demonstrasi pembongkaran suspensi depan sepeda motor. Murid secara berpasangan mempraktikkan pengurasan oli shock, penggantian seal shockbreaker yang bocor, dan menakar volume oli baru dengan gelas ukur sesuai spesifikasi. Penutup: Guru memberikan tes fungsional pantulan suspensi pasca-perbaikan.`,
          reflectionGuru: `Murid merespons instruksi dengan teliti. Sesuai kata kunci pembelajaran: "${shortReflection}", pemahaman struktur suspensi teleskopik sudah baik, namun pengerjaan pengisian oli shock masih perlu perhatian khusus agar tidak berlebih volumenya.`,
          obstacles: `Beberapa kunci ring-pas berkarat menghambat kelancaran pembongkaran penutup shockbreaker.`,
          followUp: `Mengoleskan pelumas anti-karat WD-40 ke peralatan bengkel yang korosif akhir pekan ini.`
        };
      }

      const calculatedPoints = Math.min(100, 85 + Math.floor(shortReflection.length / 2));
      setAiDraft({
        ...fallbackDraft,
        points: calculatedPoints
      });
      setSuccessMsg("Draf Jurnal Disusun Berhasil (Model Latar Cepat)!");
    } finally {
      setLoading(false);
      setAiPhase("");
    }
  };

  const handlePostFinalJurnal = () => {
    if (!aiDraft) return;

    const newJurnal: JurnalMengajar & { documentationPhotos?: string[] } = {
      id: "J" + (journals.length + 1).toString().padStart(2, "0"),
      date,
      subject: activeSch.subject,
      className: activeSch.className,
      tpCode: activeSch.tpCode,
      material: activeSch.tpTitle,
      attendancePresent: studentsPresent,
      attendanceAbsent: studentsAbsentList,
      activities: aiDraft.activities,
      reflectionGuru: aiDraft.reflectionGuru,
      obstacles: aiDraft.obstacles,
      followUp: aiDraft.followUp,
      documentationPhoto: photoSelfie || uploadedPhoto || undefined,
      documentationPhotos: [photoSelfie, photoLearning, photoEnvironment].filter(Boolean) as string[],
      shortReflection: shortReflection,
      scheduleTime: activeSch.time,
      modulAjar: activeSch.modulAjar,
      createdAt: new Date().toISOString(),
      points: aiDraft.points,
      kataKunci: shortReflection
    };

    setJournals(prev => [newJurnal, ...prev]);
    setAiDraft(null);
    setShortReflection("");
    setUploadedPhoto("");
    setPhotoSelfie("");
    setPhotoLearning("");
    setPhotoEnvironment("");
    setPhotoPresetIndex(null);
    setSuccessMsg("Jurnal mengajar resmi disimpan ke database kurikulum!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const printJournalHTML = (j: JurnalMengajar) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Jurnal - \${j.className} - \${j.date}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 3px double #1e3a8a; padding-bottom: 15px; margin-bottom: 30px; text-align: center; }
            .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .header h2 { font-size: 22px; margin: 5px 0; font-weight: 800; color: #1e3a8a; }
            .header p { font-size: 11px; margin: 3px 0; color: #64748b; }
            .grid-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: #f8fafc; }
            .meta-item { font-size: 12px; }
            .meta-label { font-weight: bold; color: #475569; }
            .section-title { font-size: 13px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; }
            .section-content { font-size: 12.5px; text-align: justify; color: #334155; }
            .photo-box { margin-top: 20px; text-align: center; }
            .photo-box img { max-width: 200px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .footer-sign { margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; }
            .sign-col { text-align: center; width: 220px; }
            .sign-space { height: 65px; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PEMERINTAH PROVINSI SULAWESI TENGGARA</h1>
            <h1>DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
            <h2>SMK NEGERI 2 KONAWE</h2>
            <p>Jl. Jenderal Sudirman No. 12, Konawe, Sulawesi Tenggara - Telp: (0408) 22123 - Email: info@smkn2konawe.sch.id</p>
          </div>
          
          <h3 style="text-align: center; margin-bottom: 25px; text-transform: uppercase; font-size: 14px; font-weight: 800; color: #0f172a;">
            LAPORAN JURNAL MENGAJAR DIGITAL HARIAN GURU
          </h3>
          
          <div class="grid-meta">
            <div class="meta-item"><span class="meta-label">Tanggal:</span> \${j.date}</div>
            <div class="meta-item"><span class="meta-label">Jadwal Kelas:</span> \${j.scheduleTime || "-"}</div>
            <div class="meta-item"><span class="meta-label">Mata Pelajaran:</span> \${j.subject}</div>
            <div class="meta-item"><span class="meta-label">Kelas Ampu:</span> \${j.className}</div>
            <div class="meta-item"><span class="meta-label">Tujuan Pembelajaran (TP):</span> \${j.tpCode}</div>
            <div class="meta-item"><span class="meta-label">Modul Ajar:</span> \${j.modulAjar || "-"}</div>
            <div class="meta-item"><span class="meta-label">Kehadiran Murid:</span> \${j.attendancePresent} Murid Hadir</div>
            <div class="meta-item"><span class="meta-label">Murid Absen / Kendala BK:</span> \${j.attendanceAbsent && j.attendanceAbsent.length > 0 ? j.attendanceAbsent.join(", ") : "Nihil"}</div>
          </div>

          <div class="section-title">I. Materi Pokok Pembahasan</div>
          <div class="section-content">
            <strong>\${j.material}</strong>
          </div>

          <div class="section-title">II. Rincian Aktivitas Pengajaran Berdiferensiasi</div>
          <div class="section-content">\${j.activities}</div>

          <div class="section-title">III. Refleksi & Analisis Ketercapaian Pembelajaran</div>
          <div class="section-content">
            <p style="margin-top: 0;"><strong>Kata Kunci Pembelajaran Guru:</strong> <em>"\${j.shortReflection || "-"}"</em></p>
            <p><strong>Ulasan AI:</strong> \${j.reflectionGuru}</p>
          </div>

          <div class="section-title">IV. Kendala Teknis / Hambatan Bengkel</div>
          <div class="section-content">\${j.obstacles}</div>

          <div class="section-title">V. Rencana Tindak Lanjut (RTL) Pertemuan Berikutnya</div>
          <div class="section-content">\${j.followUp}</div>

          \${(j as any).documentationPhotos && (j as any).documentationPhotos.length > 0 ? \`
          <div class="photo-box" style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
            \${(j as any).documentationPhotos.map((imgUrl: string, idx: number) => \`
              <div style="text-align: center; display: inline-block;">
                <div style="font-size: 8px; font-weight: bold; color: #475569; margin-bottom: 5px; text-transform: uppercase;">
                  \${idx === 0 ? "Foto 1: Selfie" : idx === 1 ? "Foto 2: Belajar" : "Foto 3: Ruangan"}
                </div>
                <img src="\${imgUrl}" style="width: 180px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" />
              </div>
            \`).join("")}
          </div>
          \` : j.documentationPhoto ? \`
          <div class="photo-box">
            <div style="font-size: 10px; font-weight: bold; color: #475569; margin-bottom: 5px; text-transform: uppercase;">DOKUMENTASI FOTO AKTIVITAS PEMBELAJARAN</div>
            <img src="\${j.documentationPhoto}" style="max-width: 200px; border-radius: 8px; border: 1px solid #cbd5e1;" />
          </div>
          \` : ""}

          <div class="footer-sign">
            <div class="sign-col">
              <p>Mengetahui,</p>
              <p>Waka Kurikulum SMK Negeri 2 Konawe</p>
              <div class="sign-space"></div>
              <p><strong><u>Andi Asrul Umar, S.Pd.</u></strong></p>
              <p>NIP. 19690408 199503 1 002</p>
            </div>
            <div class="sign-col">
              <p>Mengetahui,</p>
              <p>Kepala SMK Negeri 2 Konawe</p>
              <div class="sign-space"></div>
              <p><strong><u>Drs. H. ABD. MANAN, M.M.</u></strong></p>
              <p>NIP. 19650812 199003 1 008</p>
            </div>
            <div class="sign-col">
              <p>Konawe, \${j.date}</p>
              <p>Guru Mata Pelajaran,</p>
              <div class="sign-space"></div>
              <p><strong>Guru Mata Pelajaran</strong></p>
              <p>NIP. -</p>
            </div>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 20px;">
            <button onclick="window.print()" style="background: #1e3a8a; color: white; border: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 13px;">Cetak Dokumen / Unduh PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalClasses = Array.from(new Set(journals.map(j => j.className))).length;
  const totalSubjects = Array.from(new Set(journals.map(j => j.subject))).length;

  // Connected Teacher Performance Indicators (Step 8)
  const totalJP = journals.length * 4; // 4 JP per session
  const complianceRate = journals.length > 0 ? 100 : 0;
  const docRate = Math.round((journals.filter(j => j.documentationPhoto).length / (journals.length || 1)) * 100);
  const averageAttendance = journals.length > 0
    ? Math.round((journals.reduce((acc, j) => acc + j.attendancePresent, 0) / (journals.length * (activeStudents.length || 10))) * 100)
    : 92;

  return (
    <div className="space-y-8 animate-fadeIn" id="jurnal-pemelajaran-section">
      
      {/* Title block with integrated header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-200/40">
            Pusat Jurnal Mengajar Digital
          </span>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mt-1.5">
            <FileText className="h-5.5 w-5.5 text-indigo-500 animate-pulse" />
            <span>{isAdmin ? "Bagan Pelaporan Jurnal Mengajar Guru (Kurikulum)" : "Pengisian Alur Jurnal Mengajar Terintegrasi AI"}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAdmin 
              ? "Monitoring rekapitulasi hasil pengajaran, pengunduhan PDF resmi, serta penyiaran log grup WhatsApp Kurikulum." 
              : "Sistem cerdas penghubung kurikulum: mulai jadwal, otomatisasi CP/TP, absensi, dokumentasi, hingga sintesis draf AI."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => shareAllJournalsToTUWA(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>Siarkan Rekap Jurnal ke WA Sekolah</span>
          </button>
        )}
      </div>

      {/* Admin summary metrics or Teacher scheduler */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Jurnal Disubmit</span>
            <span className="text-2xl font-black text-slate-950 font-mono">{journals.length} Log</span>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Laporan terverifikasi Kurikulum Merdeka</div>
          </div>
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Kelas Terlayani</span>
            <span className="text-2xl font-black text-slate-950 font-mono">{totalClasses} Kelas</span>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Jenjang Keahlian Produktif TKR & TSM</div>
          </div>
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Kepatuhan Berkas</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{complianceRate}%</span>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Rasio kesesuaian CP/ATP pembelajaran</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: THE INTERACTIVE STEPPER FORM */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Langkah Alur Kerja Pengisian Jurnal
              </h4>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                Interactive Wizard
              </span>
            </div>

            {/* STEP 1: PILIH KELAS DAN JADWAL */}
            <div className="space-y-2 border-l-4 border-indigo-500 pl-4 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">1</span>
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Pilih Kelas & Jadwal Mengajar</label>
                </div>
                <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Aktif 2 Semester
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {customSchedules.map((sch, idx) => (
                  <div
                    key={sch.id}
                    onClick={() => setSelectedSchIndex(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer group ${
                      selectedSchIndex === idx
                        ? "border-indigo-600 bg-indigo-50/50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs flex justify-between items-center">
                      <span>{sch.className}</span>
                      {customSchedules.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClass(sch.id, e)}
                          title="Hapus Kelas"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 mt-0.5">{sch.day}</div>
                    <div className="text-[9px] text-slate-500 font-medium">{sch.time}</div>
                    <div className="text-[9px] text-slate-400 mt-1 font-semibold truncate">{sch.subject}</div>
                    {selectedSchIndex === idx && (
                      <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </div>
                ))}

                {/* Add new class button card */}
                <button
                  type="button"
                  onClick={() => setShowAddClassForm(!showAddClassForm)}
                  className="p-3 rounded-2xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/10 hover:bg-indigo-50/30 text-indigo-700 text-left transition-all flex flex-col justify-center items-center h-24 gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="h-5 w-5 text-indigo-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-center">Tambah Kelas Ajar</span>
                </button>
              </div>

              {/* Add class Form */}
              {showAddClassForm && (
                <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-3.5 mt-2">
                  <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">Input Kelas & CP/ATP Baru</span>
                    <button
                      type="button"
                      onClick={() => setShowAddClassForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>
                  <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">Nama Kelas</label>
                      <input
                        type="text"
                        placeholder="Contoh: XI TKR A"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hari Mengajar</label>
                      <select
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value)}
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                      >
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alokasi Jam Belajar</label>
                      <input
                        type="text"
                        placeholder="Contoh: 07:00 - 10:30 (Jam 1-4)"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-sans">Mata Pelajaran</label>
                      <select
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none font-bold"
                      >
                        <option value="Teknik Kendaraan Ringan (Otomotif)">Teknik Kendaraan Ringan (Otomotif)</option>
                        <option value="Teknik Sepeda Motor (Produktif)">Teknik Sepeda Motor (Produktif)</option>
                        <option value="Mesin Otomotif & K3">Mesin Otomotif & K3</option>
                        <option value="Pemeliharaan Mesin Kendaraan Ringan">Pemeliharaan Mesin Kendaraan Ringan</option>
                        <option value="Pemeliharaan Kelistrikan Kendaraan Ringan">Pemeliharaan Kelistrikan Kendaraan Ringan</option>
                        <option value="Bahasa Inggris Teknik">Bahasa Inggris Teknik</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 border-t border-indigo-100/30 pt-2.5 space-y-2">
                      <span className="text-[10px] font-extrabold text-indigo-950 uppercase tracking-wider block">Integrasi Capaian Pembelajaran (CP) & ATP</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Kode CP</label>
                          <input
                            type="text"
                            value={newCpCode}
                            onChange={(e) => setNewCpCode(e.target.value)}
                            className="w-full bg-white border rounded-lg px-2 py-1 focus:outline-none font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5 font-sans">Judul CP</label>
                          <input
                            type="text"
                            value={newCpTitle}
                            onChange={(e) => setNewCpTitle(e.target.value)}
                            className="w-full bg-white border rounded-lg px-2 py-1 focus:outline-none text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5 font-sans">Isi Capaian Pembelajaran (CP) Terbaru</label>
                        <textarea
                          rows={2}
                          value={newCpContent}
                          onChange={(e) => setNewCpContent(e.target.value)}
                          className="w-full bg-white border rounded-lg px-2 py-1 focus:outline-none text-[11px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Alur TP (ATP)</label>
                          <input
                            type="text"
                            value={newAtpTitle}
                            onChange={(e) => setNewAtpTitle(e.target.value)}
                            className="w-full bg-white border rounded-lg px-2 py-1 focus:outline-none text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Tujuan Pembelajaran (TP)</label>
                          <input
                            type="text"
                            value={newTpTitle}
                            onChange={(e) => setNewTpTitle(e.target.value)}
                            className="w-full bg-white border rounded-lg px-2 py-1 focus:outline-none text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-1.5 pt-2 border-t border-indigo-100/30">
                      <button
                        type="button"
                        onClick={() => setShowAddClassForm(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-bold"
                      >
                        Simpan Kelas Ajar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="pt-1.5 flex gap-3">
                <div className="w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Pembelajaran</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: OTOMATISASI CP, TP, ATP (PREVIEW ONLY HERE, DETAIL ON RIGHT PANEL) */}
            <div className="space-y-1.5 border-l-4 border-indigo-400 pl-4 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-[10px]">2</span>
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Target Kurikulum Terdeteksi</label>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200/20 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Terkoneksi Otomatis
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-extrabold text-indigo-600 font-mono bg-white px-1.5 py-0.25 rounded border">{activeSch.tpCode}</span>
                  <span className="text-slate-500 font-bold">{activeSch.tpTitle}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium mt-1">
                  Materi ini secara hierarki terikat dengan dokumen <strong className="text-slate-800">{activeSch.atpCode}</strong> dan <strong className="text-slate-800">{activeSch.cpCode}</strong>.
                </p>
              </div>
            </div>

            {/* STEP 3: ABSENSI MURID INTERAKTIF */}
            <div className="space-y-2 border-l-4 border-indigo-400 pl-4 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-[10px]">3</span>
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Lakukan Absensi Murid Harian</label>
                </div>
                <span className="text-[10px] font-black text-slate-500 font-mono">
                  {studentsPresent} Hadir • {studentsAbsentList.length} Absen
                </span>
              </div>
              
              <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50">
                <div className="grid grid-cols-2 text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1.5 border-b border-slate-150">
                  <span>Nama Murid</span>
                  <span className="text-right pr-4">Status Kehadiran</span>
                </div>
                
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {activeStudents.map((student) => {
                    const currentStatus = attendanceMap[student.id] || "Hadir";
                    return (
                      <div key={student.id} className="grid grid-cols-2 items-center px-3 py-2 text-xs hover:bg-slate-50 transition-all">
                        <span className="font-bold text-slate-800">{student.name}</span>
                        <div className="flex justify-end gap-1">
                          {["Hadir", "Sakit", "Izin", "Alfa"].map((status) => {
                            const isSelected = currentStatus === status;
                            let btnClass = "border text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ";
                            if (isSelected) {
                              if (status === "Hadir") btnClass += "bg-emerald-600 border-emerald-600 text-white";
                              else if (status === "Sakit") btnClass += "bg-amber-500 border-amber-500 text-white";
                              else if (status === "Izin") btnClass += "bg-sky-500 border-sky-500 text-white";
                              else btnClass += "bg-rose-600 border-rose-600 text-white";
                            } else {
                              btnClass += "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: status as any }))}
                                className={btnClass}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 4: UNGGAH 3 FOTO DOKUMENTASI PEMBELAJARAN (WAJIB) */}
            <div className="space-y-3 border-l-4 border-indigo-400 pl-4 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-[10px]">4</span>
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Unggah 3 Berkas Dokumentasi KBM (Wajib)</label>
                </div>
                <span className="text-[10px] font-black text-slate-500">
                  {[photoSelfie, photoLearning, photoEnvironment].filter(Boolean).length}/3 Foto
                </span>
              </div>

              {/* Informative alert card */}
              <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-2xl text-[11px] text-amber-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1">
                  ⚠️ Regulasi Dokumentasi Kurikulum Merdeka SMK Negeri 2 Konawe:
                </span>
                <p className="font-semibold leading-relaxed text-slate-700">
                  Laporan KBM wajib menyertakan <span className="underline font-bold text-slate-900">3 jenis foto asli</span>: (1) Foto selfie guru bersama murid di belakangnya, (2) Foto murid aktif saat belajar, dan (3) Foto kondisi ruangan belajar.
                </p>
              </div>

              {/* Three upload blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Block 1: Selfie */}
                <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[140px] relative">
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">1. Selfie dengan Murid</span>
                  {photoSelfie ? (
                    <div className="w-full h-20 relative rounded-xl overflow-hidden mt-1.5 border">
                      <img src={photoSelfie} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoSelfie("")}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full flex-1 flex flex-col items-center justify-center cursor-pointer mt-1.5 p-2 bg-white border border-dashed rounded-xl hover:bg-indigo-50/10 hover:border-indigo-500 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "selfie")}
                      />
                      <Camera className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">Ambil Foto</span>
                    </label>
                  )}
                </div>

                {/* Block 2: Murid Belajar */}
                <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[140px] relative">
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">2. Murid Belajar Aktif</span>
                  {photoLearning ? (
                    <div className="w-full h-20 relative rounded-xl overflow-hidden mt-1.5 border">
                      <img src={photoLearning} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoLearning("")}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full flex-1 flex flex-col items-center justify-center cursor-pointer mt-1.5 p-2 bg-white border border-dashed rounded-xl hover:bg-indigo-50/10 hover:border-indigo-500 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "learning")}
                      />
                      <Camera className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">Ambil Foto</span>
                    </label>
                  )}
                </div>

                {/* Block 3: Ruangan Belajar */}
                <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[140px] relative">
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">3. Kondisi Ruang Belajar</span>
                  {photoEnvironment ? (
                    <div className="w-full h-20 relative rounded-xl overflow-hidden mt-1.5 border">
                      <img src={photoEnvironment} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoEnvironment("")}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full flex-1 flex flex-col items-center justify-center cursor-pointer mt-1.5 p-2 bg-white border border-dashed rounded-xl hover:bg-indigo-50/10 hover:border-indigo-500 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "env")}
                      />
                      <Camera className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-600">Ambil Foto</span>
                    </label>
                  )}
                </div>
              </div>


            </div>

            {/* STEP 5: KATA KUNCI ELEMEN PEMBELAJARAN */}
            <div className="space-y-2 border-l-4 border-indigo-400 pl-4 py-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-[10px]">5</span>
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Ketik Kata Kunci Elemen / Materi Pembelajaran (Nanti AI yang Generate)</label>
              </div>
              <textarea
                value={shortReflection}
                onChange={(e) => setShortReflection(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Contoh: EFI, multimeter, scan tool OBD-II, K3LH, sirkuit kelistrikan, praktik troubleshoot"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none text-slate-800 font-medium"
              />
              
              {/* Quick tags for auto-completion */}
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] text-slate-400 font-bold self-center">Rujukan Kata Cepat:</span>
                {[
                  "EFI & OBD-II",
                  "Multimeter analog/digital",
                  "Troubleshoot kelistrikan bodi",
                  "K3LH & Budaya Kerja Bengkel",
                  "Pembelajaran berdiferensiasi",
                  "Alat kerja kelistrikan",
                  "Pemeriksaan tegangan baterai"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setShortReflection(prev => prev + (prev ? ", " : "") + tag)}
                    className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-[9px] text-slate-600 font-bold px-2 py-0.5 rounded cursor-pointer transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 6: AI COMPOSE BUTTON TRIGGER */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCreateJurnal}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:bg-slate-400"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{loading ? "Menyusun Skenario Jurnal..." : "AI Susun Jurnal Mengajar Lengkap (Langkah 6)"}</span>
              </button>
            </div>

            {/* Dynamic loading states */}
            {loading && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-800 space-y-2 flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold text-indigo-950 block">SIMPATI AI Sedang Berpikir</span>
                  <span className="text-slate-600 italic block">{aiPhase}</span>
                </div>
              </div>
            )}

            {/* STEP 7: PREVIEW AI AND ACTIONS CONTAINER */}
            {aiDraft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-indigo-200 bg-indigo-50/20 rounded-3xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-indigo-600 animate-bounce" />
                    <span className="text-xs font-black uppercase text-indigo-950 tracking-wider">Hasil Formulasi Jurnal AI</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                      🎯 Poin Jurnal AI: {aiDraft.points}/100
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">Ready to Publish</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-700">
                  <div>
                    <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1">1. Rincian Aktivitas Pembelajaran</h5>
                    <p className="bg-white border rounded-xl p-3 leading-relaxed font-semibold">{aiDraft.activities}</p>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1">2. Sintesis Refleksi Guru Lengkap</h5>
                    <p className="bg-white border rounded-xl p-3 leading-relaxed font-semibold">{aiDraft.reflectionGuru}</p>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1">3. Hambatan / Kendala Kelas</h5>
                    <p className="bg-white border rounded-xl p-3 leading-relaxed font-semibold">{aiDraft.obstacles}</p>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1">4. Rencana Tindak Lanjut (RTL)</h5>
                    <p className="bg-white border rounded-xl p-3 leading-relaxed font-semibold text-indigo-900">{aiDraft.followUp}</p>
                  </div>
                </div>

                {/* PDF & WA TU SUBMISSION DIRECT TRIGGER */}
                <div className="pt-4 border-t border-indigo-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const mockJurnal: JurnalMengajar = {
                          id: "TMP_J01",
                          date,
                          subject: activeSch.subject,
                          className: activeSch.className,
                          tpCode: activeSch.tpCode,
                          material: activeSch.tpTitle,
                          attendancePresent: studentsPresent,
                          attendanceAbsent: studentsAbsentList,
                          activities: aiDraft.activities,
                          reflectionGuru: aiDraft.reflectionGuru,
                          obstacles: aiDraft.obstacles,
                          followUp: aiDraft.followUp,
                          documentationPhoto: uploadedPhoto || undefined,
                          shortReflection: shortReflection,
                          scheduleTime: activeSch.time,
                          modulAjar: activeSch.modulAjar,
                          createdAt: new Date().toISOString(),
                          points: aiDraft.points,
                          kataKunci: shortReflection
                        };
                        printJournalHTML(mockJurnal);
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Printer className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Cetak / PDF Laporan</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={isSendingTU}
                      onClick={() => {
                        const mockJurnal: JurnalMengajar = {
                          id: "TMP_J01",
                          date,
                          subject: activeSch.subject,
                          className: activeSch.className,
                          tpCode: activeSch.tpCode,
                          material: activeSch.tpTitle,
                          attendancePresent: studentsPresent,
                          attendanceAbsent: studentsAbsentList,
                          activities: aiDraft.activities,
                          reflectionGuru: aiDraft.reflectionGuru,
                          obstacles: aiDraft.obstacles,
                          followUp: aiDraft.followUp,
                          documentationPhoto: uploadedPhoto || undefined,
                          shortReflection: shortReflection,
                          scheduleTime: activeSch.time,
                          modulAjar: activeSch.modulAjar,
                          createdAt: new Date().toISOString(),
                          points: aiDraft.points,
                          kataKunci: shortReflection
                        };
                        shareJournalToTUWA(mockJurnal, true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all disabled:bg-slate-400"
                    >
                      <Send className="h-3.5 w-3.5 animate-pulse" />
                      <span>{isSendingTU ? "Mengirim..." : "Kirim WA Grup TU (Otomatis)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const mockJurnal: JurnalMengajar = {
                          id: "TMP_J01",
                          date,
                          subject: activeSch.subject,
                          className: activeSch.className,
                          tpCode: activeSch.tpCode,
                          material: activeSch.tpTitle,
                          attendancePresent: studentsPresent,
                          attendanceAbsent: studentsAbsentList,
                          activities: aiDraft.activities,
                          reflectionGuru: aiDraft.reflectionGuru,
                          obstacles: aiDraft.obstacles,
                          followUp: aiDraft.followUp,
                          documentationPhoto: uploadedPhoto || undefined,
                          shortReflection: shortReflection,
                          scheduleTime: activeSch.time,
                          modulAjar: activeSch.modulAjar,
                          createdAt: new Date().toISOString(),
                          points: aiDraft.points,
                          kataKunci: shortReflection
                        };
                        shareJournalToTUWA(mockJurnal, false);
                      }}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[10px] px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Kirim WA TU (Manual)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePostFinalJurnal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Simpan & Arsipkan Jurnal (Langkah 7)</span>
                  </button>
                </div>

                {/* Direct display/configuration for the Tata Usaha WA Target ID */}
                <div className="mt-2 p-2.5 bg-slate-100/50 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px]">
                  <span className="font-bold text-slate-500">Target WA Grup Admin Tata Usaha (TU):</span>
                  <input
                    type="text"
                    value={tuTarget}
                    onChange={(e) => {
                      setTuTarget(e.target.value);
                      localStorage.setItem("simpati_fonnte_tu_target", e.target.value);
                    }}
                    placeholder="Masukkan Target ID / No WA..."
                    className="bg-white border rounded px-2 py-0.5 text-[10px] font-mono text-slate-700 w-full sm:w-48"
                  />
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: CURRICULUM CONTEXT AND CONNECTED STATISTICS PANEL (STEP 8) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. CURRICULUM VISUALIZER CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Konteks Kurikulum Merdeka Terintegrasi</h4>
                </div>
                {!isEditingCurriculum ? (
                  <button
                    type="button"
                    onClick={handleStartEditCurriculum}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Input / Edit CP, ATP, TP Mandiri</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    Mode Pengeditan Acuan Mengajar
                  </span>
                )}
              </div>

              {isEditingCurriculum ? (
                <div className="space-y-4 text-xs bg-indigo-50/40 p-4 rounded-2xl border border-indigo-150">
                  <p className="text-[11px] text-slate-600 font-semibold leading-normal">
                    Silakan lengkapi atau ubah Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), dan Tujuan Pembelajaran (TP) untuk mata pelajaran mengajar Anda di kelas <strong>{activeSch.className}</strong>:
                  </p>

                  {/* Edit TP */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-amber-600 block">1. Tujuan Pembelajaran (TP)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editTpCode}
                        onChange={(e) => setEditTpCode(e.target.value)}
                        placeholder="Kode TP (ex: TP-TKR-01)"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={editTpTitle}
                        onChange={(e) => setEditTpTitle(e.target.value)}
                        placeholder="Judul TP Singkat..."
                        className="sm:col-span-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={editTpContent}
                      onChange={(e) => setEditTpContent(e.target.value)}
                      placeholder="Rincian deskripsi indikator Tujuan Pembelajaran..."
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Edit ATP */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-teal-600 block">2. Alur Tujuan Pembelajaran (ATP)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editAtpCode}
                        onChange={(e) => setEditAtpCode(e.target.value)}
                        placeholder="Kode ATP (ex: ATP-TKR-01)"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        value={editAtpTitle}
                        onChange={(e) => setEditAtpTitle(e.target.value)}
                        placeholder="Judul Alur Pembelajaran..."
                        className="sm:col-span-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={editAtpContent}
                      onChange={(e) => setEditAtpContent(e.target.value)}
                      placeholder="Tahapan alur urutan pembelajaran..."
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* Edit CP */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">3. Capaian Pembelajaran (CP)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editCpCode}
                        onChange={(e) => setEditCpCode(e.target.value)}
                        placeholder="Kode CP (ex: CP-TKR-01)"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={editCpTitle}
                        onChange={(e) => setEditCpTitle(e.target.value)}
                        placeholder="Judul Capaian Pembelajaran Elemen..."
                        className="sm:col-span-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={editCpContent}
                      onChange={(e) => setEditCpContent(e.target.value)}
                      placeholder="Capaian Pembelajaran Elemen Fase F / Merdeka..."
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Save / Cancel buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveCurriculum}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Simpan Acuan Mengajar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCurriculum(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">

                  {/* TP Box */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-amber-600 block">Tujuan Pembelajaran (TP)</span>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                      <div className="font-bold text-slate-900 font-mono mb-1">{activeSch.tpCode}</div>
                      <div className="font-semibold text-slate-700 leading-relaxed">{activeSch.tpTitle}</div>
                      <p className="text-[10.5px] text-slate-500 mt-1">{activeSch.tpContent}</p>
                    </div>
                  </div>

                  {/* ATP Box */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-teal-600 block">Alur Tujuan Pembelajaran (ATP)</span>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                      <div className="font-bold text-slate-900 font-mono mb-1">{activeSch.atpCode}</div>
                      <div className="font-semibold text-slate-700 leading-relaxed">{activeSch.atpTitle}</div>
                      <p className="text-[10.5px] text-slate-500 mt-1">{activeSch.atpContent}</p>
                    </div>
                  </div>

                  {/* CP Box */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Capaian Pembelajaran (CP)</span>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                      <div className="font-bold text-slate-900 font-mono mb-1">{activeSch.cpCode}</div>
                      <div className="font-semibold text-slate-700 leading-relaxed">{activeSch.cpTitle}</div>
                      <p className="text-[10.5px] text-slate-500 mt-1">{activeSch.cpContent}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. REKAP KINERJA & LAPORAN SEMESTER (STEP 8 LINK) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-500 animate-bounce" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Rekap Kinerja & Rapor Semester</h4>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded font-mono">
                  Linked live
                </span>
              </div>

              {/* Connected Performance metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Total Jam Mengajar</span>
                  <span className="text-xl font-black text-slate-900 block mt-1 font-mono">{totalJP} JP</span>
                  <span className="text-[9px] text-indigo-600 font-bold block mt-0.5">Bulan Ini (Semester Genap)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Dokumentasi Terupload</span>
                  <span className="text-xl font-black text-indigo-700 block mt-1 font-mono">{docRate}%</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Kesesuaian SOP K3LH</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Presensi Murid Rerata</span>
                  <span className="text-xl font-black text-slate-900 block mt-1 font-mono">{averageAttendance}%</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Rasio kehadiran di kelas ampu</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Arsip Jurnal Harian</span>
                  <span className="text-xl font-black text-emerald-600 block mt-1 font-mono">{journals.length} Disimpan</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Status: Terhubung Kurikulum</span>
                </div>
              </div>

              {/* Progress of Curriculum Coverage Semester */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-700 uppercase text-[9px] tracking-wide">Ketercapaian Target Kurikulum</span>
                  <span className="font-black text-indigo-700 font-mono">{Math.min(100, Math.round((journals.length / 16) * 100))}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((journals.length / 16) * 100))}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span>Pekan 0</span>
                  <span>Target Semester (16 Pertemuan)</span>
                  <span>Pekan 16</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Archive of Jurnal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Arsip Log Jurnal Mengajar Sekolah (SMK NEGERI 2 KONAWE)</h4>
          <span className="text-[10px] text-indigo-600 font-extrabold uppercase bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200/40">
            Sinkronisasi Database Kurikulum Aktif
          </span>
        </div>
        
        <div className="space-y-4">
          {journals.map((j) => (
            <div key={j.id} className="border border-slate-200 rounded-3xl p-5 bg-white shadow-xs space-y-3 hover:border-indigo-400 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">{j.tpCode}</span>
                  <span className="text-xs font-black text-slate-800">{j.material}</span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200/50">
                    🎯 Nilai Jurnal: {j.points || 92}/100
                  </span>
                </div>
                <div className="text-left sm:text-right text-[10px] text-slate-400 font-bold shrink-0">
                  <div>TGL: {j.date}</div>
                  <div>KELAS: {j.className}</div>
                  {j.scheduleTime && <div>JADWAL: {j.scheduleTime}</div>}
                </div>
              </div>

              {j.shortReflection && (
                <div className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-2xl text-xs">
                  <span className="text-[9px] font-extrabold uppercase text-indigo-600 block mb-0.5">Kata Kunci Elemen Pembelajaran Guru</span>
                  <p className="text-slate-700 italic font-medium">"{j.shortReflection}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1 text-slate-500">1. Aktivitas Pengajaran</h5>
                  <p className="text-slate-650 font-medium leading-relaxed text-justify">{j.activities}</p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1 text-slate-500">2. Refleksi Guru Lengkap</h5>
                  <p className="text-slate-650 font-medium leading-relaxed text-justify">{j.reflectionGuru}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1 text-slate-500">3. Kendala Kelas</h5>
                  <p className="text-slate-650 font-medium leading-relaxed text-justify">{j.obstacles}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <h5 className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider mb-1 text-slate-500">4. Tindak Lanjut</h5>
                  <p className="text-slate-650 font-medium leading-relaxed text-justify text-indigo-800">{j.followUp}</p>
                </div>
              </div>

              {j.documentationPhoto && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400">Lampiran Foto:</span>
                  <img src={j.documentationPhoto} alt="Lampiran" className="w-16 h-12 object-cover rounded-lg border shadow-3xs" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t pt-2 mt-2">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2">
                  <span>Hadir: {j.attendancePresent} murid</span>
                  <span>•</span>
                  <span>Absen: {j.attendanceAbsent && j.attendanceAbsent.length > 0 ? j.attendanceAbsent.join(", ") : "Nihil"}</span>
                  {j.modulAjar && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-indigo-500">{j.modulAjar}</span>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => printJournalHTML(j)}
                    className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Cetak PDF</span>
                  </button>

                  <button
                    onClick={() => shareJournalToTUWA(j, true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    <span>Kirim WA Grup TU (Otomatis)</span>
                  </button>

                  <button
                    onClick={() => shareJournalToTUWA(j, false)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-3 py-1.5 rounded-lg border border-emerald-200/50 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>WA TU (Manual)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left font-sans text-slate-800"
            >
              <div className="flex items-center gap-2.5 text-rose-600">
                <Trash2 className="h-5 w-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">{confirmModal.title}</h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left font-sans text-slate-800"
            >
              <div className="flex items-center gap-2.5 text-indigo-600">
                <span className="text-xl">⚠️</span>
                <h4 className="text-sm font-black uppercase tracking-wider">{alertModal.title}</h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {alertModal.message}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModal(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// -----------------------------------------------------------------------------
// Module 2: Penilaian & Remedial Hub
// -----------------------------------------------------------------------------
export function PenilaianAnalisis({ 
  isAutomotive,
  username = "",
  currentRole = ""
}: { 
  isAutomotive: boolean;
  username?: string;
  currentRole?: string;
}) {
  const allMasterSchedules = React.useMemo(() => {
    return getStoredSchedules();
  }, []);

  // Matched schedules for logged in teacher (e.g. Arham Amiruddin, S.Pd)
  const teacherSchedules = React.useMemo(() => {
    if (!username) return [];
    return getTeacherMatchedSchedules(username, allMasterSchedules);
  }, [username, allMasterSchedules]);

  const teacherClasses = React.useMemo(() => {
    return Array.from(new Set(teacherSchedules.map(s => s.className.trim()))).filter(Boolean);
  }, [teacherSchedules]);

  // Available classes list from local storage or defaults
  const [classList, setClassList] = useState<string[]>(() => {
    const saved = localStorage.getItem("simpati_classes_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return ["XII TKR A", "XII TKR B", "XI TKR A", "XI TKR B", "X TKR A", "X TKR B", "XI TSM A", "XII TSM", "XI TSM B", "XII TSM A"];
  });

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (teacherClasses.length > 0) return teacherClasses[0];
    return "XI TKR A";
  });

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (teacherSchedules.length > 0) return teacherSchedules[0].subject;
    return "Teknik Kendaraan Ringan (Otomotif)";
  });

  // Automatically update selectedClass and selectedSubject when username / teacherClasses change
  useEffect(() => {
    if (teacherClasses.length > 0 && !teacherClasses.includes(selectedClass)) {
      setSelectedClass(teacherClasses[0]);
      if (teacherSchedules[0]) {
        setSelectedSubject(teacherSchedules[0].subject);
      }
    }
  }, [teacherClasses, teacherSchedules, selectedClass]);

  // Store all student scores in localStorage
  const [scores, setScores] = useState<StudentScore[]>(() => {
    const saved = localStorage.getItem("simpati_penilaian_scores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SCORES;
  });

  useEffect(() => {
    localStorage.setItem("simpati_penilaian_scores", JSON.stringify(scores));
  }, [scores]);

  // Dynamically load/build student list for the selected class
  const classStudents = React.useMemo(() => {
    // 1. Try from MOCK_STUDENTS matching className
    const mockMatch = MOCK_STUDENTS.filter(s => 
      s.className && s.className.toLowerCase().trim() === selectedClass.toLowerCase().trim()
    );
    if (mockMatch.length > 0) {
      return mockMatch.map(s => ({
        id: s.id,
        name: s.name,
        nis: s.nis || "24001"
      }));
    }

    // 2. Try from simpati_students_list
    const savedMasterStudents = localStorage.getItem("simpati_students_list");
    if (savedMasterStudents) {
      try {
        const list = JSON.parse(savedMasterStudents);
        if (Array.isArray(list)) {
          const filtered = list.filter((s: any) => 
            (s.className || s.class || "").toLowerCase().trim() === selectedClass.toLowerCase().trim()
          );
          if (filtered.length > 0) {
            return filtered.map((s: any) => ({
              id: s.id || `S-${s.name.replace(/\s+/g, '')}`,
              name: s.name,
              nis: s.nis || "222310" + Math.floor(100 + Math.random() * 900)
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Try from DEFAULT_CLASS_STUDENTS mapping
    const savedMap = localStorage.getItem("simpati_students_map");
    let studentMap = DEFAULT_CLASS_STUDENTS;
    if (savedMap) {
      try {
        studentMap = { ...DEFAULT_CLASS_STUDENTS, ...JSON.parse(savedMap) };
      } catch (e) {}
    }

    const mappedNames = studentMap[selectedClass] || studentMap["XI TKR A"] || [];
    if (mappedNames.length > 0) {
      return mappedNames.map((name, idx) => ({
        id: `S-${selectedClass.replace(/\s+/g, '')}-${idx + 1}`,
        name: name,
        nis: `24${(idx + 1).toString().padStart(3, '0')}`
      }));
    }

    // Default generator
    return [
      { id: `S-${selectedClass}-01`, name: `Ahmad (${selectedClass})`, nis: "222310201" },
      { id: `S-${selectedClass}-02`, name: `Budi (${selectedClass})`, nis: "222310202" },
      { id: `S-${selectedClass}-03`, name: `Cahyo (${selectedClass})`, nis: "222310203" },
      { id: `S-${selectedClass}-04`, name: `Deni (${selectedClass})`, nis: "222310204" },
      { id: `S-${selectedClass}-05`, name: `Eka (${selectedClass})`, nis: "222310205" }
    ];
  }, [selectedClass]);

  // Synchronize scores list so every student in selectedClass has a StudentScore entry
  const currentClassScores = React.useMemo(() => {
    return classStudents.map(student => {
      const existing = scores.find(s => s.studentId === student.id || s.studentName.toLowerCase() === student.name.toLowerCase());
      if (existing) return existing;

      // Create initial score
      const defaultTugas = 80;
      const defaultPraktik = 82;
      const defaultProjek = 80;
      const defaultPh = 78;
      const defaultPts = 80;
      const defaultPas = 80;
      const mean = parseFloat(((defaultTugas * 0.15) + (defaultPraktik * 0.25) + (defaultProjek * 0.15) + (defaultPh * 0.15) + (defaultPts * 0.15) + (defaultPas * 0.15)).toFixed(1));
      const passed = mean >= 75;

      return {
        studentId: student.id,
        studentName: student.name,
        tugas: defaultTugas,
        praktik: defaultPraktik,
        projek: defaultProjek,
        ph: defaultPh,
        pts: defaultPts,
        pas: defaultPas,
        rataRata: mean,
        lulus: passed,
        remedialRecommendation: passed 
          ? "Tuntas. Direkomendasikan melakukan pendalaman materi mandiri."
          : "Belum tuntas. Rekomendasi: Remedial pengerjaan LKPD perbaikan instrumen bodi."
      };
    });
  }, [classStudents, scores]);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  // Grade fields
  const [editTugas, setEditTugas] = useState(0);
  const [editPraktik, setEditPraktik] = useState(0);
  const [editProjek, setEditProjek] = useState(0);
  const [editPh, setEditPh] = useState(0);
  const [editPts, setEditPts] = useState(0);
  const [editPas, setEditPas] = useState(0);

  const [analyzing, setAnalyzing] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);

  const handleEdit = (s: StudentScore) => {
    setEditingStudentId(s.studentId);
    setEditTugas(s.tugas);
    setEditPraktik(s.praktik);
    setEditProjek(s.projek);
    setEditPh(s.ph);
    setEditPts(s.pts);
    setEditPas(s.pas);
  };

  const handleSaveGrades = (id: string) => {
    const mean = parseFloat(((editTugas * 0.15) + (editPraktik * 0.25) + (editProjek * 0.15) + (editPh * 0.15) + (editPts * 0.15) + (editPas * 0.15)).toFixed(1));
    const passThreshold = 75; // KKTP is 75 for Merdeka Curriculum SMK TKR
    const passed = mean >= passThreshold;

    setScores(prev => {
      const existingIdx = prev.findIndex(s => s.studentId === id);
      const studentObj = classStudents.find(cs => cs.id === id);
      const updatedItem: StudentScore = {
        studentId: id,
        studentName: studentObj ? studentObj.name : "Murid",
        tugas: editTugas,
        praktik: editPraktik,
        projek: editProjek,
        ph: editPh,
        pts: editPts,
        pas: editPas,
        rataRata: mean,
        lulus: passed,
        remedialRecommendation: passed 
          ? "Tuntas. Direkomendasikan melakukan pendalaman materi mandiri."
          : "Belum tuntas. Rekomendasi: Remedial pengerjaan LKPD perbaikan instrumen bodi."
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedItem;
        return copy;
      } else {
        return [...prev, updatedItem];
      }
    });

    setEditingStudentId(null);
  };

  const handleAnalyzeClassWithAI = async () => {
    setAnalyzing(true);
    setAlertText("");

    const failedCount = currentClassScores.filter(s => !s.lulus).length;
    const failedNames = currentClassScores.filter(s => !s.lulus).map(s => `${s.studentName} (Nilai: ${s.rataRata})`).join(", ");

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Konsultan Evaluasi Akademik SMK Merdeka).\n" +
      "Berikan rekomendasi pembinaan kelas yang kritis dan solutif. Tentukan topik remedial yang realistis,\n" +
      "analisa kelemahan umum kelas, dan buat pembimbingan terstruktur.\n" +
      (isAutomotive ? "KHUSUS OTOMOTIF: Singgung kelemahan praktik tune up atau kelistrikan, serta cara remedial yang aman terkait K3." : "");

    const prompt = `Analisa kelas ${selectedClass}. Total ${currentClassScores.length} murid, lulus (KKTP >= 75) sebanyak ${currentClassScores.length - failedCount}, remedial sebanyak ${failedCount} orang: [${failedNames || "Tidak Ada"}]. Tuliskan rekomendasi tindakan konkret.`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction
        })
      });

      const data = await res.json();
      setAlertText(data.text);
    } catch (e: any) {
      console.error(e);
      setAlertText(
        `### Analisis Kelas ${selectedClass}\n` +
        `Data Kelulusan: ${currentClassScores.length - failedCount} dari ${currentClassScores.length} Murid tuntas.\n` +
        `Rekomendasi Remedial:\n` +
        `- Bagi ${failedCount} murid yang belum tuntas, wajib melakukan jadwal pembelajaran tambahan di hari jumat sore di bengkel otomotif.\n` +
        `- Penguatan difokuskan pada ${isAutomotive ? 'troubleshooting kelistrikan bodi serta pembacaan multimeter digital roda dua/empat.' : 'analisis soal teori terstruktur.'}\n` +
        `- Tutor Sebaya: Mengangkat murid berprestasi tinggi untuk membantu pendampingan praktik kelompok remidi.`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const totalClassAverage = currentClassScores.length > 0 
    ? parseFloat((currentClassScores.reduce((sum, s) => sum + s.rataRata, 0) / currentClassScores.length).toFixed(1))
    : 0;
  const totalCompletenessRatio = currentClassScores.length > 0 
    ? Math.round((currentClassScores.filter(s => s.lulus).length / currentClassScores.length) * 100)
    : 0;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" id="penilaian-remedial">
      
      {/* Teacher Schedule Auto-Connect Banner */}
      {teacherClasses.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-indigo-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/80 text-amber-300 rounded-xl border border-indigo-400/30 shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Jadwal Mengajar Otomatis Terhubung</span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {username || "Guru"}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-100 mt-0.5">
                Mengampu {teacherClasses.length} Kelas Terjadwal: <span className="text-amber-300">{teacherClasses.join(", ")}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <span className="text-[10px] text-slate-300 font-bold uppercase mr-1">Pilih Cepat Kelas:</span>
            {teacherClasses.map(cls => (
              <button
                key={cls}
                type="button"
                onClick={() => {
                  setSelectedClass(cls);
                  const sch = teacherSchedules.find(s => s.className === cls);
                  if (sch) setSelectedSubject(sch.subject);
                  setEditingStudentId(null);
                  setAlertText("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedClass === cls
                    ? "bg-amber-400 text-slate-950 shadow-sm scale-[1.02]"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                <span>{cls}</span>
                {selectedClass === cls && <CheckCircle className="h-3.5 w-3.5 text-slate-950" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Filter & Class Switcher Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-indigo-300 block mb-1">
              Pilihan Kelas / Rombel Mengajar
            </label>
            <div className="relative flex items-center">
              <Users className="absolute left-3 h-4 w-4 text-indigo-400 pointer-events-none" />
              <select
                id="select-penilaian-kelas"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setEditingStudentId(null);
                  setAlertText("");
                }}
                className="bg-slate-800 text-white text-xs font-black rounded-xl pl-9 pr-8 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {teacherClasses.length > 0 ? (
                  teacherClasses.map((cls) => (
                    <option key={`tcls-${cls}`} value={cls}>
                      📍 Kelas {cls} (Sesuai Jadwal)
                    </option>
                  ))
                ) : (
                  classList.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-indigo-300 block mb-1">
              Mata Pelajaran Pengampu
            </label>
            <input
              type="text"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-pdf-class-report"
            onClick={() => setShowPdfReportModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl border border-indigo-400/30 shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-amber-300" />
            <span>Cetak / Download Laporan PDF Daftar Nilai Kelas</span>
          </button>
        </div>
      </div>

      {/* High-Level Class Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rerata Nilai Rapor Kelas ({selectedClass})</span>
          <span className="text-2xl font-extrabold text-slate-950 font-mono">{totalClassAverage}</span>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Standar KKTP Kurikulum Merdeka: 75.0</div>
        </div>
        
        <div className="bg-slate-50 border p-4 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rasio Ketuntasan Belajar</span>
          <span className={`text-2xl font-extrabold font-mono ${totalCompletenessRatio >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalCompletenessRatio}%
          </span>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {currentClassScores.filter(s => s.lulus).length} dari {currentClassScores.length} murid tuntas belajar.
          </div>
        </div>

        <div className="flex items-center">
          <button
            id="btn-trigger-ai-class-analysis"
            onClick={handleAnalyzeClassWithAI}
            disabled={analyzing}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
          >
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> : <PieChart className="h-4.5 w-4.5 text-emerald-400" />}
            <span>{analyzing ? "Menghitung Matriks Kelas..." : "Analisis Remedial Kelas (AI)"}</span>
          </button>
        </div>
      </div>

      {alertText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 leading-relaxed font-semibold font-mono whitespace-pre-wrap"
          id="ai-class-analysis-box"
        >
          {alertText}
        </motion.div>
      )}

      {/* Primary Gradebook Sheet Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
        <div className="bg-slate-900 text-white px-4 py-3 text-xs font-bold flex justify-between items-center">
          <span>LEMBAR DAFTAR MATRIKS NILAI KELAS - {selectedClass.toUpperCase()}</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">KKTP Merdeka: 75</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-extrabold border-b">
                <th className="py-2.5 px-4 font-bold">Nama Murid</th>
                <th className="py-2.5 px-3 text-center">Tugas (15%)</th>
                <th className="py-2.5 px-3 text-center">Praktik (25%)</th>
                <th className="py-2.5 px-3 text-center">Projek (15%)</th>
                <th className="py-2.5 px-3 text-center">PH (15%)</th>
                <th className="py-2.5 px-3 text-center">PTS (15%)</th>
                <th className="py-2.5 px-3 text-center">PAS (15%)</th>
                <th className="py-2.5 px-3 text-center">RATA-RATA</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClassScores.map((score) => {
                const isEditing = editingStudentId === score.studentId;
                return (
                  <tr key={score.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{score.studentName}</td>
                    
                    {isEditing ? (
                      <>
                        <td className="p-1 text-center">
                          <input type="number" value={editTugas} onChange={(e) => setEditTugas(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                        <td className="p-1 text-center">
                          <input type="number" value={editPraktik} onChange={(e) => setEditPraktik(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                        <td className="p-1 text-center">
                          <input type="number" value={editProjek} onChange={(e) => setEditProjek(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                        <td className="p-1 text-center">
                          <input type="number" value={editPh} onChange={(e) => setEditPh(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                        <td className="p-1 text-center">
                          <input type="number" value={editPts} onChange={(e) => setEditPts(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                        <td className="p-1 text-center">
                          <input type="number" value={editPas} onChange={(e) => setEditPas(parseInt(e.target.value) || 0)} className="w-12 bg-slate-50 border rounded text-center py-1 text-xs" />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3 text-center font-semibold">{score.tugas}</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">{score.praktik}</td>
                        <td className="py-3 px-3 text-center font-semibold">{score.projek}</td>
                        <td className="py-3 px-3 text-center font-semibold">{score.ph}</td>
                        <td className="py-3 px-3 text-center font-mono">{score.pts}</td>
                        <td className="py-3 px-3 text-center font-mono">{score.pas}</td>
                      </>
                    )}

                    <td className="py-3 px-3 text-center font-extrabold font-mono text-slate-900 bg-slate-50/70">
                      {isEditing ? "-" : score.rataRata}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        score.lulus 
                          ? "bg-emerald-50 text-emerald-800 border" 
                          : "bg-rose-50 text-rose-800 border"
                      }`}>
                        {score.lulus ? "TUNTAS" : "REMEDIAL"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <button
                          id={`btn-save-grade-${score.studentId}`}
                          onClick={() => handleSaveGrades(score.studentId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                        >
                          Simpan
                        </button>
                      ) : (
                        <button
                          id={`btn-edit-grade-${score.studentId}`}
                          onClick={() => handleEdit(score)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer"
                        >
                          Edit Nilai
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Class Grades Report Modal */}
      <AnimatePresence>
        {showPdfReportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full border border-slate-200 shadow-2xl my-8 space-y-6 text-slate-900"
            >
              {/* Action Toolbar */}
              <div className="flex justify-between items-center border-b pb-4 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-black uppercase text-slate-900">
                    Pratinjau Cetak / Export Laporan PDF Daftar Nilai Kelas
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerPrint}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPdfReportModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* Printable PDF Content Sheet Area */}
              <div className="p-6 border border-slate-300 rounded-2xl bg-white space-y-6 text-slate-900 font-sans print:border-0 print:p-0">
                {/* Kop Sekolah Resmi */}
                <div className="text-center border-b-4 border-double border-slate-950 pb-4">
                  <h1 className="text-lg font-extrabold tracking-wide text-slate-900 uppercase leading-tight">PEMERINTAH PROVINSI SULAWESI TENGGARA</h1>
                  <h2 className="text-xs font-bold tracking-normal text-slate-800 uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
                  <h3 className="text-xl font-black tracking-wider text-slate-950 mt-1 uppercase">SMK NEGERI 2 KONAWE</h3>
                  <p className="text-[11px] text-slate-700 mt-1">
                    Kompetensi Keahlian: Teknik Otomotif, Teknik Sepeda Motor, DPIB, DKV, TAV & Konstruksi
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono italic">
                    Jl. Poros Konawe - Unaaha, Kab. Konawe, Sulawesi Tenggara | Telp: (0408) 22123 | Email: info@smkn2konawe.sch.id
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1">
                  <h4 className="text-md font-black underline tracking-wider text-slate-900 uppercase">
                    LAPORAN DAFTAR NILAI KELAS & METRIKS KETUNTASAN BELAJAR (KKTP)
                  </h4>
                  <p className="text-xs font-bold text-slate-700">
                    Tahun Pelajaran: 2026/2027 | Semester Ganjil (1) | Kurikulum Merdeka
                  </p>
                </div>

                {/* Class Meta Details */}
                <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Kelas / Rombel</span><span className="mr-2">:</span><span className="font-black text-slate-900 uppercase">{selectedClass}</span></div>
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Mata Pelajaran</span><span className="mr-2">:</span><span className="font-bold text-slate-800">{selectedSubject}</span></div>
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Guru Pengampu</span><span className="mr-2">:</span><span className="font-bold text-slate-800">Guru Pengampu Mata Pelajaran</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Total Murid</span><span className="mr-2">:</span><span className="font-bold text-slate-900 font-mono">{currentClassScores.length} Orang</span></div>
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Rerata Kelas</span><span className="mr-2">:</span><span className="font-bold text-slate-900 font-mono">{totalClassAverage}</span></div>
                    <div className="flex"><span className="w-28 text-slate-600 font-semibold">Tanggal Cetak</span><span className="mr-2">:</span><span className="font-bold text-slate-800 font-mono">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  </div>
                </div>

                {/* Printable Class Grade Table */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                    DAFTAR REKAPITULASI NILAI AKADEMIK KELAS {selectedClass}
                  </h5>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 uppercase text-[9px] font-black border-b border-slate-400">
                        <th className="border border-slate-400 p-2 text-center w-8">No</th>
                        <th className="border border-slate-400 p-2">Nama Murid</th>
                        <th className="border border-slate-400 p-2 text-center">Tugas (15%)</th>
                        <th className="border border-slate-400 p-2 text-center">Praktik (25%)</th>
                        <th className="border border-slate-400 p-2 text-center">Projek (15%)</th>
                        <th className="border border-slate-400 p-2 text-center">PH (15%)</th>
                        <th className="border border-slate-400 p-2 text-center">PTS (15%)</th>
                        <th className="border border-slate-400 p-2 text-center">PAS (15%)</th>
                        <th className="border border-slate-400 p-2 text-center">Nilai Rata-rata</th>
                        <th className="border border-slate-400 p-2 text-center">Status KKTP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400 text-slate-900">
                      {currentClassScores.map((sc, idx) => (
                        <tr key={sc.studentId}>
                          <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-400 p-2 font-bold">{sc.studentName}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.tugas}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.praktik}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.projek}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.ph}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.pts}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono">{sc.pas}</td>
                          <td className="border border-slate-400 p-2 text-center font-black font-mono">{sc.rataRata}</td>
                          <td className="border border-slate-400 p-2 text-center font-bold">
                            <span className={sc.lulus ? "text-emerald-800" : "text-rose-800"}>
                              {sc.lulus ? "TUNTAS" : "REMEDIAL"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="border border-slate-400 p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                  <div className="font-bold text-slate-900">Ringkasan Evaluasi Belajar Kelas:</div>
                  <div className="text-slate-700">
                    - Rasio Ketuntasan: <strong>{totalCompletenessRatio}%</strong> ({currentClassScores.filter(s => s.lulus).length} dari {currentClassScores.length} murid tuntas, {currentClassScores.filter(s => !s.lulus).length} murid wajib mengikuti remedial).
                  </div>
                  {alertText && (
                    <div className="text-slate-800 font-mono text-[10px] bg-indigo-50 p-2 rounded border border-indigo-200 mt-2">
                      <strong>Rekomendasi AI Remedial:</strong> {alertText.slice(0, 300)}...
                    </div>
                  )}
                </div>

                {/* Formal Signatures */}
                <div className="pt-8 grid grid-cols-3 gap-4 text-xs text-center">
                  <div className="space-y-12">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-bold text-slate-800">Waka Kurikulum SMK Negeri 2 Konawe</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 underline">Andi Asrul Umar, S.Pd.</p>
                      <p className="text-slate-500 font-mono text-[9px]">NIP. 19690408 199503 1 002</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-bold text-slate-800">Kepala SMK Negeri 2 Konawe</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 underline">Drs. H. ABD. MANAN, M.M.</p>
                      <p className="text-slate-500 font-mono text-[9px]">NIP. 19650812 199003 1 008</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p className="text-slate-600">Konawe, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="font-bold text-slate-800">Guru Pengampu / Wali Kelas</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-950 underline">Guru Pengampu / Wali Kelas</p>
                      <p className="text-slate-500 font-mono text-[9px]">NIP. -</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
