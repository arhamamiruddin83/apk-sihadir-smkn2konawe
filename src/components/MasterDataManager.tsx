/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  UserSquare2, 
  BookOpen, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle, 
  Info, 
  RefreshCw,
  Save,
  Grid,
  FileText,
  Smartphone,
  Mail,
  UserX,
  Sparkles,
  Calendar,
  Compass,
  MapPin,
  AlertCircle,
  ShieldAlert,
  Eye,
  Lock,
  Upload,
  User,
  Camera,
  Printer,
  X,
  ChevronRight,
  GraduationCap,
  UserPlus,
  QrCode
} from "lucide-react";
import { Student, Teacher, TeachingSchedule } from "../types";
import { compressImageFile } from "../lib/imageCompressor";
import { MOCK_STUDENTS, MOCK_TEACHERS } from "../mockData";
import { getAllTeachers, saveTeacherRecord, subscribeTeacherRecords, getTeacherPhoto } from "../services/teacherService";
import { OFFICIAL_CLASSES } from "../data/classCaptains";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { OFFICIAL_SMK2_SCHEDULES } from "../data/translatedSchedules";
import ScheduleImporterModal from "./ScheduleImporterModal";
import BirthDateSelector from "./BirthDateSelector";
import { DocumentPdfImporterModal } from "./DocumentPdfImporterModal";
import { CetakKartuQrModal } from "./CetakKartuQrModal";
import { 
  getMasterGuruWaliData, 
  saveMasterGuruWaliData, 
  GuruWaliMasterItem, 
  BimbinganMuridItem, 
  INITIAL_GURU_WALI_MASTER_DATA 
} from "../data/guruWaliMasterData";

// Hardcoded initial list of classes to populate if empty
const DEFAULT_CLASSES = OFFICIAL_CLASSES;

const OFFICIAL_SUBJECTS = [
  "Pendidikan Agama (dan Budi Pekerti)",
  "Pendidikan Kewarganegaraan/Pancasila",
  "Bahasa Indonesia",
  "Pendidikan Jasmani & Orkes",
  "Sejarah",
  "Seni Budaya",
  "Matematika",
  "Bahasa Inggris",
  "IPAS",
  "Informatika",
  "Dasar Program Keahlian",
  "Mata Pelajaran Keahlian",
  "Kreatifitas, inovasi dan Kewirausahaan",
  "Mata Pelajaran Pilihan"
];

// Hardcoded initial list of subjects/mapel to populate if empty
const DEFAULT_SUBJECTS = [
  ...OFFICIAL_SUBJECTS
];

const DEFAULT_SCHEDULES: TeachingSchedule[] = [
  ...OFFICIAL_SMK2_SCHEDULES.slice(0, 20).map((item, idx) => ({
    id: `sch-${idx + 1}`,
    teacherId: item.teacherCode.toLowerCase(),
    teacherName: item.teacherName,
    subject: item.subjectName,
    className: item.className,
    day: item.day,
    period: `${item.period} (${item.time})`,
    semester: "Ganjil 2026/2027"
  }))
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY.trim() !== "";

// Helper component for Google Maps circle radius in Admin Calibration
function MapCircle({ center, radius }: { center: { lat: number; lng: number }; radius: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    try {
      if (!window.google.maps || !window.google.maps.Circle) return;
      const circle = new window.google.maps.Circle({
        map,
        center,
        radius,
        fillColor: "#4f46e5",
        fillOpacity: 0.12,
        strokeColor: "#4338ca",
        strokeOpacity: 0.4,
        strokeWeight: 1.5,
      });
      return () => {
        try {
          circle.setMap(null);
        } catch (e) {
          console.error("Error clearing circle map", e);
        }
      };
    } catch (err) {
      console.error("Failed to build Google Maps Circle:", err);
    }
  }, [map, center, radius]);
  return null;
}

// React Error Boundary for catching Google Maps API / Marker errors
class MapErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map rendering error captured by boundary in MasterData:", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (this as any).props.fallback;
    }
    return (this as any).props.children;
  }
}

interface MasterDataManagerProps {
  currentRole?: string;
  username?: string;
}

export function MasterDataManager({ currentRole, username }: MasterDataManagerProps = {}) {
  const isReadOnly = currentRole === "tu" || username === "tu";
  const isSaktiOrAdelia = (() => {
    const u = (username || "").toLowerCase();
    return u.includes("sakti") || u.includes("adelia") || u.includes("saktinani") || u.includes("pusparini");
  })();
  const tuRoleTitle = isSaktiOrAdelia ? "Admin Tata Usaha (TU)" : "Staf Tata Usaha";
  const [mapAuthFailed, setMapAuthFailed] = useState(false);

  useEffect(() => {
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failure detected in MasterDataManager");
      setMapAuthFailed(true);
      if (originalAuthFailure) {
        try {
          originalAuthFailure();
        } catch (e) {
          console.error(e);
        }
      }
    };
    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<"murid" | "guru" | "guru_wali" | "mapel" | "kelas" | "jadwal" | "gps">("murid");

  // Master Data Guru Wali & Bimbingan Murid State
  const [guruWaliList, setGuruWaliList] = useState<GuruWaliMasterItem[]>(() => {
    return getMasterGuruWaliData();
  });

  useEffect(() => {
    saveMasterGuruWaliData(guruWaliList);
  }, [guruWaliList]);

  // GPS Calibration states
  const [calibratedLat, setCalibratedLat] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lat");
    if (!saved || saved === "-7.2504" || saved === "-3.838139") {
      localStorage.setItem("sihadir_school_lat", "-3.8380461319668107");
      return -3.8380461319668107;
    }
    return parseFloat(saved);
  });
  const [calibratedLon, setCalibratedLon] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lon");
    if (!saved || saved === "112.7508" || saved === "122.041944") {
      localStorage.setItem("sihadir_school_lon", "122.04194960321178");
      return 122.04194960321178;
    }
    return parseFloat(saved);
  });
  const [calibratedRadius, setCalibratedRadius] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_radius");
    return saved ? parseInt(saved) : 700;
  });
  
  // Local states loaded from LocalStorage or defaults
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed = parsed.filter((s: Student) => s.className !== "XII DKV");
          const existingKeys = new Set(
            parsed.map((s: Student) => `${(s.nisn || '').trim()}_${(s.name || '').trim().toLowerCase()}`)
          );
          const missingFromMock = MOCK_STUDENTS.filter(s => {
            const key = `${(s.nisn || '').trim()}_${(s.name || '').trim().toLowerCase()}`;
            return !existingKeys.has(key);
          });
          if (missingFromMock.length > 0) {
            const merged = [...parsed, ...missingFromMock];
            localStorage.setItem("simpati_students_list", JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem("simpati_students_list", JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  });

  // Modal detail per kelas digital
  const [selectedClassForModal, setSelectedClassForModal] = useState<string | null>(null);
  const [classModalSearch, setClassModalSearch] = useState<string>("");

  // Helper untuk mendapatkan daftar murid per kelas
  const getClassStudents = (kelasName: string) => {
    if (!kelasName) return [];
    const target = kelasName.trim().toLowerCase();
    return students.filter(s => {
      const studentClass = (s.className || "").trim().toLowerCase();
      if (studentClass === target) return true;
      if ((target === "x tsm" || target === "x tsm a" || target === "x tsm b") && (studentClass === "x tsm" || studentClass === "x tsm a" || studentClass === "x tsm b")) return true;
      if ((target === "xii tsm" && studentClass === "xii tsm a") || (target === "xii tsm a" && studentClass === "xii tsm")) return true;
      return false;
    });
  };

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    return getAllTeachers();
  });

  const [classes, setClasses] = useState<string[]>(() => {
    const saved = localStorage.getItem("simpati_classes_list");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed = parsed.map((c: string) => (c === "X TSM A" || c === "X TSM B") ? "X TSM" : c);
          parsed = parsed.filter((c: string) => c !== "XII DKV");
          parsed = Array.from(new Set(parsed)).sort();
          localStorage.setItem("simpati_classes_list", JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return DEFAULT_CLASSES;
  });

  const [subjects, setSubjects] = useState<string[]>(() => {
    let list = DEFAULT_SUBJECTS;
    const saved = localStorage.getItem("simpati_subjects_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = [...parsed];
        }
      } catch (e) { console.error(e); }
    }
    // Filter out non-subject roles (jabatan)
    const nonSubjectRoles = ["Admin Utama", "Administrator Utama", "Guru Mapel", "Guru Mata Pelajaran", "Guru Piket", "Guru Wali", "Wali Kelas"];
    list = list.filter(item => !nonSubjectRoles.some(role => role.toLowerCase() === item.trim().toLowerCase()));

    // Ensure all official SMK Negeri 2 Konawe subjects are present
    OFFICIAL_SUBJECTS.forEach(sub => {
      if (!list.some(item => item.toLowerCase() === sub.toLowerCase())) {
        list.push(sub);
      }
    });
    return list;
  });

  const [schedules, setSchedules] = useState<TeachingSchedule[]>(() => {
    const saved = localStorage.getItem("simpati_teaching_schedules");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SCHEDULES;
  });

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Form states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalType, setPdfModalType] = useState<"guru" | "murid" | "mapel">("guru");
  const [isStudentQrModalOpen, setIsStudentQrModalOpen] = useState(false);
  const [studentQrModalClass, setStudentQrModalClass] = useState<string>("ALL");
  const [editType, setEditType] = useState<"murid" | "guru" | "mapel" | "kelas" | "jadwal">("murid");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Guru Wali Modals & Form states
  const [isGuruWaliModalOpen, setIsGuruWaliModalOpen] = useState(false);
  const [editingGuruWali, setEditingGuruWali] = useState<GuruWaliMasterItem | null>(null);
  const [guruWaliNameInput, setGuruWaliNameInput] = useState("");

  const [isMuridModalOpen, setIsMuridModalOpen] = useState(false);
  const [selectedGuruWaliId, setSelectedGuruWaliId] = useState<string | null>(null);
  const [editingMurid, setEditingMurid] = useState<{ guruWaliId: string; murid: BimbinganMuridItem } | null>(null);
  const [muridNameInput, setMuridNameInput] = useState("");
  const [muridKelasInput, setMuridKelasInput] = useState("XI TKR A");
  const [muridKetInput, setMuridKetInput] = useState("");

  const handleSaveGuruWali = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruWaliNameInput.trim()) return;
    if (editingGuruWali) {
      setGuruWaliList(prev => prev.map(item => item.id === editingGuruWali.id ? { ...item, namaGuru: guruWaliNameInput.trim() } : item));
      setStatusMessage({ type: "success", text: `Nama Guru Wali berhasil diperbarui!` });
    } else {
      const newItem: GuruWaliMasterItem = {
        id: "gw-" + Date.now(),
        no: guruWaliList.length + 1,
        namaGuru: guruWaliNameInput.trim(),
        muridList: []
      };
      setGuruWaliList(prev => [...prev, newItem]);
      setStatusMessage({ type: "success", text: `Guru Wali "${guruWaliNameInput}" berhasil ditambahkan!` });
    }
    setIsGuruWaliModalOpen(false);
    setGuruWaliNameInput("");
    setEditingGuruWali(null);
  };

  const handleDeleteGuruWali = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus Guru Wali "${name}" beserta data murid bimbingannya?`)) {
      setGuruWaliList(prev => prev.filter(g => g.id !== id));
      setStatusMessage({ type: "success", text: `Guru Wali "${name}" berhasil dihapus.` });
    }
  };

  const handleSaveMuridBimbingan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muridNameInput.trim() || !selectedGuruWaliId) return;

    if (editingMurid) {
      setGuruWaliList(prev => prev.map(gw => {
        if (gw.id === editingMurid.guruWaliId) {
          return {
            ...gw,
            muridList: gw.muridList.map(m => m.id === editingMurid.murid.id ? {
              ...m,
              nama: muridNameInput.trim(),
              kelas: muridKelasInput.trim(),
              keterangan: muridKetInput.trim() || undefined
            } : m)
          };
        }
        return gw;
      }));
      setStatusMessage({ type: "success", text: `Data murid ${muridNameInput} berhasil diperbarui!` });
    } else {
      const newMurid: BimbinganMuridItem = {
        id: "m-" + Date.now(),
        nama: muridNameInput.trim(),
        kelas: muridKelasInput.trim(),
        keterangan: muridKetInput.trim() || undefined
      };
      setGuruWaliList(prev => prev.map(gw => {
        if (gw.id === selectedGuruWaliId) {
          return {
            ...gw,
            muridList: [...gw.muridList, newMurid]
          };
        }
        return gw;
      }));
      setStatusMessage({ type: "success", text: `Murid ${muridNameInput} berhasil ditambahkan ke bimbingan.` });
    }

    setIsMuridModalOpen(false);
    setMuridNameInput("");
    setMuridKelasInput("XI TKR A");
    setMuridKetInput("");
    setEditingMurid(null);
  };

  const handleDeleteMuridBimbingan = (guruWaliId: string, muridId: string, muridName: string) => {
    if (window.confirm(`Hapus ${muridName} dari daftar bimbingan Guru Wali?`)) {
      setGuruWaliList(prev => prev.map(gw => {
        if (gw.id === guruWaliId) {
          return {
            ...gw,
            muridList: gw.muridList.filter(m => m.id !== muridId)
          };
        }
        return gw;
      }));
      setStatusMessage({ type: "success", text: `Murid ${muridName} dihapus dari bimbingan.` });
    }
  };

  const handleResetGuruWaliData = () => {
    if (window.confirm("Reset seluruh data Guru Wali ke versi SK Resmi Kepala SMK Negeri 2 Konawe (36 Guru Wali)?")) {
      setGuruWaliList(INITIAL_GURU_WALI_MASTER_DATA);
      saveMasterGuruWaliData(INITIAL_GURU_WALI_MASTER_DATA);
      setStatusMessage({ type: "success", text: "Data Master Guru Wali berhasil direset sesuai SK Kepala Sekolah SMK Negeri 2 Konawe!" });
    }
  };

  // PDF Master Data Import Handlers
  const handlePdfImportGuru = (newTeachers: Teacher[]) => {
    setTeachers(prev => {
      const updated = [...newTeachers, ...prev];
      localStorage.setItem("simpati_teachers_list", JSON.stringify(updated));
      return updated;
    });
    setStatusMessage({ type: "success", text: `Berhasil menambahkan ${newTeachers.length} data guru baru dari dokumen PDF!` });
  };

  const handlePdfImportStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      const updated = [...newStudents, ...prev];
      localStorage.setItem("simpati_students_list", JSON.stringify(updated));
      return updated;
    });
    setStatusMessage({ type: "success", text: `Berhasil menambahkan ${newStudents.length} data murid baru dari dokumen PDF!` });
  };

  const handlePdfImportSubjects = (newSubjects: string[]) => {
    setSubjects(prev => {
      const uniqueNew = newSubjects.filter(s => !prev.includes(s));
      const updated = [...prev, ...uniqueNew];
      localStorage.setItem("simpati_subjects_list", JSON.stringify(updated));
      return updated;
    });
    setStatusMessage({ type: "success", text: `Berhasil menambahkan ${newSubjects.length} mata pelajaran baru dari dokumen PDF!` });
  };

  // Form states - Murid
  const [siswaForm, setSiswaForm] = useState({
    name: "",
    nis: "",
    nisn: "",
    className: "XI TKR A",
    major: "Teknik Kendaraan Ringan (TKR)",
    gender: "Laki-laki",
    birthPlace: "",
    birthDate: "",
    religion: "Islam",
    address: "",
    fatherName: "",
    motherName: "",
    fatherOccupation: "",
    motherOccupation: "",
    statusActive: "Aktif",
    parentName: "",
    whatsApp: "",
    parentWhatsApp: "",
    photoUrl: ""
  });

  // Form states - Guru
  const [guruForm, setGuruForm] = useState({
    name: "",
    nip: "",
    nuptk: "",
    subject: "Pemeliharaan Mesin Kendaraan Ringan",
    classes: [] as string[],
    role: "Guru Mata Pelajaran",
    whatsApp: "",
    email: "",
    photoUrl: "",
    birthPlace: "Konawe",
    birthDate: "1985-05-05"
  });

  // Form states - Jadwal Mengajar
  const [jadwalForm, setJadwalForm] = useState({
    teacherId: "",
    subject: "",
    className: "",
    day: "Senin",
    period: "Jam 1-4 (07:15 - 10:15)",
    semester: "Ganjil 2026/2027"
  });

  // Form states - Mapel & Kelas
  const [simpleInput, setSimpleInput] = useState("");

  // Notify status
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  // Listen for updates from other components and Firebase Firestore
  useEffect(() => {
    // 1. Subscribe to teacher records (Firebase Firestore & localStorage realtime updates)
    const unsubTeachers = subscribeTeacherRecords((updatedTeachers) => {
      if (updatedTeachers && updatedTeachers.length > 0) {
        setTeachers(updatedTeachers);
      }
    });

    // 2. Student updates listener
    const handleStorageUpdate = () => {
      const savedStudents = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudents(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("sihadir_data_updated", handleStorageUpdate);
    return () => {
      unsubTeachers();
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("sihadir_data_updated", handleStorageUpdate);
    };
  }, []);

  // PDF Export Handler
  const handleExportPDF = (type: "murid" | "guru" | "guru_wali" | "mapel" | "jadwal") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Izinkan pop-up di browser Anda.");
      return;
    }

    const filteredSubjectsList = subjects.filter(sub =>
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSchedulesList = schedules.filter(sch =>
      sch.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.day.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let title = "";
    let headersHTML = "";
    let rowsHTML = "";

    if (type === "murid") {
      title = "REKAPITULASI DATA MASTER MURID SMK NEGERI 2 KONAWE";
      headersHTML = `
        <th>No</th>
        <th>NISN / NIS</th>
        <th>Nama Lengkap Murid</th>
        <th>L/P</th>
        <th>Kelas</th>
        <th>Kontak Murid</th>
        <th>Nama Orang Tua / Wali</th>
        <th>Kontak Ortu</th>
        <th>Status Profil</th>
      `;
      rowsHTML = filteredStudents.map((s, idx) => `
        <tr>
          <td style="text-align:center">${idx + 1}</td>
          <td>${s.nisn || s.nis || "-"}</td>
          <td style="font-weight:bold">${s.name}</td>
          <td style="text-align:center">${s.gender || "-"}</td>
          <td style="text-align:center">${s.className}</td>
          <td>${s.phone || "-"}</td>
          <td>${s.fatherName || s.motherName || s.parentName || "-"}</td>
          <td>${s.parentPhone || s.parentWhatsApp || s.whatsApp || "-"}</td>
          <td style="text-align:center; color: ${s.photoUrl ? '#16a34a' : '#475569'}; font-weight:bold">
            ${s.photoUrl ? 'Lengkap (Ada Foto)' : 'Tersimpan'}
          </td>
        </tr>
      `).join("");
    } else if (type === "guru_wali") {
      title = "DAFTAR NAMA GURU WALI & BIMBINGAN MURID SMK NEGERI 2 KONAWE (PELAJARAN 2026 / 2027)";
      headersHTML = `
        <th style="width: 40px">No</th>
        <th style="width: 220px">Nama Guru Wali</th>
        <th style="width: 100px">Total Murid</th>
        <th>Daftar Nama Murid Bimbingan & Kelas Digital</th>
      `;
      const filteredGW = guruWaliList.filter(gw =>
        gw.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gw.muridList.some(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || m.kelas.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      rowsHTML = filteredGW.map((g, idx) => `
        <tr>
          <td style="text-align:center; font-weight:bold">${idx + 1}</td>
          <td style="font-weight:bold; color:#1e3a8a">${g.namaGuru}</td>
          <td style="text-align:center; font-weight:bold">${g.muridList.length} Murid</td>
          <td>
            <ol style="margin:0; padding-left:18px; line-height:1.5">
              ${g.muridList.map(m => `
                <li>
                  <strong>${m.nama}</strong> - <span style="color:#0f766e; font-weight:bold">${m.kelas}</span>
                  ${m.keterangan ? `<span style="color:#b91c1c; font-weight:bold; font-size:9px"> (${m.keterangan})</span>` : ''}
                </li>
              `).join('')}
            </ol>
          </td>
        </tr>
      `).join("");
    } else if (type === "guru") {
      title = "REKAPITULASI DATA MASTER GURU & PENDIDIK SMK NEGERI 2 KONAWE";
      headersHTML = `
        <th>No</th>
        <th>NIP / NUPTK</th>
        <th>Nama Guru / Pendidik</th>
        <th>Mata Pelajaran Utama</th>
        <th>No. HP / WhatsApp</th>
        <th>Status Profil</th>
      `;
      rowsHTML = filteredTeachers.map((g, idx) => `
        <tr>
          <td style="text-align:center">${idx + 1}</td>
          <td>${g.nip || "-"}</td>
          <td style="font-weight:bold">${g.name}</td>
          <td>${g.subject || "-"}</td>
          <td>${g.phone || "-"}</td>
          <td style="text-align:center; color: ${g.photoUrl ? '#16a34a' : '#475569'}; font-weight:bold">
            ${g.photoUrl ? 'Lengkap (Ada Foto)' : 'Tersimpan'}
          </td>
        </tr>
      `).join("");
    } else if (type === "mapel") {
      title = "REKAPITULASI DAFTAR MATA PELAJARAN SMK NEGERI 2 KONAWE";
      headersHTML = `
        <th>No</th>
        <th>Nama Mata Pelajaran</th>
        <th>Status Kurikulum</th>
      `;
      rowsHTML = filteredSubjectsList.map((m, idx) => `
        <tr>
          <td style="text-align:center; width:50px">${idx + 1}</td>
          <td style="font-weight:bold">${m}</td>
          <td style="text-align:center">Kurikulum Merdeka</td>
        </tr>
      `).join("");
    } else if (type === "jadwal") {
      title = "REKAPITULASI JADWAL MENGAJAR SMK NEGERI 2 KONAWE";
      headersHTML = `
        <th>No</th>
        <th>Hari</th>
        <th>Jam Ke</th>
        <th>Kelas</th>
        <th>Mata Pelajaran</th>
        <th>Guru Pengampu</th>
      `;
      rowsHTML = filteredSchedulesList.map((j, idx) => `
        <tr>
          <td style="text-align:center; width:50px">${idx + 1}</td>
          <td style="font-weight:bold; text-align:center">${j.day}</td>
          <td style="text-align:center">Jam ${j.period} (${j.timeSlot || '-'})</td>
          <td style="text-align:center; font-weight:bold">${j.className}</td>
          <td>${j.subject}</td>
          <td>${j.teacherName}</td>
        </tr>
      `).join("");
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 25px; font-size: 11px; color: #0f172a; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #0f172a; padding-bottom: 12px; }
          .header h3 { margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
          .header h2 { margin: 4px 0; font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #1e3a8a; }
          .header p { margin: 4px 0 0 0; font-size: 11px; font-weight: bold; color: #334155; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10px; color: #475569; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #64748b; padding: 7px 9px; font-size: 10px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 800; text-transform: uppercase; color: #0f172a; font-size: 9px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; }
          .footer-box { text-align: center; font-size: 10px; }
          @media print {
            body { padding: 0; }
            @page { size: A4 landscape; margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h3>Pemerintah Provinsi Sulawesi Tenggara</h3>
          <h3>Dinas Pendidikan dan Kebudayaan</h3>
          <h2>SMK NEGERI 2 KONAWE</h2>
          <p>${title}</p>
        </div>
        <div class="meta-info">
          <span>Jumlah Total: ${
            type === "murid" ? filteredStudents.length :
            type === "guru" ? filteredTeachers.length :
            type === "mapel" ? filteredSubjectsList.length : filteredSchedulesList.length
          } Record</span>
          <span>Waktu Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WITA</span>
        </div>
        <table>
          <thead>
            <tr>${headersHTML}</tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
        <div class="footer">
          <div class="footer-box">
            <p style="margin-bottom: 50px;">Mengetahui,<br/><strong>Wakasek Bidang Kurikulum</strong></p>
            <p><strong><u>Andi Asrul Umar, S.Pd.</u></strong><br/>NIP. 19690408 199503 1 002</p>
          </div>
          <div class="footer-box">
            <p>Konawe, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="margin-bottom: 50px;"><strong>Kepala SMK Negeri 2 Konawe</strong></p>
            <p><strong><u>Drs. H. ABD. MANAN, M.M.</u></strong><br/>NIP. 19650812 199003 1 008</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("simpati_students_list", JSON.stringify(students));
      
      const namesMap: Record<string, string[]> = {};
      DEFAULT_CLASSES.forEach(c => {
        namesMap[c] = [];
      });
      students.forEach((s) => {
        if (!namesMap[s.className]) {
          namesMap[s.className] = [];
        }
        if (!namesMap[s.className].includes(s.name)) {
          namesMap[s.className].push(s.name);
        }
      });
      Object.keys(namesMap).forEach(key => {
        if (namesMap[key].length === 0) {
          const savedMap = localStorage.getItem("simpati_students_map");
          if (savedMap) {
            try {
              const parsed = JSON.parse(savedMap);
              if (parsed[key] && parsed[key].length > 0) {
                namesMap[key] = parsed[key];
              }
            } catch(e){}
          }
        }
      });

      localStorage.setItem("simpati_students_map", JSON.stringify(namesMap));
    } catch (e) {
      console.warn("Could not sync students to localStorage:", e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem("simpati_teachers_list", JSON.stringify(teachers));
      localStorage.setItem("sihadir_master_teachers", JSON.stringify(teachers));
    } catch (e) {
      console.warn("Could not sync teachers to localStorage:", e);
    }
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem("simpati_classes_list", JSON.stringify(classes));
    } catch (e) {
      console.warn("Could not sync classes to localStorage:", e);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem("simpati_subjects_list", JSON.stringify(subjects));
    } catch (e) {
      console.warn("Could not sync subjects to localStorage:", e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem("simpati_teaching_schedules", JSON.stringify(schedules));
      window.dispatchEvent(new Event("sihadir_data_updated"));
    } catch (e) {
      console.warn("Could not sync schedules to localStorage:", e);
    }
  }, [schedules]);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Reset helper
  const handleResetDefaults = () => {
    triggerConfirm(
      "Setel Ulang Data Master",
      "Apakah Anda yakin ingin mengembalikan semua Master Data ke setelan pabrik default?",
      () => {
        setStudents(MOCK_STUDENTS);
        setTeachers(MOCK_TEACHERS);
        setClasses(DEFAULT_CLASSES);
        setSubjects(DEFAULT_SUBJECTS);
        setSchedules(DEFAULT_SCHEDULES);
        showStatus("Semua data master berhasil diset ulang ke default!", "success");
      }
    );
  };

  const handleSaveCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("sihadir_school_lat", calibratedLat.toString());
    localStorage.setItem("sihadir_school_lon", calibratedLon.toString());
    localStorage.setItem("sihadir_school_radius", calibratedRadius.toString());
    showStatus("Kalibrasi Titik GPS & Radius Sekolah berhasil disimpan!", "success");
  };

  const handleResetCalibration = () => {
    triggerConfirm(
      "Setel Ulang Kalibrasi GPS",
      "Kembalikan koordinat sekolah ke standar default SMK Negeri 2 Konawe?",
      () => {
        setCalibratedLat(-3.8380461319668107);
        setCalibratedLon(122.04194960321178);
        setCalibratedRadius(700);
        localStorage.setItem("sihadir_school_lat", "-3.8380461319668107");
        localStorage.setItem("sihadir_school_lon", "122.04194960321178");
        localStorage.setItem("sihadir_school_radius", "700");
        showStatus("Titik koordinat berhasil dikembalikan ke default SMK Negeri 2 Konawe!", "success");
      }
    );
  };

  // Student CRUD Operations
  const handleOpenAddSiswa = (targetClass?: string) => {
    setEditType("murid");
    setEditingId(null);
    setSiswaForm({
      name: "",
      nis: `24${String(students.length + 1).padStart(3, "0")}`,
      nisn: `011${Math.floor(1000000 + Math.random() * 9000000)}`,
      className: targetClass || classes[0] || "X TKR A",
      major: "Teknik Kendaraan Ringan (TKR)",
      gender: "Laki-laki",
      birthPlace: "",
      birthDate: "",
      religion: "Islam",
      address: "",
      fatherName: "",
      motherName: "",
      fatherOccupation: "",
      motherOccupation: "",
      statusActive: "Aktif",
      parentName: "",
      whatsApp: "0813" + Math.floor(1000000 + Math.random() * 9000000),
      parentWhatsApp: "0813" + Math.floor(1000000 + Math.random() * 9000000),
      photoUrl: ""
    });
    setIsEditorOpen(true);
  };

  const handleOpenEditSiswa = (murid: Student) => {
    setEditType("murid");
    setEditingId(murid.id);
    setSiswaForm({
      name: murid.name,
      nis: murid.nis,
      nisn: murid.nisn,
      className: murid.className,
      major: murid.major || "Teknik Kendaraan Ringan (TKR)",
      gender: murid.gender || "Laki-laki",
      birthPlace: murid.birthPlace || "",
      birthDate: murid.birthDate || "",
      religion: murid.religion || "Islam",
      address: murid.address || "",
      fatherName: murid.fatherName || "",
      motherName: murid.motherName || "",
      fatherOccupation: murid.fatherOccupation || "",
      motherOccupation: murid.motherOccupation || "",
      statusActive: murid.statusActive || "Aktif",
      parentName: murid.parentName || "",
      whatsApp: murid.whatsApp || "",
      parentWhatsApp: murid.parentWhatsApp || "",
      photoUrl: murid.photoUrl || ""
    });
    setIsEditorOpen(true);
  };

  const handleOpenAddGuru = () => {
    setEditType("guru");
    setEditingId(null);
    setGuruForm({
      name: "",
      nip: `198${Math.floor(0 + Math.random() * 9)}${Math.floor(10 + Math.random() * 89)} ${Math.floor(100000 + Math.random() * 900000)} 1 00${teachers.length + 1}`,
      nuptk: `${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      subject: subjects[0] || "Pemeliharaan Mesin Kendaraan Ringan",
      classes: ["XI TKR A"],
      role: "Guru Mata Pelajaran",
      whatsApp: "0812" + Math.floor(1000000 + Math.random() * 9000000),
      email: "",
      photoUrl: "",
      birthPlace: "Konawe",
      birthDate: "1985-05-05"
    });
    setIsEditorOpen(true);
  };

  const handleOpenEditGuru = (teacher: Teacher) => {
    setEditType("guru");
    setEditingId(teacher.id);
    const place = teacher.birthPlace || (teacher.birthInfo ? teacher.birthInfo.split(",")[0].trim() : "Konawe");
    const date = teacher.birthDate || "1985-05-05";
    const resolvedPhoto = teacher.photoUrl || getTeacherPhoto(teacher.id) || getTeacherPhoto(teacher.name) || (teacher.nip ? getTeacherPhoto(teacher.nip) : "") || "";
    setGuruForm({
      name: teacher.name,
      nip: teacher.nip || "",
      nuptk: teacher.nuptk || "",
      subject: teacher.subject || "",
      classes: teacher.classes || [],
      role: teacher.role || "Guru Mata Pelajaran",
      whatsApp: teacher.whatsApp || "",
      email: teacher.email || "",
      photoUrl: resolvedPhoto,
      birthPlace: place,
      birthDate: date
    });
    setIsEditorOpen(true);
  };

  const handleOpenAddJadwal = () => {
    setEditType("jadwal");
    setEditingId(null);
    setJadwalForm({
      teacherId: teachers[0]?.id || "budi",
      subject: subjects[0] || "Pemeliharaan Mesin Kendaraan Ringan",
      className: classes[0] || "XI TKR A",
      day: "Senin",
      period: "Jam 1-4 (07:15 - 10:15)",
      semester: "Ganjil 2026/2027"
    });
    setIsEditorOpen(true);
  };

  const handleOpenEditJadwal = (sch: TeachingSchedule) => {
    setEditType("jadwal");
    setEditingId(sch.id);
    setJadwalForm({
      teacherId: sch.teacherId,
      subject: sch.subject,
      className: sch.className,
      day: sch.day,
      period: sch.period,
      semester: sch.semester
    });
    setIsEditorOpen(true);
  };

  const handleDeleteJadwal = (id: string) => {
    triggerConfirm(
      "Hapus Jadwal Mengajar",
      "Apakah Anda yakin ingin menghapus jadwal mengajar ini?",
      () => {
        setSchedules(prev => prev.filter(s => s.id !== id));
        showStatus("Jadwal mengajar berhasil dihapus.");
      }
    );
  };

  const handleDeleteSiswa = (id: string, name: string) => {
    triggerConfirm(
      "Hapus Data Murid",
      `Apakah Anda yakin ingin menghapus murid '${name}' dari master data?`,
      () => {
        setStudents(prev => prev.filter(s => s.id !== id));
        showStatus(`Murid ${name} berhasil dihapus dari master data.`);
      }
    );
  };

  const handleDeleteGuru = (id: string, name: string) => {
    triggerConfirm(
      "Hapus Data Guru",
      `Apakah Anda yakin ingin menghapus guru '${name}' dari master data?`,
      () => {
        setTeachers(prev => {
          const filtered = prev.filter(t => t.id !== id);
          localStorage.setItem("simpati_teachers_list", JSON.stringify(filtered));
          localStorage.setItem("sihadir_master_teachers", JSON.stringify(filtered));
          return filtered;
        });
        showStatus(`Guru ${name} berhasil dihapus dari master data.`);
      }
    );
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaForm.name.trim()) return;

    if (editingId) {
      // Edit
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...siswaForm } : s));
      showStatus(`Sukses memperbarui data murid: ${siswaForm.name}`);
    } else {
      // Add
      const newStudent: Student = {
        id: `S${Date.now()}`,
        ...siswaForm
      };
      setStudents(prev => [newStudent, ...prev]);
      showStatus(`Murid baru berhasil didaftarkan: ${siswaForm.name}`);
    }
    setIsEditorOpen(false);
  };

  const handleSaveGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruForm.name.trim()) return;

    const teacherId = editingId || `T${Date.now()}`;
    const targetTeacher: Teacher = {
      id: teacherId,
      ...guruForm
    };

    if (editingId) {
      setTeachers(prev => prev.map(t => t.id === editingId ? targetTeacher : t));
      showStatus(`Sukses memperbarui data guru: ${guruForm.name}`);
    } else {
      setTeachers(prev => [...prev, targetTeacher]);
      showStatus(`Guru baru berhasil didaftarkan: ${guruForm.name}`);
    }

    // Persist to both localStorage and Firebase Cloud Firestore
    await saveTeacherRecord(targetTeacher);
    setIsEditorOpen(false);
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const t = teachers.find(teach => teach.id === jadwalForm.teacherId);
    const teacherName = t ? t.name : "Guru Mata Pelajaran";

    if (editingId) {
      setSchedules(prev => prev.map(s => s.id === editingId ? { ...s, ...jadwalForm, teacherName } : s));
      showStatus("Sukses memperbarui jadwal mengajar.");
    } else {
      const newSchedule: TeachingSchedule = {
        id: `SCH-${Date.now()}`,
        teacherName,
        ...jadwalForm
      };
      setSchedules(prev => [newSchedule, ...prev]);
      showStatus("Jadwal mengajar baru berhasil ditambahkan.");
    }
    setIsEditorOpen(false);
  };

  // Add / Delete simpler items
  const handleAddMapel = (e: React.FormEvent) => {
    e.preventDefault();
    const name = simpleInput.trim();
    if (!name) return;
    if (subjects.includes(name)) {
      showStatus("Mata pelajaran sudah ada di daftar", "error");
      return;
    }
    setSubjects(prev => [...prev, name]);
    setSimpleInput("");
    showStatus(`Mata Pelajaran '${name}' berhasil ditambahkan.`);
  };

  const handleDeleteMapel = (mapel: string) => {
    triggerConfirm(
      "Hapus Mata Pelajaran",
      `Apakah Anda yakin ingin menghapus mata pelajaran '${mapel}' dari kurikulum?`,
      () => {
        setSubjects(prev => prev.filter(s => s !== mapel));
        showStatus(`Mata pelajaran '${mapel}' berhasil dihapus.`);
      }
    );
  };

  const handleAddKelas = (e: React.FormEvent) => {
    e.preventDefault();
    const name = simpleInput.trim().toUpperCase();
    if (!name) return;
    if (classes.includes(name)) {
      showStatus("Nama Kelas sudah terdaftar", "error");
      return;
    }
    setClasses(prev => [...prev, name].sort());
    setSimpleInput("");
    showStatus(`Kelas '${name}' berhasil dibuat.`);
  };

  const handleDeleteKelas = (kelasName: string) => {
    triggerConfirm(
      "Hapus Data Kelas",
      `Apakah Anda yakin ingin menghapus kelas '${kelasName}'? Semua presensi untuk kelas ini akan terdampak.`,
      () => {
        setClasses(prev => prev.filter(c => c !== kelasName));
        showStatus(`Kelas '${kelasName}' berhasil dihapus.`);
      }
    );
  };

  // Toggle class selection for teacher
  const handleToggleClassForGuru = (className: string) => {
    setGuruForm(prev => {
      const isSelected = prev.classes.includes(className);
      const updatedClasses = isSelected
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className];
      return { ...prev, classes: updatedClasses };
    });
  };

  // Filter lists based on query
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.includes(searchQuery)
  );

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.nip && t.nip.includes(searchQuery))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
      
      {/* Header Panel */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/70 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Users className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Data Master SMK {isReadOnly && `(Akses Lihat ${tuRoleTitle})`}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isReadOnly 
              ? `Akses Khusus ${tuRoleTitle}: Hanya untuk meninjau data master murid, guru, kelas, dan jadwal.` 
              : "Menu khusus Admin Utama & Waka Kurikulum untuk mengatur seluruh entitas pendidikan sekolah. Klik untuk mengedit langsung!"}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg border border-yellow-200 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Set Default Pabrik
            </button>
          </div>
        )}
      </div>

      {/* Read-Only Notice for TU Admin / Staf */}
      {isReadOnly && (
        <div className="m-4 p-4 bg-amber-50 border-2 border-amber-300/80 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-200 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-300">
                Akses Terbatas: Mode Lihat Saja (Read-Only)
              </span>
              <span className="text-xs font-bold text-amber-800 font-mono">Akun {tuRoleTitle}</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Sebagai {tuRoleTitle}, Anda berhak meninjau dan melihat seluruh Data Master Murid, Guru, Mata Pelajaran, Kelas, dan Jadwal Mengajar SMK Negeri 2 Konawe. 
              <strong className="font-extrabold text-rose-800 ml-1">
                Akses untuk Menambah, Mengedit, dan Menghapus Data Master dinonaktifkan
              </strong> dan hanya dipegang oleh Administrator Utama.
            </p>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className={`m-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 border-b border-gray-100 bg-slate-50/50 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveSubTab("murid"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "siswa" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          Murid terdaftar ({students.length})
        </button>
        
        <button
          onClick={() => { setActiveSubTab("guru"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "guru" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserSquare2 className="h-4 w-4" />
          Guru Mata Pelajaran ({teachers.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("guru_wali"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "guru_wali" ? "border-amber-600 text-amber-800 font-extrabold bg-amber-50/50" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="h-4 w-4 text-amber-600" />
          Guru Wali & Bimbingan ({guruWaliList.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("mapel"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "mapel" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Mata Pelajaran ({subjects.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("kelas"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "kelas" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          Kelas Digital ({classes.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("jadwal"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "jadwal" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Jadwal Mengajar & Semester
        </button>

        <button
          onClick={() => { setActiveSubTab("gps"); setSearchQuery(""); }}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "gps" ? "border-indigo-600 text-indigo-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass className="h-4 w-4 text-indigo-600" />
          Kalibrasi GPS Sekolah
        </button>
      </div>

      {/* Main Grid View */}
      <div className="p-5">
        
        {/* Sub-Header actions */}
        {activeSubTab !== "gps" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Cari dari tab ${activeSubTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

          <div>
            {isReadOnly ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs">
                  <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Mode Lihat Saja (Admin TU) - Akses Tambah/Edit Dibatasi</span>
                </div>
                {activeSubTab === "siswa" && (
                  <button
                    onClick={() => {
                      setStudentQrModalClass("ALL");
                      setIsStudentQrModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" />
                    Cetak Kartu QR Murid
                  </button>
                )}
              </div>
            ) : (
              <>
                {activeSubTab === "siswa" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setStudentQrModalClass("ALL");
                        setIsStudentQrModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" />
                      Cetak Kartu QR Murid
                    </button>
                    <button
                      onClick={() => handleExportPDF("murid")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak / Ekspor PDF Murid
                    </button>
                    <button
                      onClick={() => { setPdfModalType("murid"); setIsPdfModalOpen(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      Impor PDF Dokumen Murid
                    </button>
                    <button
                      onClick={handleOpenAddSiswa}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Murid Baru
                    </button>
                  </div>
                )}

                {activeSubTab === "guru" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleExportPDF("guru")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak / Ekspor PDF Guru
                    </button>
                    <button
                      onClick={() => { setPdfModalType("guru"); setIsPdfModalOpen(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      Impor PDF Dokumen Guru
                    </button>
                    <button
                      onClick={handleOpenAddGuru}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Guru Baru
                    </button>
                  </div>
                )}

                {activeSubTab === "guru_wali" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleExportPDF("guru_wali")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak PDF Guru Wali (SK)
                    </button>
                    <button
                      onClick={() => {
                        setEditingGuruWali(null);
                        setGuruWaliNameInput("");
                        setIsGuruWaliModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Guru Wali Baru
                    </button>
                  </div>
                )}

                {activeSubTab === "mapel" && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleExportPDF("mapel")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak PDF Mapel
                    </button>
                    <button
                      onClick={() => { setPdfModalType("mapel"); setIsPdfModalOpen(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      Impor PDF Mapel
                    </button>
                    <form onSubmit={handleAddMapel} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama mapel baru..."
                        required
                        value={simpleInput}
                        onChange={(e) => setSimpleInput(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah
                      </button>
                    </form>
                  </div>
                )}

                {activeSubTab === "kelas" && (
                  <form onSubmit={handleAddKelas} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: XII TKR C..."
                      required
                      value={simpleInput}
                      onChange={(e) => setSimpleInput(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-medium uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Buat Kelas
                    </button>
                  </form>
                )}

                {activeSubTab === "jadwal" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleExportPDF("jadwal")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak PDF Jadwal
                    </button>
                    <button
                      onClick={() => setIsImporterOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="h-4 w-4" />
                      Penerjemah & Impor Jadwal SMK 2
                    </button>
                    <button
                      onClick={handleOpenAddJadwal}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Jadwal Baru
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        )}

        {/* Tab Contents: MURID */}
        {activeSubTab === "siswa" && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Nama Murid</th>
                  <th className="py-3 px-4">NIS / NISN</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jurusan</th>
                  <th className="py-3 px-4">Nama Orang Tua</th>
                  <th className="py-3 px-4">WhatsApp Orang Tua</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                      Tidak ada murid ditemukan. Saring pencarian lain atau buat baru!
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((murid) => (
                    <tr key={murid.id} className="hover:bg-slate-55/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 overflow-hidden flex items-center justify-center text-indigo-700 font-extrabold text-[10px] uppercase shrink-0">
                          {murid.photoUrl ? (
                            <img src={murid.photoUrl} alt={murid.name} className="w-full h-full object-cover" />
                          ) : (
                            murid.name.substring(0, 2)
                          )}
                        </div>
                        <span>{murid.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{murid.nis} / {murid.nisn}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded text-[10px] uppercase border border-indigo-100">
                          {murid.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium">{murid.major || "TKR"}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{murid.parentName || "-"}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {murid.parentWhatsApp ? (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {murid.parentWhatsApp}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isReadOnly ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border inline-flex items-center gap-1">
                            <Lock className="h-3 w-3 text-amber-600" /> Lihat Saja
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1 px-1">
                            <button
                              onClick={() => handleOpenEditSiswa(murid)}
                              className="p-1 px-2 hover:bg-indigo-50 hover:text-indigo-700 text-slate-400 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                              title="Edit Data Murid"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span className="text-[10px] font-bold">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSiswa(murid.id, murid.name)}
                              className="p-1 px-2 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                              title="Hapus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Contents: GURU */}
        {activeSubTab === "guru" && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Mata Pelajaran Diampu</th>
                  <th className="py-3 px-4">Kelas Mengajar</th>
                  <th className="py-3 px-4">Jabatan / Peran</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                      Tidak ada data guru ditemukan terkait pencarian tersebut.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-55/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-extrabold text-[10px] uppercase shrink-0">
                          {teacher.photoUrl ? (
                            <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            teacher.name.substring(0, 2)
                          )}
                        </div>
                        <div>
                          <span className="block">{teacher.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{teacher.email || "-"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[10px] leading-tight">
                        <div>NIP: {teacher.nip || "-"}</div>
                        <div className="text-slate-400 mt-0.5">NUPTK: {teacher.nuptk || "-"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-indigo-950 font-bold text-[11px] max-w-[200px] truncate" title={teacher.subject}>
                        {teacher.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {teacher.classes && teacher.classes.length > 0 ? (
                            teacher.classes.map((c, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded text-[9px] uppercase leading-none">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">Tidak ada kelas diampu</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-bold">{teacher.role || "Guru Mapel"}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{teacher.whatsApp || "-"}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isReadOnly ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border inline-flex items-center gap-1">
                            <Lock className="h-3 w-3 text-amber-600" /> Lihat Saja
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditGuru(teacher)}
                              className="p-1 px-2 hover:bg-indigo-50 hover:text-indigo-700 text-slate-400 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span className="text-[10px] font-bold">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteGuru(teacher.id, teacher.name)}
                              className="p-1 px-2 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Contents: GURU WALI & BIMBINGAN MURID */}
        {activeSubTab === "guru_wali" && (
          <div className="space-y-5">
            {/* SK Header Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-900 via-stone-900 to-indigo-950 text-white rounded-2xl shadow-sm border border-amber-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-500/30 text-amber-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    SK KEPALA SMK NEGERI 2 KONAWE (PELAJARAN 2026/2027)
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">NOMOR: 521.3/ /800/VII/2026</span>
                </div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-amber-400" />
                  DATA MASTER GURU WALI & MURID PEMBIMBINGAN
                </h3>
                <p className="text-xs text-amber-100/80 font-medium">
                  Penetapan 35 Guru Wali Bimbingan Murid untuk pemantauan karakter, ketertiban, absensi, dan akademik.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetGuruWaliData}
                  className="px-3 py-2 bg-amber-800/80 hover:bg-amber-700 text-amber-100 border border-amber-600/50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  title="Kembalikan ke data standar SK SMK Negeri 2 Konawe"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Sesuai SK</span>
                </button>
              </div>
            </div>

            {/* List of Guru Wali Cards */}
            <div className="space-y-4">
              {guruWaliList.filter(gw => 
                gw.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gw.muridList.some(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || m.kelas.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400">
                  <p className="text-sm font-bold">Tidak ada data Guru Wali atau Murid Bimbingan ditemukan.</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tambah Guru Wali baru.</p>
                </div>
              ) : (
                guruWaliList.filter(gw => 
                  gw.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  gw.muridList.some(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || m.kelas.toLowerCase().includes(searchQuery.toLowerCase()))
                ).map((gw, idx) => (
                  <div key={gw.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:border-indigo-300 transition-all">
                    {/* Header Guru Wali */}
                    <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-amber-600 text-white font-black text-xs rounded-lg flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{gw.namaGuru}</span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black rounded-md">
                              {gw.muridList.length} Murid Bina
                            </span>
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            Pembimbing Murid • SMK Negeri 2 Konawe
                          </span>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedGuruWaliId(gw.id);
                              setEditingMurid(null);
                              setMuridNameInput("");
                              setMuridKelasInput("XI TKR A");
                              setMuridKetInput("");
                              setIsMuridModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Tambah Murid</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingGuruWali(gw);
                              setGuruWaliNameInput(gw.namaGuru);
                              setIsGuruWaliModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 rounded-lg transition-all cursor-pointer"
                            title="Edit Nama Guru Wali"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGuruWali(gw.id, gw.namaGuru)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                            title="Hapus Guru Wali"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Table Murid Bimbingan */}
                    <div className="p-3 overflow-x-auto">
                      {gw.muridList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 px-2 text-center">
                          Belum ada murid bimbingan yang terdaftar untuk {gw.namaGuru}. Klik "+ Tambah Murid" di atas.
                        </p>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/60 text-[10px] font-black text-slate-500 uppercase border-b border-slate-200">
                              <th className="py-2 px-3 w-10">No</th>
                              <th className="py-2 px-3">Nama Lengkap Murid</th>
                              <th className="py-2 px-3">Kelas Digital</th>
                              <th className="py-2 px-3">Keterangan Khusus</th>
                              {!isReadOnly && <th className="py-2 px-3 text-right">Aksi</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {gw.muridList.map((murid, mIdx) => (
                              <tr key={murid.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2 px-3 text-slate-400 font-bold text-[10px]">{mIdx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{murid.nama}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-bold border border-teal-200 rounded text-[10px]">
                                    {murid.kelas}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  {murid.keterangan ? (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-black border border-rose-200 rounded text-[10px]">
                                      {murid.keterangan}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic">Biasa / Naik Kelas</span>
                                  )}
                                </td>
                                {!isReadOnly && (
                                  <td className="py-2 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => {
                                          setSelectedGuruWaliId(gw.id);
                                          setEditingMurid({ guruWaliId: gw.id, murid });
                                          setMuridNameInput(murid.nama);
                                          setMuridKelasInput(murid.kelas);
                                          setMuridKetInput(murid.keterangan || "");
                                          setIsMuridModalOpen(true);
                                        }}
                                        className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                                        title="Edit Murid"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMuridBimbingan(gw.id, murid.id, murid.nama)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                                        title="Hapus Murid"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Contents: MAPEL */}
        {activeSubTab === "mapel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((mapel, index) => (
              <div key={index} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-150 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-10 bg-indigo-600 rounded"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{mapel}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Mata Pelajaran Utama</span>
                  </div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => handleDeleteMapel(mapel)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-lg transition-all cursor-pointer"
                    title="Hapus Mapel"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab Contents: KELAS */}
        {activeSubTab === "kelas" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <div>
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Merekam {classes.length} Ruang Kelas Digital
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Klik pada salah satu kartu kelas di bawah untuk melihat daftar nama murid lengkap dengan NISN.
                </p>
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => {
                    const name = prompt("Masukkan nama kelas baru (Contoh: XII TKR C):");
                    if (!name) return;
                    const clean = name.trim().toUpperCase();
                    if (classes.includes(clean)) {
                      showStatus("Nama Kelas sudah terdaftar", "error");
                      return;
                    }
                    setClasses(prev => [...prev, clean].sort());
                    localStorage.setItem("simpati_classes_list", JSON.stringify([...classes, clean].sort()));
                    showStatus(`Kelas '${clean}' berhasil ditambahkan!`, "success");
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Kelas Baru
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {classes.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map((kelasName, index) => {
                const classStudents = getClassStudents(kelasName);
                const studentCount = classStudents.length;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedClassForModal(kelasName);
                      setClassModalSearch("");
                    }}
                    className="relative p-3.5 bg-white hover:bg-indigo-50/40 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between h-32 shadow-2xs hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-tight block">{kelasName}</span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">SMK Negeri 2 Konawe</span>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteKelas(kelasName);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-md transition-all cursor-pointer"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2 border-t border-slate-100 pt-2 flex items-end justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">Total Murid</span>
                        <span className={`text-base font-black block mt-0.5 ${studentCount > 0 ? "text-indigo-700" : "text-amber-600"}`}>
                          {studentCount} <span className="text-[10px] font-normal text-slate-400">Murid</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                        Detail <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tab Contents: JADWAL */}
        {activeSubTab === "jadwal" && (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4 font-black">Guru Mata Pelajaran</th>
                  <th className="py-3 px-4 font-black">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-black">Kelas Mengajar</th>
                  <th className="py-3 px-4 font-black">Hari / Waktu</th>
                  <th className="py-3 px-4 font-black">Semester</th>
                  <th className="py-3 px-4 text-right font-black">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {schedules.filter(sch => 
                  sch.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sch.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sch.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sch.semester.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                      Tidak ada jadwal mengajar ditemui. Saring pencarian lain atau tambahkan jadwal baru!
                    </td>
                  </tr>
                ) : (
                  schedules.filter(sch => 
                    sch.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sch.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sch.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sch.semester.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-55/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sch.teacherName}</td>
                      <td className="py-3.5 px-4 text-indigo-950 font-bold text-[11px]">{sch.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded text-[10px] uppercase border border-indigo-100">
                          {sch.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{sch.day}</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{sch.period}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded text-[9px] uppercase leading-none">
                          {sch.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isReadOnly ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border inline-flex items-center gap-1">
                            <Lock className="h-3 w-3 text-amber-600" /> Lihat Saja
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1 px-1">
                            <button
                              onClick={() => handleOpenEditJadwal(sch)}
                              className="p-1 px-2 hover:bg-indigo-50 hover:text-indigo-700 text-slate-400 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
                              title="Edit Jadwal"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span className="text-[10px] font-bold">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteJadwal(sch.id)}
                              className="p-1 px-2 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-lg transition-all cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Contents: GPS CALIBRATION */}
        {activeSubTab === "gps" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2.5">
                  <Compass className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Kalibrator Titik Koordinat Sekolah</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Lakukan kalibrasi titik koordinat pusat sekolah (Latitude & Longitude) serta radius toleransi absen. Guru hanya dapat melakukan absen jika berada di dalam area radius tersebut.
                </p>
              </div>

              <form onSubmit={handleSaveCalibration} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Latitude Pusat Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={calibratedLat}
                    onChange={(e) => setCalibratedLat(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-indigo-500"
                    placeholder="Contoh: -3.838139"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Longitude Pusat Sekolah
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={calibratedLon}
                    onChange={(e) => setCalibratedLon(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-indigo-500"
                    placeholder="Contoh: 122.041944"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Radius Toleransi Presensi
                    </label>
                    <span className="text-xs font-mono font-extrabold text-indigo-600">
                      {calibratedRadius} Meter
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="10"
                    value={calibratedRadius}
                    onChange={(e) => setCalibratedRadius(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                    <span>50m (Sangat Ketat)</span>
                    <span>1.5km (Sangat Longgar)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4 text-indigo-200" />
                    SIMPAN DAN TERAPKAN KALIBRASI
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCalibration}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset ke Default SMK Negeri 2 Konawe
                  </button>
                </div>
              </form>

              {/* Presets Calibration Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-2.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Daftar Preset Cepat</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setCalibratedLat(-3.8380461319668107);
                      setCalibratedLon(122.04194960321178);
                      setCalibratedRadius(700);
                      showStatus("Preset SMK Negeri 2 Konawe dipilih!", "success");
                    }}
                    className="p-2 border border-slate-100 hover:border-indigo-300 rounded-lg text-left bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    🏫 SMK Negeri 2 Konawe (Default)
                    <span className="block font-mono text-[8px] text-slate-400 font-normal mt-0.5">Sultra, ID</span>
                  </button>
                  <button
                    onClick={() => {
                      setCalibratedLat(-6.2088);
                      setCalibratedLon(106.8456);
                      setCalibratedRadius(500);
                      showStatus("Preset Jakarta Pusat dipilih!", "success");
                    }}
                    className="p-2 border border-slate-100 hover:border-indigo-300 rounded-lg text-left bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    🏢 DKI Jakarta Pusat
                    <span className="block font-mono text-[8px] text-slate-400 font-normal mt-0.5">Jakarta, ID</span>
                  </button>
                  <button
                    onClick={() => {
                      setCalibratedLat(-6.9175);
                      setCalibratedLon(107.6191);
                      setCalibratedRadius(300);
                      showStatus("Preset Bandung Raya dipilih!", "success");
                    }}
                    className="p-2 border border-slate-100 hover:border-indigo-300 rounded-lg text-left bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    ⛰️ Bandung Raya
                    <span className="block font-mono text-[8px] text-slate-400 font-normal mt-0.5">Bandung, Jabar</span>
                  </button>
                  <button
                    onClick={() => {
                      setCalibratedLat(-7.7956);
                      setCalibratedLon(110.3695);
                      setCalibratedRadius(600);
                      showStatus("Preset Yogyakarta dipilih!", "success");
                    }}
                    className="p-2 border border-slate-100 hover:border-indigo-300 rounded-lg text-left bg-slate-50/50 hover:bg-indigo-50/20 transition-all text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    👑 DI Yogyakarta
                    <span className="block font-mono text-[8px] text-slate-400 font-normal mt-0.5">Yogyakarta, DIY</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Map Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Visualisasi & Penanda Posisi Kalibrasi</span>
                <span className="text-[10px] text-slate-400 font-medium">Klik pada peta untuk memindahkan titik kalibrasi sekolah</span>
              </div>

              {hasValidKey && !mapAuthFailed ? (
                <MapErrorBoundary
                  fallback={
                    <div className="w-full border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 text-white relative shadow-md">
                      {/* Radar simulator graphic */}
                      <div className="h-[280px] w-full relative bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        
                        {/* Ring circles matching radius */}
                        <div className="absolute h-64 w-64 rounded-full border border-slate-800 animate-pulse"></div>
                        <div className="absolute h-44 w-44 rounded-full border border-indigo-900/40"></div>
                        
                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280">
                          {/* Grid cross lines */}
                          <line x1="200" y1="0" x2="200" y2="280" stroke="#1e293b" strokeWidth="1" />
                          <line x1="0" y1="140" x2="400" y2="140" stroke="#1e293b" strokeWidth="1" />
                          
                          {/* Interactive Calibration School Radius boundary */}
                          <circle cx="200" cy="140" r={Math.max(20, Math.min(120, calibratedRadius * 0.12))} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                          <circle cx="200" cy="140" r={Math.max(20, Math.min(120, calibratedRadius * 0.12))} fill="#6366f1" fillOpacity="0.08" />
                          
                          {/* Calibration marker */}
                          <circle cx="200" cy="140" r="5" fill="#6366f1" />
                          <circle cx="200" cy="140" r="12" fill="none" stroke="#6366f1" strokeWidth="1" className="animate-ping" opacity="0.5" />
                          <text x="210" y="144" fill="#6366f1" className="text-[10px] font-black tracking-wide uppercase">TITIK PUSAT SEKOLAH (KALIBRASI)</text>
                          
                          {/* Text showing active coordinates */}
                          <text x="15" y="255" fill="#94a3b8" className="text-[9px] font-mono">Lat: {calibratedLat}</text>
                          <text x="15" y="268" fill="#94a3b8" className="text-[9px] font-mono">Lon: {calibratedLon}</text>
                          <text x="280" y="268" fill="#6366f1" className="text-[10px] font-mono font-bold">Radius: {calibratedRadius}m</text>
                        </svg>

                        <div className="absolute top-3 left-3 bg-indigo-950/80 border border-indigo-800 text-[10px] px-2.5 py-1 rounded-md font-mono text-indigo-300">
                          Kalibrator Satelit Offline Simulator
                        </div>
                      </div>

                      {/* API Setup Advice */}
                      <div className="p-5 bg-slate-900 text-[11px] leading-relaxed">
                        <div className="flex gap-2 items-start text-amber-400 font-bold mb-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <span>Peta Interaktif Gagal Dimuat - Mengaktifkan Mode Simulator</span>
                        </div>
                        <p className="text-slate-300 text-[10px]">
                          Peta interaktif tidak dapat dimuat karena Google Maps API belum aktif (ApiNotActivatedMapError) atau kunci tidak valid. Halaman kalibrasi kembali menggunakan simulator offline di atas agar Anda tetap dapat melakukan administrasi secara normal.
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-50 shadow-inner">
                    <APIProvider apiKey={API_KEY} version="weekly">
                      <GoogleMap
                        defaultCenter={{ lat: calibratedLat, lng: calibratedLon }}
                        center={{ lat: calibratedLat, lng: calibratedLon }}
                        defaultZoom={15}
                        mapId="ADMIN_MAP_ID"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: "100%", height: "100%" }}
                        gestureHandling="cooperative"
                        zoomControl={true}
                        mapTypeControl={true}
                        scaleControl={true}
                        streetViewControl={true}
                        fullscreenControl={true}
                        onClick={(e) => {
                          if (e.detail.latLng) {
                            setCalibratedLat(parseFloat(e.detail.latLng.lat.toFixed(6)));
                            setCalibratedLon(parseFloat(e.detail.latLng.lng.toFixed(6)));
                          }
                        }}
                      >
                        <AdvancedMarker
                          position={{ lat: calibratedLat, lng: calibratedLon }}
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setCalibratedLat(parseFloat(e.latLng.lat().toFixed(6)));
                              setCalibratedLon(parseFloat(e.latLng.lng().toFixed(6)));
                            }
                          }}
                          title="Titik Kalibrasi SMK Negeri 2 Konawe"
                        >
                          <Pin background="#4f46e5" glyphColor="#fff" borderColor="#3730a3" />
                        </AdvancedMarker>
                        <MapCircle center={{ lat: calibratedLat, lng: calibratedLon }} radius={calibratedRadius} />
                      </GoogleMap>
                    </APIProvider>
                  </div>
                </MapErrorBoundary>
              ) : (
                <div className="w-full border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 text-white relative shadow-md">
                  {/* Radar simulator graphic */}
                  <div className="h-[280px] w-full relative bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {/* Ring circles matching radius */}
                    <div className="absolute h-64 w-64 rounded-full border border-slate-800 animate-pulse"></div>
                    <div className="absolute h-44 w-44 rounded-full border border-indigo-900/40"></div>
                    
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 280">
                      {/* Grid cross lines */}
                      <line x1="200" y1="0" x2="200" y2="280" stroke="#1e293b" strokeWidth="1" />
                      <line x1="0" y1="140" x2="400" y2="140" stroke="#1e293b" strokeWidth="1" />
                      
                      {/* Interactive Calibration School Radius boundary */}
                      <circle cx="200" cy="140" r={Math.max(20, Math.min(120, calibratedRadius * 0.12))} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                      <circle cx="200" cy="140" r={Math.max(20, Math.min(120, calibratedRadius * 0.12))} fill="#6366f1" fillOpacity="0.08" />
                      
                      {/* Calibration marker */}
                      <circle cx="200" cy="140" r="5" fill="#6366f1" />
                      <circle cx="200" cy="140" r="12" fill="none" stroke="#6366f1" strokeWidth="1" className="animate-ping" opacity="0.5" />
                      <text x="210" y="144" fill="#6366f1" className="text-[10px] font-black tracking-wide uppercase">TITIK PUSAT SEKOLAH (KALIBRASI)</text>
                      
                      {/* Text showing active coordinates */}
                      <text x="15" y="255" fill="#94a3b8" className="text-[9px] font-mono">Lat: {calibratedLat}</text>
                      <text x="15" y="268" fill="#94a3b8" className="text-[9px] font-mono">Lon: {calibratedLon}</text>
                      <text x="280" y="268" fill="#6366f1" className="text-[10px] font-mono font-bold">Radius: {calibratedRadius}m</text>
                    </svg>

                    <div className="absolute top-3 left-3 bg-indigo-950/80 border border-indigo-800 text-[10px] px-2.5 py-1 rounded-md font-mono text-indigo-300">
                      Kalibrator Satelit Offline Simulator
                    </div>
                  </div>

                  {/* API Setup Advice */}
                  <div className="p-5 bg-slate-900 text-[11px] leading-relaxed">
                    <div className="flex gap-2 items-start text-amber-400 font-bold mb-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <span>Mode Simulator Aktif - Peta Riil Memerlukan Google Maps API Key</span>
                    </div>
                    <p className="text-slate-300">
                      Agar peta satelit Google Maps interaktif aktif di halaman ini, harap simpan Google Maps API Key Anda ke dalam Secrets:
                    </p>
                    <ol className="list-decimal list-inside text-slate-400 mt-1.5 space-y-1 pl-1">
                      <li>Buka <strong className="text-white">Settings (⚙️)</strong> di pojok kanan atas layar ini.</li>
                      <li>Pilih menu <strong className="text-white">Secrets</strong>.</li>
                      <li>Tambahkan secret bernama <code className="bg-slate-800 text-white px-1 py-0.5 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY</code>.</li>
                      <li>Isi dengan API Key Google Cloud Platform Anda lalu klik Simpan.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Editor Modal for Adding / Editing Murid & Guru */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-yellow-400" />
                  <h3 className="font-bold text-sm tracking-tight capitalize">
                    {editingId ? "Edit" : "Daftarkan"} {editType === "siswa" ? "Data Murid Baru" : editType === "guru" ? "Profil Pendidik Guru" : "Jadwal Mengajar Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer transition-all"
                >
                  Batal
                </button>
              </div>

              {/* Form container */}
              {editType === "siswa" ? (
                <form onSubmit={handleSaveSiswa} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Foto Profil Murid</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                          {siswaForm.photoUrl ? (
                            <img src={siswaForm.photoUrl} alt="Foto Murid" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap gap-2 items-center">
                            <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Unggah Foto Murid</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageFile(file, 400, 400, 0.8);
                                      setSiswaForm(prev => ({ ...prev, photoUrl: compressed }));
                                    } catch (err) {
                                      console.error("Error compressing photo:", err);
                                    }
                                  }
                                }}
                              />
                            </label>
                            {siswaForm.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setSiswaForm(prev => ({ ...prev, photoUrl: "" }))}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">Format: JPG, PNG, WEBP. Maks 5MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Lengkap Murid</label>
                      <input
                        type="text"
                        required
                        value={siswaForm.name}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contoh: Aditya Pratama"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nomor Induk Murid (NIS)</label>
                      <input
                        type="text"
                        required
                        value={siswaForm.nis}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, nis: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">NISN</label>
                      <input
                        type="text"
                        required
                        value={siswaForm.nisn}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, nisn: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Kelas Digital</label>
                      <select
                        value={siswaForm.className}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, className: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        {classes.map((cls, i) => (
                          <option key={i} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Konsentrasi Keahlian / Jurusan</label>
                      <input
                        type="text"
                        value={siswaForm.major}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, major: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-2">TTL & Kontak Murid</span>
                      <BirthDateSelector
                        birthPlace={siswaForm.birthPlace}
                        birthDate={siswaForm.birthDate}
                        onPlaceChange={(place) => setSiswaForm(prev => ({ ...prev, birthPlace: place }))}
                        onDateChange={(dateIso) => setSiswaForm(prev => ({ ...prev, birthDate: dateIso }))}
                        minYear={1995}
                        maxYear={2026}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Jenis Kelamin</label>
                      <select
                        value={siswaForm.gender}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Agama</label>
                      <select
                        value={siswaForm.religion}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, religion: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Budha">Budha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">No. HP / WhatsApp Murid</label>
                      <input
                        type="text"
                        value={siswaForm.whatsApp}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, whatsApp: e.target.value }))}
                        placeholder="Contoh: 081234567890"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-750"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">No. HP / WhatsApp Orang Tua</label>
                      <input
                        type="text"
                        value={siswaForm.parentWhatsApp}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, parentWhatsApp: e.target.value }))}
                        placeholder="Contoh: 081298765432"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-750"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Alamat Rumah Lengkap</label>
                      <textarea
                        rows={2}
                        value={siswaForm.address}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Isi alamat tempat tinggal murid..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-2">Orang Tua & Wali Murid</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Ayah Kandung</label>
                      <input
                        type="text"
                        value={siswaForm.fatherName}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, fatherName: e.target.value }))}
                        placeholder="Nama lengkap ayah..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={siswaForm.fatherOccupation}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                        placeholder="Pekerjaan ayah..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Ibu Kandung</label>
                      <input
                        type="text"
                        value={siswaForm.motherName}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, motherName: e.target.value }))}
                        placeholder="Nama lengkap ibu..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={siswaForm.motherOccupation}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, motherOccupation: e.target.value }))}
                        placeholder="Pekerjaan ibu..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Wali Terdaftar</label>
                      <input
                        type="text"
                        value={siswaForm.parentName}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, parentName: e.target.value }))}
                        placeholder="Nama wali jika tinggal bersama wali..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-750 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Status Keaktifan</label>
                      <select
                        value={siswaForm.statusActive}
                        onChange={(e) => setSiswaForm(prev => ({ ...prev, statusActive: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-800"
                      >
                        <option value="Aktif">Aktif Belajar</option>
                        <option value="Mutasi">Mutasi Keluar</option>
                        <option value="Keluar">Keluar / Dropout</option>
                        <option value="Lulus">Lulus / Alumni</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="px-4.5 py-2 border border-slate-200 rounded-xl text-slate-550 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" /> Simpan Data
                    </button>
                  </div>
                </form>
              ) : editType === "guru" ? (
                <form onSubmit={handleSaveGuru} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Foto Profil Guru / Staf</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                          {guruForm.photoUrl ? (
                            <img src={guruForm.photoUrl} alt="Foto Guru" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap gap-2 items-center">
                            <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Unggah Foto Guru</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageFile(file, 400, 400, 0.8);
                                      setGuruForm(prev => ({ ...prev, photoUrl: compressed }));
                                    } catch (err) {
                                      console.error("Error compressing photo:", err);
                                    }
                                  }
                                }}
                              />
                            </label>
                            {guruForm.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setGuruForm(prev => ({ ...prev, photoUrl: "" }))}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">Format: JPG, PNG, WEBP. Pasfoto resmi pendidik atau staf.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Lengkap Guru (Beserta Gelar)</label>
                      <input
                        type="text"
                        required
                        value={guruForm.name}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contoh: Alam, S.Pd. (Opa Alam)"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">NIP (Nomor Induk Pegawai)</label>
                      <input
                        type="text"
                        value={guruForm.nip}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, nip: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">NUPTK</label>
                      <input
                        type="text"
                        value={guruForm.nuptk}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, nuptk: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Peran Kerja Utama / Mata Pelajaran</label>
                      <select
                        value={guruForm.subject}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        {subjects.filter(sub => {
                          const isBk = (guruForm.name || "").toLowerCase().includes("cici") || 
                                       (guruForm.name || "").toLowerCase().includes("yoga") || 
                                       (guruForm.role || "").toLowerCase().includes("bk") || 
                                       (guruForm.subject || "").toLowerCase().includes("bk") || 
                                       (guruForm.subject || "").toLowerCase().includes("bimbingan");
                          if (isBk && (sub === "Guru Mapel" || sub === "Guru Mata Pelajaran")) {
                            return false;
                          }
                          return true;
                        }).map((sub, i) => (
                          <option key={i} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Jabatan / Peran Tambahan</label>
                      <input
                        type="text"
                        value={guruForm.role}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Contoh: Guru Produktif & Wali Kelas"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-semibold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nomor WhatsApp Aktif</label>
                      <input
                        type="text"
                        required
                        value={guruForm.whatsApp}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, whatsApp: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">Tempat & Tanggal Lahir Pendidik</span>
                      <BirthDateSelector
                        birthPlace={guruForm.birthPlace}
                        birthDate={guruForm.birthDate}
                        onPlaceChange={(place) => setGuruForm(prev => ({ ...prev, birthPlace: place }))}
                        onDateChange={(dateIso) => setGuruForm(prev => ({ ...prev, birthDate: dateIso }))}
                        minYear={1950}
                        maxYear={2026}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Alamat Email Resmi</label>
                      <input
                        type="email"
                        value={guruForm.email}
                        onChange={(e) => setGuruForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="nama@smkn2konawe.sch.id"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-705"
                      />
                    </div>

                    {/* Class checklist mapping */}
                    <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 pt-4">
                      <label className="text-[10px] font-black text-indigo-750 uppercase tracking-wider block mb-1">Daftar Kelas yang Diajar (Klik untuk Pilih)</label>
                      <div className="grid grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {classes.map((cls, i) => {
                          const isAssigned = guruForm.classes.includes(cls);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleToggleClassForGuru(cls)}
                              className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                                isAssigned 
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                                  : "bg-white border-slate-200 text-slate-655 hover:bg-slate-100"
                              }`}
                            >
                              {cls}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="px-4.5 py-2 border border-slate-200 rounded-xl text-slate-550 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" /> Simpan Guru
                    </button>
                  </div>
                </form>
              ) : editType === "jadwal" ? (
                <form onSubmit={handleSaveJadwal} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Pilih Guru Mata Pelajaran</label>
                      <select
                        required
                        value={jadwalForm.teacherId}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, teacherId: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Guru --</option>
                        {teachers.map((teach) => (
                          <option key={teach.id} value={teach.id}>{teach.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Mata Pelajaran yang Diajarkan</label>
                      <select
                        required
                        value={jadwalForm.subject}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                        {subjects.map((sub, i) => (
                          <option key={i} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Kelas Mengajar</label>
                      <select
                        required
                        value={jadwalForm.className}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, className: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Kelas --</option>
                        {classes.map((cls, i) => (
                          <option key={i} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Hari Mengajar</label>
                      <select
                        required
                        value={jadwalForm.day}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, day: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Jam Belajar / Alokasi Waktu</label>
                      <input
                        type="text"
                        required
                        value={jadwalForm.period}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, period: e.target.value }))}
                        placeholder="Contoh: Jam 1-4 (07:15 - 10:15)"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Semester / Tahun Ajaran</label>
                      <select
                        required
                        value={jadwalForm.semester}
                        onChange={(e) => setJadwalForm(prev => ({ ...prev, semester: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-bold text-slate-850 cursor-pointer"
                      >
                        <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
                        <option value="Genap 2026/2027">Genap 2026/2027</option>
                        <option value="Ganjil 2027/2028">Ganjil 2027/2028</option>
                        <option value="Genap 2027/2028">Genap 2027/2028</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="px-4.5 py-2 border border-slate-200 rounded-xl text-slate-550 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" /> Simpan Jadwal
                    </button>
                  </div>
                </form>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Importer Modal */}
      <AnimatePresence>
        {isImporterOpen && (
          <ScheduleImporterModal
            isOpen={isImporterOpen}
            onClose={() => setIsImporterOpen(false)}
            onImport={(importedSchedules) => {
              setSchedules(prev => {
                const filteredNew = importedSchedules.filter(newSch => 
                  !prev.some(existing => 
                    existing.day === newSch.day && 
                    existing.className === newSch.className && 
                    existing.period === newSch.period
                  )
                );
                
                if (filteredNew.length < importedSchedules.length) {
                  showStatus(`Berhasil mengimpor ${filteredNew.length} jadwal pelajaran baru. ${importedSchedules.length - filteredNew.length} jadwal dilewati karena sudah ada.`);
                } else {
                  showStatus(`Berhasil mengimpor ${filteredNew.length} jadwal pelajaran baru dari SMK Negeri 2 Konawe.`);
                }
                
                return [...prev, ...filteredNew];
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left"
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

      {/* PDF Master Data Document Importer Modal */}
      <DocumentPdfImporterModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultFileType={pdfModalType}
        onImportTeachers={handlePdfImportGuru}
        onImportStudents={handlePdfImportStudents}
        onImportSubjects={handlePdfImportSubjects}
        existingClasses={classes}
      />

      {/* Student QR Card Generator & Print Modal */}
      <CetakKartuQrModal
        isOpen={isStudentQrModalOpen}
        onClose={() => setIsStudentQrModalOpen(false)}
        students={students}
        initialClass={studentQrModalClass}
      />

      {/* Class Student List Modal */}
      <AnimatePresence>
        {selectedClassForModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md border border-indigo-500 shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black tracking-tight text-white">Daftar Murid Kelas {selectedClassForModal}</h3>
                      <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {getClassStudents(selectedClassForModal).length} Murid
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Data Resmi Murid SMK Negeri 2 Konawe (NISN & Identitas)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClassForModal(null)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Action & Filter Bar */}
              <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NISN..."
                    value={classModalSearch}
                    onChange={(e) => setClassModalSearch(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        handleOpenAddSiswa(selectedClassForModal);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah Murid
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setStudentQrModalClass(selectedClassForModal);
                      setIsStudentQrModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5 text-indigo-600" />
                    Cetak Kartu QR
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    Cetak
                  </button>
                </div>
              </div>

              {/* Modal Body: Table */}
              <div className="overflow-y-auto p-6 flex-1">
                {(() => {
                  const classStudents = getClassStudents(selectedClassForModal);
                  const filtered = classStudents.filter(s =>
                    s.name.toLowerCase().includes(classModalSearch.toLowerCase()) ||
                    (s.nisn && s.nisn.includes(classModalSearch)) ||
                    (s.nis && s.nis.includes(classModalSearch))
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-400 space-y-2">
                        <Users className="h-10 w-10 mx-auto text-slate-300" />
                        <p className="text-sm font-bold text-slate-600">
                          {classStudents.length === 0 ? `Belum ada murid terdaftar di kelas ${selectedClassForModal}` : "Tidak ditemukan murid yang cocok dengan pencarian."}
                        </p>
                        <p className="text-xs text-slate-400">
                          {classStudents.length === 0 ? "Klik tombol 'Tambah Murid' di atas untuk memasukkan murid ke kelas ini." : "Coba kata kunci pencarian lain."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-[10px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-3 text-center w-12 font-black">No</th>
                            <th className="py-3 px-4 font-black">NISN</th>
                            <th className="py-3 px-3 font-black">NIS</th>
                            <th className="py-3 px-4 font-black">Nama Murid</th>
                            <th className="py-3 px-3 text-center font-black">L/P</th>
                            <th className="py-3 px-4 font-black">Kontak WA</th>
                            {!isReadOnly && <th className="py-3 px-4 text-right font-black">Aksi</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {filtered.map((student, idx) => (
                            <tr key={student.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="py-3 px-3 text-center font-extrabold text-slate-400 text-[11px]">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <span className="font-mono font-black text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-150 text-[11px]">
                                  {student.nisn || "-"}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500 font-semibold text-[11px]">
                                {student.nis || "-"}
                              </td>
                              <td className="py-3 px-4 font-extrabold text-slate-900 uppercase">
                                {student.name}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-600">
                                {student.gender === "Perempuan" ? "P" : "L"}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                                {student.whatsApp || student.parentWhatsApp || "-"}
                              </td>
                              {!isReadOnly && (
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => {
                                        handleOpenEditSiswa(student);
                                      }}
                                      className="p-1.5 hover:bg-indigo-50 hover:text-indigo-700 text-slate-400 rounded-lg transition-all cursor-pointer"
                                      title="Edit Murid"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSiswa(student.id, student.name)}
                                      className="p-1.5 hover:bg-red-50 hover:text-red-700 text-slate-400 rounded-lg transition-all cursor-pointer"
                                      title="Hapus Murid"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span>
                  Total {getClassStudents(selectedClassForModal).length} murid di kelas <strong>{selectedClassForModal}</strong>
                </span>
                <button
                  onClick={() => setSelectedClassForModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Tambah / Edit Guru Wali */}
      <AnimatePresence>
        {isGuruWaliModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {editingGuruWali ? "Edit Data Guru Wali" : "Tambah Guru Wali Baru"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">SK Kepala SMK Negeri 2 Konawe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuruWaliModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGuruWali} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Guru Wali & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={guruWaliNameInput}
                    onChange={(e) => setGuruWaliNameInput(e.target.value)}
                    placeholder="Contoh: Syamsul Sabir, S.Kom"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsGuruWaliModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Simpan Guru Wali
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Tambah / Edit Murid Bimbingan */}
      <AnimatePresence>
        {isMuridModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {editingMurid ? "Edit Data Murid Bimbingan" : "Tambah Murid Bimbingan Baru"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Binaan Guru Wali SMK Negeri 2 Konawe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMuridModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMuridBimbingan} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Murid Bina *
                  </label>
                  <input
                    type="text"
                    required
                    value={muridNameInput}
                    onChange={(e) => setMuridNameInput(e.target.value)}
                    placeholder="Contoh: AHMAD FAUSAN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Digital *
                  </label>
                  <select
                    value={muridKelasInput}
                    onChange={(e) => setMuridKelasInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  >
                    {OFFICIAL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={muridKetInput}
                    onChange={(e) => setMuridKetInput(e.target.value)}
                    placeholder="Contoh: TDK NAIK (Atau kosongkan)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMuridModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Simpan Murid Bimbingan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
