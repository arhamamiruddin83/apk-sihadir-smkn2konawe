import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Send, Copy, ExternalLink, Check, Users, ShieldAlert,
  Clock, AlertTriangle, CheckCircle2, UserCheck, FileText,
  Building2, School, RefreshCw, ChevronRight, Search, HeartPulse, UserX
} from "lucide-react";
import {
  buildComprehensive15WitaReport,
  dispatchComprehensive15WitaReport,
  Comprehensive15ReportResult,
  getTeacherGroupTarget
} from "../services/whatsappFonnteService";

interface Comprehensive15WitaReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export function Comprehensive15WitaReportModal({
  isOpen,
  onClose,
  initialDate
}: Comprehensive15WitaReportModalProps) {
  const [activeTab, setActiveTab] = useState<"pesan_wa" | "siswa_absen" | "kelas_wali" | "dewan_guru" | "staf_tu">("pesan_wa");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchStudent, setSearchStudent] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Generate Report
  const report: Comprehensive15ReportResult = useMemo(() => {
    return buildComprehensive15WitaReport(initialDate);
  }, [initialDate, refreshKey]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(report.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendFonnte = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      const res = await dispatchComprehensive15WitaReport(true);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Terjadi kesalahan pengiriman." });
    } finally {
      setIsSending(false);
    }
  };

  const filteredAbsentStudents = report.details.allAbsentStudents.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.className.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.status.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const targetGroup = getTeacherGroupTarget();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30 tracking-wider">
                  Rekapitulasi Presensi Terpadu 15.00 WITA
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Batas Akhir Sesi KBM
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <School className="h-6 w-6 text-emerald-400" />
                <span>SIARAN REKAPITULASI PRESENSI HARIAN</span>
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                {report.dateFormatted} • Prinsip: <span className="text-amber-200 italic font-semibold">&ldquo;Transparansi Penuh Presensi — Menghindari Dusta di Antara Kita&rdquo;</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10 relative z-10 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-emerald-200">Kehadiran Murid</div>
              <div className="text-base font-black text-white">{report.summary.studentAttendancePct}%</div>
              <div className="text-[9px] text-emerald-200 truncate">
                {report.summary.studentsHadir}/{report.summary.totalStudents} Hadir (S:{report.summary.studentsSakit} I:{report.summary.studentsIzin} A:{report.summary.studentsAlfa})
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-sky-200">Kehadiran Dewan Guru</div>
              <div className="text-base font-black text-white">{report.summary.teacherAttendancePct}%</div>
              <div className="text-[9px] text-sky-200 truncate">
                {report.summary.teachersHadir}/{report.summary.totalTeachers} Guru • {report.summary.teachersJurnalCount} Jurnal
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-amber-200">Staf Tata Usaha</div>
              <div className="text-base font-black text-white">{report.summary.tuStaffAttendancePct}%</div>
              <div className="text-[9px] text-amber-200 truncate">
                {report.summary.tuStaffHadir}/{report.summary.totalTuStaff} Staf Lengkap
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-rose-200">Murid Tidak Hadir</div>
              <div className="text-base font-black text-white">
                {report.summary.studentsSakit + report.summary.studentsIzin + report.summary.studentsAlfa} Murid
              </div>
              <div className="text-[9px] text-rose-200 truncate">
                Sakit: {report.summary.studentsSakit} | Izin: {report.summary.studentsIzin} | Alfa: {report.summary.studentsAlfa}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2 overflow-x-auto gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("pesan_wa")}
            className={`px-3.5 py-2.5 font-extrabold text-xs rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === "pesan_wa"
                ? "bg-white text-emerald-700 border-emerald-600 shadow-xs"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Format Teks WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("siswa_absen")}
            className={`px-3.5 py-2.5 font-extrabold text-xs rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === "siswa_absen"
                ? "bg-white text-rose-700 border-rose-600 shadow-xs"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <UserX className="h-3.5 w-3.5" />
            <span>Daftar Murid Tidak Hadir ({report.details.allAbsentStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kelas_wali")}
            className={`px-3.5 py-2.5 font-extrabold text-xs rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === "kelas_wali"
                ? "bg-white text-indigo-700 border-indigo-600 shadow-xs"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Rekap 18 Kelas & Wali</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dewan_guru")}
            className={`px-3.5 py-2.5 font-extrabold text-xs rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === "dewan_guru"
                ? "bg-white text-teal-700 border-teal-600 shadow-xs"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Dewan Guru ({report.summary.totalTeachers})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("staf_tu")}
            className={`px-3.5 py-2.5 font-extrabold text-xs rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === "staf_tu"
                ? "bg-white text-amber-700 border-amber-600 shadow-xs"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Staf Tata Usaha ({report.summary.totalTuStaff})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
              feedback.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
                <span>{feedback.message}</span>
              </div>
              <button 
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: FORMAT TEKS WHATSAPP */}
          {activeTab === "pesan_wa" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-emerald-700" />
                    Format Siaran WhatsApp Resmi (Pukul 15.00 WITA)
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Target Gateway: <span className="font-mono font-bold">{targetGroup}</span> (Grup / Saluran WhatsApp Sekolah)
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Tersalin!" : "Salin Format"}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(report.messageText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Buka di WA</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleSendFonnte}
                    disabled={isSending}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-emerald-400" />}
                    <span>{isSending ? "Mengirim..." : "Kirim via Gateway Fonnte"}</span>
                  </button>
                </div>
              </div>

              {/* Message Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={report.messageText}
                  rows={15}
                  className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-700 leading-relaxed resize-none focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR MURID TIDAK HADIR */}
          {activeTab === "siswa_absen" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserX className="h-4 w-4 text-rose-600" />
                    <span>Daftar Murid Tidak Hadir Hari Ini ({report.details.allAbsentStudents.length} Murid)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Transparansi penuh data murid yang sakit, izin, atau alfa agar dapat segera dikoordinasikan oleh Wali Kelas & Guru BK.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Cari murid / kelas..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Murid</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Keterangan / Alasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAbsentStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{st.name}</td>
                        <td className="py-2.5 px-3 font-bold text-indigo-700">{st.className}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            st.status === "Sakit"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : st.status === "Izin"
                              ? "bg-sky-100 text-sky-800 border border-sky-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{st.notes || "-"}</td>
                      </tr>
                    ))}
                    {filteredAbsentStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          Tidak ada murid yang berstatus tidak hadir sesuai pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REKAP 18 KELAS & WALI KELAS */}
          {activeTab === "kelas_wali" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>Rekapitulasi Kehadiran Per Kelas (18 Kelas Resmi SMK 2 Konawe)</span>
                </h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Wali Kelas</th>
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3 text-center text-emerald-700">Hadir</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">Sakit</th>
                      <th className="py-2.5 px-3 text-center text-sky-700">Izin</th>
                      <th className="py-2.5 px-3 text-center text-rose-700">Alfa</th>
                      <th className="py-2.5 px-3 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.details.classes.map((cls, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-black text-slate-900">{cls.className}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{cls.waliKelas}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{cls.total}</td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-700">{cls.hadir}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700">{cls.sakit}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-sky-700">{cls.izin}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-700">{cls.alfa}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            cls.pct >= 95 ? "bg-emerald-100 text-emerald-800" : cls.pct >= 90 ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {cls.pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DEWAN GURU */}
          {activeTab === "dewan_guru" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-teal-600" />
                  <span>Presensi Dewan Guru ({report.summary.teachersHadir}/{report.summary.totalTeachers} Hadir • {report.summary.teacherAttendancePct}%)</span>
                </h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Guru</th>
                      <th className="py-2.5 px-3">Jabatan / Tugas</th>
                      <th className="py-2.5 px-3">Jam Masuk</th>
                      <th className="py-2.5 px-3">Jam Pulang</th>
                      <th className="py-2.5 px-3">Jurnal KBM</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.details.teachers.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-extrabold text-slate-900">{t.name}</td>
                        <td className="py-2 px-3 text-slate-500">{t.role}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">{t.clockIn || "--:--"} WITA</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{t.clockOut || "--:--"} WITA</td>
                        <td className="py-2 px-3">
                          {t.hasJournal ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Terisi
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Belum</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            t.status.includes("Hadir") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STAF TATA USAHA */}
          {activeTab === "staf_tu" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>Presensi Tenaga Kependidikan / Tata Usaha ({report.summary.tuStaffHadir}/{report.summary.totalTuStaff} Hadir • 100%)</span>
                </h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Staf</th>
                      <th className="py-2.5 px-3">Jabatan</th>
                      <th className="py-2.5 px-3">Jam Masuk</th>
                      <th className="py-2.5 px-3">Jam Pulang</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.details.tuStaff.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{st.name}</td>
                        <td className="py-3 px-3 font-medium text-slate-600">{st.role}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">{st.clockIn} WITA</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{st.clockOut} WITA</td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            ⏰ Penyiaran otomatis dijadwalkan setiap hari pukul <strong className="text-slate-800">15.00 WITA</strong> via SIHADIR WhatsApp Gateway.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSendFonnte}
              disabled={isSending}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? "Mengirim..." : "Siarkan Rekap 15.00 ke WhatsApp"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
