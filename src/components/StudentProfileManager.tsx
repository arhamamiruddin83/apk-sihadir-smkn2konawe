/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  GraduationCap, 
  User, 
  Home, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Briefcase, 
  Calendar, 
  MapPin, 
  CheckCircle,
  FileText,
  AlertCircle,
  Upload,
  Camera,
  Trash2,
  KeyRound
} from "lucide-react";
import { Student } from "../types";
import { MOCK_STUDENTS } from "../mockData";
import { compressImageFile } from "../lib/imageCompressor";
import BirthDateSelector from "./BirthDateSelector";

interface StudentProfileManagerProps {
  currentRole?: string;
  username?: string;
  embeddedMode?: boolean;
}

export default function StudentProfileManager({ currentRole, username, embeddedMode = false }: StudentProfileManagerProps = {}) {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("simpati_students_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_STUDENTS;
  });

  // Check if current user is logged in as an actual student
  const isSiswaRole = currentRole === "siswa";
  const myStudentProfile = (() => {
    if (!username) return null;
    const u = username.toLowerCase().trim();
    // If admin, teacher, or other non-student role, do not bind a student profile card
    if (u === "admin" || u === "arham" || u === "tu" || u === "kepsek" || u === "kurikulum" || u === "kesiswaan" || u === "piket" || u === "bk") {
      return null;
    }
    const matched = students.find((s) => {
      if (!s) return false;
      const sName = (s.name || "").toLowerCase();
      const sId = (s.id || "").toLowerCase();
      const sNis = String(s.nis || "");
      const sNisn = String(s.nisn || "");
      return sName.includes(u) || sNis === u || sNisn === u || sId === u;
    });
    if (matched) return matched;
    return isSiswaRole ? students[0] : null;
  })();

  const [selectedClass, setSelectedClass] = useState<string>("Semua Kelas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states matching types.ts
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    nis: string;
    nisn: string;
    className: string;
    major: string;
    gender: string;
    birthPlace: string;
    birthDate: string;
    religion: string;
    address: string;
    fatherName: string;
    motherName: string;
    fatherOccupation: string;
    motherOccupation: string;
    statusActive: string;
    parentName: string;
    parentWhatsApp: string;
    whatsApp: string;
    photoUrl: string;
  }>({
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
    parentWhatsApp: "",
    whatsApp: "",
    photoUrl: "",
  });

  // Get distinct classes with safe filter
  const classesList = ["Semua Kelas", ...Array.from(new Set(students.filter(s => s && s.className).map((s) => s.className)))];

  const handleOpenAdd = () => {
    setModalError(null);
    setSelectedStudent(null);
    setFormData({
      id: `S${Date.now()}`,
      name: "",
      nis: `24${String(students.length + 1).padStart(3, "0")}`,
      nisn: `008${Math.floor(1000000 + Math.random() * 9000000)}`,
      className: classesList.find(c => c !== "Semua Kelas") || "XI TKR A",
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
      parentWhatsApp: "",
      whatsApp: "",
      photoUrl: "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setModalError(null);
    setSelectedStudent(student);
    setFormData({
      id: student.id,
      name: student.name || "",
      nis: student.nis || "",
      nisn: student.nisn || "",
      className: student.className || "XI TKR A",
      major: student.major || "Teknik Kendaraan Ringan (TKR)",
      gender: student.gender || "Laki-laki",
      birthPlace: student.birthPlace || "",
      birthDate: student.birthDate || "",
      religion: student.religion || "Islam",
      address: student.address || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      fatherOccupation: student.fatherOccupation || "",
      motherOccupation: student.motherOccupation || "",
      statusActive: student.statusActive || "Aktif",
      parentName: student.parentName || "",
      parentWhatsApp: student.parentWhatsApp || "",
      whatsApp: student.whatsApp || "",
      photoUrl: student.photoUrl || "",
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
      if (saved) {
        try {
          setStudents(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("sihadir_data_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sihadir_data_updated", handleStorage);
    };
  }, []);

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      setModalError("Harap isi Nama Lengkap Siswa terlebih dahulu.");
      return;
    }

    setModalError(null);

    const cleanNis = (formData.nis || "").trim() || `24${String(students.length + 1).padStart(3, "0")}`;
    const cleanNisn = (formData.nisn || "").trim() || `008${Math.floor(1000000 + Math.random() * 9000000)}`;
    const cleanClassName = (formData.className || "").trim() || "XI TKR A";
    const cleanMajor = (formData.major || "").trim() || "Teknik Kendaraan Ringan (TKR)";

    const finalFormData: Student = {
      ...formData,
      nis: cleanNis,
      nisn: cleanNisn,
      className: cleanClassName,
      major: cleanMajor,
      parentName: formData.parentName || formData.fatherName || formData.motherName || "-"
    };

    let updatedStudents: Student[] = [];

    if (selectedStudent) {
      // Editing existing student with robust matching
      let matched = false;
      const targetId = selectedStudent.id;
      const targetNis = selectedStudent.nis;
      const targetName = (selectedStudent.name || "").toLowerCase().trim();

      updatedStudents = students.map((s) => {
        const matchesId = Boolean(targetId && s.id && s.id === targetId);
        const matchesNis = Boolean(targetNis && s.nis && s.nis === targetNis);
        const matchesName = Boolean(targetName && s.name && s.name.toLowerCase().trim() === targetName);

        if (matchesId || matchesNis || matchesName) {
          matched = true;
          return {
            ...s,
            ...finalFormData,
            id: s.id || targetId || finalFormData.id || `S${Date.now()}`
          };
        }
        return s;
      });

      if (!matched) {
        updatedStudents = [{ id: targetId || `S${Date.now()}`, ...finalFormData }, ...students];
      }
      setStatusMessage(`Berhasil memperbarui biodata siswa: ${finalFormData.name}`);
    } else {
      // Adding new student
      const newStudent: Student = {
        id: finalFormData.id || `S${Date.now()}`,
        ...finalFormData
      };
      updatedStudents = [newStudent, ...students];
      setStatusMessage(`Berhasil menambahkan siswa baru: ${finalFormData.name}`);
    }

    setStudents(updatedStudents);
    try {
      localStorage.setItem("simpati_students_list", JSON.stringify(updatedStudents));
      localStorage.setItem("sihadir_master_students", JSON.stringify(updatedStudents));

      if (currentRole === "ketua_kelas") {
        localStorage.setItem("sihadir_ketua_kelas_name", finalFormData.name);
      }
    } catch (err) {
      console.warn("Error saving student list to localStorage:", err);
    }

    // Also sync to simpati_students_map for attendance lists
    try {
      const currentMapRaw = localStorage.getItem("simpati_students_map");
      let newMap: Record<string, string[]> = {};
      if (currentMapRaw) {
        newMap = JSON.parse(currentMapRaw);
      }
      updatedStudents.forEach((s) => {
        if (s.className && s.name) {
          if (!newMap[s.className]) {
            newMap[s.className] = [];
          }
          if (!newMap[s.className].includes(s.name)) {
            newMap[s.className].push(s.name);
          }
        }
      });
      localStorage.setItem("simpati_students_map", JSON.stringify(newMap));
    } catch (err) {
      console.error("Error syncing student map:", err);
    }

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("sihadir_data_updated"));
    setIsEditModalOpen(false);
    setSelectedStudent(null);

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const filteredStudents = students.filter((s) => {
    if (!s) return false;
    const matchesClass = selectedClass === "Semua Kelas" || s.className === selectedClass;
    const q = (searchQuery || "").toLowerCase();
    const sName = (s.name || "").toLowerCase();
    const sNis = String(s.nis || "");
    const sNisn = String(s.nisn || "");
    const matchesSearch = 
      sName.includes(q) ||
      sNis.includes(q) ||
      sNisn.includes(q);
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6" id="student-profile-workspace">
      {/* Header Panel */}
      {!embeddedMode ? (
        <div className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Biodata & Data Pribadi Siswa</h1>
              <p className="text-xs text-slate-500 font-medium">Lengkapi, perbarui, dan tinjau profil lengkap peserta didik di kelas binaan Anda.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-indigo-900 font-bold uppercase tracking-wider">Sinkronisasi Master Data OK</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wide">Editing & Kelola Biodata Siswa</h3>
              <p className="text-[11px] text-slate-500">Lengkapi data pribadi, pasfoto, TTL, agama, alamat, dan data orang tua siswa di bawah ini.</p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>+ Siswa Baru</span>
          </button>
        </div>
      )}

      {/* Personal Student Card (For Siswa Role or matched student account) */}
      {myStudentProfile && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/50 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {myStudentProfile.photoUrl ? (
                    <img src={myStudentProfile.photoUrl} alt={myStudentProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-indigo-200" />
                  )}
                </div>
                <button
                  onClick={() => handleOpenEdit(myStudentProfile)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Ganti Pasfoto Profil"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                    Biodata Siswa {isSiswaRole ? "Saya" : ""}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/15 text-indigo-100 border border-white/20">
                    {myStudentProfile.className}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-indigo-200 border border-white/10">
                    {myStudentProfile.major || "Teknik Kendaraan Ringan (TKR)"}
                  </span>
                </div>

                <h2 className="text-xl font-black text-white tracking-tight">{myStudentProfile.name}</h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-200 font-medium">
                  <span>NIS: <strong className="text-white font-mono">{myStudentProfile.nis}</strong></span>
                  <span>•</span>
                  <span>NISN: <strong className="text-white font-mono">{myStudentProfile.nisn}</strong></span>
                  {myStudentProfile.birthPlace && (
                    <>
                      <span>•</span>
                      <span>TTL: <strong className="text-white">{myStudentProfile.birthPlace}, {myStudentProfile.birthDate || "-"}</strong></span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-300">
                  {myStudentProfile.fatherName && <span>Ayah: <strong className="text-indigo-100">{myStudentProfile.fatherName}</strong></span>}
                  {myStudentProfile.motherName && <span>Ibu: <strong className="text-indigo-100">{myStudentProfile.motherName}</strong></span>}
                  {myStudentProfile.whatsApp && <span>WA Siswa: <strong className="text-indigo-100 font-mono">{myStudentProfile.whatsApp}</strong></span>}
                  {myStudentProfile.parentWhatsApp && <span>WA Ortu: <strong className="text-indigo-100 font-mono">{myStudentProfile.parentWhatsApp}</strong></span>}
                </div>

                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] text-indigo-100 border border-white/15">
                  <KeyRound className="h-3 w-3 text-amber-300" />
                  <span>Kata Sandi Login Portal Siswa: <strong className="font-mono text-amber-300 font-bold">{myStudentProfile.nisn || myStudentProfile.nis}</strong> (Nomor NISN)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => handleOpenEdit(myStudentProfile)}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit & Lengkapi Biodata Saya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert status */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold"
          >
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit / Add Modal Popup */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-4 bg-indigo-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-200" />
                  <div>
                    <h2 className="text-sm font-black tracking-wide uppercase">
                      {selectedStudent ? "Edit Biodata Siswa" : "Tambah Siswa Baru"}
                    </h2>
                    <p className="text-[10px] text-indigo-200 font-medium">
                      {selectedStudent ? `${selectedStudent.name} (${selectedStudent.className})` : "Isi seluruh informasi siswa secara lengkap"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* 1. Foto Profil & Identitas Utama Siswa */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <User className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Identitas Utama & Foto Siswa</h3>
                  </div>

                  {/* Photo Upload Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-[10px] font-black text-indigo-700 uppercase tracking-wider">Foto Profil Siswa</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} alt="Foto Siswa" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          <label className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Foto Siswa</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file, 400, 400, 0.8);
                                    setFormData(prev => ({ ...prev, photoUrl: compressed }));
                                  } catch (err) {
                                    console.error("Error compressing photo:", err);
                                  }
                                }
                              }}
                            />
                          </label>
                          {formData.photoUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Hapus Foto
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Unggah pasfoto resmi siswa (Format JPG/PNG/WEBP).</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Siswa */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nama Lengkap Siswa *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Aditya Pratama"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    {/* NIS */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nomor Induk Siswa (NIS)</label>
                      <input
                        type="text"
                        value={formData.nis}
                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                        placeholder="Contoh: 24001"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    {/* NISN */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">NISN</label>
                      <input
                        type="text"
                        value={formData.nisn}
                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                        placeholder="Contoh: 0081234567"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    {/* Kelas */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Kelas</label>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        placeholder="Contoh: XI TKR A"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                      />
                    </div>

                    {/* Jurusan / Keahlian */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Jurusan / Keahlian</label>
                      <input
                        type="text"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        placeholder="Contoh: Teknik Kendaraan Ringan (TKR)"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Tempat & Tanggal Lahir (Drop-down Tanggal, Bulan, Tahun) */}
                    <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <BirthDateSelector
                        birthPlace={formData.birthPlace}
                        birthDate={formData.birthDate}
                        onPlaceChange={(place) => setFormData(prev => ({ ...prev, birthPlace: place }))}
                        onDateChange={(dateIso) => setFormData(prev => ({ ...prev, birthDate: dateIso }))}
                        minYear={1995}
                        maxYear={2026}
                      />
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Jenis Kelamin</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    {/* Agama */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Agama</label>
                      <select
                        value={formData.religion}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Budha">Budha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Nomor Telepon & Alamat Siswa */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">2. Kontak Telepon & Alamat Siswa</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Telepon Siswa */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nomor HP / WhatsApp Siswa</label>
                      <input
                        type="text"
                        value={formData.whatsApp}
                        onChange={(e) => setFormData({ ...formData, whatsApp: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    {/* Telepon Orang Tua */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nomor HP / WhatsApp Orang Tua</label>
                      <input
                        type="text"
                        value={formData.parentWhatsApp}
                        onChange={(e) => setFormData({ ...formData, parentWhatsApp: e.target.value })}
                        placeholder="Contoh: 081298765432"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Alamat Rumah Lengkap</label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Isi jalan, RT/RW, desa/kelurahan, kecamatan tempat tinggal siswa..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Data Orang Tua (Ayah & Ibu) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Data Orang Tua & Wali</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Ayah */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nama Ayah Kandung</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Nama lengkap ayah kandung..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Pekerjaan Ayah */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation}
                        onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                        placeholder="Profesi / pekerjaan ayah..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Nama Ibu */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nama Ibu Kandung</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        placeholder="Nama lengkap ibu kandung..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Pekerjaan Ibu */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={formData.motherOccupation}
                        onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                        placeholder="Profesi / pekerjaan ibu..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Nama Wali */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Nama Wali Terdaftar</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        placeholder="Isi jika siswa tinggal bersama wali (paman/kakek/saudara)..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Data Siswa</span>
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
