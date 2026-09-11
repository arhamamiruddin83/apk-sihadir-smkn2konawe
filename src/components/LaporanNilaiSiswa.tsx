/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Award, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  UserCheck, 
  Sparkles, 
  Printer, 
  Calculator, 
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Gauge
} from "lucide-react";
import { MOCK_STUDENTS } from "../mockData";
import { getTeacherMatchedSchedules, getStoredSchedules, normalizeName, isSameTeacherName } from "../utils/scheduleHelper";

// Define score parameters
interface GradeRecord {
  schoolYear: string;
  semester: "Ganjil" | "Genap";
  attendanceRate: number; // 0 - 100 %
  taskCompletion: number; // 0 - 100 score
  attitudeScore: number; // 0 - 100 score
  peerScore: number; // 0 - 100 score
  skillScore: number; // 0 - 100 score
  nilaiHarian: number; // 0 - 100 score
  nilaiFormatif: number; // 0 - 100 score
  nilaiSumatif: number; // 0 - 100 score
}

// Default mock grades database for 3 school years, 2 semesters, for all 10 students
const DEFAULT_GRADES_DATABASE: Record<string, Record<string, Record<"Ganjil" | "Genap", GradeRecord>>> = {
  // Aditya Pratama (S01)
  "S01": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 95, taskCompletion: 88, attitudeScore: 90, peerScore: 85, skillScore: 88, nilaiHarian: 85, nilaiFormatif: 87, nilaiSumatif: 84 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 98, taskCompletion: 92, attitudeScore: 94, peerScore: 88, skillScore: 90, nilaiHarian: 88, nilaiFormatif: 91, nilaiSumatif: 89 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 92, taskCompletion: 84, attitudeScore: 88, peerScore: 82, skillScore: 85, nilaiHarian: 82, nilaiFormatif: 84, nilaiSumatif: 81 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 96, taskCompletion: 90, attitudeScore: 92, peerScore: 86, skillScore: 87, nilaiHarian: 86, nilaiFormatif: 89, nilaiSumatif: 86 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 97, taskCompletion: 95, attitudeScore: 95, peerScore: 90, skillScore: 92, nilaiHarian: 92, nilaiFormatif: 94, nilaiSumatif: 90 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 96, taskCompletion: 94, attitudeScore: 96, peerScore: 92, skillScore: 93, nilaiHarian: 91, nilaiFormatif: 95, nilaiSumatif: 92 }
    }
  },
  // Bagus Setiawan (S02)
  "S02": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 85, taskCompletion: 75, attitudeScore: 78, peerScore: 80, skillScore: 72, nilaiHarian: 74, nilaiFormatif: 76, nilaiSumatif: 71 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 88, taskCompletion: 78, attitudeScore: 82, peerScore: 81, skillScore: 75, nilaiHarian: 77, nilaiFormatif: 79, nilaiSumatif: 74 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 90, taskCompletion: 80, attitudeScore: 85, peerScore: 84, skillScore: 78, nilaiHarian: 80, nilaiFormatif: 82, nilaiSumatif: 77 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 92, taskCompletion: 82, attitudeScore: 88, peerScore: 85, skillScore: 82, nilaiHarian: 83, nilaiFormatif: 86, nilaiSumatif: 80 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 88, taskCompletion: 75, attitudeScore: 80, peerScore: 78, skillScore: 74, nilaiHarian: 75, nilaiFormatif: 78, nilaiSumatif: 73 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 91, taskCompletion: 79, attitudeScore: 82, peerScore: 80, skillScore: 78, nilaiHarian: 78, nilaiFormatif: 81, nilaiSumatif: 76 }
    }
  },
  // Dedi Cahyono (S03)
  "S03": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 100, taskCompletion: 98, attitudeScore: 98, peerScore: 96, skillScore: 95, nilaiHarian: 96, nilaiFormatif: 97, nilaiSumatif: 94 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 100, taskCompletion: 99, attitudeScore: 99, peerScore: 98, skillScore: 97, nilaiHarian: 98, nilaiFormatif: 99, nilaiSumatif: 96 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 99, taskCompletion: 96, attitudeScore: 97, peerScore: 95, skillScore: 94, nilaiHarian: 94, nilaiFormatif: 96, nilaiSumatif: 92 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 100, taskCompletion: 98, attitudeScore: 98, peerScore: 97, skillScore: 96, nilaiHarian: 96, nilaiFormatif: 98, nilaiSumatif: 95 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 100, taskCompletion: 99, attitudeScore: 100, peerScore: 98, skillScore: 98, nilaiHarian: 98, nilaiFormatif: 99, nilaiSumatif: 97 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 100, taskCompletion: 100, attitudeScore: 100, peerScore: 99, skillScore: 99, nilaiHarian: 99, nilaiFormatif: 100, nilaiSumatif: 98 }
    }
  },
  // Eko Purwanto (S04)
  "S04": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 78, taskCompletion: 60, attitudeScore: 70, peerScore: 72, skillScore: 65, nilaiHarian: 63, nilaiFormatif: 65, nilaiSumatif: 60 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 82, taskCompletion: 64, attitudeScore: 72, peerScore: 74, skillScore: 68, nilaiHarian: 66, nilaiFormatif: 69, nilaiSumatif: 63 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 80, taskCompletion: 65, attitudeScore: 74, peerScore: 73, skillScore: 66, nilaiHarian: 68, nilaiFormatif: 70, nilaiSumatif: 64 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 85, taskCompletion: 70, attitudeScore: 76, peerScore: 75, skillScore: 70, nilaiHarian: 71, nilaiFormatif: 73, nilaiSumatif: 68 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 84, taskCompletion: 62, attitudeScore: 72, peerScore: 70, skillScore: 65, nilaiHarian: 64, nilaiFormatif: 68, nilaiSumatif: 61 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 86, taskCompletion: 68, attitudeScore: 75, peerScore: 73, skillScore: 68, nilaiHarian: 68, nilaiFormatif: 71, nilaiSumatif: 65 }
    }
  },
  // Fajar Ramadan (S05)
  "S05": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 94, taskCompletion: 82, attitudeScore: 86, peerScore: 84, skillScore: 85, nilaiHarian: 83, nilaiFormatif: 85, nilaiSumatif: 80 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 95, taskCompletion: 85, attitudeScore: 88, peerScore: 86, skillScore: 88, nilaiHarian: 86, nilaiFormatif: 88, nilaiSumatif: 84 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 92, taskCompletion: 84, attitudeScore: 85, peerScore: 82, skillScore: 83, nilaiHarian: 82, nilaiFormatif: 84, nilaiSumatif: 81 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 94, taskCompletion: 86, attitudeScore: 87, peerScore: 85, skillScore: 86, nilaiHarian: 85, nilaiFormatif: 87, nilaiSumatif: 83 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 96, taskCompletion: 88, attitudeScore: 89, peerScore: 87, skillScore: 88, nilaiHarian: 86, nilaiFormatif: 89, nilaiSumatif: 85 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 97, taskCompletion: 91, attitudeScore: 92, peerScore: 90, skillScore: 90, nilaiHarian: 89, nilaiFormatif: 92, nilaiSumatif: 88 }
    }
  },
  // Guntur Wibowo (S06)
  "S06": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 91, taskCompletion: 76, attitudeScore: 82, peerScore: 78, skillScore: 80, nilaiHarian: 78, nilaiFormatif: 80, nilaiSumatif: 76 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 93, taskCompletion: 79, attitudeScore: 84, peerScore: 80, skillScore: 82, nilaiHarian: 81, nilaiFormatif: 83, nilaiSumatif: 78 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 88, taskCompletion: 75, attitudeScore: 80, peerScore: 77, skillScore: 78, nilaiHarian: 76, nilaiFormatif: 78, nilaiSumatif: 74 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 90, taskCompletion: 78, attitudeScore: 83, peerScore: 80, skillScore: 81, nilaiHarian: 79, nilaiFormatif: 81, nilaiSumatif: 77 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 94, taskCompletion: 80, attitudeScore: 82, peerScore: 81, skillScore: 82, nilaiHarian: 80, nilaiFormatif: 83, nilaiSumatif: 78 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 95, taskCompletion: 83, attitudeScore: 85, peerScore: 84, skillScore: 84, nilaiHarian: 82, nilaiFormatif: 86, nilaiSumatif: 81 }
    }
  },
  // Hendra Wijaya (S07)
  "S07": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 80, taskCompletion: 68, attitudeScore: 72, peerScore: 75, skillScore: 70, nilaiHarian: 68, nilaiFormatif: 70, nilaiSumatif: 65 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 84, taskCompletion: 72, attitudeScore: 76, peerScore: 78, skillScore: 72, nilaiHarian: 71, nilaiFormatif: 73, nilaiSumatif: 68 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 86, taskCompletion: 74, attitudeScore: 78, peerScore: 80, skillScore: 75, nilaiHarian: 74, nilaiFormatif: 76, nilaiSumatif: 70 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 88, taskCompletion: 77, attitudeScore: 80, peerScore: 82, skillScore: 78, nilaiHarian: 77, nilaiFormatif: 79, nilaiSumatif: 73 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 85, taskCompletion: 70, attitudeScore: 75, peerScore: 76, skillScore: 72, nilaiHarian: 70, nilaiFormatif: 74, nilaiSumatif: 68 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 88, taskCompletion: 75, attitudeScore: 78, peerScore: 79, skillScore: 76, nilaiHarian: 74, nilaiFormatif: 78, nilaiSumatif: 72 }
    }
  },
  // Irfan Hakim (S08)
  "S08": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 96, taskCompletion: 90, attitudeScore: 92, peerScore: 88, skillScore: 90, nilaiHarian: 89, nilaiFormatif: 91, nilaiSumatif: 87 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 98, taskCompletion: 94, attitudeScore: 95, peerScore: 91, skillScore: 92, nilaiHarian: 92, nilaiFormatif: 95, nilaiSumatif: 90 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 94, taskCompletion: 88, attitudeScore: 90, peerScore: 86, skillScore: 87, nilaiHarian: 86, nilaiFormatif: 89, nilaiSumatif: 85 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 96, taskCompletion: 91, attitudeScore: 93, peerScore: 89, skillScore: 89, nilaiHarian: 88, nilaiFormatif: 91, nilaiSumatif: 87 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 98, taskCompletion: 92, attitudeScore: 93, peerScore: 91, skillScore: 92, nilaiHarian: 90, nilaiFormatif: 93, nilaiSumatif: 88 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 97, taskCompletion: 94, attitudeScore: 94, peerScore: 93, skillScore: 93, nilaiHarian: 92, nilaiFormatif: 95, nilaiSumatif: 91 }
    }
  },
  // Kurniawan (S09)
  "S09": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 93, taskCompletion: 80, attitudeScore: 85, peerScore: 82, skillScore: 81, nilaiHarian: 80, nilaiFormatif: 83, nilaiSumatif: 79 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 95, taskCompletion: 84, attitudeScore: 87, peerScore: 85, skillScore: 84, nilaiHarian: 83, nilaiFormatif: 86, nilaiSumatif: 82 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 91, taskCompletion: 82, attitudeScore: 84, peerScore: 80, skillScore: 83, nilaiHarian: 81, nilaiFormatif: 84, nilaiSumatif: 80 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 94, taskCompletion: 85, attitudeScore: 86, peerScore: 83, skillScore: 86, nilaiHarian: 84, nilaiFormatif: 87, nilaiSumatif: 83 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 95, taskCompletion: 85, attitudeScore: 86, peerScore: 84, skillScore: 83, nilaiHarian: 83, nilaiFormatif: 86, nilaiSumatif: 81 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 94, taskCompletion: 86, attitudeScore: 88, peerScore: 85, skillScore: 85, nilaiHarian: 85, nilaiFormatif: 88, nilaiSumatif: 84 }
    }
  },
  // Lukman Nulhakim (S10)
  "S10": {
    "2024/2025": {
      Ganjil: { schoolYear: "2024/2025", semester: "Ganjil", attendanceRate: 70, taskCompletion: 55, attitudeScore: 68, peerScore: 70, skillScore: 60, nilaiHarian: 58, nilaiFormatif: 61, nilaiSumatif: 55 },
      Genap: { schoolYear: "2024/2025", semester: "Genap", attendanceRate: 75, taskCompletion: 60, attitudeScore: 71, peerScore: 72, skillScore: 63, nilaiHarian: 61, nilaiFormatif: 64, nilaiSumatif: 58 }
    },
    "2025/2026": {
      Ganjil: { schoolYear: "2025/2026", semester: "Ganjil", attendanceRate: 72, taskCompletion: 58, attitudeScore: 70, peerScore: 73, skillScore: 62, nilaiHarian: 60, nilaiFormatif: 63, nilaiSumatif: 57 },
      Genap: { schoolYear: "2025/2026", semester: "Genap", attendanceRate: 76, taskCompletion: 62, attitudeScore: 74, peerScore: 75, skillScore: 66, nilaiHarian: 64, nilaiFormatif: 67, nilaiSumatif: 60 }
    },
    "2026/2027": {
      Ganjil: { schoolYear: "2026/2027", semester: "Ganjil", attendanceRate: 71, taskCompletion: 52, attitudeScore: 66, peerScore: 68, skillScore: 58, nilaiHarian: 56, nilaiFormatif: 60, nilaiSumatif: 54 },
      Genap: { schoolYear: "2026/2027", semester: "Genap", attendanceRate: 74, taskCompletion: 58, attitudeScore: 70, peerScore: 71, skillScore: 62, nilaiHarian: 60, nilaiFormatif: 64, nilaiSumatif: 58 }
    }
  }
};

// Default weight percentages
const WEIGHTS = {
  attendanceRate: 15, // 15%
  taskCompletion: 20, // 20%
  attitudeScore: 15,  // 15%
  peerScore: 15,      // 15%
  skillScore: 35      // 35%
};

interface LaporanNilaiSiswaProps {
  currentRole: string;
  username: string;
  isAutomotive?: boolean;
}

export function LaporanNilaiSiswa({ currentRole, username, isAutomotive = true }: LaporanNilaiSiswaProps) {
  // Teacher filter state ("auto", "semua", or specific teacher name)
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("auto");

  // Load all master teaching schedules
  const allMasterSchedules = React.useMemo(() => {
    return getStoredSchedules();
  }, []);

  // Unique list of teachers from master schedules
  const uniqueTeacherNames = React.useMemo(() => {
    const nameSet = new Set<string>();
    allMasterSchedules.forEach(s => {
      if (s.teacherName && s.teacherName.trim()) {
        nameSet.add(s.teacherName.trim());
      }
    });
    return Array.from(nameSet).sort();
  }, [allMasterSchedules]);

  // Schedules matching logged in user (e.g. Arham Amiruddin, S.Pd)
  const teacherSchedules = React.useMemo(() => {
    if (!username) return [];
    return getTeacherMatchedSchedules(username, allMasterSchedules);
  }, [username, allMasterSchedules]);

  const matchedTeacherName = React.useMemo(() => {
    if (teacherSchedules.length > 0 && teacherSchedules[0].teacherName) {
      return teacherSchedules[0].teacherName;
    }
    return username || "";
  }, [teacherSchedules, username]);

  const activeFilterTeacherName = React.useMemo(() => {
    if (selectedTeacherFilter === "semua") return "semua";
    if (selectedTeacherFilter !== "auto") return selectedTeacherFilter;
    if (matchedTeacherName) return matchedTeacherName;
    return "semua";
  }, [selectedTeacherFilter, matchedTeacherName]);

  const activeTeacherSchedules = React.useMemo(() => {
    if (activeFilterTeacherName === "semua") return allMasterSchedules;
    return allMasterSchedules.filter(s => {
      return isSameTeacherName(s.teacherName || "", activeFilterTeacherName);
    });
  }, [activeFilterTeacherName, allMasterSchedules]);

  // Classes taught by the active teacher based on master schedules
  const teacherClasses = React.useMemo(() => {
    return Array.from(new Set(activeTeacherSchedules.map(s => s.className.trim()))).filter(Boolean);
  }, [activeTeacherSchedules]);

  // All available classes (master schedule + mock students)
  const allRegisteredClasses = React.useMemo(() => {
    const fromMaster = allMasterSchedules.map(s => s.className.trim());
    const fromMock = MOCK_STUDENTS.map(s => s.className.trim());
    return Array.from(new Set([...fromMaster, ...fromMock])).filter(Boolean).sort();
  }, [allMasterSchedules]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("S01");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(() => {
    if (teacherClasses.length > 0) return teacherClasses[0];
    return "Semua Kelas";
  });

  useEffect(() => {
    if (teacherClasses.length > 0 && selectedClassFilter === "Semua Kelas") {
      setSelectedClassFilter(teacherClasses[0]);
    } else if (teacherClasses.length > 0 && !teacherClasses.includes(selectedClassFilter) && selectedClassFilter !== "Semua Kelas") {
      setSelectedClassFilter(teacherClasses[0]);
    }
  }, [teacherClasses]);

  // Automatically keep selectedStudentId synchronized with selectedClassFilter
  useEffect(() => {
    const studentsInClass = MOCK_STUDENTS.filter(
      s => selectedClassFilter === "Semua Kelas" || s.className === selectedClassFilter
    );
    if (studentsInClass.length > 0) {
      const currentInFilter = studentsInClass.some(s => s.id === selectedStudentId);
      if (!currentInFilter) {
        setSelectedStudentId(studentsInClass[0].id);
      }
    }
  }, [selectedClassFilter]);
  const [schoolYear, setSchoolYear] = useState<string>("2026/2027");
  const [semester, setSemester] = useState<"Ganjil" | "Genap">("Ganjil");
  const [gradesDb, setGradesDb] = useState<typeof DEFAULT_GRADES_DATABASE>(() => {
    const saved = localStorage.getItem("simpati_custom_grades_db");
    return saved ? JSON.parse(saved) : DEFAULT_GRADES_DATABASE;
  });

  // Synchronized BK Cases & Student Attendance Logs (from other tabs / roles)
  const [bkLogs, setBkLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("simpati_bk_counseling_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "BK-01",
        date: new Date().toISOString().split("T")[0],
        studentName: "Kurniawan",
        className: "XI TKR A",
        caseType: "Tanpa Keterangan (Alfa) di jam produktif",
        actionTaken: "Pemanggilan oleh Guru BK & Konseling persuasif",
        status: "Dalam Bimbingan",
        reportedBy: "Guru / Staf Pelapor"
      }
    ];
  });

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("simpati_saved_attendance_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "S-ATT-01",
        date: new Date().toISOString().split("T")[0],
        className: "XI TKR A",
        subject: "Teknik Kendaraan Ringan (Otomotif)",
        records: [
          { id: "S01", name: "Aditya Pratama", status: "Hadir" },
          { id: "S02", name: "Bagus Setiawan", status: "Sakit" },
          { id: "S03", name: "Dedi Cahyono", status: "Izin" },
          { id: "S04", name: "Eko Purwanto", status: "Hadir" },
          { id: "S05", name: "Fajar Ramadan", status: "Hadir" },
          { id: "S06", name: "Guntur Wibowo", status: "Hadir" },
          { id: "S07", name: "Hendra Wijaya", status: "Hadir" },
          { id: "S08", name: "Irfan Hakim", status: "Hadir" },
          { id: "S09", name: "Kurniawan", status: "Alfa" }
        ]
      }
    ];
  });

  // Keep logs reactively in sync from localStorage (e.g. if updated in BK/Wali tab)
  useEffect(() => {
    const syncLogsFromDisk = () => {
      const savedBK = localStorage.getItem("simpati_bk_counseling_logs");
      if (savedBK) {
        try {
          setBkLogs(JSON.parse(savedBK));
        } catch (e) {
          console.error(e);
        }
      }
      const savedAtt = localStorage.getItem("simpati_saved_attendance_logs");
      if (savedAtt) {
        try {
          setAttendanceLogs(JSON.parse(savedAtt));
        } catch (e) {
          console.error(e);
        }
      }
    };

    syncLogsFromDisk();
    const interval = setInterval(syncLogsFromDisk, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync grades from Penilaian & Remedial Hub dynamically
  useEffect(() => {
    const syncFromPenilaianHub = () => {
      const savedScores = localStorage.getItem("simpati_penilaian_scores");
      if (savedScores) {
        try {
          const scoresList = JSON.parse(savedScores);
          setGradesDb(prev => {
            const updated = JSON.parse(JSON.stringify(prev)); // Deep copy
            let hasChanged = false;

            scoresList.forEach((score: any) => {
              const sId = score.studentId; // e.g. "S01", "S02"
              if (sId && updated[sId]) {
                const currentYr = updated[sId]["2026/2027"];
                if (currentYr) {
                  const semGrade = currentYr[semester];
                  if (semGrade) {
                    // Check if scores differ before updating to prevent infinite renders
                    if (
                      semGrade.taskCompletion !== score.tugas ||
                      semGrade.skillScore !== score.praktik ||
                      semGrade.nilaiHarian !== score.ph ||
                      semGrade.nilaiFormatif !== score.pts ||
                      semGrade.nilaiSumatif !== score.pas
                    ) {
                      currentYr[semester] = {
                        ...semGrade,
                        taskCompletion: score.tugas,
                        skillScore: score.praktik,
                        nilaiHarian: score.ph,
                        nilaiFormatif: score.pts,
                        nilaiSumatif: score.pas
                      };
                      hasChanged = true;
                    }
                  }
                }
              }
            });

            if (hasChanged) {
              return updated;
            }
            return prev;
          });
        } catch (e) {
          console.error("Failed to sync grades from Penilaian Hub:", e);
        }
      }
    };

    syncFromPenilaianHub();
    const interval = setInterval(syncFromPenilaianHub, 3000);
    return () => clearInterval(interval);
  }, [semester]);

  // State to simulate edit/fine-tune
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simAttendance, setSimAttendance] = useState(90);
  const [simTasks, setSimTasks] = useState(85);
  const [simAttitude, setSimAttitude] = useState(85);
  const [simPeer, setSimPeer] = useState(85);
  const [simSkill, setSimSkill] = useState(85);
  const [simHarian, setSimHarian] = useState(80);
  const [simFormatif, setSimFormatif] = useState(82);
  const [simSumatif, setSimSumatif] = useState(80);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync back custom grades to localStorage
  useEffect(() => {
    localStorage.setItem("simpati_custom_grades_db", JSON.stringify(gradesDb));
  }, [gradesDb]);

  // Handle setting active student based on logged in user if they are a student
  useEffect(() => {
    if (currentRole === "siswa" && username) {
      const match = MOCK_STUDENTS.find(s => s.name.toLowerCase() === username.toLowerCase());
      if (match) {
        setSelectedStudentId(match.id);
      } else {
        setSelectedStudentId("S01"); // Default fallback
      }
    }
  }, [currentRole, username]);

  // Retrieve current grades for selection
  const getActiveGrades = (stuId: string, yr: string, sem: "Ganjil" | "Genap"): GradeRecord => {
    const studentDb = gradesDb[stuId] || gradesDb["S01"];
    const yearDb = studentDb[yr] || studentDb["2026/2027"];
    return yearDb[sem];
  };

  const activeGrades = getActiveGrades(selectedStudentId, schoolYear, semester);

  // Sync simulator sliders when activeGrades or selected student changes
  useEffect(() => {
    if (activeGrades) {
      setSimAttendance(activeGrades.attendanceRate);
      setSimTasks(activeGrades.taskCompletion);
      setSimAttitude(activeGrades.attitudeScore);
      setSimPeer(activeGrades.peerScore);
      setSimSkill(activeGrades.skillScore);
      setSimHarian(activeGrades.nilaiHarian);
      setSimFormatif(activeGrades.nilaiFormatif);
      setSimSumatif(activeGrades.nilaiSumatif);
    }
  }, [selectedStudentId, schoolYear, semester]);

  const activeStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId) || MOCK_STUDENTS[0];

  // Filter BK cases specifically for the active student
  const activeStudentBkCases = bkLogs.filter(
    (c) => c.studentName && c.studentName.toLowerCase() === activeStudent.name.toLowerCase()
  );

  // Calculate Sickness, Permission, Absent count from attendance logs for the active student
  let countSakit = 0;
  let countIzin = 0;
  let countAlfa = 0;

  attendanceLogs.forEach((log) => {
    if (log.records && Array.isArray(log.records)) {
      log.records.forEach((rec: any) => {
        if (rec.name && rec.name.toLowerCase() === activeStudent.name.toLowerCase()) {
          if (rec.status === "Sakit") countSakit++;
          else if (rec.status === "Izin") countIzin++;
          else if (rec.status === "Alfa" || rec.status === "Alfa") countAlfa++;
        }
      });
    }
  });

  // Calculate Report Card Score based on prompt's 5 aspects
  // rata-rata kehadiran (15%), kumpul tugas (20%), penilaian sikap (15%), penilaian antar teman (15%), serta penilaian keterampilan langsung oleh guru (35%)
  const calculateReportGrade = (
    att: number, 
    tasks: number, 
    attit: number, 
    peer: number, 
    skill: number
  ) => {
    const val = (
      (att * WEIGHTS.attendanceRate / 100) +
      (tasks * WEIGHTS.taskCompletion / 100) +
      (attit * WEIGHTS.attitudeScore / 100) +
      (peer * WEIGHTS.peerScore / 100) +
      (skill * WEIGHTS.skillScore / 100)
    );
    return Math.round(val * 10) / 10;
  };

  const currentReportGrade = calculateReportGrade(
    simAttendance,
    simTasks,
    simAttitude,
    simPeer,
    simSkill
  );

  // Get status
  const isPassed = currentReportGrade >= 75;

  const getPredikat = (score: number) => {
    if (score >= 90) return { letter: "A", desc: "Sangat Baik", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (score >= 80) return { letter: "B", desc: "Baik", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    if (score >= 75) return { letter: "C", desc: "Cukup (Tuntas)", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { letter: "D", desc: "Kurang (Belum Tuntas)", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const predikat = getPredikat(currentReportGrade);

  // Handle saving customized simulation scores into our database state
  const handleSaveSimulatedScores = () => {
    setGradesDb(prev => {
      const updated = { ...prev };
      if (!updated[selectedStudentId]) updated[selectedStudentId] = {};
      if (!updated[selectedStudentId][schoolYear]) updated[selectedStudentId][schoolYear] = {
        Ganjil: { ...DEFAULT_GRADES_DATABASE["S01"]["2026/2027"]["Ganjil"] },
        Genap: { ...DEFAULT_GRADES_DATABASE["S01"]["2026/2027"]["Genap"] }
      };
      
      updated[selectedStudentId][schoolYear][semester] = {
        schoolYear,
        semester,
        attendanceRate: simAttendance,
        taskCompletion: simTasks,
        attitudeScore: simAttitude,
        peerScore: simPeer,
        skillScore: simSkill,
        nilaiHarian: simHarian,
        nilaiFormatif: simFormatif,
        nilaiSumatif: simSumatif
      };
      return updated;
    });

    setToastMessage("Data nilai berhasil disimpan & diperbarui di server rapor sekolah!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Yearly recap logic: calculate average of Semester Ganjil & Semester Genap for the chosen year
  const sGanjil = getActiveGrades(selectedStudentId, schoolYear, "Ganjil");
  const sGenap = getActiveGrades(selectedStudentId, schoolYear, "Genap");

  const reportGanjil = calculateReportGrade(
    sGanjil.attendanceRate,
    sGanjil.taskCompletion,
    sGanjil.attitudeScore,
    sGanjil.peerScore,
    sGanjil.skillScore
  );

  const reportGenap = calculateReportGrade(
    sGenap.attendanceRate,
    sGenap.taskCompletion,
    sGenap.attitudeScore,
    sGenap.peerScore,
    sGenap.skillScore
  );

  const yearlyAverage = Math.round(((reportGanjil + reportGenap) / 2) * 10) / 10;
  const isYearlyPassed = yearlyAverage >= 75;

  const handlePrint = () => {
    window.print();
  };

  // Check if current user is student or administrator
  const isTeacherOrAdmin = currentRole !== "siswa";

  return (
    <div className="space-y-6" id="student-report-card-workspace">
      
      {/* CSS untuk Optimasi Cetak Lembar Penilaian */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif !important;
          }
          /* Sembunyikan elemen UI interaktif & navigasi */
          .print\\:hidden,
          #quick-role-switcher,
          nav,
          header,
          footer,
          button,
          aside,
          .no-print,
          div[role="tooltip"] {
            display: none !important;
          }
          
          /* Hilangkan padding default workspace */
          #student-report-card-workspace {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Tampilkan area penilaian cetak secara penuh */
          .print-sheet {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 15mm;
          }

          /* Buat batas tabel formal hitam putih */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #1e293b !important;
            padding: 8px !important;
            color: black !important;
          }
          th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {/* === VIEW SCREEN UTAMA (Sembunyikan saat Cetak) === */}
      <div className="print:hidden space-y-6">
        
        {/* Top Welcome Title Grid */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full tracking-wider">
                E-RAPOR MURID
              </span>
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full tracking-wider">
                KURIKULUM MERDEKA
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-400 shrink-0" />
              <span>Portofolio Laporan Capaian Nilai & Lembar Penilaian Belajar</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Transparansi penilaian terintegrasi. Lihat nilai harian, formatif, sumatif, serta rekapitulasi penilaian rapor akhir berbasis kehadiran, tugas, sikap, rekan sebaya, dan kejuruan langsung dari guru.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black px-5 py-3 rounded-xl border border-indigo-400/35 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>Cetak Lembar Penilaian</span>
            </button>
          </div>
        </div>

      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-emerald-500 border border-emerald-400 text-white rounded-xl shadow-lg flex items-center gap-3 font-semibold text-xs"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-white animate-bounce" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Global Selectors Panel */}
      <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          <h3 className="text-xs font-extrabold uppercase text-indigo-950 tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Konfigurasi Filter Portofolio Pembelajaran</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Filter Jadwal Guru:</span>
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="bg-indigo-50/70 border border-indigo-200 py-1 px-2.5 text-[11px] rounded-lg font-bold text-indigo-950 focus:outline-indigo-500 transition-colors max-w-[210px] truncate cursor-pointer"
            >
              {username && (
                <option value="auto">
                  🤖 Auto ({matchedTeacherName ? matchedTeacherName.split(",")[0] : username})
                </option>
              )}
              <option value="semua">Semua Guru (Tampilkan Seluruh Kelas)</option>
              {uniqueTeacherNames.map((tName, i) => (
                <option key={i} value={tName}>{tName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Class Buttons for Taught Classes */}
        {teacherClasses.length > 0 && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              Kelas Diampu ({activeFilterTeacherName !== "semua" ? activeFilterTeacherName.split(",")[0] : "Sesuai Jadwal"}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {teacherClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedClassFilter === cls
                      ? "bg-indigo-600 text-white shadow-sm scale-105"
                      : "bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  <span>{cls}</span>
                  {selectedClassFilter === cls && <CheckCircle className="h-3 w-3 text-amber-300" />}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedClassFilter("Semua Kelas")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedClassFilter === "Semua Kelas"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                Semua Kelas
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Class Filter Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Filter Kelas / Rombel</label>
            <div className="relative">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {teacherClasses.length > 0 ? (
                  <>
                    <option value="Semua Kelas">
                      📍 Semua Kelas Diampu ({teacherClasses.length} Rombel Sesuai Jadwal)
                    </option>
                    {teacherClasses.map((cls) => (
                      <option key={`tcls-${cls}`} value={cls}>
                        Class {cls} (Sesuai Jadwal Mengajar)
                      </option>
                    ))}
                    {activeFilterTeacherName === "semua" && (
                      <optgroup label="📚 KELAS LAINNYA">
                        {allRegisteredClasses
                          .filter(cls => !teacherClasses.includes(cls))
                          .map((cls) => (
                            <option key={`allcls-${cls}`} value={cls}>
                              {cls}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  <>
                    <option value="Semua Kelas">Semua Kelas Terdaftar ({allRegisteredClasses.length} Rombel)</option>
                    {allRegisteredClasses.map((cls) => (
                      <option key={`allcls-${cls}`} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tahun Pelajaran</label>
            <div className="relative">
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="2024/2025">Tahun Pelajaran: 2024/2025</option>
                <option value="2025/2026">Tahun Pelajaran: 2025/2026</option>
                <option value="2026/2027">Tahun Pelajaran: 2026/2027</option>
              </select>
            </div>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Semester Aktif</label>
            <div className="relative">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Ganjil">Semester Ganjil (1)</option>
                <option value="Genap">Semester Genap (2)</option>
              </select>
            </div>
          </div>

          {/* Student Selector (Locked for student role, unlocked for teachers/admins) */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Murid Terdaftar</label>
            {isTeacherOrAdmin ? (
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-indigo-50/50 border border-indigo-150 text-xs font-bold rounded-xl pl-10 pr-3 py-2.5 text-indigo-950 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {MOCK_STUDENTS
                    .filter(s => selectedClassFilter === "Semua Kelas" || s.className === selectedClassFilter)
                    .map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-800">
                        {s.name} ({s.className})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{activeStudent.name}</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                  NIS: {activeStudent.nis} / NISN: {activeStudent.nisn}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card 1: Official Student Report summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lembar Identitas Murid</h4>
                <p className="text-sm font-black text-slate-800">{activeStudent.name}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Kompetensi Keahlian: {activeStudent.major}</p>
              </div>
              <span className="bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase">
                {activeStudent.className}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-slate-500 font-medium">Nomor Induk Murid (NIS):</span>
                <span className="font-bold text-slate-800">{activeStudent.nis}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-slate-500 font-medium">NIS Nasional (NISN):</span>
                <span className="font-bold text-slate-800">{activeStudent.nisn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-slate-500 font-medium">Tahun Pelajaran:</span>
                <span className="font-bold text-slate-800">{schoolYear}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-slate-500 font-medium">Semester / Bagian:</span>
                <span className="font-bold text-slate-800">{semester} ({semester === "Ganjil" ? "1 / Ganjil" : "2 / Genap"})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span className="text-slate-500 font-medium">Wali Kelas Pengampu:</span>
                <span className="font-bold text-slate-800">Wali Kelas</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Informasi Kurikulum</span>
              <p className="text-xs text-slate-700 font-semibold">Menggunakan Standar Penilaian Asesmen SMK Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) minimal 75.</p>
            </div>
          </div>
        </div>

        {/* Card 2: Report Card Calculation Score Center */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl shadow-md p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">AKUMULASI HASIL RAPOR AKHIR</span>
              <span className="bg-white/10 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">100% Terhitung</span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-indigo-400/30 flex flex-col items-center justify-center bg-white/5 shadow-inner">
                  <span className="text-3xl font-black font-mono tracking-tighter text-yellow-300">{currentReportGrade}</span>
                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Rapor Akhir</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-xs font-bold">Predikat:</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${predikat.color}`}>
                    {predikat.letter} ({predikat.desc})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-300 text-xs font-bold">Kelulusan:</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isPassed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}>
                    {isPassed ? "✓ Tuntas Belajar" : "✗ Perlu Remedial"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
              <span className="font-extrabold text-white text-xs block mb-1">Rekomendasi Akademik Merdeka:</span>
              {isPassed 
                ? "Sangat baik. Murid berhasil melampaui Kriteria Ketercapaian Tujuan Pembelajaran (KKTP 75). Disarankan untuk melanjutkan pendalaman keterampilan."
                : "Belum memenuhi standar minimum KKTP (75.0). Wajib mengikuti kelas remedial harian sore di bengkel produktif dan perbaikan tugas tertulis."
              }
            </div>
          </div>

          <div className="text-[9px] text-slate-400 font-mono tracking-wide leading-none text-right">
            Perhitungan Berdasarkan Formula Bobot Rapor Resmi Sekolah
          </div>
        </div>

        {/* Card 3: Yearly Recap Dashboard (Rangkuman 1 Tahun) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between border-b pb-3">
              <span>Merekap 1 Tahun Pelajaran</span>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-[9px] font-bold">Yearly Recap</span>
            </h4>

            {/* Side-by-side semester progress */}
            <div className="space-y-3.5">
              
              {/* Semester 1 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-700">Semester 1 (Ganjil)</span>
                  <span className="font-black font-mono text-slate-800">{reportGanjil} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${reportGanjil >= 75 ? "bg-indigo-500" : "bg-rose-500"}`}
                    style={{ width: `${reportGanjil}%` }}
                  ></div>
                </div>
              </div>

              {/* Semester 2 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-700">Semester 2 (Genap)</span>
                  <span className="font-black font-mono text-slate-800">{reportGenap} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${reportGenap >= 75 ? "bg-indigo-500" : "bg-rose-500"}`}
                    style={{ width: `${reportGenap}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* Calculated annual average box */}
            <div className="bg-slate-50 border p-4 rounded-xl text-center space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Rata-rata 1 Tahun Pelajaran</span>
              <span className="text-3xl font-black font-mono text-slate-900 block leading-tight">{yearlyAverage}</span>
              <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded ${isYearlyPassed ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                {isYearlyPassed ? "Tuntas 1 Tahun Pelajaran" : "Di Bawah KKM Tahunan"}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold italic text-center">
            Mencakup Semester Ganjil & Genap ({schoolYear})
          </div>
        </div>

      </div>

      {/* === INTEGRASI STATUS KEDISIPLINAN, PRESENSI & CATATAN GURU BK === */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Status Kedisiplinan, Ketidakhadiran & Bimbingan Konseling (BK)</h3>
              <p className="text-xs text-slate-500">Hasil sinkronisasi data presensi harian dari Wali Kelas dan penanganan kasus oleh Guru BK</p>
            </div>
          </div>
          <span className="bg-slate-100 text-slate-800 text-[10px] font-mono px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider">
            Sistem Integrasi SIHADIR
          </span>
        </div>

        {/* Attendance Summary Cards (Sickness, Permit, Absence) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider block">🤒 Total Izin Sakit</span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">Dilaporkan Ortu ke Wali Kelas</span>
            </div>
            <span className="text-2xl font-black font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
              {countSakit} <span className="text-xs font-bold">Hari</span>
            </span>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-blue-800 font-black uppercase tracking-wider block">✉️ Total Izin Resmi</span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">Melalui surat keterangan resmi</span>
            </div>
            <span className="text-2xl font-black font-mono text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
              {countIzin} <span className="text-xs font-bold">Hari</span>
            </span>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-rose-800 font-black uppercase tracking-wider block">❌ Absen Tanpa Keterangan (Alfa)</span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">Memerlukan atensi disiplin khusus</span>
            </div>
            <span className={`text-2xl font-black font-mono px-3 py-1 rounded-lg ${countAlfa > 0 ? "bg-rose-200 text-rose-800 animate-pulse" : "bg-rose-100 text-rose-700"}`}>
              {countAlfa} <span className="text-xs font-bold">Hari</span>
            </span>
          </div>
        </div>

        {/* BK Cases Sub-section */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Catatan Kasus / Rujukan Guru BK Resmi</h4>
          
          {activeStudentBkCases.length > 0 ? (
            <div className="border border-slate-150 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white text-slate-600">
                  <thead className="bg-slate-50 border-b">
                    <tr className="uppercase text-[9px] font-extrabold text-slate-400">
                      <th className="py-2 px-4">Tanggal Kejadian</th>
                      <th className="py-2 px-4">Kasus / Pelanggaran Karakter</th>
                      <th className="py-2 px-4">Tindakan / Solusi Guru BK</th>
                      <th className="py-2 px-3 text-center">Status Kasus</th>
                      <th className="py-2 px-4">Pelapor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeStudentBkCases.map((bkCase) => (
                      <tr key={bkCase.id} className="hover:bg-slate-50/30 font-semibold text-slate-750">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{bkCase.date}</td>
                        <td className="py-2.5 px-4 text-slate-900">{bkCase.caseType}</td>
                        <td className="py-2.5 px-4 text-indigo-750 italic">"{bkCase.actionTaken}"</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            bkCase.status === "Selesai"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : bkCase.status === "Dalam Bimbingan"
                              ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {bkCase.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-slate-500">{bkCase.reportedBy || "Guru BK"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-emerald-900 block">✓ Karakter Terpuji (Disiplin Prima)</span>
                <span className="text-xs text-emerald-750 font-semibold block mt-0.5">
                  Murid ini bersih dari catatan kasus perilaku negatif. Tidak ada rujukan bimbingan konseling (BK) yang aktif.
                  Sikap gotong-royong, sopan santun, dan ketaatan terhadap standar tata tertib sekolah berjalan dengan sangat memuaskan.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table: Detailed Grades Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Daftar Nilai Capaian Belajar Detail</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Nilai Harian, Formatif, Sumatif, serta Rincian Aspek Penentu Rapor Akhir</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-slate-800 text-yellow-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              Semester: {semester}
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              Tahun: {schoolYear}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-extrabold border-b">
                <th className="py-3 px-5 font-bold">Kategori Nilai / Aspek Kompetensi</th>
                <th className="py-3 px-4 text-center">Nilai Asli</th>
                <th className="py-3 px-4 text-center">Bobot Rapor</th>
                <th className="py-3 px-4 text-center">Kontribusi Rapor</th>
                <th className="py-3 px-5 text-right">Deskripsi Keterangan Capaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              
              {/* Aspek 1: Rata-rata Kehadiran */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                    <UserCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span>Rata-rata Kehadiran (Clock-In)</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Kehadiran presensi murid di kelas & bengkel</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simAttendance}%</td>
                <td className="py-3 px-4 text-center font-bold text-slate-400">{WEIGHTS.attendanceRate}%</td>
                <td className="py-3 px-4 text-center font-black font-mono text-blue-600">
                  {Math.round((simAttendance * WEIGHTS.attendanceRate / 100) * 10) / 10}
                </td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simAttendance >= 90 ? "Sangat disiplin, kehadiran di atas 90%. Menunjukkan dedikasi belajar prima." : "Kurang disiplin, sering terlambat/absen tanpa keterangan memadai."}
                </td>
              </tr>

              {/* Aspek 2: Kumpul Tugas */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span>Koleksi Kumpul Tugas Mandiri</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Ketepatan & kelengkapan pengumpulan LKPD</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simTasks}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-400">{WEIGHTS.taskCompletion}%</td>
                <td className="py-3 px-4 text-center font-black font-mono text-indigo-600">
                  {Math.round((simTasks * WEIGHTS.taskCompletion / 100) * 10) / 10}
                </td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simTasks >= 80 ? "Seluruh tugas terisi lengkap tepat waktu dengan penulisan terstruktur." : "Beberapa tugas terlewatkan, butuh pendampingan penyelesaian Lembar Kerja."}
                </td>
              </tr>

              {/* Aspek 3: Penilaian Sikap */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span>Penilaian Karakter & Sikap</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Profil Pelajar Pancasila, kejujuran & sopan santun</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simAttitude}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-400">{WEIGHTS.attitudeScore}%</td>
                <td className="py-3 px-4 text-center font-black font-mono text-amber-600">
                  {Math.round((simAttitude * WEIGHTS.attitudeScore / 100) * 10) / 10}
                </td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simAttitude >= 85 ? "Menunjukkan kesantunan tinggi, jujur di bengkel, patuh pada K3." : "Butuh peningkatan kedisiplinan pakaian bengkel dan inisiatif kemandirian."}
                </td>
              </tr>

              {/* Aspek 4: Penilaian Antar Teman */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span>Penilaian Antar Teman Sebaya</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Kolaborasi kerja kelompok & kontribusi praktikum</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simPeer}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-400">{WEIGHTS.peerScore}%</td>
                <td className="py-3 px-4 text-center font-black font-mono text-purple-600">
                  {Math.round((simPeer * WEIGHTS.peerScore / 100) * 10) / 10}
                </td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simPeer >= 80 ? "Mudah diajak bekerjasama, disenangi rekan kelompok, aktif membantu." : "Cenderung pasif dalam diskusi, perlu melatih inisiatif gotong royong."}
                </td>
              </tr>

              {/* Aspek 5: Penilaian Keterampilan Langsung oleh Guru */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span>Keterampilan Praktik Langsung (Guru)</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Penguasaan tune up, pembacaan scanner & troubleshooting</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simSkill}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-400">{WEIGHTS.skillScore}%</td>
                <td className="py-3 px-4 text-center font-black font-mono text-emerald-600">
                  {Math.round((simSkill * WEIGHTS.skillScore / 100) * 10) / 10}
                </td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium font-semibold text-slate-800">
                  {simSkill >= 85 ? "Sangat terampil menggunakan peralatan, diagnosis DTC cepat & presisi." : "Butuh latihan berulang dalam kalibrasi scanner dan perbaikan kelistrikan."}
                </td>
              </tr>

              {/* Harian, Formatif & Sumatif Sub-Table Header */}
              <tr className="bg-slate-900/5 text-slate-950">
                <td colSpan={5} className="py-2.5 px-5 font-black uppercase text-[10px] tracking-widest text-slate-700">
                  Sub-Nilai Evaluasi Belajar (Sebagai Komponen Pelengkap Rapor)
                </td>
              </tr>

              {/* Nilai Harian */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800 pl-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <div>
                    <span>Nilai Harian (Rata-Rata)</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Akumulasi tes kecil dan kuis lisan di kelas</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simHarian}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simHarian >= 75 ? "Berada di atas batas ketuntasan harian." : "Memerlukan remedial uji pemahaman harian."}
                </td>
              </tr>

              {/* Nilai Formatif */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800 pl-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <div>
                    <span>Nilai Formatif (Proses)</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Evaluasi formatif tengah bab pengajaran</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simFormatif}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simFormatif >= 75 ? "Memahami alur tujuan pembelajaran bab ini dengan baik." : "Butuh bimbingan terstruktur pendalaman tujuan belajar."}
                </td>
              </tr>

              {/* Nilai Sumatif */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5 font-bold flex items-center gap-2 text-slate-800 pl-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <div>
                    <span>Nilai Sumatif (Akhir Bab / PAS)</span>
                    <span className="block text-[9px] text-slate-400 font-mono">Ujian sumatif akhir materi kelistrikan & mesin EFI</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{simSumatif}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">-</td>
                <td className="py-3 px-5 text-right text-[11px] text-slate-500 font-medium">
                  {simSumatif >= 75 ? "Mampu mengaplikasikan teori kognitif pada lembar evaluasi sumatif." : "Disarankan mempelajari kembali bank soal sumatif sekolah."}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator & Fine-Tune Panel (Fulfills the interactivity & simulation requested by students and teachers) */}
      <div className="hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Simulator Prediksi Nilai & Input Guru</h3>
              <p className="text-xs text-slate-500">
                {isTeacherOrAdmin 
                  ? "Sebagai Pendidik, Anda dapat langsung mengubah input nilai di bawah ini untuk mengupdate e-rapor murid secara realtime." 
                  : "Sebagai Murid, Anda dapat mensimulasikan nilai Anda dengan menggeser slider di bawah ini secara instan."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsSimulatorOpen(!isSimulatorOpen);
              }}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl border border-indigo-200 transition-all cursor-pointer"
            >
              {isSimulatorOpen ? "Sembunyikan Simulator" : "Buka Panel Simulator"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSimulatorOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-6 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                
                {/* Sliders Block 1 */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b pb-1">Aspek 1 & 2</h4>
                  
                  {/* Attendance */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Rerata Kehadiran (%):</span>
                      <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{simAttendance}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simAttendance}
                      onChange={(e) => setSimAttendance(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Koleksi Kumpul Tugas (Score):</span>
                      <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{simTasks}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simTasks}
                      onChange={(e) => setSimTasks(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Sliders Block 2 */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b pb-1">Aspek 3, 4 & 5</h4>
                  
                  {/* Attitude */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Penilaian Sikap (Score):</span>
                      <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{simAttitude}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simAttitude}
                      onChange={(e) => setSimAttitude(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Peer */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Penilaian Antar Teman:</span>
                      <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{simPeer}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simPeer}
                      onChange={(e) => setSimPeer(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Keterampilan Praktik (Guru):</span>
                      <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{simSkill}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simSkill}
                      onChange={(e) => setSimSkill(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Sliders Block 3: Sub-nilai */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b pb-1">Evaluasi Belajar</h4>

                  {/* Nilai Harian */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Nilai Harian:</span>
                      <span className="font-black font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{simHarian}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simHarian}
                      onChange={(e) => setSimHarian(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                  </div>

                  {/* Formatif */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Nilai Formatif:</span>
                      <span className="font-black font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{simFormatif}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simFormatif}
                      onChange={(e) => setSimFormatif(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                  </div>

                  {/* Sumatif */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Nilai Sumatif:</span>
                      <span className="font-black font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{simSumatif}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={simSumatif}
                      onChange={(e) => setSimSumatif(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                  </div>
                </div>

              </div>

              {/* Save simulation values officially back to server (localStorage) */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => {
                    if (activeGrades) {
                      setSimAttendance(activeGrades.attendanceRate);
                      setSimTasks(activeGrades.taskCompletion);
                      setSimAttitude(activeGrades.attitudeScore);
                      setSimPeer(activeGrades.peerScore);
                      setSimSkill(activeGrades.skillScore);
                      setSimHarian(activeGrades.nilaiHarian);
                      setSimFormatif(activeGrades.nilaiFormatif);
                      setSimSumatif(activeGrades.nilaiSumatif);
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Reset Simulasi
                </button>
                {isTeacherOrAdmin ? (
                  <button
                    onClick={handleSaveSimulatedScores}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span>Update Rapor Murid Secara Resmi</span>
                  </button>
                ) : (
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <span>⚠️ Simulasi nilai Anda bersifat sementara & tidak mengubah e-rapor resmi di server.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      </div> {/* print:hidden end */}


      {/* === VIEW LEMBAR PENILAIAN CETAK (Hanya Muncul saat Cetak / print:block) === */}
      <div className="hidden print:block print-sheet bg-white text-black p-8 font-sans max-w-4xl mx-auto space-y-6">
        
        {/* Kop Surat Sekolah Resmi */}
        <div className="text-center border-b-4 border-double border-slate-950 pb-4">
          <h1 className="text-lg font-extrabold tracking-wide text-slate-900 uppercase leading-tight">PEMERINTAH PROVINSI SULAWESI TENGGARA</h1>
          <h2 className="text-sm font-bold tracking-normal text-slate-800 uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
          <h3 className="text-xl font-black tracking-wider text-slate-950 mt-1 uppercase">SMK NEGERI 2 KONAWE</h3>
          <p className="text-xs text-slate-700 mt-1">
            Kompetensi Keahlian: Teknik Otomotif, Teknik Sepeda Motor, DPIB, DKV, TAV & Konstruksi
          </p>
          <p className="text-[10px] text-slate-500 font-mono italic">
            Jl. Poros Konawe - Unaaha, Kab. Konawe, Sulawesi Tenggara | Telp: (0408) 22123 | Email: info@smkn2konawe.sch.id
          </p>
        </div>

        {/* Judul Lembar Penilaian */}
        <div className="text-center space-y-1 my-4">
          <h4 className="text-md font-black underline tracking-wider text-slate-900 uppercase">
            LEMBAR PENILAIAN HASIL BELAJAR MURID (PORTFOLIO NILAI)
          </h4>
          <p className="text-xs font-bold text-slate-700">
            Tahun Pelajaran: {schoolYear} | Semester: {semester} ({semester === "Ganjil" ? "1 / Ganjil" : "2 / Genap"})
          </p>
        </div>

        {/* Informasi / Identitas Murid */}
        <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-4 rounded-xl bg-slate-50/50">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">Nama Murid</span>
              <span className="mr-2">:</span>
              <span className="font-extrabold text-slate-900 uppercase">{activeStudent.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">NIS / NISN</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-800 font-mono">{activeStudent.nis} / {activeStudent.nisn}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">Kompetensi Keahlian</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-800">{activeStudent.major}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">Rombel / Kelas</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-900 uppercase">{activeStudent.className}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">Wali Kelas</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-800">Wali Kelas</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-600 font-semibold">Tanggal Cetak</span>
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-800 font-mono">
                {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Bagian I: Matriks Penilaian */}
        <div className="space-y-2">
          <h5 className="text-xs font-black uppercase text-slate-900 tracking-wide">
            I. MATRIKS CAPAIAN ASPEK UTAMA (BOBOT RAPOR)
          </h5>
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase text-[9px] font-extrabold border-b border-slate-400">
                <th className="border border-slate-400 p-2.5 text-left w-1/3">Aspek Penilaian</th>
                <th className="border border-slate-400 p-2.5 text-center w-12">Skor</th>
                <th className="border border-slate-400 p-2.5 text-center w-12">Bobot</th>
                <th className="border border-slate-400 p-2.5 text-center w-16">Kontribusi</th>
                <th className="border border-slate-400 p-2.5 text-left">Deskripsi / Catatan Capaian Kompetensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400 text-slate-900">
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold">1. Kehadiran Bengkel & Kelas (Clock-In)</td>
                <td className="border border-slate-400 p-2.5 text-center font-bold font-mono">{simAttendance}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{WEIGHTS.attendanceRate}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-black font-mono">
                  {Math.round((simAttendance * WEIGHTS.attendanceRate / 100) * 10) / 10}
                </td>
                <td className="border border-slate-400 p-2.5">
                  {simAttendance >= 95 ? "Tingkat disiplin sangat prima, hadir tepat waktu di seluruh sesi praktik." : "Presensi baik, pertahankan tingkat disiplin belajar."}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold">2. Pengumpulan Tugas Mandiri (Jobsheet LKPD)</td>
                <td className="border border-slate-400 p-2.5 text-center font-bold font-mono">{simTasks}</td>
                <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{WEIGHTS.taskCompletion}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-black font-mono">
                  {Math.round((simTasks * WEIGHTS.taskCompletion / 100) * 10) / 10}
                </td>
                <td className="border border-slate-400 p-2.5">
                  {simTasks >= 85 ? "Menyelesaikan seluruh jobsheet, laporan kelistrikan otomotif & EFI dengan lengkap." : "LKPD terisi dengan cukup baik, pastikan pengiriman tepat waktu."}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold">3. Sikap Profil Pancasila & Budaya K3</td>
                <td className="border border-slate-400 p-2.5 text-center font-bold font-mono">{simAttitude}</td>
                <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{WEIGHTS.attitudeScore}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-black font-mono">
                  {Math.round((simAttitude * WEIGHTS.attitudeScore / 100) * 10) / 10}
                </td>
                <td className="border border-slate-400 p-2.5">
                  {simAttitude >= 85 ? "Sangat patuh pada tata tertib bengkel, menggunakan APD lengkap, rapi dan santun." : "Menerapkan standar keselamatan kerja industri dengan konsisten."}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold">4. Penilaian Antar Teman (Kolaborasi Tim)</td>
                <td className="border border-slate-400 p-2.5 text-center font-bold font-mono">{simPeer}</td>
                <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{WEIGHTS.peerScore}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-black font-mono">
                  {Math.round((simPeer * WEIGHTS.peerScore / 100) * 10) / 10}
                </td>
                <td className="border border-slate-400 p-2.5">
                  {simPeer >= 80 ? "Sangat kooperatif, berkontribusi aktif dalam pembagian kerja kelompok praktikum." : "Mampu bekerjasama dengan baik bersama rekan sejawat dalam tim."}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold">5. Keterampilan Produktif (Evaluasi Guru)</td>
                <td className="border border-slate-400 p-2.5 text-center font-bold font-mono">{simSkill}</td>
                <td className="border border-slate-400 p-2.5 text-center font-semibold text-slate-600">{WEIGHTS.skillScore}%</td>
                <td className="border border-slate-400 p-2.5 text-center font-black font-mono">
                  {Math.round((simSkill * WEIGHTS.skillScore / 100) * 10) / 10}
                </td>
                <td className="border border-slate-400 p-2.5">
                  {simSkill >= 85 ? "Sangat cakap melakukan troubleshooting EFI, penyetelan katup, dan diagnosis scanner." : "Keterampilan praktik memadai, tingkatkan jam terbang praktikum mandiri."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bagian II: Capaian Nilai Akademik */}
        <div className="space-y-2">
          <h5 className="text-xs font-black uppercase text-slate-900 tracking-wide">
            II. ASESMEN AKADEMIK (NILAI EVALUASI BELAJAR)
          </h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-400 p-2.5 rounded-lg text-center bg-slate-50">
              <span className="text-[10px] text-slate-600 font-bold block uppercase">Rata-rata Nilai Harian</span>
              <span className="text-base font-black text-slate-950 font-mono block mt-0.5">{simHarian}</span>
            </div>
            <div className="border border-slate-400 p-2.5 rounded-lg text-center bg-slate-50">
              <span className="text-[10px] text-slate-600 font-bold block uppercase">Nilai Asesmen Formatif</span>
              <span className="text-base font-black text-slate-950 font-mono block mt-0.5">{simFormatif}</span>
            </div>
            <div className="border border-slate-400 p-2.5 rounded-lg text-center bg-slate-50">
              <span className="text-[10px] text-slate-600 font-bold block uppercase">Nilai Asesmen Sumatif</span>
              <span className="text-base font-black text-slate-950 font-mono block mt-0.5">{simSumatif}</span>
            </div>
          </div>
        </div>

        {/* Bagian III: Rangkuman & Rekomendasi */}
        <div className="space-y-2">
          <h5 className="text-xs font-black uppercase text-slate-900 tracking-wide">
            III. REKAPITULASI HASIL RAPOR AKHIR & REKOMENDASI PENDIDIK
          </h5>
          <div className="border border-slate-950 p-4 rounded-xl space-y-3 bg-slate-50/50">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-6">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Akumulasi Nilai Akhir</span>
                  <span className="text-xl font-black text-slate-950 font-mono">{currentReportGrade}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Predikat Kelulusan</span>
                  <span className="text-xs font-black text-slate-900 block mt-1 uppercase font-mono">
                    {predikat.letter} ({predikat.desc})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Ketuntasan KKTP (75)</span>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 border ${isPassed ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"}`}>
                  {isPassed ? "✓ TUNTAS BELAJAR (LULUS)" : "✗ BELUM TUNTAS (WAJIB REMEDIAL)"}
                </span>
              </div>
            </div>
            <div className="text-xs border-t border-slate-300 pt-2.5 text-slate-800 leading-relaxed">
              <span className="font-extrabold text-slate-900 block mb-0.5">Catatan Khusus Guru Wali Kelas:</span>
              {isPassed 
                ? "Murid menunjukkan pemahaman yang sangat mendalam dan keahlian tinggi di bengkel kerja otomotif. Karakter gotong royong dan kesadaran K3 sangat baik. Pertahankan kompetensi prima ini untuk persiapan Praktik Kerja Lapangan (PKL) semester berikutnya."
                : "Nilai capaian belum memenuhi batas ketuntasan minimal kriteria sekolah (KKTP 75). Murid disarankan untuk mengikuti kelas remedial terjadwal dan melengkapi jobsheet yang belum tuntas di bawah bimbingan instruktur."
              }
            </div>
          </div>
        </div>

        {/* Bagian IV: Laporan Kedisiplinan & Kasus BK (Hasil Integrasi SIHADIR) */}
        <div className="space-y-2">
          <h5 className="text-xs font-black uppercase text-slate-900 tracking-wide">
            IV. CATATAN KEDISIPLINAN, ABSENSI & BIMBINGAN KONSELING (BK)
          </h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Rekap Absensi */}
            <div className="border border-slate-400 p-3 rounded-lg bg-slate-50/30">
              <span className="font-extrabold text-slate-900 block border-b pb-1 mb-2">A. Rekapitulasi Presensi (Ketidakhadiran)</span>
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 text-slate-600 font-medium">Izin Sakit (🤒)</td>
                    <td className="py-1 text-right font-bold text-slate-800">{countSakit} Hari</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 text-slate-600 font-medium">Izin Resmi (✉️)</td>
                    <td className="py-1 text-right font-bold text-slate-800">{countIzin} Hari</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 text-slate-600 font-medium">Tanpa Keterangan (Alfa / ❌)</td>
                    <td className="py-1 text-right font-bold text-rose-700">{countAlfa} Hari</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rekap BK */}
            <div className="border border-slate-400 p-3 rounded-lg bg-slate-50/30">
              <span className="font-extrabold text-slate-900 block border-b pb-1 mb-2">B. Keputusan / Tindakan Khusus Guru BK</span>
              <div className="space-y-1">
                {activeStudentBkCases.length > 0 ? (
                  activeStudentBkCases.map((bkC, i) => (
                    <div key={bkC.id || i} className="text-[11px] leading-tight pb-1.5 border-b border-slate-200 last:border-0">
                      <span className="font-bold text-slate-800 block">{bkC.caseType}</span>
                      <span className="text-slate-500 block">Tindakan: <span className="italic">"{bkC.actionTaken}"</span> ({bkC.status})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-emerald-800 font-medium italic">
                    "Murid tidak memiliki catatan rujukan atau tindakan pelanggaran kedisiplinan dari Guru BK. Karakter terpuji."
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Resmi */}
        <div className="pt-10 grid grid-cols-4 gap-2 text-xs text-center">
          <div className="space-y-12">
            <div>
              <p className="text-slate-600">Menyetujui,</p>
              <p className="font-bold text-slate-800">Orang Tua / Wali Murid</p>
            </div>
            <div className="border-b border-slate-400 w-3/4 mx-auto pt-6"></div>
            <p className="text-slate-500 text-[10px] italic">(........................................................)</p>
          </div>

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
              <p className="font-bold text-slate-800">Wali Kelas Pengampu</p>
            </div>
            <div>
              <p className="font-bold text-slate-950 underline">Wali Kelas Pengampu</p>
              <p className="text-slate-500 font-mono text-[9px]">NIP. -</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
