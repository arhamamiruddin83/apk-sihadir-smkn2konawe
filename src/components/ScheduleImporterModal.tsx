/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Search, 
  Calendar, 
  Users, 
  BookOpen, 
  UserCheck, 
  CheckCircle, 
  Download, 
  AlertCircle,
  FileText,
  Filter
} from "lucide-react";
import { OFFICIAL_SMK2_SCHEDULES, TEACHER_MAP, SUBJECT_MAP, TranslatedScheduleItem } from "../data/translatedSchedules";
import { TeachingSchedule } from "../types";

interface ScheduleImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedSchedules: TeachingSchedule[]) => void;
}

export default function ScheduleImporterModal({ isOpen, onClose, onImport }: ScheduleImporterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("Semua Hari");
  const [selectedClass, setSelectedClass] = useState<string>("Semua Kelas");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("Semua Guru");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Extract distinct values for filters
  const days = ["Semua Hari", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const classesList = ["Semua Kelas", ...Array.from(new Set(OFFICIAL_SMK2_SCHEDULES.map(s => s.className)))].sort();
  const teachersList = ["Semua Guru", ...Array.from(new Set(OFFICIAL_SMK2_SCHEDULES.map(s => `${s.teacherCode} - ${s.teacherName}`)))].sort();

  // Filter items
  const filteredSchedules = OFFICIAL_SMK2_SCHEDULES.filter((item, idx) => {
    const key = `${item.day}-${item.className}-${item.period}-${item.teacherCode}`;
    
    const matchesSearch = 
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDay = selectedDay === "Semua Hari" || item.day === selectedDay;
    const matchesClass = selectedClass === "Semua Kelas" || item.className === selectedClass;
    
    const teacherCodeSelected = selectedTeacher !== "Semua Guru" ? selectedTeacher.split(" - ")[0] : "";
    const matchesTeacher = selectedTeacher === "Semua Guru" || item.teacherCode === teacherCodeSelected;

    return matchesSearch && matchesDay && matchesClass && matchesTeacher;
  });

  const toggleSelectAll = () => {
    const allSelected = filteredSchedules.every((_, idx) => selectedItems[idx]);
    const newSelected: Record<string, boolean> = { ...selectedItems };
    
    filteredSchedules.forEach((_, idx) => {
      newSelected[idx] = !allSelected;
    });
    
    setSelectedItems(newSelected);
  };

  const toggleSelectItem = (idx: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleBulkImport = () => {
    const schedulesToImport: TeachingSchedule[] = [];
    
    filteredSchedules.forEach((item, idx) => {
      if (selectedItems[idx]) {
        schedulesToImport.push({
          id: `sch-imported-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          teacherId: item.teacherCode.toLowerCase(),
          teacherName: item.teacherName,
          subject: item.subjectName,
          className: item.className,
          day: item.day,
          period: `${item.period} (${item.time})`,
          semester: "Ganjil 2026/2027"
        });
      }
    });

    if (schedulesToImport.length === 0) {
      alert("Silakan pilih minimal satu jadwal mengajar terlebih dahulu.");
      return;
    }

    onImport(schedulesToImport);
    onClose();
  };

  const totalSelected = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
      >
        {/* Header */}
        <div className="p-5 bg-indigo-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase">Penerjemah & Impor Jadwal Resmi</h2>
              <p className="text-[10px] text-indigo-200 font-medium">Jadwal Pelajaran Semester Ganjil SMK Negeri 2 Konawe TA 2026/2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Cari Kata Kunci</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Guru, Kode, Mapel, Kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[11px] rounded-lg border border-slate-200 pl-8 pr-3 py-2 bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Hari</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full text-[11px] rounded-lg border border-slate-200 p-2 bg-white font-bold text-slate-700"
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-[11px] rounded-lg border border-slate-200 p-2 bg-white font-bold text-slate-700"
            >
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Guru (Kode - Nama)</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full text-[11px] rounded-lg border border-slate-200 p-2 bg-white font-bold text-slate-700"
            >
              {teachersList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Legend / Info */}
        <div className="px-5 py-2 bg-amber-50/70 border-b border-amber-100 flex items-center gap-2 text-[10px] text-amber-800 font-semibold shrink-0">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Sistem secara otomatis menerjemahkan kode jadwal (contoh: <strong>3.MUS</strong> menjadi mapel <strong>Bahasa Indonesia</strong> oleh <strong>Drs. Muslimin. L, S.Pd.</strong>). Centang baris untuk diimpor.</span>
        </div>

        {/* List of Translated Schedules */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredSchedules.length > 0 && filteredSchedules.every((_, idx) => selectedItems[idx])}
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-2.5 px-2">Hari & Waktu</th>
                <th className="py-2.5 px-2">Kelas</th>
                <th className="py-2.5 px-2">Kode Asli</th>
                <th className="py-2.5 px-2">Mata Pelajaran (Hasil Terjemahan)</th>
                <th className="py-2.5 px-2">Pendidik / Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                    Tidak ada jadwal SMK Negeri 2 Konawe yang cocok dengan saringan filter Anda.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((item, idx) => {
                  const isChecked = Boolean(selectedItems[idx]);
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => toggleSelectItem(idx)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isChecked ? "bg-indigo-50/30" : ""}`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(idx)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-extrabold text-slate-900">{item.day}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">{item.period} ({item.time})</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-extrabold border border-slate-200 rounded text-[9px]">
                          {item.className}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-indigo-600 text-[10px]">
                        {item.subjectCode}.{item.teacherCode}
                      </td>
                      <td className="py-3 px-2 font-black text-slate-800">
                        {item.subjectName}
                      </td>
                      <td className="py-3 px-2 font-semibold text-indigo-900">
                        <span>{item.teacherName}</span>
                        <span className="ml-1.5 inline-block bg-indigo-100 text-indigo-800 font-mono text-[9.5px] font-black px-1.5 py-0.5 rounded border border-indigo-200">
                          [{item.teacherCode}]
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            Terpilih <span className="text-indigo-600 font-black">{totalSelected}</span> dari <span className="font-black">{filteredSchedules.length}</span> jadwal pelajaran.
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleBulkImport}
              disabled={totalSelected === 0}
              className={`px-4.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${totalSelected === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Download className="h-4 w-4" />
              <span>Impor Jadwal Terpilih</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
