/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  ClipboardList, 
  Check, 
  UserPlus, 
  Trash2, 
  RotateCcw, 
  Send, 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  AlertCircle, 
  TrendingUp, 
  Search,
  CheckCircle,
  FileText,
  UserCheck,
  GraduationCap,
  Clock,
  LogIn,
  LogOut,
  FileSpreadsheet,
  AlertTriangle,
  Camera,
  Upload,
  MapPin,
  Compass,
  RefreshCw,
  Share2,
  Copy,
  Link,
  ExternalLink
} from "lucide-react";
import { dbService } from "../firebase";
import { TeachingSchedule } from "../types";
import { getTeacherMatchedSchedules, getStoredSchedules, normalizeName, getTeacherPerwalianClass, isSameTeacherName } from "../utils/scheduleHelper";
import { MOCK_STUDENTS } from "../mockData";
import { getStudentCaptainClass } from "../data/classCaptains";
import { getMasterGuruWaliData } from "../data/guruWaliMasterData";
import { InteractiveAttendanceMap } from "./InteractiveAttendanceMap";
import { notifyStudentAttendanceInstant, notifyClassAttendanceSummary } from "../services/whatsappFonnteService";
import { AttendanceScheduleInfoCard } from "./AttendanceScheduleInfoCard";

// Haversine formula to calculate distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // returns distance in meters
}

// The classes explicitly requested by the user
const LIST_OF_CLASSES = [
  // Grade X
  "X TKR A", "X TKR B", "X TSM", "X TAV", "X DPIB", "X DKV",
  // Grade XI
  "XI TKR A", "XI TKR B", "XI TSM A", "XI TSM B", "XI DPIB", "XI TAV", "XI DKV",
  // Grade XII
  "XII TKR A", "XII TKR B", "XII TSM", "XII TAV", "XII DPIB"
];

// Default clean pre-populated lists so the user doesn't start with a blank list
export const DEFAULT_CLASS_STUDENTS: Record<string, string[]> = {
  "X TKR A": [
    "ABD. AZIZ", "AIMAN", "ALEXA AL MUBARAK", "ALFIN SEPRIANTO", "ANAK AGUNG MADE ARTHA GINA",
    "BAGUS WICAKSONO", "DIMAS MUHAMAD ILYAS", "FERDI ADRIAN", "GEDE PRAYADYA", "JUNA BASTIAN",
    "KETUT ARDIANA", "KHOIRUDDIN", "KOMANG PRANATA", "MUH OCTARIANSYAH ALFATIR", "MUH. BAIM AKBAR",
    "MUH. FAHMI ADZAN", "MUH. MAULANA", "MUH. RAYHAN AL IRSYAD", "MUH. REZA ALFIQAR", "MUH. ZAKIR ASSAJAD",
    "MUHAMMAD IRSYAD", "MUHAMMAD RIZAL", "NIKODEMUS SEPTIANTO", "NUR ALIMANSYAH", "NYOMAN SUGIE HARTHA",
    "REZAL HERFIANSYAH", "SAHRUL"
  ],
  "X TKR B": [
    "AGHNAN SUGIAR AZHARY", "AKSAH NURPRANANSAH", "ALFIAN SYAHRUL M.", "ALVIN SABATINO", "ANDI MUHAMMAD HAEKAL",
    "BAGAS PANJI SAMUDRA", "BASO SABRIN", "FAIZ ALWAN FAHYAAD", "FRANANDA KURNIA ALFAROBI", "ISMAIL",
    "KADEK DWI SUPRIYANTO", "KETUT JULIANTO", "KIANDRA ADI PRASTYA", "MADE INDRA SAPUTRA", "MUH. ALDI",
    "MUH. DWI APRILIANO", "MUH. FORLAND", "MUH. PUTRA ALRIFKI", "MUH. RENALDI P", "MUH. SAFII ADITYA",
    "MUHAMAD NISWAR", "MUHAMMAD NUR ALAM MATTOREANG", "NANDA FEBRIAN", "NATA PARWATA", "NENGAH ARYA DWI ARTHA",
    "REFAN HERMAWAN", "RIFKI RAMDANI", "WAYAN BAYU ADITYA"
  ],
  "X TSM": [
    "ABI AHZARIF", "ADITYA PRATAMA", "AHMAD IRWAN SAPUTRA", "AKIL NUR", "ALDO ALFIANTO",
    "ARJUN HIRMANSA", "ARPAN", "FAREL ANANTA", "GUSTI RAKA PRATAMA", "IGNASIUS HENDRA GUNAWAN",
    "JANR ARISTO MATIUS", "KADEK ADI DARMAWAN", "M. HAFID ALFINSYAH", "MADE WIRA NATA", "MUH. ALFA RISKY",
    "MUH. ALVHINO APRILLIO", "MUH. DESTA", "MUH. FAID HIBBAN", "MUH. FITRAHTULLAH RAHMAN", "MUH. ILHAM IMANSYAH",
    "MUH. RIZAL", "MUH. WAHYU HALULANGA", "MUH. YOMI ALFADJRIN", "MUHAMAD ANUGRA", "MUHAMMAD IQBAL",
    "MUHAMMAD RAMADHAN REFANDYBTOONDO", "RENDY ADITIA", "RESKI ARDI", "REVAN ARSYAD APRIANSYAH", "RIKI FERDIAN",
    "RIZKY ARDIANSYAH AL-FAUZI", "SAIFUDIN DIKA PRATAMA", "SULFITRA RAHARJO", "WALDY DWI DAFANSYAH"
  ],
  "X TAV": [
    "AHMAD NUR LATIF", "MUH. IRFAN", "MUHAMMAD BAGAS RIFALDI", "NARENDRA JYOTIS KAMA.", "RIDO AKBAR MAULANA"
  ],
  "X DPIB": [
    "ANDI ARIAH SAPUTRA", "HANAN AFIF", "MUH. KHAYRAN AFFAN S.", "MUHAMMAD ALRASYID", "NIA ANISA PUTRI"
  ],
  "X DKV": [
    "CHINOVAN DWI CAHYA", "DANIEL FREDY TUNGADY", "MUHAMAMAD SOFY IFAN HIDAYAT", "MUHAMMAD NANDA SEPRIAN"
  ],

  "XI TKR A": [
    "ABDUL FATHIR AL-FATH", "ABI DWI SANJAYA", "ALFONSUS JIMMY KRISTIANO", "ALHAFID", "ARIADI DIDIK NANTA",
    "FADIL FAIT", "FEBRIAN", "FITRA TEGUH SETYAWAN", "GEDE KEVIN", "IHWAL",
    "IWAN GUNAWAN", "KOMANG SUARSANA", "LATIF SUGIARTO", "M. RIZKY MAULANA", "MADE SUADITA YASA",
    "MOCH. FAKHRI PUTRA NURSYA WIDYA", "MUH ASDAR", "MUH. ADRIAN SAFUTRA", "MUH. AKBAR", "MUH. FAHMI ALFAROBI",
    "MUHAMAD SHIDIQ FATHONI", "REHAN JAENURI", "RIFKY FEBRIYANTO", "RONAL SETIAWAN", "VERI SUDANA"
  ],
  "XI TKR B": [
    "ABDURAFI ASRIFIN", "ABDULRAHMAN SINDALIWU", "ABI SAIFUL ANZHOR", "ADI GUNA", "ALIF EMERALDI KURNIAWAN",
    "ALOISIUS REVANT GONSALES", "ARFIQUN AL FATURRAHMAN", "BAYU", "DIPA PRATAMA", "FAIZ NUR AFRIANZAH",
    "FERDIANSYAH", "GEDE AGUS PRAYOGA", "HESSA ADRIANSYAH", "I WAYAN WARDANA", "ILHAM NUR FAJAR",
    "JARNO MUHAMMAD ARIFIN", "MADE KEFIN", "MAXIMUS WIADNYANA", "MUH. ADIBINTANG", "MUH. FADJRIANSYAH",
    "MUH. FATUR RAHMAN", "MUH. FIKAL EFFENDY", "MUH. RESKY ANUGRAH", "MUH. ARIPAN", "MUHAMMAD RANGGA",
    "NABIL ALFATAH", "REHAN AGUS PRAYOGA", "REZZA BRIAN DINATA", "ROLANSYAH", "UJANG DIDI SURYADI", "YUSRIANTO"
  ],
  "XI TSM A": [
    "A. ZULKIFLI", "ADIL SAPUTRA", "ADILLA AL FATH", "AKSEL", "ALFAREL BINTANG PRATAMA",
    "ANDI MUH. AFKAR DZAKIY", "ANDRA EFRON'K", "BAGAS ARI WASITO", "CIKO PEBRIAN", "EDRIYANSAH SYALIN",
    "GRACE STEFANUS JOY", "HENGKI APRIANSYAH", "ILHAM PUTRAWAN", "KADEK MULYANTARA", "LAODE MUHAMAD ILHAM PAJAR HASRI",
    "MUH. ADRIL IQBAL", "MUH. ALBIANSYA", "MUH. DAHLAN", "MUH. FADHIL", "MUH. FATWA MALAIKA",
    "MUH. ILHAM", "MUH. SAKTI MUHARRAM", "MUH. VINO PRAYOGI", "MUHAMMAD", "NIZAR ZULMI FATHURRAHMAN",
    "RAYHAN AL-FAHRI", "REIN AZHAR", "SABARUDDIN", "SANDY SEPRIANSYAH", "SULTAMA FADLI RAMADHAN", "TEGUH PRASETIO"
  ],
  "XI TSM B": [
    "ADI BAGAS SAPUTRA", "AHMAD FADLAN", "ALFANDI", "ANDI BASO FIKRI", "ANDIKA SAPUTRA",
    "ASRAN ASIS", "BILAL AL ZIQRI", "DANI SAPUTRA", "FADIL SAPUTRA", "FILIPUS PIKCA",
    "GUSTI ASTA PRASATYA", "IMRAN", "M. ADIL", "MIFTAHUL ICKSAN", "MUH. ARJA ARDIANSYAH",
    "MUH. FARHAN JUNIAWAN", "MUHAMMAD NUR AQSAL", "RADIT REZA SAPUTRA", "RAHMATULLAH", "RANGGA",
    "RESKI ADITIA SAPUTRA", "SAEFUL HUDA", "SILFARO RAMADHAN", "SYAHRIL", "TIRTA RAMADAN"
  ],
  "XI TAV": [
    "ALPIANSYAH GANI", "RENDI AWAN", "KELANA TEGUH RAHARJA", "KETUT ARIA REDIAWAN"
  ],
  "XI DPIB": [
    "HAFIS IBRAHIM", "HARDIKA", "MUHAMMAD RAFLI MARAMIS", "SERIN", "TYAS PUTRI PRAMESTI"
  ],
  "XI DKV": [
    "MUHAMMAD REVAN AL-FAHQREZI", "REVA OLIVVATUL SAIDA", "ROBIATUL ADAWIYAH", "SYAHRUL RAMADHAN"
  ],

  "XII TKR A": [
    "ABD. GOPUR", "ADE PUTRA JASMAN", "ADITYA SAPUTRA", "AKBAR. S", "ARFAEL PRATAMA",
    "DIMAS APRIANSYAH", "DANY SAPUTRA", "FADLI ANDI PRASETYO", "FENDI JULIANSYAH", "FIRNANDA SATRIO WICAKSONO",
    "GENTA NEO ACTARA", "KADEK ADISETIAWAN", "MADE ARDIKA WIRAWAN", "MUH. ASRUL", "MUH. ILHAM IZMUL IZAM",
    "MUH. RIFKI", "MUHAMMAD RIZKY FEBRIANSYAH", "NUR ALAM", "RAMA FITRIANDANU", "REPAN",
    "REYHAN PRATAMA RIANTO", "SANJAYA", "SHAEQAL EFRANDA EKADITYA", "WAWAN HIDAYAT", "ZULHAJI FAJRIN"
  ],
  "XII TKR B": [
    "AHMAD NAZRIEL", "AL FAIRA", "ALIF", "ANDI ASHAR", "BASO ASNUR",
    "DAMASUS SUTANTO", "DIMAS", "FAHRESA ADITYA PRATAMA", "FIKHAL DZUHRAINI", "GEDE YOGA PRAMANA",
    "KADEK FEBRI ANDIKA", "KRISTIAN TANAN", "M. NADIP JOVALDI", "MIFTAKHUR ROZAK", "MUH. ANDIKA",
    "MUHAMAD HANAFI", "MUHAMAD SAHRIL APRILIAN", "NAJUAN ARTHA PRATAMA", "PUTU RIZKY OKTAPIAN", "RAFI DWI NURAJI",
    "RAHMADDANI", "REPAN MARIO ARDIANSYAH", "SUDRAJAT MURDANI", "TRIWIRA NATA WIJAYA", "VAREL", "WHILY BHIRA MALDHANI"
  ],
  "XII TSM": [
    "ELVANUS", "FERDY", "GUNARTO", "IBRAHIM", "JELY HINO",
    "KADEK BAYU SANDI", "KADEK PAJAR", "KOMANG SURYA", "MUH. AFDAL USMAN", "MUH. ALIF ALFIANSYAH",
    "MUH. FHAUZRIL MAYORO", "MUH. RIDWAN", "NYOMAN AGUS SUJANA", "PUTU HERI PRATAMA", "RAFKY IBNU HIDAYAH",
    "RAFLI ADRIYANSAH", "RANGGA PRAMONO"
  ],
  "XII TAV": [
    "ABDUL FADLI", "ANTONIAS", "DWI SURAJAB", "Fatma Yani", "GALIH ADI PRATAMA",
    "GEDE ARDIKA SUDANA YASA", "HENRI", "IKSAN NUR AJI", "ILHAM", "MUH. FADHIL ADITYA",
    "MUH. REZKI RAMADHAN", "NOTO TRIATMOJO", "PAISAL", "SYAHLAN", "WAHYU"
  ],
  "XII DPIB": [
    "Ade Agus Wila Kusuma", "AKBAR", "AURA NURAFIFA", "CHEZAR PRADITA.S", "ELZI",
    "HASDIAN GANI", "KESYA VANIA SAFIRA", "M. Ridwan H.", "MUH. IDAM ALFATIH", "NAJWA AZ-ZAHRA",
    "TASYA PUTRI APRILIA", "TIARA HANIM PRATIWI", "WAHYUDI", "ZAKI MUAMAR"
  ]
};

interface StudentAttendanceRecord {
  id: string;
  name: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alfa";
}

interface SavedAttendanceLog {
  id: string;
  date: string;
  className: string;
  subject: string;
  records: StudentAttendanceRecord[];
}

interface StudentAttendanceProps {
  isAdmin?: boolean;
  currentRole?: string;
  username?: string;
}

export function StudentAttendance({ 
  isAdmin = false,
  currentRole = "guru",
  username = ""
}: StudentAttendanceProps) {
  const [mapAuthFailed, setMapAuthFailed] = useState(false);

  useEffect(() => {
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failure detected in StudentAttendance");
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

  const [activeClasses] = useState<string[]>(() => {
    const saved = localStorage.getItem("simpati_classes_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return LIST_OF_CLASSES;
  });

  const [activeSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("simpati_subjects_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      "Pemeliharaan Mesin Kendaraan Ringan",
      "Teknik Kendaraan Ringan (Otomotif)",
      "Mesin Otomotif & K3",
      "Bahasa Inggris Teknik"
    ];
  });

  const [activeSchedules, setActiveSchedules] = useState<TeachingSchedule[]>(() => {
    const saved = localStorage.getItem("simpati_teaching_schedules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 5) return parsed;
      } catch (e) { console.error(e); }
    }
    return getStoredSchedules();
  });

  useEffect(() => {
    localStorage.setItem("simpati_teaching_schedules", JSON.stringify(activeSchedules));
  }, [activeSchedules]);

  const [selectedSemester, setSelectedSemester] = useState<string>("Ganjil 2026/2027");

  // Filter state for teacher schedule selection (e.g. Arham Amiruddin, Isnawati, etc.)
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("auto");

  // Extract list of all available teacher names from activeSchedules
  const uniqueTeacherNames = React.useMemo(() => {
    const nameSet = new Set<string>();
    activeSchedules.forEach(s => {
      if (s.teacherName && s.teacherName.trim()) {
        nameSet.add(s.teacherName.trim());
      }
    });
    return Array.from(nameSet).sort();
  }, [activeSchedules]);

  // Automatically resolve matched teacher schedule for logged-in teacher (e.g. Arham Amiruddin)
  const matchedTeacherSchedules = React.useMemo(() => {
    if (!username) return [];
    return getTeacherMatchedSchedules(username, activeSchedules);
  }, [username, activeSchedules]);

  const matchedTeacherName = React.useMemo(() => {
    if (matchedTeacherSchedules.length > 0 && matchedTeacherSchedules[0].teacherName) {
      return matchedTeacherSchedules[0].teacherName;
    }
    return username || "";
  }, [matchedTeacherSchedules, username]);

  const effectiveTeacherName = React.useMemo(() => {
    if (selectedTeacherFilter === "semua") {
      return "semua";
    }
    if (selectedTeacherFilter !== "auto") {
      return selectedTeacherFilter;
    }
    if (matchedTeacherName) {
      return matchedTeacherName;
    }
    return "semua";
  }, [selectedTeacherFilter, matchedTeacherName]);

  const filteredSchedules = React.useMemo(() => {
    return activeSchedules.filter(sch => {
      // 1. Semester filter
      const matchSem = !sch.semester || sch.semester === selectedSemester;
      if (!matchSem) return false;

      // 2. Teacher filter
      if (effectiveTeacherName === "semua") return true;

      const normSchTeacher = sch.teacherName || "";
      const normFilterTeacher = effectiveTeacherName;

      if (!normSchTeacher || !normFilterTeacher) return true;

      return isSameTeacherName(normSchTeacher, normFilterTeacher);
    });
  }, [activeSchedules, selectedSemester, effectiveTeacherName]);

  const teacherClasses = React.useMemo(() => {
    return Array.from(new Set(matchedTeacherSchedules.map(s => s.className.trim()))).filter(Boolean);
  }, [matchedTeacherSchedules]);

  useEffect(() => {
    if (matchedTeacherSchedules.length > 0) {
      // Merge matched schedules into activeSchedules if not present
      const formatted: TeachingSchedule[] = matchedTeacherSchedules.map((sch, idx) => ({
        id: sch.id || `sch-auto-${idx}`,
        teacherId: (sch.teacherCode || "guru").toLowerCase(),
        teacherName: sch.teacherName,
        subject: sch.subject,
        className: sch.className,
        day: sch.day || "Senin",
        period: sch.period || sch.time || "Jam 1-4",
        semester: "Ganjil 2026/2027"
      }));

      setActiveSchedules(prev => {
        const existingKeys = new Set(prev.map(p => `${p.className}-${p.subject}-${p.day}`));
        const toAdd = formatted.filter(f => !existingKeys.has(`${f.className}-${f.subject}-${f.day}`));
        if (toAdd.length > 0) return [...toAdd, ...prev];
        return prev;
      });

      // Default selectedClass and subjectName to teacher's schedule
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
        if (matchedTeacherSchedules[0]?.subject) {
          setSubjectName(matchedTeacherSchedules[0].subject);
        }
      }
    }
  }, [matchedTeacherSchedules, username]);

  const teacherPerwalianClass = React.useMemo(() => {
    return getTeacherPerwalianClass(username);
  }, [username]);

  const teacherBimbinganStudentNames = React.useMemo(() => {
    if (!username) return [];
    const masterData = getMasterGuruWaliData();
    const match = masterData.find(g => {
      const gName = g.namaGuru.toLowerCase();
      const uName = username.toLowerCase();
      return gName.includes(uName) || uName.includes(gName) || (uName.includes("arbianti") && gName.includes("arbianti"));
    });
    if (match && match.muridList) {
      return match.muridList.map(m => m.nama.trim().toUpperCase());
    }
    return [];
  }, [username]);

  const [onlyShowBimbinganSiswa, setOnlyShowBimbinganSiswa] = useState<boolean>(false);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    const navClass = localStorage.getItem("sihadir_target_perwalian_class");
    if (navClass) {
      localStorage.removeItem("sihadir_target_perwalian_class");
      return navClass;
    }
    if (username) {
      const perwalian = getTeacherPerwalianClass(username);
      if (perwalian) return perwalian;

      const captainCls = getStudentCaptainClass(username);
      if (captainCls && LIST_OF_CLASSES.includes(captainCls)) return captainCls;
      const studentMatch = MOCK_STUDENTS.find(s => s.name.toUpperCase() === username.toUpperCase());
      if (studentMatch?.className && LIST_OF_CLASSES.includes(studentMatch.className)) {
        return studentMatch.className;
      }
    }
    const savedKkCls = localStorage.getItem("sihadir_ketua_kelas_class");
    if (savedKkCls && LIST_OF_CLASSES.includes(savedKkCls)) return savedKkCls;
    return activeClasses[0] || "X TKR A";
  });

  // Sync selectedClass automatically when username changes
  useEffect(() => {
    const navClass = localStorage.getItem("sihadir_target_perwalian_class");
    if (navClass) {
      localStorage.removeItem("sihadir_target_perwalian_class");
      setSelectedClass(navClass);
      return;
    }
    if (username) {
      const perwalian = getTeacherPerwalianClass(username);
      if (perwalian) {
        setSelectedClass(perwalian);
        return;
      }
      const captainCls = getStudentCaptainClass(username);
      if (captainCls && LIST_OF_CLASSES.includes(captainCls)) {
        setSelectedClass(captainCls);
        return;
      }
      const studentMatch = MOCK_STUDENTS.find(s => s.name.toUpperCase() === username.toUpperCase());
      if (studentMatch?.className && LIST_OF_CLASSES.includes(studentMatch.className)) {
        setSelectedClass(studentMatch.className);
        return;
      }
    }
    const savedKkCls = localStorage.getItem("sihadir_ketua_kelas_class");
    if (savedKkCls && LIST_OF_CLASSES.includes(savedKkCls)) {
      setSelectedClass(savedKkCls);
    }
  }, [username]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState<string>("");
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Daily log configs
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [subjectName, setSubjectName] = useState<string>(activeSubjects[0] || "Pemeliharaan Mesin Kendaraan Ringan");

  // Load custom student names mapped by class name from local storage or defaults
  const [classStudents, setClassStudents] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("simpati_students_map");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_CLASS_STUDENTS;
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("simpati_students_map");
      if (saved) {
        try { setClassStudents(JSON.parse(saved)); } catch (e) { console.error(e); }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Current active attendance log state for selected class
  const [attendanceList, setAttendanceList] = useState<StudentAttendanceRecord[]>([]);

  // Archive Logs
  const [savedLogs, setSavedLogs] = useState<SavedAttendanceLog[]>(() => {
    const saved = localStorage.getItem("simpati_saved_attendance_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

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

  // AI Insights
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [waNotifyPhone, setWaNotifyPhone] = useState<string>("081234567890");
  const [isSendingWA, setIsSendingWA] = useState<Record<string, boolean>>({});

  // Load self-attendance logs
  const [selfAttendanceList, setSelfAttendanceList] = useState<any[]>(() => {
    const saved = localStorage.getItem("simpati_student_self_attendance");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Return initial seed for demo and verification purposes
    return [
      { id: "self-seed-1", studentName: "Ahmad Fauzan", className: "XI TKR A", date: "2026-07-02", clockIn: "07:05", clockOut: "14:15", status: "Hadir", reason: "" },
      { id: "self-seed-2", studentName: "Ahmad Fauzan", className: "XI TKR A", date: "2026-07-03", clockIn: "07:11", clockOut: "14:30", status: "Hadir", reason: "" },
      { id: "self-seed-3", studentName: "Bagus Wijaya", className: "XI TKR A", date: "2026-07-03", clockIn: "07:02", clockOut: "14:20", status: "Hadir", reason: "" }
    ];
  });

  // Save self-attendance updates
  useEffect(() => {
    localStorage.setItem("simpati_student_self_attendance", JSON.stringify(selfAttendanceList));
  }, [selfAttendanceList]);

  // Realtime subscription to Firebase Cloud Firestore for multi-device sync
  useEffect(() => {
    const unsubSelf = dbService.subscribeRecords("student_self_attendance", (records) => {
      if (records && records.length > 0) {
        setSelfAttendanceList(records);
      }
    });
    const unsubLogs = dbService.subscribeRecords("saved_attendance_logs", (records) => {
      if (records && records.length > 0) {
        setSavedLogs(records);
      }
    });
    return () => {
      if (unsubSelf) unsubSelf();
      if (unsubLogs) unsubLogs();
    };
  }, []);

  // Modal State for Sharing Student Attendance Link via WhatsApp
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState<boolean>(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean>(false);

  // Student level reactive inputs for active self attendance logging
  const [studentSelfStatus, setStudentSelfStatus] = useState<string>("Hadir");
  const [studentSelfReason, setStudentSelfReason] = useState<string>("");
  const [showSelfReasonForm, setShowSelfReasonForm] = useState<boolean>(false);

  // Dynamic School Coordinates calibrated in Admin for Students
  const [schoolLat, setSchoolLat] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lat");
    if (!saved || saved === "-7.2504" || saved === "-3.838139") {
      localStorage.setItem("sihadir_school_lat", "-3.8380461319668107");
      return -3.8380461319668107;
    }
    return parseFloat(saved);
  });
  const [schoolLon, setSchoolLon] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lon");
    if (!saved || saved === "112.7508" || saved === "122.041944") {
      localStorage.setItem("sihadir_school_lon", "122.04194960321178");
      return 122.04194960321178;
    }
    return parseFloat(saved);
  });
  const [schoolRadius, setSchoolRadius] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_radius");
    return saved ? parseInt(saved) : 700;
  });

  useEffect(() => {
    const savedLat = localStorage.getItem("sihadir_school_lat");
    const savedLon = localStorage.getItem("sihadir_school_lon");
    const savedRadius = localStorage.getItem("sihadir_school_radius");
    if (savedLat) setSchoolLat(parseFloat(savedLat));
    if (savedLon) setSchoolLon(parseFloat(savedLon));
    if (savedRadius) setSchoolRadius(parseInt(savedRadius));
  }, []);

  // Real GPS vs Simulation states for Student (Default to real GPS if available or previously used)
  const [useRealGps, setUseRealGps] = useState<boolean>(() => {
    return true; // Default to reading real device GPS
  });
  const [realLat, setRealLat] = useState<number | null>(() => {
    const saved = localStorage.getItem("sihadir_last_real_lat");
    return saved ? parseFloat(saved) : null;
  });
  const [realLon, setRealLon] = useState<number | null>(() => {
    const saved = localStorage.getItem("sihadir_last_real_lon");
    return saved ? parseFloat(saved) : null;
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Mock live map center for student
  const [gpsOffsetLat, setGpsOffsetLat] = useState(0.0001); // default within radius
  const [gpsOffsetLon, setGpsOffsetLon] = useState(0.0001);
  const [simulatedLat, setSimulatedLat] = useState(() => {
    const saved = localStorage.getItem("sihadir_school_lat");
    return saved ? parseFloat(saved) : -3.8380461319668107;
  });
  const [simulatedLon, setSimulatedLon] = useState(() => {
    const saved = localStorage.getItem("sihadir_school_lon");
    return saved ? parseFloat(saved) : 122.04194960321178;
  });
  const [studentDistance, setStudentDistance] = useState(0);

  useEffect(() => {
    const lat = schoolLat + gpsOffsetLat;
    const lon = schoolLon + gpsOffsetLon;
    setSimulatedLat(parseFloat(lat.toFixed(6)));
    setSimulatedLon(parseFloat(lon.toFixed(6)));
  }, [gpsOffsetLat, gpsOffsetLon, schoolLat, schoolLon]);

  useEffect(() => {
    const lat = useRealGps && realLat !== null ? realLat : simulatedLat;
    const lon = useRealGps && realLon !== null ? realLon : simulatedLon;
    const dist = getDistance(schoolLat, schoolLon, lat, lon);
    setStudentDistance(dist);
  }, [useRealGps, realLat, realLon, simulatedLat, simulatedLon, schoolLat, schoolLon]);

  const studentGpsWatchIdRef = useRef<number | null>(null);

  const startRealGpsTracking = () => {
    if (!navigator.geolocation) {
      setGpsError("Perangkat atau browser ini tidak mendukung pembacaan koordinat GPS.");
      setIsGpsLoading(false);
      return;
    }
    
    setIsGpsLoading(true);
    setGpsError(null);
    setUseRealGps(true);

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const lat = parseFloat(latitude.toFixed(6));
      const lon = parseFloat(longitude.toFixed(6));
      setRealLat(lat);
      setRealLon(lon);
      setGpsAccuracy(Math.round(accuracy));
      setUseRealGps(true);
      setIsGpsLoading(false);
      setGpsError(null);
      localStorage.setItem("sihadir_last_real_lat", String(latitude));
      localStorage.setItem("sihadir_last_real_lon", String(longitude));
    };

    const handleError = (err: GeolocationPositionError) => {
      setIsGpsLoading(false);
      if (err.code === err.PERMISSION_DENIED) {
        setGpsError("Izin lokasi (GPS) ditolak browser HP. Buka Pengaturan HP > Aplikasi > Browser > Izinkan Akses Lokasi.");
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setGpsError("Sinyal GPS belum terbaca. Pastikan tombol Lokasi / GPS di status bar HP Anda sudah aktif.");
      } else {
        setGpsError("Waktu pencarian GPS habis. Pastikan GPS aktif dan berada di area terbuka untuk mendapatkan sinyal.");
      }
    };

    // Step 1: Request quick initial fix with standard accuracy (low latency)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      () => {
        // Fallback: try high accuracy if low accuracy fails
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 6000 }
    );

    // Step 2: Request precise high-accuracy satellite fix
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    // Step 3: Continuously watch position
    if (studentGpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(studentGpsWatchIdRef.current);
    }
    studentGpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handleSuccess(pos);
      },
      (err) => {
        // Only report if we don't have any coordinates yet
        if (realLat === null) {
          handleError(err);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  };

  // Automatically start real GPS tracking on mount for student
  useEffect(() => {
    startRealGpsTracking();
    return () => {
      if (studentGpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(studentGpsWatchIdRef.current);
        studentGpsWatchIdRef.current = null;
      }
    };
  }, []);

  // Real-time ticking system clock (Jam, Tanggal, Bulan, Tahun)
  const [liveDateTime, setLiveDateTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // State for attendance alarm settings
  const [alarmHourIn, setAlarmHourIn] = useState<string>(() => localStorage.getItem("simpati_alarm_in") || "07:15");
  const [alarmHourOut, setAlarmHourOut] = useState<string>(() => localStorage.getItem("simpati_alarm_out") || "14:00");
  const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(() => localStorage.getItem("simpati_alarm_enabled") !== "false");
  const [dismissedAlarmIn, setDismissedAlarmIn] = useState<boolean>(false);
  const [dismissedAlarmOut, setDismissedAlarmOut] = useState<boolean>(false);
  const [alarmTriggeredIn, setAlarmTriggeredIn] = useState<boolean>(false);
  const [alarmTriggeredOut, setAlarmTriggeredOut] = useState<boolean>(false);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("simpati_alarm_in", alarmHourIn);
  }, [alarmHourIn]);

  useEffect(() => {
    localStorage.setItem("simpati_alarm_out", alarmHourOut);
  }, [alarmHourOut]);

  useEffect(() => {
    localStorage.setItem("simpati_alarm_enabled", String(isAlarmEnabled));
  }, [isAlarmEnabled]);

  // Play buzzer sound using browser web audio API
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let time = audioCtx.currentTime;
      // Ringing alarm beep sequence
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 988, time); // Ringing alternating frequencies
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
        time += 0.45;
      }
    } catch (e) {
      console.warn("AudioContext block by browser auto-play policy.", e);
    }
  };

  // Alarm trigger logic checking time periodically
  useEffect(() => {
    if (!isAlarmEnabled) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecord = selfAttendanceList.find(r => r.studentName === username && r.date === todayStr);
    
    const currentHours = liveDateTime.getHours();
    const currentMinutes = liveDateTime.getMinutes();
    
    const [inH, inM] = alarmHourIn.split(":").map(Number);
    const [outH, outM] = alarmHourOut.split(":").map(Number);
    
    // Check Clock-In Alarm (Belum Absen Masuk)
    const isPastInTime = currentHours > inH || (currentHours === inH && currentMinutes >= inM);
    if (!todayRecord && isPastInTime && !dismissedAlarmIn) {
      if (!alarmTriggeredIn) {
        setAlarmTriggeredIn(true);
        playAlarmSound();
      }
    } else if (todayRecord || !isPastInTime) {
      setAlarmTriggeredIn(false);
    }

    // Check Clock-Out Alarm (Belum Absen Keluar)
    const isPastOutTime = currentHours > outH || (currentHours === outH && currentMinutes >= outM);
    if (todayRecord && todayRecord.status === "Hadir" && !todayRecord.clockOut && isPastOutTime && !dismissedAlarmOut) {
      if (!alarmTriggeredOut) {
        setAlarmTriggeredOut(true);
        playAlarmSound();
      }
    } else if (!todayRecord || todayRecord.clockOut || !isPastOutTime) {
      setAlarmTriggeredOut(false);
    }
  }, [liveDateTime, selfAttendanceList, username, alarmHourIn, alarmHourOut, isAlarmEnabled, dismissedAlarmIn, dismissedAlarmOut]);

  // Predefined gorgeous student uniform & background presets
  const PHOTO_PRESETS = [
    {
      id: "osis-gate",
      label: "Seragam OSIS Putih Abu-Abu (Latar Gerbang Sekolah)",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23e0f2fe"/><line x1="50" y1="300" x2="50" y2="80" stroke="%2394a3b8" stroke-width="12"/><line x1="250" y1="300" x2="250" y2="80" stroke="%2394a3b8" stroke-width="12"/><rect x="30" y="50" width="240" height="30" fill="%2364748b" rx="5"/><circle cx="150" cy="120" r="45" fill="%230284c7"/><path d="M80 250 L80 215 Q80 175 150 175 Q220 175 220 215 L220 250 Z" fill="%230f172a"/><rect x="135" y="175" width="30" height="40" fill="%23ffffff"/><polygon points="115,175 150,210 185,175" fill="%230284c7"/><text x="150" y="280" font-family="sans-serif" font-size="11" font-weight="black" fill="%230369a1" text-anchor="middle">OSIS - GERBANG SEKOLAH</text></svg>`
    },
    {
      id: "pramuka-field",
      label: "Seragam Pramuka Lengkap (Latar Lapangan Upacara)",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23fef3c7"/><line x1="40" y1="300" x2="40" y2="40" stroke="%23b45309" stroke-width="6"/><polygon points="40,40 100,55 40,70" fill="%23dc2626"/><circle cx="150" cy="120" r="45" fill="%2378350f"/><path d="M80 250 L80 215 Q80 175 150 175 Q220 175 220 215 L220 250 Z" fill="%23451a03"/><rect x="135" y="175" width="30" height="40" fill="%23d97706"/><polygon points="115,175 150,215 185,175" fill="%2378350f"/><text x="150" y="280" font-family="sans-serif" font-size="11" font-weight="black" fill="%23b45309" text-anchor="middle">PRAMUKA - LAPANGAN</text></svg>`
    },
    {
      id: "batik-class",
      label: "Seragam Batik Sekolah (Latar Ruang Kelas & Papan Tulis)",
      url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23fce7f3"/><rect x="40" y="40" width="220" height="100" fill="%231e293b" rx="4"/><line x1="30" y1="140" x2="270" y2="140" stroke="%23b45309" stroke-width="8"/><circle cx="150" cy="130" r="45" fill="%23be185d"/><path d="M80 260 L80 220 Q80 180 150 180 Q220 180 220 220 L220 260 Z" fill="%239d174d"/><rect x="135" y="180" width="30" height="45" fill="%23f472b6"/><polygon points="115,180 150,215 185,180" fill="%23be185d"/><text x="150" y="285" font-family="sans-serif" font-size="11" font-weight="black" fill="%239d174d" text-anchor="middle">BATIK - RUANG KELAS</text></svg>`
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>("osis-gate");
  const [selectedPresetIdOut, setSelectedPresetIdOut] = useState<string>("osis-gate");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customPhotoOut, setCustomPhotoOut] = useState<string | null>(null);
  
  // Student webcam states
  const [studentIsCapturing, setStudentIsCapturing] = useState<boolean>(false);
  const [studentIsCapturingOut, setStudentIsCapturingOut] = useState<boolean>(false);
  const studentVideoRef = useRef<HTMLVideoElement | null>(null);
  const studentVideoRefOut = useRef<HTMLVideoElement | null>(null);

  const triggerStudentCamera = async (isOut: boolean) => {
    if (isOut) {
      setStudentIsCapturingOut(true);
      setCustomPhotoOut(null);
    } else {
      setStudentIsCapturing(true);
      setCustomPhoto(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 200 } });
      setTimeout(() => {
        const ref = isOut ? studentVideoRefOut.current : studentVideoRef.current;
        if (ref) {
          ref.srcObject = stream;
          ref.play();
        }
      }, 100);
    } catch (e) {
      console.warn("Unable to access physical camera for student, using dynamic fallback face generator.", e);
      // Fallback generator
      setTimeout(() => {
        const avatars = [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        if (isOut) {
          setCustomPhotoOut(randomAvatar);
          setStudentIsCapturingOut(false);
        } else {
          setCustomPhoto(randomAvatar);
          setStudentIsCapturing(false);
        }
      }, 1500);
    }
  };

  const captureStudentSelfieFromVideo = (isOut: boolean) => {
    const videoRef = isOut ? studentVideoRefOut.current : studentVideoRef.current;
    if (videoRef) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (isOut) {
          setCustomPhotoOut(dataUrl);
        } else {
          setCustomPhoto(dataUrl);
        }
        // stop camera stream
        const stream = videoRef.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
    if (isOut) {
      setStudentIsCapturingOut(false);
    } else {
      setStudentIsCapturing(false);
    }
  };
  
  // Modal preview photo for Teacher / Wali Kelas
  const [viewSelfieUrl, setViewSelfieUrl] = useState<string | null>(null);
  const [viewSelfieTitle, setViewSelfieTitle] = useState<string>("");

  // Save student modifications to localStorage whenever classStudents is modified
  useEffect(() => {
    localStorage.setItem("simpati_students_map", JSON.stringify(classStudents));
  }, [classStudents]);

  // Save saved logs updates
  useEffect(() => {
    localStorage.setItem("simpati_saved_attendance_logs", JSON.stringify(savedLogs));
  }, [savedLogs]);

  // Re-generate list when class changes or custom lists change
  useEffect(() => {
    let masterStudentsList: string[] = [];
    const savedMaster = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
    if (savedMaster) {
      try {
        const parsed = JSON.parse(savedMaster);
        if (Array.isArray(parsed) && parsed.length > 0) {
          masterStudentsList = parsed
            .filter((s: any) => (s.className || "").trim().toUpperCase() === selectedClass.trim().toUpperCase())
            .map((s: any) => s.name);
        }
      } catch (e) {}
    }
    if (masterStudentsList.length === 0) {
      masterStudentsList = MOCK_STUDENTS
        .filter(s => (s.className || "").trim().toUpperCase() === selectedClass.trim().toUpperCase())
        .map(s => s.name);
    }

    const customNames = classStudents[selectedClass] || [];
    const names = masterStudentsList.length > 0
      ? Array.from(new Set([...masterStudentsList, ...customNames]))
      : (customNames.length > 0 ? customNames : (DEFAULT_CLASS_STUDENTS[selectedClass] || []));

    const activeRecords: StudentAttendanceRecord[] = names.map((name, index) => ({
      id: `${selectedClass.replace(/\s+/g, "")}-${index}`,
      name,
      status: "Hadir" // Default status to Hadir for fast tick/click
    }));
    setAttendanceList(activeRecords);
    setAiAnalysis(null);
  }, [selectedClass, classStudents]);

  // Student self clock-in handler
  const handleStudentSelfClockIn = (studentName: string, studentClass: string, status: string, reason: string, photo?: string, photoLabel?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hour * 60 + minutes;

    if (timeInMinutes < 6 * 60 + 30) {
      alert("⚠️ Gagal: Akses Presensi Masuk belum dibuka! Presensi masuk dibuka mulai pukul 06.30 WITA.");
      return;
    }
    if (timeInMinutes > 11 * 60 + 30) {
      alert("⚠️ Gagal: Akses Presensi Masuk telah ditutup! Batas jam Presensi Masuk adalah pukul 11.30 WITA.");
      return;
    }

    const activeLat = useRealGps && realLat !== null ? realLat : simulatedLat;
    const activeLon = useRealGps && realLon !== null ? realLon : simulatedLon;
    const activeDistance = studentDistance;
    
    setSelfAttendanceList(prev => {
      const existingIdx = prev.findIndex(r => r.studentName === studentName && r.date === todayStr);
      const recordId = existingIdx >= 0 ? prev[existingIdx].id : `self-${todayStr}-${studentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const newRecord = {
        id: recordId,
        studentName,
        className: studentClass,
        date: todayStr,
        clockIn: status === "Hadir" ? timeStr : null,
        clockOut: existingIdx >= 0 ? prev[existingIdx].clockOut : null,
        status,
        reason: status !== "Hadir" ? reason : "",
        photo: photo || null,
        photoLabel: photoLabel || null,
        latitude: activeLat,
        longitude: activeLon,
        distanceMeter: activeDistance
      };
      
      // Save directly to Firebase Cloud Firestore for real-time aggregation across Guru & Admin TU
      dbService.saveRecord("student_self_attendance", newRecord.id, newRecord);

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRecord;
        return copy;
      } else {
        return [newRecord, ...prev];
      }
    });
    alert(`Presensi Mandiri (${status}) berhasil disimpan pada ${timeStr || "hari ini"} dengan verifikasi foto berseragam dan lokasi GPS! Data otomatis tersinkron ke Rekap Guru & Admin TU.`);
  };

  // Student self clock-out handler
  const handleStudentSelfClockOut = (studentName: string, photo?: string, photoLabel?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hour * 60 + minutes;

    const isFriday = now.getDay() === 5;
    const minOutMins = isFriday ? 11 * 60 : (13 * 60 + 15);
    const minOutTimeLabel = isFriday ? "11.00" : "13.15";

    if (timeInMinutes < minOutMins) {
      alert(`⚠️ Akses Ditolak: Absen Pulang DITAHAN! Absen Pulang baru dapat dilakukan mulai pukul ${minOutTimeLabel} WITA${isFriday ? " (Khusus Hari Jumat)" : ""}.`);
      return;
    }

    // Ensure student has clocked in first
    const existingRecord = selfAttendanceList.find(r => r.studentName === studentName && r.date === todayStr);
    if (!existingRecord || !existingRecord.clockIn || existingRecord.clockIn === "--:--") {
      alert("⚠️ Gagal: Anda belum melakukan Presensi Masuk (Clock-In) hari ini! Silakan lakukan presensi masuk terlebih dahulu sebelum presensi pulang.");
      return;
    }

    const activeLat = useRealGps && realLat !== null ? realLat : simulatedLat;
    const activeLon = useRealGps && realLon !== null ? realLon : simulatedLon;
    const activeDistance = studentDistance;
    
    setSelfAttendanceList(prev => {
      const existingIdx = prev.findIndex(r => r.studentName === studentName && r.date === todayStr);
      if (existingIdx >= 0) {
        const updatedRecord = {
          ...prev[existingIdx],
          clockOut: timeStr,
          photoOut: photo || null,
          photoOutLabel: photoLabel || null,
          latitudeOut: activeLat,
          longitudeOut: activeLon,
          distanceMeterOut: activeDistance
        };
        // Save update to Firebase Cloud Firestore
        dbService.saveRecord("student_self_attendance", updatedRecord.id, updatedRecord);
        const copy = [...prev];
        copy[existingIdx] = updatedRecord;
        return copy;
      } else {
        const studentClass = Object.keys(classStudents).find(cls => classStudents[cls].includes(studentName)) || "XI TKR A";
        const recordId = `self-${todayStr}-${studentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const newRecord = {
          id: recordId,
          studentName,
          className: studentClass,
          date: todayStr,
          clockIn: "--:--",
          clockOut: timeStr,
          status: "Hadir",
          reason: "",
          photoOut: photo || null,
          photoOutLabel: photoLabel || null,
          latitudeOut: activeLat,
          longitudeOut: activeLon,
          distanceMeterOut: activeDistance
        };
        dbService.saveRecord("student_self_attendance", newRecord.id, newRecord);
        return [newRecord, ...prev];
      }
    });
    alert(`Presensi Keluar berhasil terekam pada pukul ${timeStr} dengan verifikasi lokasi GPS! Data otomatis tersinkron ke Rekap Guru & Admin TU.`);
  };

  // Convert uploaded photo to Base64 with compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isOut: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 400;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL("image/jpeg", 0.7);
            if (isOut) {
              setCustomPhotoOut(compressed);
            } else {
              setCustomPhoto(compressed);
            }
            return;
          }
          if (isOut) setCustomPhotoOut(reader.result as string);
          else setCustomPhoto(reader.result as string);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle single-click status updates
  const handleUpdateStatus = (studentId: string, newStatus: "Hadir" | "Sakit" | "Izin" | "Alfa") => {
    if (!isAdmin) {
      alert("Akses Terkunci: Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk menginput atau mengubah status absensi.");
      return;
    }
    const targetStudent = attendanceList.find(s => s.id === studentId);
    setAttendanceList(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );

    // Instantly notify Admin TU and Guru BK
    if (targetStudent) {
      notifyStudentAttendanceInstant({
        studentName: targetStudent.name,
        className: selectedClass,
        status: newStatus,
        clockIn: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        method: "Absensi Manual Guru/Wali",
        recordedBy: `${currentRole === "tu" ? "Admin Tata Usaha" : "Guru / Wali Kelas"} (${currentRole})`,
        notes: `Pembaruan absensi kelas ${selectedClass}`
      }).catch(err => console.warn("TU/BK instant notify failed:", err));
    }
  };

  // Bulk operation to mark all present (Hadir)
  const handleMarkAllHadir = () => {
    if (!isAdmin) {
      alert("Akses Terkunci: Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk mengubah status absensi.");
      return;
    }
    setAttendanceList(prev => prev.map(student => ({ ...student, status: "Hadir" })));
  };

  // Add customized student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Akses Terkunci: Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk menambah daftar siswa.");
      return;
    }
    if (!newStudentName.trim()) return;
    
    setClassStudents(prev => {
      const currentList = prev[selectedClass] || [];
      return {
        ...prev,
        [selectedClass]: [...currentList, newStudentName.trim()]
      };
    });
    setNewStudentName("");
  };

  // Delete specific student
  const handleDeleteStudent = (studentName: string) => {
    if (!isAdmin) {
      triggerAlert("Akses Terkunci", "Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk menghapus siswa.");
      return;
    }
    triggerConfirm(
      "Hapus Data Siswa",
      `Apakah Anda yakin ingin menghapus siswa '${studentName}' dari daftar absen kelas ${selectedClass}?`,
      () => {
        setClassStudents(prev => {
          const currentList = prev[selectedClass] || [];
          return {
            ...prev,
            [selectedClass]: currentList.filter(name => name !== studentName)
          };
        });
      }
    );
  };

  // Edit inline student name
  const handleStartEdit = (studentId: string, currentName: string) => {
    if (!isAdmin) {
      alert("Akses Terkunci: Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk mengedit nama siswa.");
      return;
    }
    setEditingStudentId(studentId);
    setEditingStudentName(currentName);
  };

  const handleSaveEdit = (oldName: string) => {
    if (!isAdmin) {
      alert("Akses Terkunci: Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk mengedit nama siswa.");
      return;
    }
    if (!editingStudentName.trim()) return;
    setClassStudents(prev => {
      const currentList = prev[selectedClass] || [];
      return {
        ...prev,
        [selectedClass]: currentList.map(name => name === oldName ? editingStudentName.trim() : name)
      };
    });
    setEditingStudentId(null);
  };

  // Reset current class to system prototype list
  const handleResetClassToDefault = () => {
    if (!isAdmin) {
      triggerAlert("Akses Terkunci", "Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk menyetel ulang data.");
      return;
    }
    triggerConfirm(
      "Setel Ulang Data Kelas",
      `Apakah Anda yakin ingin mengatur ulang data nama siswa kelas ${selectedClass} kembali ke bawaan sistem?`,
      () => {
        setClassStudents(prev => ({
          ...prev,
          [selectedClass]: DEFAULT_CLASS_STUDENTS[selectedClass] || []
        }));
      }
    );
  };

  // Save Daily Log to History
  const handleSaveDailyLog = () => {
    if (!isAdmin) {
      triggerAlert("Akses Terkunci", "Hanya Akun Admin Utama atau Admin Tata Usaha ('tu') yang diizinkan untuk mengarsipkan rekap absensi.");
      return;
    }
    const newLog: SavedAttendanceLog = {
      id: `log-${Date.now()}`,
      date: selectedDate,
      className: selectedClass,
      subject: subjectName,
      records: [...attendanceList]
    };
    
    setSavedLogs(prev => [newLog, ...prev]);
    dbService.saveRecord("saved_attendance_logs", newLog.id, newLog);

    // Broadcast class recap to Admin TU and Guru BK via Fonnte
    const absentList = attendanceList
      .filter(s => s.status !== "Hadir")
      .map(s => ({ name: s.name, status: s.status }));
    notifyClassAttendanceSummary({
      className: selectedClass,
      date: selectedDate,
      subject: subjectName,
      total: attendanceList.length,
      hadir: attendanceList.filter(s => s.status === "Hadir").length,
      sakit: attendanceList.filter(s => s.status === "Sakit").length,
      izin: attendanceList.filter(s => s.status === "Izin").length,
      alfa: attendanceList.filter(s => s.status === "Alfa").length,
      absentList,
      recordedBy: `${currentRole === "tu" ? "Admin Tata Usaha" : "Guru / Wali Kelas"} (${currentRole})`
    }).catch(err => console.warn("TU & BK class summary notify failed:", err));

    triggerAlert("Sukses", `Laporan absensi ${selectedClass} berhasil disimpan ke log arsip, tersinkron ke Cloud Firestore, dan disiarkan ke WA Admin TU & Guru BK!`);
  };

  const handleDeleteLog = (logId: string) => {
    triggerConfirm(
      "Hapus Rekap Absensi",
      "Hapus rekap absensi ini dari arsip?",
      () => {
        setSavedLogs(prev => prev.filter(l => l.id !== logId));
        dbService.deleteRecord("saved_attendance_logs", logId);
      }
    );
  };

  // Load a historic log
  const handleLoadPreservedLog = (log: SavedAttendanceLog) => {
    setSelectedClass(log.className);
    setSelectedDate(log.date);
    setSubjectName(log.subject);
    setAttendanceList(log.records);
    setAiAnalysis(null);
  };

  // AI Attendance rate and pattern analyzer
  const handleAnalyzeAttendanceAI = async () => {
    setAiAnalyzing(true);
    setAiAnalysis(null);

    const total = attendanceList.length;
    const hadir = attendanceList.filter(s => s.status === "Hadir").length;
    const izin = attendanceList.filter(s => s.status === "Izin").length;
    const sakit = attendanceList.filter(s => s.status === "Sakit").length;
    const alfa = attendanceList.filter(s => s.status === "Alfa").length;
    const presenceRate = total > 0 ? ((hadir / total) * 100).toFixed(1) : "0";

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Asisten Pengambil Keputusan Kehadiran & Akademik Sekolah).\n" +
      "Menganalisis statistik absensi siswa, berikan insight, temukan siswa bermasalah (alfa berulang/sakit), " +
      "dan berikan rekomendasi pembinaan konseling sekolah.";

    const prompt = 
      `Kelas: ${selectedClass}\n` +
      `Mata Pelajaran: ${subjectName}\n` +
      `Tanggal Rekap: ${selectedDate}\n` +
      `Statistik:\n` +
      `- Total Siswa: ${total}\n` +
      `- Hadir: ${hadir}\n` +
      `- Sakit: ${sakit}\n` +
      `- Izin: ${izin}\n` +
      `- Alfa: ${alfa}\n` +
      `- Tingkat Kehadiran: ${presenceRate}%\n\n` +
      `Daftar Siswa Tidak Hadir:\n` +
      attendanceList.filter(s => s.status !== "Hadir").map(s => `- ${s.name} (${s.status})`).join("\n") +
      `\n\nTulis kesimpulan ringkas, status kelas (Prima, Waspada, Kritis), dan 3 butir rencana tindak lanjut pembimbingan.`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiAnalysis(data.text);
    } catch (e) {
      console.error(e);
      // Fallback
      setAiAnalysis(
        `### EVALUASI PRESENSI SIMPATI AI - KELAS ${selectedClass}\n` +
        `**Status Kelas:** ${Number(presenceRate) >= 90 ? "🟢 PRIMA" : "🟡 WASPADA"}\n` +
        `**Analisa Pola:**\n` +
        `Tingkat kehadiran tercatat sebesar **${presenceRate}%** (${hadir}/${total} Siswa hadir). Terdapat ${alfa} siswa mangkir (Alfa) dan ${sakit + izin} yang mengirimkan keterangan berhalangan.\n\n` +
        `**Rencana Tindak Lanjut Sekolah:**\n` +
        `1. Wali Kelas berkoordinasi dengan Guru BK untuk menghubungi orang tua murid berstatus Alfa hari ini.\n` +
        `2. Berikan perhatian khusus pada pemenuhan tugas produktif praktek bengkel yang terlewat.\n` +
        `3. Saring notifikasi langsung grup WhatsApp Wali Murid mengenai batas toleransi keterlambatan.`
      );
    } finally {
      setAiAnalyzing(false);
    }
  };

  // WhatsApp formatted generator template
  const getWhatsAppMessageRawForParent = (studentName: string, status: string) => {
    let statusText = "";
    if (status === "Sakit") statusText = "Sakit (dengan/kurang surat)";
    else if (status === "Izin") statusText = "Izin Halangan Keluarga/Pribadi";
    else statusText = "Alfa (Tanpa Keterangan Tertulis)";

    return `*PRESENSI RESMI SIHADIR - SMK NEGERI 2 KONAWE*\n\nYth. Bapak/Ibu Wali Murid dari *${studentName}*\n\nKami menginfokan laporan resmi kehadiran siswa kelas *${selectedClass}* untuk mata pelajaran *${subjectName}* pada tanggal *${selectedDate}*:\n\n📌 Keterangan: *${statusText}*\n\nMohon bantuannya untuk terus mendampingi belajar siswa di rumah. Jika ada surat keterangan dokter/resmi silakan diserahkan kepada Wali Kelas.\n\nHormat kami,\nWali Kelas & Tim SIHADIR\n*SMK Negeri 2 Konawe*`;
  };

  const handleLaunchWhatsApp = (studentName: string, status: string) => {
    const textMsg = encodeURIComponent(getWhatsAppMessageRawForParent(studentName, status));
    // Normal client link
    const cleanPhone = waNotifyPhone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${textMsg}`, "_blank");
  };

  const handleSendFonnteWhatsApp = async (studentName: string, status: string) => {
    const fonnteApiKey = localStorage.getItem("simpati_fonnte_api_key") || "LMJoXs8WD3g78VGgFuTM";
    const fonnteTargetOverride = waNotifyPhone.replace(/[^0-9]/g, "");
    const msg = getWhatsAppMessageRawForParent(studentName, status);

    setIsSendingWA(prev => ({ ...prev, [studentName]: true }));
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: fonnteTargetOverride,
          message: msg,
          customToken: fonnteApiKey
        })
      });
      const data = await response.json();
      if (data.status === true || data.status === "true" || (data.hasOwnProperty("status") && data.status !== false)) {
        alert(`🚀 Berhasil! Notifikasi ketidakhadiran ${studentName} telah dikirim secara otomatis ke nomor ${fonnteTargetOverride} via Fonnte Gateway.`);
      } else {
        const errorMsg = data.reason || data.message || "Gagal mengirim via Fonnte.";
        alert(`Gagal mengirim via Fonnte: ${errorMsg}\n\nMengalihkan ke pengiriman manual WhatsApp Web...`);
        handleLaunchWhatsApp(studentName, status);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Koneksi error: ${e.message || "Gagal menghubungi API proxy."}\n\nMengalihkan ke pengiriman manual WhatsApp Web...`);
      handleLaunchWhatsApp(studentName, status);
    } finally {
      setIsSendingWA(prev => ({ ...prev, [studentName]: false }));
    }
  };

  // Statistics calculation
  const totalStudents = attendanceList.length;
  const countHadir = attendanceList.filter(s => s.status === "Hadir").length;
  const countSakit = attendanceList.filter(s => s.status === "Sakit").length;
  const countIzin = attendanceList.filter(s => s.status === "Izin").length;
  const countAlfa = attendanceList.filter(s => s.status === "Alfa").length;
  const attendanceRate = totalStudents > 0 ? Math.round((countHadir / totalStudents) * 100) : 0;

  // Filter student lists by search & bimbingan filter
  const filteredAttendance = attendanceList.filter(student => {
    const nameMatches = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatches) return false;
    if (onlyShowBimbinganSiswa && teacherBimbinganStudentNames.length > 0) {
      const uName = student.name.trim().toUpperCase();
      return teacherBimbinganStudentNames.some(bName => uName.includes(bName) || bName.includes(uName));
    }
    return true;
  });

  if (currentRole === "siswa") {
    // Find student's class
    const studentClass = Object.keys(classStudents).find(className => 
      classStudents[className].includes(username)
    ) || "XI TKR A";

    const currentHour = liveDateTime.getHours();
    const currentMinute = liveDateTime.getMinutes();
    const liveTimeMinutes = currentHour * 60 + currentMinute;
    const isFriday = liveDateTime.getDay() === 5;
    const isClockInTimeOpen = liveTimeMinutes >= (6 * 60 + 30); // 06:30 pagi
    const isClockInCutOffPassed = liveTimeMinutes > (9 * 60 + 30); // 09:30 pagi batas akhir
    const isClockOutTimeOpen = liveTimeMinutes >= (isFriday ? 11 * 60 : (13 * 60 + 15)); // 11:00 Jumat, 13:15 hari biasa
    const isClockOutCutOffPassed = liveTimeMinutes > (14 * 60 + 30); // 14:30 WITA batas akhir pulang

    // Filter logs for this class & student
    const myAttendanceHistory = savedLogs.flatMap(log => {
      if (log.className !== studentClass) return [];
      const myRecord = log.records.find(r => r.name === username);
      if (!myRecord) return [];
      return [{
        id: log.id,
        date: log.date,
        subject: log.subject,
        status: myRecord.status
      }];
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

    // Calculate stats
    const totalMyLogs = myAttendanceHistory.length;
    const myHadir = myAttendanceHistory.filter(h => h.status === "Hadir").length;
    const mySakit = myAttendanceHistory.filter(h => h.status === "Sakit").length;
    const myIzin = myAttendanceHistory.filter(h => h.status === "Izin").length;
    const myAlfa = myAttendanceHistory.filter(h => h.status === "Alfa").length;
    const myRate = totalMyLogs > 0 ? Math.round((myHadir / totalMyLogs) * 100) : 100;

    return (
      <div className="space-y-6" id="student-attendance-personal-workspace">
        {/* Visual Header Grid banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-955 p-6 rounded-2xl border border-slate-800 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-emerald-400 shrink-0" />
              <h2 className="text-xl font-bold tracking-tight">Portal Riwayat Kehadiran Siswa</h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
                Akses Mandiri
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Selamat datang, <strong className="text-white font-extrabold">{username}</strong> ({studentClass}). Di sini Anda dapat memantau akumulasi data presensi harian Anda yang diinput secara riil oleh Wali Kelas & Guru Pengajar SMK Negeri 2 Konawe.
            </p>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-3 shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-gray-400 uppercase leading-none font-bold">Persentase Kehadiran Anda</div>
              <div className="text-lg font-extrabold text-white leading-none mt-1">{myRate}%</div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-850">{myHadir}</div>
            <div className="text-[10px] uppercase font-bold text-emerald-600 mt-1">Hadir (Present)</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-850">{mySakit}</div>
            <div className="text-[10px] uppercase font-bold text-blue-600 mt-1">Sakit (Sick)</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-850">{myIzin}</div>
            <div className="text-[10px] uppercase font-bold text-amber-600 mt-1">Izin (Permitted)</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-850">{myAlfa}</div>
            <div className="text-[10px] uppercase font-bold text-rose-600 mt-1">Alfa (Absent)</div>
          </div>
        </div>

        {/* ALARM & PENGINGAT ABSENSI MANDIRI */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-150 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl animate-pulse">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Sistem Alarm & Pengingat Absensi Pintar</h3>
                <p className="text-xs text-slate-500">Mencegah lupa absen masuk & keluar dengan sirine digital dan alarm otomatis harian.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAlarmEnabled}
                  onChange={(e) => {
                    setIsAlarmEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setAlarmTriggeredIn(false);
                      setAlarmTriggeredOut(false);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ms-2 text-xs font-bold text-slate-700">Alarm {isAlarmEnabled ? "Aktif" : "Nonaktif"}</span>
              </label>

              <button
                type="button"
                onClick={playAlarmSound}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
              >
                🔊 Tes Suara
              </button>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Set Batas Alarm Absen Masuk (Clock-In)</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={alarmHourIn}
                  onChange={(e) => {
                    setAlarmHourIn(e.target.value);
                    setDismissedAlarmIn(false);
                  }}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 w-full focus:outline-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => { setAlarmHourIn("07:15"); setDismissedAlarmIn(false); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Alarm berbunyi jika jam ini tercapai & Anda belum Clock-In.</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Set Batas Alarm Absen Keluar (Clock-Out)</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={alarmHourOut}
                  onChange={(e) => {
                    setAlarmHourOut(e.target.value);
                    setDismissedAlarmOut(false);
                  }}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 w-full focus:outline-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => { setAlarmHourOut("14:00"); setDismissedAlarmOut(false); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Alarm berbunyi jika jam ini tercapai & Anda belum Clock-Out.</p>
            </div>
          </div>

          {/* Active Alarm Alerts */}
          <AnimatePresence>
            {alarmTriggeredIn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white p-4 rounded-xl border border-red-400 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black uppercase tracking-wider">⚠️ ALARM DARURAT: BELUM ABSEN MASUK!</h4>
                    <p className="text-[11px] opacity-90 font-medium">Sudah melewati pukul {alarmHourIn}. Segera ambil selfie berseragam dan klik "Kirim Absen Masuk"!</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetEl = document.getElementById("student-attendance-personal-workspace");
                      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-white text-rose-700 hover:bg-rose-50 text-[10px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Absen Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissedAlarmIn(true)}
                    className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                  >
                    Tunda (Snooze)
                  </button>
                </div>
              </motion.div>
            )}

            {alarmTriggeredOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white p-4 rounded-xl border border-amber-400 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black uppercase tracking-wider">⚠️ ALARM DARURAT: BELUM ABSEN KELUAR!</h4>
                    <p className="text-[11px] opacity-90 font-medium">Sesi belajar selesai (batas: {alarmHourOut}). Lengkapi kepulangan Anda sebelum terekam Alfa!</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetEl = document.getElementById("student-attendance-personal-workspace");
                      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-white text-amber-700 hover:bg-amber-50 text-[10px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Absen Pulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissedAlarmOut(true)}
                    className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                  >
                    Tunda (Snooze)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PRESENSI MANDIRI SISWA WIDGET */}
        <div id="student-attendance-personal-workspace" className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Presensi Mandiri Siswa (Clock-In & Clock-Out)</h3>
                <p className="text-xs text-slate-500">Lengkapi kehadiran harian beserta bukti foto berseragam dengan latar sekolah.</p>
              </div>
            </div>
          </div>

          {/* INFORMASI JADWAL & BATAS WAKTU ABSENSI */}
          <AttendanceScheduleInfoCard role="siswa" variant="full" />

          {(() => {
            const todayStr = new Date().toISOString().split("T")[0];
            const todayRecord = selfAttendanceList.find(r => r.studentName === username && r.date === todayStr);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side (Col 5): Live Status & History & Warning */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Status Kehadiran Hari Ini</span>
                    
                    <div className="flex items-center gap-3">
                      {todayRecord ? (
                        <span className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg border inline-block ${
                          todayRecord.status === "Hadir"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : todayRecord.status === "Sakit"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          ✓ {todayRecord.status}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-black uppercase rounded-lg border bg-rose-50 text-rose-800 border-rose-200 animate-pulse">
                          ⚠️ BELUM ABSEN (Default: ALFA)
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                        <span className="text-slate-500 font-bold">Jam Absen Masuk (Clock-In):</span>
                        <div className="text-right">
                          <span className="font-extrabold text-indigo-700 font-mono block">
                            {todayRecord && todayRecord.clockIn ? todayRecord.clockIn : "--:--"}
                          </span>
                          {todayRecord && todayRecord.latitude !== undefined && todayRecord.latitude !== null && !isNaN(Number(todayRecord.latitude)) && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              📍 {Number(todayRecord.latitude).toFixed(5)}, {Number(todayRecord.longitude).toFixed(5)} ({todayRecord.distanceMeter}m)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                        <span className="text-slate-500 font-bold">Jam Absen Keluar (Clock-Out):</span>
                        <div className="text-right">
                          <span className="font-extrabold text-indigo-700 font-mono block">
                            {todayRecord && todayRecord.clockOut ? todayRecord.clockOut : "--:--"}
                          </span>
                          {todayRecord && todayRecord.latitudeOut !== undefined && todayRecord.latitudeOut !== null && !isNaN(Number(todayRecord.latitudeOut)) && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              📍 {Number(todayRecord.latitudeOut).toFixed(5)}, {Number(todayRecord.longitudeOut).toFixed(5)} ({todayRecord.distanceMeterOut}m)
                            </span>
                          )}
                        </div>
                      </div>
                      {todayRecord && todayRecord.reason && (
                        <div className="py-2.5 px-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs leading-relaxed">
                          <span className="font-extrabold text-amber-900 block mb-1">Alasan Ketidakhadiran:</span>
                          <p className="text-slate-600 italic">"{todayRecord.reason}"</p>
                        </div>
                      )}
                    </div>

                    {/* Show saved selfie thumbnail if exists */}
                    {todayRecord && (todayRecord.photo || todayRecord.photoOut) && (
                      <div className="border-t pt-3 mt-3">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider mb-2">Foto Verifikasi Anda</span>
                        <div className="flex gap-2">
                          {todayRecord.photo && (
                            <div className="relative group cursor-pointer" onClick={() => { setViewSelfieUrl(todayRecord.photo); setViewSelfieTitle(`Foto Masuk - ${username}`); }}>
                              <img src={todayRecord.photo} alt="Photo Masuk" className="w-16 h-16 object-cover rounded-lg border border-slate-250 hover:border-indigo-500" />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[8px] text-white font-black text-center py-0.5 rounded-b-lg">MASUK</span>
                            </div>
                          )}
                          {todayRecord.photoOut && (
                            <div className="relative group cursor-pointer" onClick={() => { setViewSelfieUrl(todayRecord.photoOut); setViewSelfieTitle(`Foto Keluar - ${username}`); }}>
                              <img src={todayRecord.photoOut} alt="Photo Keluar" className="w-16 h-16 object-cover rounded-lg border border-slate-250 hover:border-indigo-500" />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[8px] text-white font-black text-center py-0.5 rounded-b-lg">PULANG</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GOOGLE MAPS STUDENT LOCATION VERIFICATION */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                          Verifikasi Lokasi Presensi Siswa
                        </h4>
                        <p className="text-[11px] text-slate-500">Koordinat Anda harus berada dalam radius sekolah untuk mencatatkan kehadiran.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUseRealGps(false);
                            setGpsError(null);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                            !useRealGps 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Simulasi
                        </button>
                        
                        <button
                          type="button"
                          disabled={isGpsLoading}
                          onClick={startRealGpsTracking}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                            useRealGps 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          } disabled:opacity-50`}
                        >
                          {isGpsLoading ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Compass className="h-3 w-3" />
                          )}
                          GPS Fisik
                        </button>
                      </div>
                    </div>

                    {gpsError && (
                      <div className="bg-rose-50 text-rose-800 text-[11px] p-3 rounded-lg border border-rose-150 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{gpsError}</span>
                      </div>
                    )}

                    {/* Coordinates & Calibration Controls */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-0.5">Lokasi Anda</span>
                        <div className="font-mono font-extrabold text-slate-700">
                          {(() => {
                            const activeLat = useRealGps && realLat !== null ? realLat : schoolLat + gpsOffsetLat;
                            const activeLon = useRealGps && realLon !== null ? realLon : schoolLon + gpsOffsetLon;
                            return `${activeLat.toFixed(6)}, ${activeLon.toFixed(6)}`;
                          })()}
                        </div>
                        <span className="text-slate-500 text-[9px] block mt-0.5 font-medium">
                          {useRealGps ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              🟢 GPS Fisik {gpsAccuracy !== null && `(Akurasi ±${gpsAccuracy}m)`}
                            </span>
                          ) : (
                            <span className="text-indigo-600 font-bold">🔵 Simulasi Koordinat</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider mb-0.5">Lokasi Sekolah</span>
                        <div className="font-mono font-extrabold text-slate-700">
                          {schoolLat.toFixed(6)}, {schoolLon.toFixed(6)}
                        </div>
                        <span className="text-slate-400 text-[9px] block">
                          SMK Negeri 2 Konawe (Radius {schoolRadius}m)
                        </span>
                      </div>
                    </div>

                    {/* Interactive Real Map Panel (Leaflet / OpenStreetMap & Satellite & Google Maps Link) */}
                    <div className="relative">
                      <InteractiveAttendanceMap
                        useRealGps={useRealGps}
                        realLat={realLat}
                        realLon={realLon}
                        schoolLat={schoolLat}
                        schoolLon={schoolLon}
                        gpsOffsetLat={gpsOffsetLat}
                        gpsOffsetLon={gpsOffsetLon}
                        setGpsOffsetLat={setGpsOffsetLat}
                        setGpsOffsetLon={setGpsOffsetLon}
                        userLabel={username || "Siswa SMK Negeri 2 Konawe"}
                        schoolRadius={schoolRadius}
                        gpsAccuracy={gpsAccuracy}
                        isGpsLoading={isGpsLoading}
                        onRefreshGps={startRealGpsTracking}
                        userRoleType="murid"
                      />
                    </div>

                    {/* Offset adjusters for simulation */}
                    {!useRealGps && (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px]">
                        <span className="font-extrabold text-slate-500 uppercase block tracking-wider">Kontrol Geser Simulasi Lokasi Siswa:</span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="flex justify-between text-slate-600 mb-0.5 font-bold">
                              <span>Pergeseran Utara/Selatan (Latitude Offset):</span>
                              <span className="font-mono text-indigo-700">{gpsOffsetLat > 0 ? `+${gpsOffsetLat.toFixed(4)}` : gpsOffsetLat.toFixed(4)}</span>
                            </div>
                            <input
                              type="range"
                              min="-0.015"
                              max="0.015"
                              step="0.0001"
                              value={gpsOffsetLat}
                              onChange={(e) => setGpsOffsetLat(parseFloat(e.target.value))}
                              className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-ew-resize"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-600 mb-0.5 font-bold">
                              <span>Pergeseran Timur/Barat (Longitude Offset):</span>
                              <span className="font-mono text-indigo-700">{gpsOffsetLon > 0 ? `+${gpsOffsetLon.toFixed(4)}` : gpsOffsetLon.toFixed(4)}</span>
                            </div>
                            <input
                              type="range"
                              min="-0.015"
                              max="0.015"
                              step="0.0001"
                              value={gpsOffsetLon}
                              onChange={(e) => setGpsOffsetLon(parseFloat(e.target.value))}
                              className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-ew-resize"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => { setGpsOffsetLat(0.0001); setGpsOffsetLon(0.0001); }}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold px-2 py-1 rounded"
                          >
                            Set Dalam Radius (~20 Meter)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setGpsOffsetLat(0.0120); setGpsOffsetLon(0.0120); }}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-2 py-1 rounded"
                          >
                            Set Luar Radius (~2.000 Meter)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Live distance feedback banner */}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px] block">Jarak Dari Titik Kalibrasi Sekolah</span>
                        <span className={`text-sm font-black ${studentDistance <= schoolRadius ? "text-emerald-600" : "text-rose-600"}`}>
                          {studentDistance} Meter
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase text-[9px] block font-sans">Kualifikasi Jarak</span>
                        <span className={`inline-block font-sans px-2.5 py-1 rounded-lg font-extrabold ${
                          studentDistance <= schoolRadius 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}>
                          {studentDistance <= schoolRadius ? "MASUK RADIUS" : "DI LUAR RADIUS"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* POLICY & INTEGRITY NOTE */}
                  <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-150/80 text-[11px] leading-relaxed text-rose-950 space-y-1.5">
                    <span className="font-extrabold uppercase text-rose-800 flex items-center gap-1.5">
                      🚨 PERINGATAN INTEGRASI:
                    </span>
                    <p>
                      Sistem kehadiran SIHADIR menerapkan <strong>Dual-Verifikasi</strong>. Jika siswa <strong>tidak mengisi absen mandiri</strong> atau tidak mendapat penilaian dari Guru Mapel di pergantian jam, status otomatis terhitung sebagai <strong>ALFA (Tidak Hadir)</strong>. Absensi Guru bersifat real dan mutlak.
                    </p>
                  </div>
                </div>

                {/* Right Side (Col 7): Interactive Forms */}
                <div className="lg:col-span-7 space-y-5">
                  {!todayRecord ? (
                    <div className="space-y-4">
                      <div className="bg-indigo-50/50 p-1 rounded-xl border border-indigo-100 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentSelfStatus("Hadir");
                            setShowSelfReasonForm(false);
                          }}
                          className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                            studentSelfStatus === "Hadir"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          SAYA HADIR (Clock-In)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentSelfStatus("Sakit");
                            setShowSelfReasonForm(true);
                          }}
                          className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${
                            studentSelfStatus !== "Hadir"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          SAYA BERHALANGAN
                        </button>
                      </div>

                      {showSelfReasonForm ? (
                        <div className="space-y-4 bg-amber-50/30 p-4 rounded-xl border border-amber-200">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-amber-900 mb-1">Status Keterangan</label>
                            <select
                              value={studentSelfStatus}
                              onChange={(e) => setStudentSelfStatus(e.target.value)}
                              className="w-full bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold focus:outline-indigo-500"
                            >
                              <option value="Sakit">Sakit</option>
                              <option value="Izin">Izin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-amber-900 mb-1">Alasan Ketidakhadiran (Sakit / Izin)</label>
                            <textarea
                              value={studentSelfReason}
                              onChange={(e) => setStudentSelfReason(e.target.value)}
                              placeholder="Tulis alasan tidak hadir secara detail (cth: Demam tinggi, mengantar orang tua berobat, dsb)..."
                              className="w-full bg-white border border-slate-250 text-xs rounded-lg p-2 h-20 focus:outline-indigo-500 font-medium"
                            />
                          </div>

                          {/* Allow attaching proof image of doctor letter or permit letter */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-black uppercase text-amber-900">Unggah Surat Keterangan / Bukti Pendukung</span>
                            <div className="flex items-center gap-3">
                              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                                <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-500">Pilih / Seret Foto Bukti</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, false)}
                                />
                              </label>
                              {customPhoto && (
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border">
                                  <img src={customPhoto} alt="Bukti" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => setCustomPhoto(null)} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[8px] font-bold">✕</button>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!studentSelfReason.trim()) {
                                alert("Silakan tulis alasan ketidakhadiran Anda.");
                                return;
                              }
                              // Use customPhoto as base64 or default SVG if none
                              const activePhoto = customPhoto || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23fef3c7"/><text x="150" y="150" font-family="sans-serif" font-size="14" fill="%23b45309" text-anchor="middle">SURAT IZIN / SAKIT</text></svg>`;
                              handleStudentSelfClockIn(username, studentClass, studentSelfStatus, studentSelfReason, activePhoto, `Keterangan ${studentSelfStatus}`);
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                          >
                            Kirim Surat Keterangan Ketidakhadiran
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* HADIR BLOCK: VERIFICATION PHOTOS */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <span className="block text-[10px] font-black uppercase text-indigo-900 tracking-wide">
                              📷 Verifikasi Seragam & Latar Sekolah (Wajib)
                            </span>

                            {/* Viewfinder simulation */}
                            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-300 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                              {studentIsCapturing ? (
                                <>
                                  <video ref={studentVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => captureStudentSelfieFromVideo(false)}
                                    className="absolute bottom-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full shadow-lg z-10 cursor-pointer"
                                  >
                                    Ambil Foto
                                  </button>
                                </>
                              ) : customPhoto ? (
                                <>
                                  <img
                                    src={customPhoto}
                                    alt="Selfie Verification"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                  />
                                  <div className="absolute inset-0 border-2 border-indigo-500 m-3 rounded-lg pointer-events-none border-dashed opacity-50"></div>
                                  <div className="absolute top-3 left-3 bg-indigo-600/90 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Foto Selfie Terpasang
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCustomPhoto(null)}
                                    className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-[9px] px-2 py-1 rounded-md z-10 cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Hapus</span>
                                  </button>
                                </>
                              ) : (
                                <div className="space-y-2 text-slate-400">
                                  <Camera className="h-10 w-10 mx-auto text-slate-500 stroke-[1.5]" />
                                  <p className="text-[10px] font-black uppercase text-slate-300 leading-tight">Belum Ada Foto Selfie Masuk</p>
                                  <p className="text-[9px] text-slate-500 px-4 leading-normal">Silakan pilih metode: Ambil selfie via kamera atau unggah foto</p>
                                </div>
                              )}
                            </div>

                            {/* Actual custom photo choices */}
                            <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="leading-tight text-center sm:text-left">
                                <span className="block text-[10px] font-bold text-slate-700 font-sans">Metode Pengambilan Foto:</span>
                                <span className="text-[9px] text-slate-400">Gunakan Selfie Live atau pilih file foto dari Galeri/Kamera HP.</span>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => triggerStudentCamera(false)}
                                  className="flex-1 sm:flex-initial bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>🤳 SELFIE LIVE</span>
                                </button>
                                <label className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 text-center font-sans">
                                  <Camera className="h-3.5 w-3.5 animate-pulse" />
                                  <span>PILIH FILE FOTO</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(e, false)}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {!isClockInTimeOpen && (
                            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-2">
                              <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                              <div className="text-left">
                                <span className="block font-black text-[10px] uppercase text-rose-900 leading-none mb-0.5">⏱️ Absen Masuk Belum Dibuka</span>
                                Tombol absen masuk baru terbuka pada pukul <strong>06:30 WITA</strong>. Batas tepat waktu pukul <strong>{isFriday ? "07:20" : "07:15"} WITA</strong> dan batas akhir absen masuk adalah pukul <strong>09:30 WITA</strong>.
                              </div>
                            </div>
                          )}

                          {isClockInCutOffPassed && (
                            <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                              <div className="text-left">
                                <span className="block font-black text-[10px] uppercase text-amber-900 leading-none mb-0.5">⚠️ Batas Waktu Absen Masuk (09:30 WITA) Terlewati</span>
                                Batas normal absen masuk telah berakhir. Anda tetap dapat mengirimkan absensi mandiri, namun status wajib diverifikasi oleh Guru Piket agar tidak terhitung Alfa.
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!isClockInTimeOpen}
                            onClick={() => {
                              if (!customPhoto) {
                                alert("⚠️ Gagal: Silakan ambil atau unggah foto selfie Anda terlebih dahulu sebagai bukti presensi masuk!");
                                return;
                              }
                              handleStudentSelfClockIn(username, studentClass, "Hadir", "", customPhoto, "Foto Selfie Mandiri (Masuk)");
                            }}
                            className={`w-full text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 ${
                              isClockInTimeOpen
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                                : "bg-slate-300 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <LogIn className="h-4.5 w-4.5" />
                            <span>Kirim Absen Masuk (Clock-In Mandiri)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* SUBSEQUENT ACTION: CLOCK OUT */}
                      {todayRecord.status === "Hadir" && !todayRecord.clockOut ? (
                        <div className="space-y-4">
                          <div className="bg-emerald-50 text-emerald-950 p-4 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="font-extrabold">Selamat Belajar!</p>
                              <p className="opacity-95 mt-0.5">
                                Anda sudah melakukan <strong>Absen Masuk (Clock-In)</strong> hari ini pada pukul <strong>{todayRecord.clockIn}</strong>. Selamat menempuh kegiatan pembelajaran dengan tertib.
                              </p>
                            </div>
                          </div>

                          {/* Clock-out photo section */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <span className="block text-[10px] font-black uppercase text-indigo-900 tracking-wide">
                              📷 Verifikasi Keluar / Kepulangan Sekolah (Wajib)
                            </span>

                            {/* Viewfinder simulation for checkout */}
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-300 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                              {studentIsCapturingOut ? (
                                <>
                                  <video ref={studentVideoRefOut} className="absolute inset-0 w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => captureStudentSelfieFromVideo(true)}
                                    className="absolute bottom-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full shadow-lg z-10 cursor-pointer"
                                  >
                                    Ambil Foto
                                  </button>
                                </>
                              ) : customPhotoOut ? (
                                <>
                                  <img
                                    src={customPhotoOut}
                                    alt="Selfie Verification Out"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                  />
                                  <div className="absolute inset-0 border-2 border-emerald-500 m-3 rounded-lg pointer-events-none border-dashed opacity-50"></div>
                                  <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Foto Selfie Pulang Terpasang
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCustomPhotoOut(null)}
                                    className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-[9px] px-2 py-1 rounded-md z-10 cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Hapus</span>
                                  </button>
                                </>
                              ) : (
                                <div className="space-y-2 text-slate-400">
                                  <Camera className="h-10 w-10 mx-auto text-slate-500 stroke-[1.5]" />
                                  <p className="text-[10px] font-black uppercase text-slate-300 leading-tight">Belum Ada Foto Selfie Pulang</p>
                                  <p className="text-[9px] text-slate-500 px-4 leading-normal">Silakan pilih metode: Ambil selfie via kamera atau unggah foto</p>
                                </div>
                              )}
                            </div>

                            {/* Actual custom photo choices for clock out */}
                            <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="leading-tight text-center sm:text-left">
                                <span className="block text-[10px] font-bold text-slate-700 font-sans">Metode Pengambilan Foto Pulang:</span>
                                <span className="text-[9px] text-slate-400 font-sans">Ambil Selfie Live atau unggah foto kelengkapan.</span>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() => triggerStudentCamera(true)}
                                  className="flex-1 sm:flex-initial bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>🤳 SELFIE LIVE</span>
                                </button>
                                <label className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 text-center font-sans">
                                  <Camera className="h-3.5 w-3.5" />
                                  <span>PILIH FILE FOTO</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(e, true)}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {!isClockOutTimeOpen && (
                            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
                              <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                              <div className="text-left">
                                <span className="block font-black text-[10px] uppercase text-amber-900 leading-none mb-0.5">⏱️ Absen Pulang Belum Dibuka</span>
                                Tombol absen pulang baru akan terbuka mulai pukul <strong>{liveDateTime.getDay() === 5 ? "11:00 WITA (Khusus Hari Jumat)" : "13:15 WITA"}</strong>. Batas akhir absen pulang adalah pukul <strong>14:30 WITA</strong>.
                              </div>
                            </div>
                          )}

                          {isClockOutCutOffPassed && (
                            <div className="p-3 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-2">
                              <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                              <div className="text-left">
                                <span className="block font-black text-[10px] uppercase text-rose-900 leading-none mb-0.5">🔒 Batas Akhir Absen Pulang (14:30 WITA) Telah Lewat</span>
                                Batas waktu absensi pulang untuk hari ini telah berakhir pada pukul 14:30 WITA. Sesi presensi hari berjalan telah diarsipkan.
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!isClockOutTimeOpen}
                            onClick={() => {
                              if (!customPhotoOut) {
                                alert("⚠️ Gagal: Silakan ambil atau unggah foto selfie pulang Anda terlebih dahulu sebagai bukti presensi keluar/pulang!");
                                return;
                              }
                              handleStudentSelfClockOut(username, customPhotoOut, "Foto Selfie Mandiri (Pulang)");
                            }}
                            className={`w-full text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 ${
                              isClockOutTimeOpen
                                ? "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                                : "bg-slate-300 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <LogOut className="h-4.5 w-4.5 text-rose-400" />
                            <span>Kirim Absen Keluar (Clock-Out Mandiri)</span>
                          </button>
                        </div>
                      ) : todayRecord.clockOut ? (
                        <div className="bg-emerald-100 text-emerald-950 p-6 rounded-2xl border border-emerald-200 flex items-start gap-4">
                          <CheckCircle className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs">
                            <h4 className="font-extrabold text-sm text-emerald-900">Siklus Presensi Selesai Lengkap!</h4>
                            <p className="opacity-90 leading-relaxed">
                              Anda telah mengirimkan <strong>Absen Masuk (Clock-In)</strong> dan <strong>Absen Keluar (Clock-Out)</strong> secara utuh hari ini. Terima kasih telah menjaga nilai kejujuran akademik. Hati-hati di perjalanan pulang!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 text-amber-950 p-5 rounded-2xl border border-amber-200 flex items-start gap-3">
                          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs">
                            <h4 className="font-extrabold text-sm text-amber-900">Laporan Berhalangan Terkirim</h4>
                            <p className="opacity-90 leading-relaxed">
                              Anda terdaftar berhalangan hadir (<strong>{todayRecord.status}</strong>) dengan alasan yang dikirim ke Wali Kelas. Semoga lekas sembuh / urusan Anda dilancarkan.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Detailed History Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Catatan Log Presensi Lengkap Saya ({totalMyLogs} Pertemuan Terarsip)
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-600 font-mono">
              Tahun Ajaran 2026/2027
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs bg-white text-slate-650">
              <thead className="bg-slate-50 border-b">
                <tr className="uppercase text-[9.5px] font-black text-slate-400 tracking-wider">
                  <th className="py-3 px-4 font-extrabold w-12 text-center bg-slate-52">No</th>
                  <th className="py-3 px-4 font-extrabold">Tanggal Sesi</th>
                  <th className="py-3 px-4 font-extrabold">Mata Pelajaran / Sesi</th>
                  <th className="py-3 px-4 font-extrabold text-center">Status Kehadiran</th>
                  <th className="py-3 px-4 font-extrabold text-center">Diverifikasi Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Belum ada catatan kehadiran yang diarsip oleh Guru untuk nama Anda.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Silakan tanyakan guru atau wali kelas untuk menyimpan log presensi kelas.</p>
                    </td>
                  </tr>
                ) : (
                  myAttendanceHistory.map((h, idx) => {
                    const matchedSch = activeSchedules.find(s => s.className === studentClass && s.subject === h.subject);
                    const verifierName = matchedSch ? matchedSch.teacherName : "Wali Kelas / Guru Piket";

                    return (
                      <tr key={h.id || idx} className="hover:bg-slate-50/50 font-medium">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 bg-slate-50/20">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                          {new Date(h.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{h.subject}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase inline-block ${
                            h.status === "Hadir"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : h.status === "Sakit"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : h.status === "Izin"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500 italic font-semibold">{verifierName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="student-attendance-workspace">
      
      {/* Visual Header Grid banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-emerald-400 shrink-0" />
            <h2 className="text-xl font-bold tracking-tight">Manajer & Presensi Kehadiran Siswa</h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
              Mode Click-Tick
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sistem presensi terpusat untuk semua kompetensi keahlian. Lakukan penginputan dan rekap absensi kehadiran siswa secara instan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsShareLinkModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer border border-emerald-400/30"
          >
            <Share2 className="h-4 w-4 shrink-0 text-emerald-100" />
            <span>Bagikan Link Absen Siswa</span>
          </button>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-gray-400 uppercase leading-none font-bold">Rata-Rata Kehadiran Kelas</div>
              <div className="text-lg font-extrabold text-white leading-none mt-1">{attendanceRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner status hak akses jika bukan admin */}
      {!isAdmin && (
        <div className="bg-amber-550/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Mode Lihat-Saja (Akses Terkunci)</p>
            <p className="opacity-90 mt-0.5">Anda sedang login menggunakan akun non-staf. Hak penginputan dan pengubahan data presensi atau nama siswa dinonaktifkan. Silakan hubungi Guru Pengajar atau Admin Utama untuk melakukan input.</p>
          </div>
        </div>
      )}

      {/* Main layout divide: Left (Control and List) VS Right (Logs & AI) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ACTIVE Attendance Register */}
        <div className="xl:col-span-8 space-y-6">

          {/* Setup Config Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-xs space-y-4">
            
            {/* 📅 Pilih Cepat Berdasarkan Jadwal Mengajar */}
            <div className="border border-indigo-100 rounded-xl bg-indigo-50/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/50 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wide block">
                      PILIH DARI JADWAL MENGAJAR GURU MATAPELAJARAN
                    </span>
                    {effectiveTeacherName !== "semua" && (
                      <span className="text-[10px] font-bold text-indigo-600 block">
                        📍 Menampilkan Jadwal Khusus: <span className="font-extrabold underline">{effectiveTeacherName}</span> ({filteredSchedules.length} Kelas)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Filter Guru:</span>
                    <select
                      value={selectedTeacherFilter}
                      onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                      className="bg-white border border-slate-250 py-0.5 px-2 text-[10px] rounded-md font-bold text-slate-800 focus:outline-indigo-500 transition-colors max-w-[170px] truncate cursor-pointer"
                    >
                      {username && (
                        <option value="auto">
                          🤖 Auto ({matchedTeacherName ? matchedTeacherName.split(",")[0] : username})
                        </option>
                      )}
                      <option value="semua">Semua Guru (Seluruh Jadwal)</option>
                      {uniqueTeacherNames.map((tName, i) => (
                        <option key={i} value={tName}>{tName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Semester:</span>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="bg-white border border-slate-250 py-0.5 px-2 text-[10px] rounded-md font-bold text-slate-800 focus:outline-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
                      <option value="Genap 2026/2027">Genap 2026/2027</option>
                      <option value="Ganjil 2027/2028">Ganjil 2027/2028</option>
                      <option value="Genap 2027/2028">Genap 2027/2028</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredSchedules.length === 0 ? (
                <div className="text-center py-4 text-slate-400 font-medium text-[11px]">
                  {effectiveTeacherName !== "semua"
                    ? `Tidak ada jadwal mengajar terdaftar untuk guru ${effectiveTeacherName} di semester ${selectedSemester}.`
                    : `Tidak ada jadwal mengajar di semester ini pada pengaturan data master.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {filteredSchedules.map((sch) => {
                    const isSelected = selectedClass === sch.className && subjectName === sch.subject;
                    return (
                      <div
                        key={sch.id}
                        onClick={() => {
                          setSelectedClass(sch.className);
                          setSubjectName(sch.subject);
                        }}
                        className={`text-left p-2.5 rounded-xl border text-[11px] leading-tight transition-all flex flex-col justify-between hover:scale-[1.01] cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 w-full">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-indigo-100" : "text-indigo-600"}`}>
                            {sch.className}
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                              {sch.day}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerConfirm(
                                  "Hapus Jadwal Mengajar",
                                  `Apakah Anda yakin ingin menghapus jadwal mengajar '${sch.subject}' untuk kelas ${sch.className} oleh ${sch.teacherName}?`,
                                  () => {
                                    setActiveSchedules(prev => prev.filter(s => s.id !== sch.id));
                                  }
                                );
                              }}
                              className={`p-1 rounded-md transition-all cursor-pointer ${
                                isSelected 
                                  ? "hover:bg-white/10 text-white/80 hover:text-white" 
                                  : "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              }`}
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="font-extrabold mt-1 truncate w-full" title={sch.subject}>
                          {sch.subject}
                        </div>
                        <div className={`text-[9px] font-medium mt-1 truncate ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                          Diajar oleh: {sch.teacherName} • {sch.period}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="text-[10px] text-slate-500 font-semibold leading-relaxed flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                <span>Memilih jadwal otomatis mengonfigurasi Kelas & Mata Pelajaran serta menampilkan daftar siswa terkait.</span>
              </div>
            </div>

            {/* Inputs settings row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mata Pelajaran (Klik Pilihan)</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-indigo-500 font-bold cursor-pointer"
                >
                  {activeSubjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                  {!activeSubjects.includes(subjectName) && subjectName && (
                    <option value={subjectName}>{subjectName}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Absensi</label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 pr-9 focus:outline-indigo-500 font-mono font-bold"
                  />
                  <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Bulk present button action helper */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleMarkAllHadir}
                  className="w-full bg-emerald-50 hover:bg-emerald-100/85 text-emerald-800 font-bold text-xs py-2.5 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Hadirkan Semua Siswa</span>
                </button>
              </div>
            </div>

          </div>

          {/* PERWALIAN & GURU WALI CONTROL BANNER */}
          {teacherPerwalianClass && (
            <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-4 rounded-2xl text-white border border-teal-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white uppercase tracking-tight">
                      Kelas Perwalian / Guru Wali: <span className="text-teal-300 font-extrabold">{teacherPerwalianClass}</span>
                    </span>
                    {teacherBimbinganStudentNames.length > 0 && (
                      <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        {teacherBimbinganStudentNames.length} Murid Bimbingan
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-200/90 font-medium mt-0.5">
                    Pembina: <strong className="text-white">{username}</strong> • {selectedClass === teacherPerwalianClass ? `Menampilkan presensi kelas perwalian ${teacherPerwalianClass}` : `Kelas aktif: ${selectedClass}. Klik untuk menuju ke kelas perwalian Anda.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto justify-end">
                {selectedClass !== teacherPerwalianClass ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(teacherPerwalianClass);
                      setOnlyShowBimbinganSiswa(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Buka Kelas Perwalian ({teacherPerwalianClass})</span>
                  </button>
                ) : (
                  teacherBimbinganStudentNames.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOnlyShowBimbinganSiswa(!onlyShowBimbinganSiswa)}
                      className={`font-extrabold text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                        onlyShowBimbinganSiswa
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black"
                          : "bg-teal-800/90 hover:bg-teal-700 text-teal-100 border-teal-600/60"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>{onlyShowBimbinganSiswa ? "Tampilkan Semua Siswa Kelas" : `Filter Hanya ${teacherBimbinganStudentNames.length} Murid Bimbingan`}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Live Student Grid & Custom Inputs */}
          <div className="bg-white rounded-2xl border border-slate-205 shadow-xs overflow-hidden">
            
            {/* Toolbar row with student searchable text & Add student tool */}
            <div className="bg-slate-50 border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Daftar Nama Siswa ({selectedClass})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Search query box */}
                <div className="relative flex-1 md:flex-none">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs w-full md:w-44 focus:outline-indigo-500 font-medium"
                    placeholder="Saring nama..."
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>

                <button
                  onClick={handleResetClassToDefault}
                  title="Kembalikan data nama ke bawaan sistem"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* QUICK FORM: ADD NEW STUDENT IN CLASS */}
            <form onSubmit={handleAddStudent} className="p-4 bg-indigo-50/15 border-b flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ketik & input nama siswa baru di sini... (cth: Bagas Wijaya)"
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 pr-20 focus:outline-indigo-500 font-bold"
                />
                <span className="absolute right-3 top-2 text-[9px] font-bold text-indigo-500 uppercase">
                  Siswa Baru
                </span>
              </div>
              <button
                type="submit"
                id="btn-add-new-student-action"
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah</span>
              </button>
            </form>

            {/* STUDENT CLICK ATTENDANCE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs bg-white text-slate-600">
                <thead className="bg-slate-50 border-b">
                  <tr className="uppercase text-[9.5px] font-black text-slate-400 tracking-wider">
                    <th className="py-3 px-4 font-extrabold w-12 text-center bg-slate-52">No</th>
                    <th className="py-3 px-4 font-extrabold">Nama Lengkap Siswa</th>
                    <th className="py-3 px-4 font-extrabold text-center">Status Sekarang</th>
                    <th className="py-3 px-4 font-extrabold text-right">Aksi Click kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold">Tidak ada siswa terdaftar or nama siswa tidak cocok.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((student, idx) => {
                      const isEditing = editingStudentId === student.id;
                      
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 font-medium">
                          {/* Number index */}
                          <td className="py-3 px-4 text-center font-bold text-slate-400 bg-slate-50/20">{idx + 1}</td>
                          
                          {/* Name edit block */}
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex gap-1.5 items-center">
                                <input
                                  type="text"
                                  value={editingStudentName}
                                  onChange={(e) => setEditingStudentName(e.target.value)}
                                  className="border rounded px-2.5 py-1 text-xs font-bold w-full bg-white focus:outline-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(student.name)}
                                  className="text-emerald-600 text-xs font-bold hover:underline px-1 shrink-0"
                                >
                                  Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="text-slate-400 text-xs font-semibold hover:underline px-1 shrink-0"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center group/n">
                                <span className="font-extrabold text-[#1F2937] text-xs leading-none">
                                  {student.name}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] opacity-0 group-hover/n:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleStartEdit(student.id, student.name)}
                                    className="text-slate-400 hover:text-indigo-600 font-bold"
                                  >
                                    Ubah Nama
                                  </button>
                                  <span className="text-slate-300">•</span>
                                  <button
                                    onClick={() => handleDeleteStudent(student.name)}
                                    className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5"
                                    title="Hapus Siswa"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Status Indicator */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              student.status === "Hadir"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : student.status === "Sakit"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : student.status === "Izin"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-red-100 text-red-850 border border-red-200"
                            }`}>
                              {student.status}
                            </span>
                          </td>

                          {/* 4 Interactive click target status buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-[10px] font-mono leading-none gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(student.id, "Hadir")}
                                className={`px-2.5 py-1 rounded font-black cursor-pointer transition-all ${
                                  student.status === "Hadir"
                                    ? "bg-emerald-500 text-white shadow-xs scale-102"
                                    : "text-slate-650 hover:bg-slate-200"
                                }`}
                              >
                                HADIR
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(student.id, "Sakit")}
                                className={`px-2.5 py-1 rounded font-black cursor-pointer transition-all ${
                                  student.status === "Sakit"
                                    ? "bg-blue-500 text-white shadow-xs scale-102"
                                    : "text-slate-650 hover:bg-slate-200"
                                }`}
                              >
                                SAKIT
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(student.id, "Izin")}
                                className={`px-2.5 py-1 rounded font-black cursor-pointer transition-all ${
                                  student.status === "Izin"
                                    ? "bg-amber-500 text-white shadow-xs scale-102"
                                    : "text-slate-650 hover:bg-slate-200"
                                }`}
                              >
                                IZIN
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(student.id, "Alfa")}
                                className={`px-2.5 py-1 rounded font-black cursor-pointer transition-all ${
                                  student.status === "Alfa"
                                    ? "bg-red-500 text-white shadow-xs scale-102"
                                    : "text-slate-650 hover:bg-slate-200"
                                }`}
                              >
                                ALFA
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Form Actions to save record */}
            <div className="bg-slate-50 border-t p-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-500 font-bold">
                ⚠️ Pastikan semua status telah diklik/diatur sebelum menyimpan laporan absensi harian kelas.
              </div>
              <button
                type="button"
                id="btn-save-attendance-record"
                onClick={handleSaveDailyLog}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4.5 w-4.5 text-emerald-400" />
                <span>Simpan Rekap Absensi (Arsip)</span>
              </button>
            </div>

          </div>

          {/* LAPORAN INTEGRASI & DUAL-VERIFIKASI WALI KELAS */}
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">
                    Laporan Dual-Verifikasi Wali Kelas (Siswa Mandiri vs Guru Mapel)
                  </h3>
                  <p className="text-[10px] text-indigo-200">Menghubungkan data presensi mandiri siswa dengan real-time input guru mata pelajaran pada {selectedDate}.</p>
                </div>
              </div>
              <span className="bg-emerald-500 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sinkron Otomatis
              </span>
            </div>

            <div className="p-4 bg-indigo-50/20 border-b border-indigo-100/50 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-indigo-950 font-bold leading-relaxed max-w-xl">
                📌 <strong>Ketentuan Integritas:</strong> Presensi dari guru mata pelajaran adalah <strong>real (faktual)</strong> dan tidak bisa ditimpa oleh siswa. Halaman ini memfasilitasi Wali Kelas untuk mencocokkan kejujuran absen mandiri siswa di setiap pergantian jam pelajaran.
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-150 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-slate-600">Hijau: Cocok</span>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-bold text-slate-600">Merah: Selisih (Discrepancy)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs bg-white text-slate-650">
                <thead className="bg-slate-50 border-b">
                  <tr className="uppercase text-[9px] font-black text-slate-400 tracking-wider">
                    <th className="py-3 px-4 font-extrabold w-10 text-center">No</th>
                    <th className="py-3 px-4 font-extrabold w-44">Siswa</th>
                    <th className="py-3 px-4 font-extrabold bg-blue-50/30">Presensi Mandiri Siswa</th>
                    <th className="py-3 px-4 font-extrabold bg-indigo-50/30">Presensi Guru Mapel (Per Jam/Sesi)</th>
                    <th className="py-3 px-4 font-extrabold text-center">Hasil Dual-Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada siswa terdaftar pada kelas {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    attendanceList.map((student, idx) => {
                      // Lookup student's self attendance for selectedDate
                      const selfRecord = selfAttendanceList.find(
                        r => r.studentName === student.name && r.date === selectedDate
                      );

                      // Lookup all other subject logs saved today for this student/class (pergantian jam)
                      const savedDayLogs = savedLogs.filter(
                        log => log.className === selectedClass && log.date === selectedDate
                      );
                      const otherSubjectsPresensi = savedDayLogs.map(log => {
                        const rec = log.records.find(r => r.name === student.name);
                        return {
                          subject: log.subject,
                          status: rec ? rec.status : "Belum diisi"
                        };
                      });

                      // Determine current live teacher status
                      const liveTeacherStatus = student.status;

                      // Verification Logic
                      let verifBadgeClass = "";
                      let verifText = "";
                      let hasWarning = false;

                      if (!selfRecord) {
                        verifBadgeClass = "bg-slate-100 text-slate-600 border border-slate-200";
                        verifText = "Belum Mengisi Presensi Mandiri";
                        if (liveTeacherStatus === "Hadir") {
                          verifBadgeClass = "bg-amber-50 text-amber-800 border border-amber-200";
                          verifText = "Siswa Belum Absen Mandiri (Guru: Hadir)";
                        }
                      } else {
                        const selfStatus = selfRecord.status;
                        if (selfStatus === liveTeacherStatus) {
                          verifBadgeClass = "bg-emerald-50 text-emerald-800 border border-emerald-200";
                          verifText = `Cocok: ${selfStatus}`;
                        } else {
                          hasWarning = true;
                          verifBadgeClass = "bg-red-50 text-red-800 border border-red-200";
                          verifText = `SELISIH: Siswa melapor '${selfStatus}' tapi Guru menilai '${liveTeacherStatus}'`;
                        }
                      }

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/40">
                          <td className="py-4 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-4 px-4 font-extrabold text-slate-900">{student.name}</td>
                          
                          {/* Self Presensi Column */}
                          <td className="py-4 px-4 bg-blue-50/10">
                            {selfRecord ? (
                              <div className="flex items-start gap-2.5">
                                {selfRecord.photo && (
                                  <div 
                                    className="relative shrink-0 cursor-pointer group"
                                    onClick={() => {
                                      setViewSelfieUrl(selfRecord.photo);
                                      setViewSelfieTitle(`Verifikasi Masuk - ${student.name}`);
                                    }}
                                  >
                                    <img 
                                      src={selfRecord.photo} 
                                      alt="Selfie" 
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 group-hover:border-indigo-500" 
                                    />
                                    <span className="absolute bottom-0 inset-x-0 bg-indigo-650/80 text-[7px] text-white font-black text-center py-0.5 rounded-b-lg">FOTO</span>
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      selfRecord.status === "Hadir"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : selfRecord.status === "Sakit"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {selfRecord.status}
                                    </span>
                                    {selfRecord.clockIn && (
                                      <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-1 border rounded">
                                        Masuk: {selfRecord.clockIn}
                                      </span>
                                    )}
                                    {selfRecord.clockOut && (
                                      <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-1 border rounded">
                                        Pulang: {selfRecord.clockOut}
                                      </span>
                                    )}
                                  </div>
                                  {selfRecord.reason && (
                                    <p className="text-[10px] text-slate-500 italic font-medium leading-tight">
                                      Ket: "{selfRecord.reason}"
                                    </p>
                                  )}
                                  {selfRecord.photoLabel && (
                                    <p className="text-[9px] text-indigo-600 font-bold leading-tight">
                                      ✓ {selfRecord.photoLabel}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic font-semibold">
                                Belum clock-in/out mandiri
                              </span>
                            )}
                          </td>

                          {/* Teacher Presensi Column */}
                          <td className="py-4 px-4 bg-indigo-50/10 space-y-1.5">
                            {/* Live current session */}
                            <div className="flex items-center gap-1.5">
                              <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                Sesi Aktif
                              </span>
                              <span className="text-[10px] text-slate-600 font-bold truncate max-w-[120px]" title={subjectName}>
                                {subjectName}:
                              </span>
                              <span className={`text-[10px] font-black uppercase ${
                                liveTeacherStatus === "Hadir" ? "text-emerald-600" : liveTeacherStatus === "Alfa" ? "text-rose-600" : "text-amber-600"
                              }`}>
                                {liveTeacherStatus}
                              </span>
                            </div>

                            {/* Other archived subjects for this day */}
                            {otherSubjectsPresensi.length > 0 && (
                              <div className="space-y-1 border-t pt-1 border-slate-100">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Jadwal Sesi Lainnya:</span>
                                {otherSubjectsPresensi.map((oth, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                    <span className="truncate max-w-[120px]">{oth.subject}:</span>
                                    <span className={`font-black uppercase text-[9.5px] ${
                                      oth.status === "Hadir" ? "text-emerald-600" : "text-rose-500"
                                    }`}>{oth.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Dual Verification Column */}
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase inline-block leading-tight ${verifBadgeClass}`}>
                              {verifText}
                            </span>
                            {hasWarning && (
                              <p className="text-[9.5px] text-rose-500 font-bold mt-1 leading-none">
                                🚨 Perlu investigasi Wali Kelas / Guru BK
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DRAFT NOTIFICATION SECTION */}
          {attendanceList.some(s => s.status !== "Hadir") && (
            <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>KIRIM NOTIFIKASI ABSEN WALI MURID (WHATSAPP)</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Pilihlah salah satu siswa mangkir atau sakit di bawah untuk langsung menyusun draf laporan, lalu kirim ke nomor HP wali murid secara murni gratis tanpa biaya API.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Set Nomor WA Pengujian (Wali Murid)</label>
                  <input
                    type="text"
                    value={waNotifyPhone}
                    onChange={(e) => setWaNotifyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-mono font-bold"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-[10px] text-emerald-950 flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold">
                    SIMPATI AI menggunakan gateway URL API direct link resmi yang 100% gratis. Tidak ada lisensi, pulsa, atau key yang perlu diseting!
                  </p>
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-2 border p-2 rounded-xl bg-slate-50">
                {attendanceList.filter(s => s.status !== "Hadir").map(s => (
                  <div key={s.id} className="bg-white p-3 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="font-extrabold text-xs text-slate-850 block">{s.name}</span>
                      <div className="flex gap-2 items-center text-[10px] mt-0.5">
                        <span className="text-rose-600 font-bold uppercase">{s.status}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-mono italic">Draft msg generated</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleLaunchWhatsApp(s.name, s.status)}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
                        title="Kirim menggunakan WhatsApp Web Manual"
                      >
                        <Send className="h-3 w-3" />
                        <span>Manual WA Web</span>
                      </button>
                      <button
                        disabled={isSendingWA[s.name]}
                        onClick={() => handleSendFonnteWhatsApp(s.name, s.status)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
                        title="Kirim secara instan di latar belakang via Fonnte Gateway"
                      >
                        {isSendingWA[s.name] ? "Mengirim..." : "Kirim Otomatis"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: RECAP STATS, AI COGNITION & LOG ARCHIVES */}
        <div className="xl:col-span-4 space-y-6">

          {/* Live Quick Stats Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Statistik Hari Ini ({selectedClass})
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Siswa</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStudents}</p>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Hadir</span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">{countHadir}</p>
              </div>

              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 text-center">
                <span className="text-[10px] text-red-650 font-bold uppercase">Alfa (Mangkir)</span>
                <p className="text-2xl font-extrabold text-red-700 mt-1">{countAlfa}</p>
              </div>

              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-150 text-center">
                <span className="text-[10px] text-amber-600 font-bold uppercase">Sakit/Izin</span>
                <p className="text-2xl font-extrabold text-amber-800 mt-1">{countSakit + countIzin}</p>
              </div>
            </div>

            {/* Attendance progress bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-650 mb-1.5">
                <span>Rasio Kehadiran</span>
                <span>{attendanceRate}%</span>
              </div>
              <div className="h-2.5 bg-slate-150 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    attendanceRate >= 90 
                      ? "bg-emerald-500" 
                      : attendanceRate >= 75 
                      ? "bg-amber-400" 
                      : "bg-red-500"
                  }`} 
                  style={{ width: `${attendanceRate}%` }} 
                />
              </div>
            </div>
          </div>

          {/* AI ATTENDANCE INSIGHTS */}
          <div className="bg-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                <span>Analisis Kehadiran AI</span>
              </h4>
              <p className="text-[10px] text-indigo-200 mt-1 leading-normal">
                Gunakan kecerdasan buatan untuk mengamati tingkat kerawanan kelas, mengidentifikasi siswa berulang tidak hadir, dan menyiasati sarana bimbingan.
              </p>
            </div>

            <button
              onClick={handleAnalyzeAttendanceAI}
              disabled={aiAnalyzing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 disabled:bg-slate-600 disabled:text-slate-400 cursor-pointer transition-colors"
            >
              {aiAnalyzing ? (
                <span>Membaca Data Kelas...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Kalkulasi Rekap Kehadiran AI</span>
                </>
              )}
            </button>

            {aiAnalysis && (
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-left font-mono text-[10px] whitespace-pre-wrap leading-relaxed text-slate-200 shadow-inner max-h-[250px] overflow-y-auto">
                {aiAnalysis}
              </div>
            )}
          </div>

          {/* ARCHIVE LOGS LIST (COMPLETED DAYS RECAPS) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
              <h4 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider">
                Arsip Rekap Absensi Kelas ({savedLogs.length})
              </h4>
            </div>

            {savedLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 border border-dashed rounded-xl">
                <Calendar className="h-6 w-6 mx-auto text-slate-300 mb-1" />
                <p className="text-[10.5px]">Belum ada arsip daily log terdaftar hari ini.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {savedLogs.map((log) => {
                  const rate = log.records.length > 0 
                    ? Math.round((log.records.filter(r => r.status === "Hadir").length / log.records.length) * 100)
                    : 0;
                  
                  return (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between gap-2 text-[11px]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">{log.className}</span>
                          <span className="text-[9.5px] text-slate-400 font-mono">{log.date} • {log.subject}</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                          rate >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {rate}% Hadir
                        </span>
                      </div>

                      <div className="flex gap-2 justify-end items-center border-t border-slate-100 pt-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadPreservedLog(log)}
                          className="text-indigo-600 hover:text-indigo-850 font-extrabold text-[10px]"
                        >
                          Tinjau Ulang
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus Log</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FULL SCREEN PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {viewSelfieUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewSelfieUrl(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-md w-full border border-slate-200 shadow-2xl cursor-default"
            >
              <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {viewSelfieTitle || "Foto Verifikasi Kehadiran"}
                </span>
                <button
                  type="button"
                  onClick={() => setViewSelfieUrl(null)}
                  className="text-slate-400 hover:text-slate-700 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-full text-xs transition-colors font-bold w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 flex flex-col items-center justify-center bg-slate-100">
                <div className="relative border-4 border-white shadow-lg rounded-2xl overflow-hidden bg-black max-w-xs w-full aspect-square">
                  <img
                    src={viewSelfieUrl}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[8px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Verified
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t text-center text-[11px] text-slate-500 leading-relaxed font-bold">
                ✓ Latar Belakang & Kelengkapan Baju Seragam Teridentifikasi Sesuai
              </div>
            </motion.div>
          </motion.div>
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

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-left"
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

      {/* Modal Bagikan Link Presensi Siswa */}
      <AnimatePresence>
        {isShareLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Bagikan Tautan Presensi Siswa</h3>
                    <p className="text-xs text-slate-500">Tautan langsung akses portal presensi mandiri siswa SMK Negeri 2 Konawe.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareLinkModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Share URL Box */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Tautan Langsung Presensi Siswa:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?mode=absen_siswa`}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}${window.location.pathname}?mode=absen_siswa`;
                      navigator.clipboard.writeText(link);
                      setCopyLinkSuccess(true);
                      setTimeout(() => setCopyLinkSuccess(false), 2500);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shrink-0 cursor-pointer shadow-sm ${
                      copyLinkSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copyLinkSuccess ? "Tersalin! ✓" : "Salin Link"}</span>
                  </button>
                </div>
              </div>

              {/* Direct WhatsApp Share Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}${window.location.pathname}?mode=absen_siswa`;
                    const waText = encodeURIComponent(
                      `*LINK PRESENSI HARIAN SISWA SMK NEGERI 2 KONAWE* 📲\n\n` +
                      `Halo siswa-siswi SMK Negeri 2 Konawe, silakan lakukan presensi masuk/pulang hari ini melalui tautan resmi:\n` +
                      `👉 ${link}\n\n` +
                      `*Langkah Pengisian:*\n` +
                      `1. Buka tautan di atas melalui browser HP (Chrome/Safari).\n` +
                      `2. Pilih Jurusan, Kelas, dan Nama Lengkap Anda.\n` +
                      `3. Masukkan NISN Anda sebagai kata sandi.\n` +
                      `4. Lakukan pengambilan foto selfie berseragam rapi & pastikan GPS diaktifkan.\n` +
                      `5. Klik "Simpan Presensi". Hasil presensi otomatis terekap langsung di dashboard Guru Pengajar & Admin Tata Usaha SMK Negeri 2 Konawe!`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${waText}`, "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Tautan ke Grup WhatsApp Siswa / Kelas</span>
                </button>
              </div>

              {/* Informative Guidance */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  Bagaimana data presensi siswa terekap ke Guru & Admin TU?
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Siswa mengisi presensi dari ponsel masing-masing menggunakan tautan di atas.</li>
                  <li>Sistem menyinkronkan data secara otomatis ke <strong>Cloud Firestore</strong>.</li>
                  <li>Guru Pengajar dan Admin Tata Usaha dapat langsung memantau bukti selfie, koordinat GPS, dan status masuk/pulang di menu <strong>Rekap Laporan</strong> dan tabel <strong>Dual-Verifikasi</strong> secara <em>real-time</em>.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
