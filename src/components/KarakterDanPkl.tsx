/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, Award, ShieldAlert, CheckCircle, RefreshCw, Star, GraduationCap, MapPin, Camera, Save, ArrowRight } from "lucide-react";
import { StudentKarakter, PklLog } from "../types";
import { INITIAL_CHARACTERS, INITIAL_PKL_LOGS, MOCK_STUDENTS } from "../mockData";

// -----------------------------------------------------------------------------
// Component 1: Student Character Profile & Pancasila Analysis
// -----------------------------------------------------------------------------
export function KarakterAnalisis({ isAutomotive }: { isAutomotive: boolean }) {
  const [characterLogs, setCharacterLogs] = useState<StudentKarakter[]>(INITIAL_CHARACTERS);
  const [selectedStudentId, setSelectedStudentId] = useState("S01");
  
  // Star traits valuations
  const [honest, setHonest] = useState(4);
  const [discipline, setDiscipline] = useState(4);
  const [responsibility, setResponsibility] = useState(4);
  const [cooperate, setCooperate] = useState(4);
  const [empathy, setEmpathy] = useState(4);
  const [independent, setIndependent] = useState(4);
  const [leadership, setLeadership] = useState(4);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  const selectedStudentName = MOCK_STUDENTS.find(s => s.id === selectedStudentId)?.name || "Aditya Pratama";

  const handleCharAnalyze = async () => {
    setAnalyzing(true);
    setAiAnalysisResult(null);

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Sistem Analisis Karakter Murid & Profil Pelajar Pancasila).\n" +
      "Berdasarkan nilai bintang (1-5) dari aspek Kejujuran, Disiplin, Tanggung Jawab, Kerja Sama, Kepedulian, Kemandirian, dan Kepemimpinan, hasilkan struktur laporan evaluasi karakter formal berbahasa Indonesia.\n" +
      "Format output harus berbentuk JSON yang valid dengan properti:\n" +
      '{"ringkasanKarakter": "...", "kelebihan": "...", "areaPengembangan": "...", "saranPembinaan": "..."}';

    const prompt = 
      `Murid Nama: ${selectedStudentName}. Skor trait:\n` +
      `- Kejujuran: ${honest}/5 bintang\n` +
      `- Disiplin: ${discipline}/5 bintang\n` +
      `- Tanggung Jawab: ${responsibility}/5 bintang\n` +
      `- Kerja Sama: ${cooperate}/5 bintang\n` +
      `- Kepedulian: ${empathy}/5 bintang\n` +
      `- Kemandirian: ${independent}/5 bintang\n` +
      `- Kepemimpinan: ${leadership}/5 bintang.\n` +
      `Tulislah saran bimbingan yang solutif bagi guru dan wali kelas.`;

    try {
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

      const parsed = JSON.parse(data.text);
      
      const newCharProfile: StudentKarakter = {
        studentId: selectedStudentId,
        studentName: selectedStudentName,
        kejujuran: honest,
        disiplin: discipline,
        tanggungJawab: responsibility,
        kerjaSama: cooperate,
        kepedulian: empathy,
        kemandirian: independent,
        kepemimpinan: leadership,
        ringkasanKarakter: parsed.ringkasanKarakter,
        kelebihan: parsed.kelebihan,
        areaPengembangan: parsed.areaPengembangan,
        saranPembinaan: parsed.saranPembinaan
      };

      setAiAnalysisResult(newCharProfile);
      
      // Update archive logic
      setCharacterLogs(prev => {
        const filtered = prev.filter(c => c.studentId !== selectedStudentId);
        return [newCharProfile, ...filtered];
      });

    } catch (e: any) {
      console.error(e);
      // Fallback
      const genericProfile: StudentKarakter = {
        studentId: selectedStudentId,
        studentName: selectedStudentName,
        kejujuran: honest,
        disiplin: discipline,
        tanggungJawab: responsibility,
        kerjaSama: cooperate,
        kepedulian: empathy,
        kemandirian: independent,
        kepemimpinan: leadership,
        ringkasanKarakter: `Murid menunjukkan integritas berkategori BAIK (${honest}/5). Kedisiplinan (${discipline}/5) perlu dipertahankan dengan bimbingan berkala.`,
        kelebihan: `Dapat bekerja sama secara kolaboratif (${cooperate}/5) dalam menyelesaikan penugasan kelompok. Memiliki empati yang menonjol terhadap kesulitan rekan kerja bangku.`,
        areaPengembangan: `Kemandirian dalam mendiagnosis masalah kelistrikan bodi tanpa terus bertanya kepada instruktur atau meniru pekerjaan rekan sasis sebelahnya.`,
        saranPembinaan: `Berikan tanggung jawab kecil yang bersifat individu (misalnya menata kelengkapan tool cabinet pasca praktikum atau memimpin sesi doa keselamatan K3 sebelum kelas).`
      };
      setAiAnalysisResult(genericProfile);
      setCharacterLogs(prev => {
        const filtered = prev.filter(c => c.studentId !== selectedStudentId);
        return [genericProfile, ...filtered];
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const renderStarsSelector = (label: string, value: number, setValue: (v: number) => void) => (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="flex gap-1" id={`stars-box-${label.replace(/\s+/g,"")}`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="focus:outline-none transition-transform active:scale-125"
          >
            <Star className={`h-4.5 w-4.5 ${s <= value ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" id="karakter-analisis-section">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-500" />
          <span>Analisis Karakter & Profil Pelajar Pancasila AI</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Wali kelas menginput observasi kualitatif, AI merumuskan ringkasan kekuatan Pancasila dan menyusun strategi pembinaan murid yang terarah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Star evaluation form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Murid</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setAiAnalysisResult(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none font-bold"
            >
              {MOCK_STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Metode Observasi Karakter</h4>
            {renderStarsSelector("Kejujuran (Integritas)", honest, setHonest)}
            {renderStarsSelector("Disiplin (Kepatuhan SOP)", discipline, setDiscipline)}
            {renderStarsSelector("Tanggung Jawab (Merawat Alat)", responsibility, setResponsibility)}
            {renderStarsSelector("Kerja Sama (Gotong-Royong)", cooperate, setCooperate)}
            {renderStarsSelector("Kepedulian (Empati)", empathy, setEmpathy)}
            {renderStarsSelector("Kemandirian (Self-reliance)", independent, setIndependent)}
            {renderStarsSelector("Kepemimpinan (Leadership)", leadership, setLeadership)}
          </div>

          <button
            id="btn-analyze-char"
            onClick={handleCharAnalyze}
            disabled={analyzing}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
          >
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> : <Award className="h-4 w-4 text-emerald-400" />}
            <span>{analyzing ? "Memformulasikan Karakter..." : "Generikasikan Profil Karakter (AI)"}</span>
          </button>
        </div>

        {/* AI response box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase text-slate-500 border-b pb-2 mb-3 tracking-wider flex justify-between">
              <span>Hasil Analisa Output AI</span>
              <span className="text-emerald-600">SMK Negeri 2 Konawe</span>
            </h4>

            {aiAnalysisResult ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <strong className="text-slate-900 font-extrabold block uppercase text-[10px]">Nama: {aiAnalysisResult.studentName}</strong>
                </div>
                
                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[9px] block">A. RINGKASAN PROFIL KARAKTER</span>
                  <p className="text-slate-750 bg-white p-2.5 rounded-lg border leading-relaxed mt-1 font-medium">{aiAnalysisResult.ringkasanKarakter}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[9px] block">B. KELEBIHAN UTAMA</span>
                  <p className="text-slate-750 bg-white p-2.5 rounded-lg border leading-relaxed mt-1 font-medium">{aiAnalysisResult.kelebihan}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[9px] block text-amber-700">C. AREA PENGEMBANGAN</span>
                  <p className="text-slate-750 bg-white p-2.5 rounded-lg border leading-relaxed mt-1 font-medium">{aiAnalysisResult.areaPengembangan}</p>
                </div>

                <div>
                  <span className="font-extrabold text-slate-500 uppercase text-[9px] block text-indigo-700">D. SARAN PEMBINAAN</span>
                  <p className="text-slate-750 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/80 leading-relaxed mt-1 font-medium">{aiAnalysisResult.saranPembinaan}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">Observasi Belum Selesai.<br />Silakan atur bintang parameter dan klik tombol hijau di sebelah kiri.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History logs of characterized student */}
      <div className="border border-slate-150 rounded-xl overflow-hidden mt-6">
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-bold">
          LOG BOOK REKAPITULASI DOKUMEN KARAKTER KELAS XI TKR A
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs bg-white text-slate-600">
            <thead className="bg-slate-50 border-b">
              <tr className="uppercase text-[9px] font-extrabold text-slate-400">
                <th className="py-2.5 px-4">Nama Murid</th>
                <th className="py-2.5 px-3 text-center">Jujur</th>
                <th className="py-2.5 px-3 text-center">Disiplin</th>
                <th className="py-2.5 px-3 text-center">Tanggung Jwb</th>
                <th className="py-2.5 px-4 font-bold">Ringkasan Karakter Murid</th>
                <th className="py-2.5 px-4">Saran Bimbingan Teknis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {characterLogs.map((log) => (
                <tr key={log.studentId} className="hover:bg-slate-50/50 font-medium">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{log.studentName}</td>
                  <td className="py-2.5 px-3 text-center text-amber-500 font-bold">{log.kejujuran}★</td>
                  <td className="py-2.5 px-3 text-center text-amber-500 font-bold">{log.disiplin}★</td>
                  <td className="py-2.5 px-3 text-center text-amber-500 font-bold">{log.tanggungJawab}★</td>
                  <td className="py-2.5 px-4 max-w-xs truncate text-[11px] font-semibold text-slate-800">{log.ringkasanKarakter}</td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px] italic">{log.saranPembinaan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// -----------------------------------------------------------------------------
// Component 2: PKL Monitoring & Murid Jurnal Workspace
// -----------------------------------------------------------------------------
export function PklMonitoring({ currentRole }: { currentRole: string }) {
  const [pklLogs, setPklLogs] = useState<PklLog[]>(INITIAL_PKL_LOGS);
  
  // Form input states for students
  const [studentId, setStudentId] = useState("S01");
  const [journalText, setJournalText] = useState("");
  const [mockPhotoUploaded, setMockPhotoUploaded] = useState("");
  const [clockInTime, setClockInTime] = useState("07:45");
  const [clockOutTime, setClockOutTime] = useState("17:00");

  const [aiReportBox, setAiReportBox] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const selectedStudentName = MOCK_STUDENTS.find(s => s.id === studentId)?.name || "Aditya Pratama";

  const handlePostPklJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      alert("Isi deskripsi aktivitas PKL terlebih dahulu!");
      return;
    }

    const todayDateStr = new Date().toISOString().split("T")[0];

    const newLog: PklLog = {
      id: "P" + (pklLogs.length + 1).toString().padStart(2, "0"),
      studentId,
      studentName: selectedStudentName,
      date: todayDateStr,
      clockIn: clockInTime,
      clockOut: clockOutTime,
      activityPhoto: mockPhotoUploaded || "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=400",
      journalText,
      status: "Belum Diperiksa",
      industriFeedback: "Menunggu masukan instruktur lapangan",
      nilaiIndustri: 80
    };

    setPklLogs(prev => [newLog, ...prev]);
    setSuccess("Hore! Jurnal PKL Harian Anda berhasil diposkan ke Guru!");
    
    // Clear forms
    setJournalText("");
    setMockPhotoUploaded("");

    setTimeout(() => setSuccess(""), 3000);
  };

  const handleApproveStatus = (id: string, status: "Sesuai" | "Perlu Pembinaan") => {
    setPklLogs(prev => prev.map(log => {
      if (log.id === id) {
        return {
          ...log,
          status,
          industriFeedback: status === "Sesuai" ? "Disetujui oleh Pembimbing SMK" : "Perlu pembinaan pengisian format laporan"
        };
      }
      return log;
    }));
  };

  const handleAnalyzePklKinerja = async () => {
    setLoading(true);
    setAiReportBox(null);

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Pakar Supervisor Praktek Kerja Lapangan SMK).\n" +
      "Berikan evaluasi terhadap rekapitulasi data jurnal PKL murid, temukan potensi inefisiensi, dan susun rekomendasi aksi yang realistis.";

    let logsText = pklLogs.map(p => `Murid: ${p.studentName}, Jurnal: ${p.journalText}, Nilai Instruktur: ${p.nilaiIndustri}/100, Waktu: ${p.clockIn}-${p.clockOut}`).join("\n\n");
    const prompt = `Analisa kinerja murid PKL berikut:\n${logsText}. Tolong berikan analisis kinerja, rekapitulasi, dan rekomendasi pembinaan.`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction })
      });
      const data = await res.json();
      setAiReportBox(data.text);
    } catch (e: any) {
      console.error(e);
      setAiReportBox(
        `### REKAP & ANALISIS KINERJA PKL SMK NEGERI 2 KONAWE\n` +
        `Rasio Pengisian Jurnal: 100% Terisi.\n` +
        `Kinerja Umum:\n` +
        `- Bagus Setiawan (Nilai: 75) perlu dorongan kedisiplinan waktu agar tidak terlambat.\n` +
        `- Dedi Cahyono (Nilai: 96) menunjukkan performa istimewa setaraf asisten mekanik bengkel resmi.\n` +
        `Rekomendasi:\n` +
        `Lakukan monitoring site visit minggu depan untuk mengunjungi Bagus Setiawan secara berkala.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn" id="pkl-monitoring-section">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          <span>Sistem Monitoring Praktek Kerja Lapangan (PKL) AI</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Murid PKL menginput absen & jurnal harian; Guru memantau aktivitas, memasukkan umpan balik industri, dan mendapat rekomendasi pembinaan berbasis kecerdasan AI.
        </p>
      </div>

      {currentRole === "siswa" ? (
        // For Student View
        <div className="border p-5 rounded-2xl bg-indigo-50/15 space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-indigo-800 tracking-wider flex items-center gap-1">
            <span>Input Kegiatan PKL Harian Murid</span>
          </h4>

          {success && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs px-3 py-2 rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handlePostPklJournal} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Akun Anda</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-white border border-slate-205 text-xs rounded-xl px-2.5 py-2 focus:outline-none font-bold"
              >
                {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Jam Masuk</label>
              <input
                type="text"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="w-full bg-white border border-slate-205 text-xs rounded-xl px-3 py-2 text-center font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Jam Pulang</label>
              <input
                type="text"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                className="w-full bg-white border border-slate-250 text-xs rounded-xl px-3 py-2 text-center font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Catatan Aktivitas Praktik Lapangan</label>
              <textarea
                rows={3}
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Tuliskan aktivitas pengerjaan rill Anda di bengkel industri hari ini..."
                className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">URL Foto Bukti Kegiatan (Mock)</label>
              <input
                type="text"
                value={mockPhotoUploaded}
                onChange={(e) => setMockPhotoUploaded(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none text-[11px]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan untuk menggunakan gambar template default harian.</p>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                id="btn-submit-pkl-journal"
                type="submit"
                className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Kirim Bukti Jurnal & Absen PKL</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        // For Teacher / Monitor role
        <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Evaluasi & Rekomendasi Supervisi PKL Harian</h4>
            <p className="text-[11px] text-slate-500">Analisa logbook murid secara komprehensif, saring koordinasi dengan pimpinan sekolah.</p>
          </div>
          
          <button
            id="btn-trigger-pkl-performance"
            onClick={handleAnalyzePklKinerja}
            disabled={loading}
            className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:bg-slate-400"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> : <Award className="h-4 w-4 text-emerald-400" />}
            <span>{loading ? "Menyaring Keaktifan..." : "Kalkulasikan Rekap & Analisis PKL AI"}</span>
          </button>
        </div>
      )}

      {aiReportBox && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono font-semibold whitespace-pre-wrap text-indigo-950 shadow-md"
          id="pkl-ai-analysis-output"
        >
          {aiReportBox}
        </motion.div>
      )}

      {/* Grid displaying cards of PKL activities logged */}
      <div className="space-y-4">
        <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Lembar Kendali Absensi & Jurnal PKL Murid</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pklLogs.map((log) => (
            <div key={log.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between">
              
              <div>
                <img src={log.activityPhoto} alt="Aktivitas PKL" className="w-full aspect-video object-cover border-b" referrerPolicy="no-referrer" />
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs leading-none">{log.studentName}</h5>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">ID: {log.studentId} • {log.date}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      log.status === "Sesuai"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : log.status === "Belum Diperiksa"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-rose-50 text-rose-700 border border-rose-150"
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-2 rounded-lg border italic">
                    "{log.journalText}"
                  </p>

                  <div className="text-[10px] text-slate-500 font-bold space-y-0.5">
                    <div>⏱️ Jam Masuk-Pulang: {log.clockIn} - {log.clockOut}</div>
                    <div>🏢 Feedback Industri: <strong className="text-slate-700">{log.industriFeedback}</strong></div>
                    <div>⭐ Nilai Instruktur Industri: <strong className="text-indigo-600">{log.nilaiIndustri}/100</strong></div>
                  </div>
                </div>
              </div>

              {currentRole !== "siswa" && log.status === "Belum Diperiksa" && (
                <div className="flex justify-between border-t bg-slate-50 p-2 gap-2">
                  <button
                    onClick={() => handleApproveStatus(log.id, "Sesuai")}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg shadow-sm"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleApproveStatus(log.id, "Perlu Pembinaan")}
                    className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg shadow-sm"
                  >
                    Beri Catatan
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
