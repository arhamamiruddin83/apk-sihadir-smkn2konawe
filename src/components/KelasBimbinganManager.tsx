/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle2, 
  UserCheck, 
  RefreshCw, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  ArrowRightLeft, 
  Info, 
  SlidersHorizontal,
  Check,
  FileText,
  Plus,
  Edit3,
  Trash2,
  X,
  RotateCcw,
  AlertCircle,
  QrCode
} from "lucide-react";
import { QrScannerModal } from "./QrScannerModal";
import { MOCK_STUDENTS } from "../mockData";

interface KelasBimbinganManagerProps {
  username?: string;
  currentRole?: string;
}

// Full list of standard classes at SMK Negeri 2 Konawe (No TKJ)
const DEFAULT_ALL_CLASSES = [
  // KELAS X
  "X TKR A", "X TKR B", "X TSM", "X TAV", "X DPIB", "X DKV", "X TB",
  // KELAS XI
  "XI TKR A", "XI TKR B", "XI TSM A", "XI TSM B", "XI TAV", "XI DPIB", "XI DKV", "XI TB",
  // KELAS XII
  "XII TKR A", "XII TKR B", "XII TSM", "XII TAV", "XII DPIB", "XII TB"
];

// Classes explicitly assigned to Pak Yoga (as per specification)
// Pak Yoga: X TKR A, X TSM, XI TKR A, XI TKR B, XI TSM (or XI TSM A), XII DPIB, XII TAV, XII TSM A (or XII TSM)
// Bu Cici: Sisanya
const YOGA_DEFAULT_CLASSES = new Set([
  "X TKR A",
  "X TSM",
  "XI TKR A",
  "XI TKR B",
  "XI TSM",
  "XI TSM A",
  "XII DPIB",
  "XII TAV",
  "XII TSM A",
  "XII TSM"
]);

// BK Teachers info
export const BK_TEACHERS = {
  CICI: {
    id: "CICI",
    name: "CICI MURNI",
    shortName: "Ibu Cici",
    role: "Guru BK / Konselor",
    nip: "19890915 201402 2 003",
    color: "pink",
    badgeBg: "bg-pink-100 text-pink-800 border-pink-300",
    activeCardBorder: "border-pink-500 bg-pink-50/70",
    buttonBg: "bg-pink-600 hover:bg-pink-700 text-white",
    avatarBg: "bg-pink-500 text-white",
    iconColor: "text-pink-600"
  },
  YOGA: {
    id: "YOGA",
    name: "YOGA NANDA HERMAWAN",
    shortName: "Pak Yoga",
    role: "Guru BK / Konselor",
    nip: "19940214 201901 1 026",
    color: "indigo",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
    activeCardBorder: "border-indigo-500 bg-indigo-50/70",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
    avatarBg: "bg-indigo-600 text-white",
    iconColor: "text-indigo-600"
  }
};

export function getBkCounselorForClass(className: string) {
  const saved = localStorage.getItem("sihadir_kelas_bimbingan_bk");
  let assignments: Record<string, "CICI" | "YOGA"> = {};
  if (saved) {
    try {
      assignments = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const assigned = assignments[className] || (YOGA_DEFAULT_CLASSES.has(className) ? "YOGA" : "CICI");
  return assigned === "YOGA" ? BK_TEACHERS.YOGA : BK_TEACHERS.CICI;
}

export const KelasBimbinganManager: React.FC<KelasBimbinganManagerProps> = ({
  username = "",
  currentRole = "guru"
}) => {
  // Detect active view mode (CICI, YOGA, or ALL)
  const [activeEditor, setActiveEditor] = useState<"CICI" | "YOGA" | "ALL">(() => {
    const u = (username || "").toLowerCase();
    if (u.includes("yoga")) return "YOGA";
    if (u.includes("cici")) return "CICI";
    return "CICI";
  });

  // Custom class list state (allows add / edit / delete)
  const [classList, setClassList] = useState<string[]>(() => {
    const filterOutTKJ = (list: string[]) => list.filter((cls) => !cls.toUpperCase().includes("TKJ"));

    const savedCustom = localStorage.getItem("sihadir_custom_kelas_bk_list");
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return filterOutTKJ(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Merge standard list with any dynamic student classes
    const savedStudents = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
    let studentList = MOCK_STUDENTS;
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          studentList = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const extracted = Array.from(new Set(studentList.map((s) => s.className).filter(Boolean)));
    return filterOutTKJ(Array.from(new Set([...DEFAULT_ALL_CLASSES, ...extracted])));
  });

  // Sort classList naturally
  const sortedClassList = React.useMemo(() => {
    return [...classList].sort((a, b) => {
      const getGradeWeight = (cls: string) => {
        if (cls.startsWith("X ")) return 1;
        if (cls.startsWith("XI ")) return 2;
        if (cls.startsWith("XII ")) return 3;
        return 4;
      };
      const gA = getGradeWeight(a);
      const gB = getGradeWeight(b);
      if (gA !== gB) return gA - gB;
      return a.localeCompare(b, "id");
    });
  }, [classList]);

  // Class assignments mapping: { [className: string]: "CICI" | "YOGA" }
  const [assignments, setAssignments] = useState<Record<string, "CICI" | "YOGA">>(() => {
    const saved = localStorage.getItem("sihadir_kelas_bimbingan_bk");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default initial split: Pak Yoga gets requested classes, Bu Cici gets the rest
    const initial: Record<string, "CICI" | "YOGA"> = {};
    DEFAULT_ALL_CLASSES.forEach((cls) => {
      if (YOGA_DEFAULT_CLASSES.has(cls)) {
        initial[cls] = "YOGA";
      } else {
        initial[cls] = "CICI";
      }
    });
    return initial;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<"ALL" | "X" | "XI" | "XII">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // CRUD Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassOwner, setNewClassOwner] = useState<"CICI" | "YOGA">("YOGA");

  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editClassOwner, setEditClassOwner] = useState<"CICI" | "YOGA">("CICI");

  const [deletingClass, setDeletingClass] = useState<string | null>(null);

  // Sync missing classes into assignments dictionary
  useEffect(() => {
    setAssignments((prev) => {
      let changed = false;
      const updated = { ...prev };
      sortedClassList.forEach((cls) => {
        if (!updated[cls]) {
          updated[cls] = YOGA_DEFAULT_CLASSES.has(cls) ? "YOGA" : "CICI";
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [sortedClassList]);

  // Save assignments & class list to localStorage
  const saveAllData = (
    newAssignments: Record<string, "CICI" | "YOGA">, 
    newList: string[], 
    message?: string
  ) => {
    setAssignments(newAssignments);
    setClassList(newList);
    localStorage.setItem("sihadir_kelas_bimbingan_bk", JSON.stringify(newAssignments));
    localStorage.setItem("sihadir_custom_kelas_bk_list", JSON.stringify(newList));
    window.dispatchEvent(new Event("sihadir_data_updated"));
    if (message) {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const saveAssignmentsOnly = (newAssignments: Record<string, "CICI" | "YOGA">, message?: string) => {
    setAssignments(newAssignments);
    localStorage.setItem("sihadir_kelas_bimbingan_bk", JSON.stringify(newAssignments));
    window.dispatchEvent(new Event("sihadir_data_updated"));
    if (message) {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Toggle class assignment between CICI and YOGA
  const toggleClassAssignment = (className: string) => {
    const current = assignments[className] || "CICI";
    const next = current === "CICI" ? "YOGA" : "CICI";
    const updated = { ...assignments, [className]: next };
    saveAssignmentsOnly(
      updated,
      `Kelas ${className} dipindahkan ke Bimbingan ${next === "CICI" ? "Ibu Cici" : "Pak Yoga"}`
    );
  };

  // Checkbox toggle when editing in CICI mode
  const handleCiciCheckbox = (className: string, checked: boolean) => {
    const targetOwner = checked ? "CICI" : "YOGA";
    const updated = { ...assignments, [className]: targetOwner };
    saveAssignmentsOnly(
      updated,
      checked 
        ? `Kelas ${className} dipilih oleh Ibu Cici (Pak Yoga mendapat kelas sisanya)`
        : `Kelas ${className} dilepas dari Ibu Cici (Otomatis ke Pak Yoga)`
    );
  };

  // Checkbox toggle when editing in YOGA mode
  const handleYogaCheckbox = (className: string, checked: boolean) => {
    const targetOwner = checked ? "YOGA" : "CICI";
    const updated = { ...assignments, [className]: targetOwner };
    saveAssignmentsOnly(
      updated,
      checked
        ? `Kelas ${className} dipilih oleh Pak Yoga (Ibu Cici mendapat kelas sisanya)`
        : `Kelas ${className} dilepas dari Pak Yoga (Otomatis ke Ibu Cici)`
    );
  };

  // Reset to default allocation (Pak Yoga: X TKR A, X TSM, XI TKR A, XI TKR B, XI TSM, XII DPIB, XII TAV, XII TSM A; Bu Cici: Sisanya)
  const handleResetDefault = () => {
    const defaultList = [...DEFAULT_ALL_CLASSES];
    const defaultAssigned: Record<string, "CICI" | "YOGA"> = {};
    defaultList.forEach((cls) => {
      if (YOGA_DEFAULT_CLASSES.has(cls)) {
        defaultAssigned[cls] = "YOGA";
      } else {
        defaultAssigned[cls] = "CICI";
      }
    });
    saveAllData(
      defaultAssigned, 
      defaultList, 
      "Berhasil mereset pembagian standar: Pak Yoga (X TKR A, X TSM, XI TKR A, XI TKR B, XI TSM, XII DPIB, XII TAV, XII TSM A) & Bu Cici (Sisanya)."
    );
  };

  // Quick Action: Auto balance 50:50
  const handleAutoBalance = () => {
    const updated: Record<string, "CICI" | "YOGA"> = {};
    sortedClassList.forEach((cls, index) => {
      if (index % 2 === 0) {
        updated[cls] = "CICI";
      } else {
        updated[cls] = "YOGA";
      }
    });
    saveAssignmentsOnly(updated, "Berhasil membagi rata kelas bimbingan BK 50:50!");
  };

  // CRUD Handler 1: Add New Class
  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newClassName.trim().toUpperCase();
    if (!cleanName) return;

    if (classList.includes(cleanName)) {
      setToastMessage(`Kelas "${cleanName}" sudah ada dalam daftar!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newList = [...classList, cleanName];
    const newAssignments = { ...assignments, [cleanName]: newClassOwner };

    saveAllData(
      newAssignments,
      newList,
      `Berhasil menambahkan kelas ${cleanName} ke pembinaan ${newClassOwner === "YOGA" ? "Pak Yoga" : "Ibu Cici"}`
    );

    setNewClassName("");
    setShowAddModal(false);
  };

  // CRUD Handler 2: Edit Class
  const handleOpenEdit = (cls: string) => {
    setEditingClass(cls);
    setEditClassName(cls);
    setEditClassOwner(assignments[cls] || "CICI");
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const cleanNewName = editClassName.trim().toUpperCase();
    if (!cleanNewName) return;

    // If name changed and already exists elsewhere
    if (cleanNewName !== editingClass && classList.includes(cleanNewName)) {
      setToastMessage(`Nama kelas "${cleanNewName}" sudah digunakan!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newList = classList.map((c) => (c === editingClass ? cleanNewName : c));
    const newAssignments = { ...assignments };
    delete newAssignments[editingClass];
    newAssignments[cleanNewName] = editClassOwner;

    saveAllData(
      newAssignments,
      newList,
      `Berhasil memperbarui kelas ${editingClass} menjadi ${cleanNewName} (${editClassOwner === "YOGA" ? "Pak Yoga" : "Ibu Cici"})`
    );

    setEditingClass(null);
  };

  // CRUD Handler 3: Delete Class
  const handleConfirmDelete = () => {
    if (!deletingClass) return;

    const newList = classList.filter((c) => c !== deletingClass);
    const newAssignments = { ...assignments };
    delete newAssignments[deletingClass];

    saveAllData(
      newAssignments,
      newList,
      `Berhasil menghapus kelas ${deletingClass} dari daftar kelas binaan BK.`
    );

    setDeletingClass(null);
  };

  // Quick Action: Assign entire grade (X, XI, or XII) to current active editor
  const handleAssignGrade = (grade: "X" | "XI" | "XII", targetOwner: "CICI" | "YOGA") => {
    const updated = { ...assignments };
    let count = 0;
    sortedClassList.forEach((cls) => {
      if (cls.startsWith(`${grade} `)) {
        updated[cls] = targetOwner;
        count++;
      }
    });
    const targetName = targetOwner === "CICI" ? "Ibu Cici" : "Pak Yoga";
    const otherName = targetOwner === "CICI" ? "Pak Yoga" : "Ibu Cici";
    saveAssignmentsOnly(
      updated,
      `Seluruh ${count} Kelas ${grade} dialokasikan ke ${targetName} (${otherName} mendapat kelas sisanya)`
    );
  };

  // Filtered classes list
  const filteredClasses = sortedClassList.filter((cls) => {
    const matchesSearch = cls.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = 
      gradeFilter === "ALL" || 
      (gradeFilter === "X" && cls.startsWith("X ")) ||
      (gradeFilter === "XI" && cls.startsWith("XI ")) ||
      (gradeFilter === "XII" && cls.startsWith("XII "));
    return matchesSearch && matchesGrade;
  });

  // Calculate statistics
  const ciciClasses = sortedClassList.filter((c) => (assignments[c] || "CICI") === "CICI");
  const yogaClasses = sortedClassList.filter((c) => assignments[c] === "YOGA");
  const totalCount = sortedClassList.length || 1;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-blue-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Bimbingan Konseling (BK)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Sistem Pembagian Kelas Binaan
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Menu Kelola & Pembagian Kelas Binaan BK
            </h2>
            <p className="text-xs text-blue-200/90 max-w-2xl font-medium leading-relaxed">
              Pembagian wilayah bimbingan konseling antara <strong className="text-pink-300 font-bold">Ibu Cici (CICI MURNI)</strong> dan <strong className="text-indigo-300 font-bold">Pak Yoga (YOGA NANDA HERMAWAN)</strong>. Anda dapat menambah kelas baru, mengedit nama kelas, mengubah guru pembina, atau menghapus kelas binaan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              type="button"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Scan QR Code Murid BK</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              type="button"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas Binaan
            </button>
            <button
              onClick={handleResetDefault}
              type="button"
              title="Reset ke pembagian resmi standar SMK Negeri 2 Konawe"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Reset Default
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards of the 2 Counselors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ibu Cici Card */}
        <div className={`p-5 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
          activeEditor === "CICI" 
            ? "bg-gradient-to-br from-pink-50 via-rose-50/50 to-white border-pink-400 ring-2 ring-pink-400/30" 
            : "bg-white border-slate-200 hover:border-pink-300"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                CM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-pink-700 tracking-wider">Guru BK 1</span>
                  {activeEditor === "CICI" && (
                    <span className="bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Mode Pilihan Aktif
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900">CICI MURNI, S.Pd</h3>
                <p className="text-[11px] text-slate-500 font-mono">NIP. 19890915 201402 2 003</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditor("CICI")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeEditor === "CICI"
                  ? "bg-pink-600 text-white shadow-xs"
                  : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
            >
              Mode Ibu Cici
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-pink-100/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Bimbingan</span>
              <span className="text-xl font-black text-pink-700">
                {ciciClasses.length} <span className="text-xs font-bold text-slate-500">Kelas ({Math.round((ciciClasses.length / totalCount) * 100)}%)</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Aturan Pembina</span>
              <span className="text-[11px] font-bold text-pink-600">
                Kelas sisanya diampu Pak Yoga ({yogaClasses.length} Klss)
              </span>
            </div>
          </div>

          {/* Class List Pill Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/60 rounded-xl border border-pink-100">
            {ciciClasses.length === 0 ? (
              <span className="text-xs text-slate-400 italic px-2 py-1">Belum ada kelas dipilih</span>
            ) : (
              ciciClasses.map((cls) => (
                <span key={cls} className="bg-pink-100 text-pink-800 border border-pink-200 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>{cls}</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Pak Yoga Card */}
        <div className={`p-5 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
          activeEditor === "YOGA" 
            ? "bg-gradient-to-br from-indigo-50 via-blue-50/50 to-white border-indigo-400 ring-2 ring-indigo-400/30" 
            : "bg-white border-slate-200 hover:border-indigo-300"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                YH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">Guru BK 2</span>
                  {activeEditor === "YOGA" && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Mode Pilihan Aktif
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900">YOGA NANDA HERMAWAN, S.Pd</h3>
                <p className="text-[11px] text-slate-500 font-mono">NIP. 19940214 201901 1 026</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveEditor("YOGA")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeEditor === "YOGA"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              Mode Pak Yoga
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Bimbingan</span>
              <span className="text-xl font-black text-indigo-700">
                {yogaClasses.length} <span className="text-xs font-bold text-slate-500">Kelas ({Math.round((yogaClasses.length / totalCount) * 100)}%)</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Aturan Pembina</span>
              <span className="text-[11px] font-bold text-indigo-600">
                Membina: X TKR A, X TSM A, XI TKR A/B, XI TSM, XII DPIB, XII TAV, XII TSM A
              </span>
            </div>
          </div>

          {/* Class List Pill Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/60 rounded-xl border border-indigo-100">
            {yogaClasses.length === 0 ? (
              <span className="text-xs text-slate-400 italic px-2 py-1">Belum ada kelas dipilih</span>
            ) : (
              yogaClasses.map((cls) => (
                <span key={cls} className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>{cls}</span>
                </span>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Control Bar: Mode Switcher, Actions & Mass Allocation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Perspective Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
            <span className="text-[11px] font-black uppercase text-slate-500 px-2.5">
              Fokus Mode:
            </span>
            <button
              type="button"
              onClick={() => setActiveEditor("CICI")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEditor === "CICI"
                  ? "bg-pink-600 text-white shadow-xs font-black"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-pink-300" />
              Ibu Cici ({ciciClasses.length} Kelas)
            </button>
            <button
              type="button"
              onClick={() => setActiveEditor("YOGA")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEditor === "YOGA"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-300" />
              Pak Yoga ({yogaClasses.length} Kelas)
            </button>
            <button
              type="button"
              onClick={() => setActiveEditor("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeEditor === "ALL"
                  ? "bg-slate-800 text-white shadow-xs font-black"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semua Matriks ({sortedClassList.length} Kelas)
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoBalance}
              type="button"
              className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Bagi Rata (50 : 50)
            </button>
            <span className="text-[10px] font-black uppercase text-slate-400 hidden sm:inline">Tingkat:</span>
            {(["X", "XI", "XII"] as const).map((grd) => (
              <button
                key={grd}
                type="button"
                onClick={() => handleAssignGrade(grd, activeEditor === "YOGA" ? "YOGA" : "CICI")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeEditor === "YOGA"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
                    : "bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100"
                }`}
              >
                Semua {grd} ke {activeEditor === "YOGA" ? "Pak Yoga" : "Ibu Cici"}
              </button>
            ))}
          </div>

        </div>

        {/* Filter & Search Input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kelas (Contoh: X TKR A, XI TSM)..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1" />
            {(["ALL", "X", "XI", "XII"] as const).map((grd) => (
              <button
                key={grd}
                type="button"
                onClick={() => setGradeFilter(grd)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  gradeFilter === grd
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {grd === "ALL" ? "Semua" : `Kelas ${grd}`}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Explanation */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>Petunjuk Pengelolaan:</strong> Pak Yoga membina kelas <strong>X TKR A, X TSM, XI TKR A, XI TKR B, XI TSM, XII DPIB, XII TAV, XII TSM A</strong> dan Bu Cici membina kelas sisanya. Anda bisa mengubah pembina lewat tombol sakelar, menekan tombol <strong>Edit</strong> untuk mengubah nama/pembina, atau tombol <strong>Hapus</strong> untuk menghapus kelas.
          </p>
        </div>

      </div>

      {/* Class Grid Selection Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Daftar Kelas Bimbingan ({filteredClasses.length} Kelas Terdaftar)
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Kelas Binaan Baru
          </button>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Kelas tidak ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau tambah kelas binaan baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredClasses.map((cls) => {
              const currentOwner = assignments[cls] || "CICI";
              const isCici = currentOwner === "CICI";
              
              // Checkbox value relative to current active mode
              const isCheckedForActiveEditor = 
                activeEditor === "YOGA" ? !isCici : isCici;

              return (
                <div
                  key={cls}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs relative group ${
                    isCici 
                      ? "bg-pink-50/40 border-pink-200 hover:border-pink-300" 
                      : "bg-indigo-50/40 border-indigo-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kelas BK</span>
                      <h4 className="text-base font-black text-slate-900 leading-tight">{cls}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Teacher Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-2xs ${
                        isCici 
                          ? "bg-pink-100 text-pink-800 border-pink-300" 
                          : "bg-indigo-100 text-indigo-800 border-indigo-300"
                      }`}>
                        {isCici ? "Ibu Cici" : "Pak Yoga"}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Checkbox Control */}
                  <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
                    
                    <div className="flex items-center justify-between gap-2">
                      {/* Interactive Checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCheckedForActiveEditor}
                          onChange={(e) => {
                            if (activeEditor === "YOGA") {
                              handleYogaCheckbox(cls, e.target.checked);
                            } else {
                              handleCiciCheckbox(cls, e.target.checked);
                            }
                          }}
                          className={`w-4 h-4 rounded border-slate-300 focus:ring-2 cursor-pointer ${
                            activeEditor === "YOGA"
                              ? "text-indigo-600 focus:ring-indigo-500"
                              : "text-pink-600 focus:ring-pink-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {activeEditor === "YOGA" ? "Pak Yoga" : "Ibu Cici"}
                        </span>
                      </label>

                      {/* Quick Switch Toggle */}
                      <button
                        type="button"
                        title="Alihkan langsung ke Guru BK lainnya"
                        onClick={() => toggleClassAssignment(cls)}
                        className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold px-1.5"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                        <span>Pindah</span>
                      </button>
                    </div>

                    {/* Edit & Delete buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/40">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 transition-all text-[11px] font-bold flex items-center gap-1 px-2 cursor-pointer"
                        title="Edit nama kelas atau pembina"
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingClass(cls)}
                        className="p-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition-all text-[11px] font-bold flex items-center gap-1 px-2 cursor-pointer"
                        title="Hapus kelas dari binaan"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tambah Kelas Binaan BK Baru</h3>
                  <p className="text-[11px] text-slate-500">Masukkan nama kelas dan pilih pembina BK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Nama Kelas Binaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: XII KULINER 1, X TKR C..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Guru BK Pembina
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewClassOwner("YOGA")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      newClassOwner === "YOGA"
                        ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
                    <div>
                      <p className="font-black">Pak Yoga</p>
                      <p className="text-[10px] text-slate-500 font-normal">YOGA NANDA H.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewClassOwner("CICI")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      newClassOwner === "CICI"
                        ? "bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 text-pink-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <p className="font-black">Ibu Cici</p>
                      <p className="text-[10px] text-slate-500 font-normal">CICI MURNI, S.Pd</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Simpan Kelas Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Kelas Binaan</h3>
                  <p className="text-[11px] text-slate-500">Ubah nama kelas atau alokasi pembina BK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Nama Kelas Binaan
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Guru BK Pembina
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditClassOwner("YOGA")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      editClassOwner === "YOGA"
                        ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
                    <div>
                      <p className="font-black">Pak Yoga</p>
                      <p className="text-[10px] text-slate-500 font-normal">YOGA NANDA H.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditClassOwner("CICI")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      editClassOwner === "CICI"
                        ? "bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 text-pink-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                    <div>
                      <p className="font-black">Ibu Cici</p>
                      <p className="text-[10px] text-slate-500 font-normal">CICI MURNI, S.Pd</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm Delete Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hapus Kelas Binaan?</h3>
                <p className="text-xs text-slate-500">
                  Apakah Anda yakin ingin menghapus kelas <strong className="text-slate-800">{deletingClass}</strong> dari daftar bimbingan BK?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for Guru BK */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        role="Guru BK"
      />

    </div>
  );
};

export default KelasBimbinganManager;
