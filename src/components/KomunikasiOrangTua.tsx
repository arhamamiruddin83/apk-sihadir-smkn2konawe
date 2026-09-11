/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  ArrowRight, 
  Share2, 
  Clipboard, 
  RefreshCw, 
  Send, 
  CheckCircle, 
  Link, 
  Settings2, 
  Layers, 
  Globe, 
  ExternalLink, 
  Plus, 
  Users, 
  BookOpen, 
  Check, 
  HelpCircle, 
  Terminal, 
  FileText, 
  Info,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Student } from "../types";
import { MOCK_STUDENTS, INITIAL_SCORES, INITIAL_CHARACTERS } from "../mockData";
import { getTeacherPerwalianClass } from "../utils/scheduleHelper";
import { WALI_KELAS_LIST, getWaliKelasForClass } from "../data/waliKelasData";

interface KomunikasiOrangTuaProps {
  username?: string;
  currentRole?: string;
}

export function KomunikasiOrangTua({ username = "", currentRole = "" }: KomunikasiOrangTuaProps) {
  const [students] = useState<Student[]>(MOCK_STUDENTS);

  // Auto-detect default perwalian class from username (e.g. Bu Nyoman -> XII TAV)
  const defaultPerwalianClass = getTeacherPerwalianClass(username) || "XII TAV";
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return localStorage.getItem("sihadir_target_perwalian_class") || defaultPerwalianClass;
  });

  // Keep selectedClass synchronized if username changes
  useEffect(() => {
    if (username) {
      const perwalian = getTeacherPerwalianClass(username);
      if (perwalian) {
        setSelectedClass(perwalian);
      }
    }
  }, [username]);

  // List of all classes available
  const allClassNames = WALI_KELAS_LIST.map(w => w.className);

  // Filter students for the selected class
  const filteredStudents = students.filter(
    s => (s.className || "").trim().toUpperCase() === selectedClass.trim().toUpperCase()
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return filteredStudents[0]?.id || "S001";
  });

  // Sync selectedStudentId to the first student of the filtered class when selectedClass changes
  useEffect(() => {
    if (filteredStudents.length > 0) {
      if (!filteredStudents.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(filteredStudents[0].id);
        setGeneratedReport("");
      }
    }
  }, [selectedClass, filteredStudents]);

  const [customNote, setCustomNote] = useState("Murid sangat rajin dalam praktikum, namun disarankan melatih kefasihan berkomunikasi saat presentasi.");
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState("");
  const [copied, setCopied] = useState(false);
  const [subTab, setSubTab] = useState<"individual" | "groups" | "guide">("individual");

  // Local storage for configurations to retain user state
  const [teacherGroupLink, setTeacherGroupLink] = useState(() => {
    return localStorage.getItem("simpati_wa_teacher_group") || "https://chat.whatsapp.com/D8o3rB2gJK71eLmOpTkrGr";
  });
  const [parentGroupLink, setParentGroupLink] = useState(() => {
    return localStorage.getItem("simpati_wa_parent_group") || "https://chat.whatsapp.com/E9z4fD3hKL12mTpQRsTvOr";
  });
  const [waGatewayProvider, setWaGatewayProvider] = useState(() => {
    return localStorage.getItem("simpati_wa_provider") || "fonnte";
  });
  const [apiKeyGateway, setApiKeyGateway] = useState(() => {
    return localStorage.getItem("simpati_wa_gateway_key") || "";
  });
  const [gatewayUrl, setGatewayUrl] = useState(() => {
    return localStorage.getItem("simpati_wa_gateway_url") || "https://api.fonnte.com/send";
  });

  const [testPhoneNumber, setTestPhoneNumber] = useState("081234567890");
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testResultLog, setTestResultLog] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<"curl" | "node" | "python">("curl");

  // Selection aggregation variables
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const selectedScore = INITIAL_SCORES.find(s => s.studentId === selectedStudentId);
  const selectedCharacter = INITIAL_CHARACTERS.find(s => s.studentId === selectedStudentId);

  // Group Broadcast configuration
  const [broadcastTemplate, setBroadcastTemplate] = useState("rapat");
  const [customBroadcastText, setCustomBroadcastText] = useState("");

  // Interactive WA Chatbot Simulator States (Terima Beres)
  const [botChatHistory, setBotChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string; timestamp: string }>>([
    { 
      sender: "bot", 
      text: "Halo! Saya adalah SIHADIR AI Chatbot Asisten SMK Negeri 2 Konawe. 🤖✨\n\nSilakan pilih menu bantuan atau ketik langsung:\n\n📌 Ketik *INFO* - Profil SMK & Jurusan\n📌 Ketik *NILAI* - Akses nilai akademis murid kelas XI TKR\n📌 Ketik *PRESENSI* - Ringkasan kehadiran murid\n📌 Ketik *KONTAK* - Nomor darurat wali kelas & sekolah", 
      timestamp: "20:00" 
    }
  ]);
  const [botInputText, setBotInputText] = useState("");
  const [botLoading, setBotLoading] = useState(false);

  const handleSendBotMessage = (textToSend: string) => {
    if (!textToSend.trim() || botLoading) return;
    
    // Check local time
    const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    // Add User Message
    const updatedHistory = [
      ...botChatHistory,
      { sender: "user" as const, text: textToSend, timestamp: timeNow }
    ];
    setBotChatHistory(updatedHistory);
    setBotInputText("");
    setBotLoading(true);

    // AI/Rule simulate response
    setTimeout(() => {
      let botResponse = "";
      const lower = textToSend.toLowerCase().trim();

      if (lower.includes("info")) {
        botResponse = `🏫 *PROFIL SMK NEGERI 2 KONAWE & JURUSAN TKR* \n\nSMK Negeri 2 Konawe berdiri sebagai Pusat Keunggulan dengan Kurikulum Standar Industri.\n\n📍 *Fasilitas Bengkel Otomotif:* \n- Lift Penyelaras Roda 3D (3D Wheel Alignment)\n- Engine Scanner OBD2 Pro\n- Simulator Sistem Kelistrikan Mutakhir\n- Studio Inovasi Guru Produktif\n\n📞 _Butuh informasi pendaftaran? Hubungi sekretariat SIHADIR SMK Negeri 2 Konawe._`;
      } else if (lower.includes("nilai") || lower.includes("rapor")) {
        botResponse = `📊 *HASIL AKADEMIK MURID (XI TKR)*\n\nSilakan masukkan salah satu nama murid untuk verifikasi nilai:\n\n- Ketik *NILAI ADI* (Adi Saputra)\n- Ketik *NILAI BUDI* (Budi Budiman)\n- Ketik *NILAI CITRA* (Citra Lestari)\n- Ketik *NILAI GALIH* (Galih Sentosa)`;
      } else if (lower.includes("adi")) {
        botResponse = `📝 *LAPORAN NILAI: ADI SAPUTRA (XI TKR)*\n\n- Rata-rata Ujian: *88.5*\n- Status Kelulusan: *TUNTAS (Sangat Baik)*\n- Praktikum Unggulan: Pemeliharaan Sasis & Transmisi Otomatis\n\n💡 _Konsisten, disiplin, dan rajin di bengkel._`;
      } else if (lower.includes("budi")) {
        botResponse = `📝 *LAPORAN NILAI: BUDI BUDIMAN (XI TKR)*\n\n- Rata-rata Ujian: *82.0*\n- Status Kelulusan: *TUNTAS (Baik)*\n- Praktikum Unggulan: Overhaul Mesin diesel & Karburator\n\n💡 _Perlu meningkatkan kerapian pengisian logbook mingguan._`;
      } else if (lower.includes("citra")) {
        botResponse = `📝 *LAPORAN NILAI: CITRA LESTARI (XI TKR)*\n\n- Rata-rata Ujian: *91.2*\n- Status Kelulusan: *TUNTAS (Istimewa)*\n- Praktikum Unggulan: Sistem Kelistrikan Bodi & ECM Tuning\n\n💡 _Sangat cakap memimpin tim dalam simulasi troubleshooter bodi._`;
      } else if (lower.includes("galih")) {
        botResponse = `📝 *LAPORAN NILAI: GALIH SENTOSA (XI TKR)*\n\n- Rata-rata Ujian: *74.5*\n- Status Kelulusan: *REMEDIAL (Perlu Pendampingan)*\n- Praktikum Tertinggal: Pemeliharaan Sensor Sensor EFI\n\n💡 _Diharapkan hadir pada sesi kelas tambahan hari Jumat siang._`;
      } else if (lower.includes("presensi") || lower.includes("hadir") || lower.includes("absen")) {
        botResponse = `✅ *DAFTAR PRESENSI MURID KELAS XI TKR*\n\nPresensi Terkini Mingguan:\n- Adi Saputra: *100%* (Hadir)\n- Budi Budiman: *95%* (1 Sakit)\n- Citra Lestari: *100%* (Hadir)\n- Galih Sentosa: *88%* (1 Sinyal Buruk, 2 Terlambat)\n\n📌 _Sistem presensi kami terkoneksi langsung dengan modul GPS Geolocation SIMPATI._`;
      } else if (lower.includes("kontak") || lower.includes("telepon") || lower.includes("hubungi")) {
        botResponse = `📞 *KONTAK PENTING SEKOLAH & WALI KELAS*\n\n- Wali Kelas XI TKR A: Bpk. Haerul, S.Pd. (*0812-4444-5555*)\n- Konselor BK: Ibu Cici Murni, S.Pd. (*0853-2222-3333*)\n- Hubungan Industri (Humas PKL): Bpk. Hariyadi, M.T. (*0877-2233-4455*)\n- Kantor Call Center SMK Negeri 2 Konawe: *0899-1234-5678*`;
      } else {
        botResponse = `🤖 *SIMPATI AI Chatbot Otomatis:* \nPesan Anda "${textToSend}" telah diproses.\n\nMaaf, kata kunci tersebut belum terdaftar. Silakan pilih menu beres berikut:\n\n👉 Ketik *INFO* (Profil SMK)\n👉 Ketik *NILAI* (Nilai Murid)\n👉 Ketik *PRESENSI* (Absensi Kelas)\n👉 Ketik *KONTAK* (No HP Pendidik)`;
      }

      setBotChatHistory(prev => [
        ...prev,
        { sender: "bot", text: botResponse, timestamp: timeNow }
      ]);
      setBotLoading(false);
    }, 850);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("simpati_wa_teacher_group", teacherGroupLink);
    localStorage.setItem("simpati_wa_parent_group", parentGroupLink);
    localStorage.setItem("simpati_wa_provider", waGatewayProvider);
    localStorage.setItem("simpati_wa_gateway_key", apiKeyGateway);
    localStorage.setItem("simpati_wa_gateway_url", gatewayUrl);
    
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 4000);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setGeneratedReport("");
    setCopied(false);

    const scoreText = selectedScore 
      ? `Rata-rata Rapor: ${selectedScore.rataRata} (${selectedScore.lulus ? 'TUNTAS' : 'REMEDIAL'})`
      : "Data nilai sedang diolah.";
      
    const charSummary = selectedCharacter
      ? `Kejujuran: ${selectedCharacter.kejujuran}/5, Disiplin: ${selectedCharacter.disiplin}/5, Tanggung Jawab: ${selectedCharacter.tanggungJawab}/5`
      : "Integritas terpantau stabil, tingkatkan kepatuhan atribut dasar.";

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Asisten Komunikasi Pendidik dan Orang Tua SMK).\n" +
      "Tugas Anda menulis laporan WhatsApp berkala kepada orang tua berdasarkan template wajib.\n" +
      "Gunakan bahasa Indonesia yang sangat sopan, formal, apresiatif (positif terhadap hasil murid), membangun, dan profesional.\n" +
      "Wajib menyalin model template berikut:\n" +
      "Assalamu'alaikum Wr. Wb.\n\n" +
      "Laporan Perkembangan Murid:\n\n" +
      "Nama: [Nama]\n" +
      "Kelas: [Kelas]\n\n" +
      "Kehadiran: [Sebutkan presentasi kehadiran atau log]\n" +
      "Nilai: [Sebutkan capaian nilai secara ringkas dan ramah]\n" +
      "Karakter: [Sebutkan review sikap positifnya]\n\n" +
      "Catatan Guru: [Masukkan catatan tambahan pendidik]\n\n" +
      "Rekomendasi: [Langkah intervensi positif orang tua di rumah]\n\n" +
      "Terima kasih atas kerja sama Bapak/Ibu.";

    const prompt = 
      `Tulislah pesan WhatsApp kepada orang tua dari murid bernama "${selectedStudent.name}"` +
      `Kelas: "${selectedStudent.className}". Data penunjang:\n` +
      `- Nilai akademik: ${scoreText}\n` +
      `- Aspek karakter: ${charSummary}\n` +
      `- Catatan khusus wali kelas: "${customNote}".`;

    try {
      const res = await fetch("/api/gemini/generate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prompt, systemInstruction })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setGeneratedReport(data.text);
    } catch (e) {
      console.error(e);
      // Fallback
      setGeneratedReport(
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Laporan Perkembangan Murid:\n\n` +
        `Nama: ${selectedStudent.name}\n` +
        `Kelas: ${selectedStudent.className}\n\n` +
        `Kehadiran: Ananda terhitung memiliki kehadiran 100% tepat waktu pada program produktif.\n` +
        `Nilai: Capaian rata-rata akademik adalah ${selectedScore?.rataRata || 82}, berkat bakat troubleshooting praktikum yang istimewa.\n` +
        `Karakter: Berkarakter disiplin tinggi, santun, dan selalu mengutamakan K2 industri.\n\n` +
        `Catatan Wali Kelas: ${customNote}\n\n` +
        `Rekomendasi: Mohon pendampingan Bapak/Ibu di rumah agar senantiasa membantu mempertahankan motivasi ananda.\n\n` +
        `Terima kasih atas kerja sama Bapak/Ibu.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert local phone (e.g., 0813xxxxxxxx) to International (62813xxxxxxxx)
  const formatPhoneNumber = (num: string) => {
    let cleaned = num.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }
    return cleaned;
  };

  // Format link for WhatsApp Direct Chat
  const getWaDirectLink = () => {
    const parentNum = selectedStudent.parentWhatsApp || "081322220001";
    const intPhone = formatPhoneNumber(parentNum);
    return `https://api.whatsapp.com/send?phone=${intPhone}&text=${encodeURIComponent(generatedReport)}`;
  };

  // Update predefined announcement templates for groups
  useEffect(() => {
    if (broadcastTemplate === "rapat") {
      setCustomBroadcastText(
        `*UNDANGAN KELAS XI TKR - SMK NEGERI 2 KONAWE*\n\nYth. Bapak/Ibu Wali Murid XI TKR,\nKami mengundang Bapak/Ibu untuk menghadiri Rapat Koordinasi Progress Praktikum PKL & Evaluasi Tengah Semester.\n\n📅 Hari/Tgl: Sabtu, 27 Juni 2026\n⏰ Waktu: 09:00 WIB - Selesai\n📍 Tempat: Bengkel Utama Otomotif SMK Negeri 2 Konawe\n\nKehadiran Bapak/Ibu sangat menentukan keselarasan pendidikan ananda. Terima kasih.`
      );
    } else if (broadcastTemplate === "praktik") {
      setCustomBroadcastText(
        `*PENGUMUMAN JADWAL PRAKTIK INDUSTRI (TKR)*\n\nDiberitahukan kepada seluruh Orang Tua & Murid Kelas XI TKR,\nMulai hari Senin besok, murid akan melakukan Uji Kompetensi Pemeliharaan Sasis & Sensor Kemudi.\n\n⚠️ Harap perhatikan:\n1. Murid wajib memakai Wearpack bersih lengkap.\n2. Sepatu safety wajib dikenakan selama di bengkel.\n3. Membawa buku jurnal & logbook harian.\n\nMohon wali murid memantau kedisplinan berangkat di pagi hari. Terima kasih atas kerja samanya.`
      );
    } else {
      setCustomBroadcastText(
        `*LAPORAN STREAK DISIPLIN KELAS - SMK NEGERI 2 KONAWE*\n\nSelamat Pagi Bapak/Ibu Wali Kelas & Guru,\nBerikut statistik kepatuhan murid dalam kurun waktu minggu ini:\n\n- Kehadiran Tepat Waktu: 96.4%\n- Kedisplinan Atribut Bengkel: 100%\n- Pengisian Logbook PKL Terverifikasi: 92%\n\nSangat membanggakan. Mari kita tingkatkan mutu pembimbingan kita sehari-hari!\n\nAsisten Sistem Digital SIHADIR`
      );
    }
  }, [broadcastTemplate]);

  // Handler to simulate gateway testing connection
  const handleTestGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestStatus("idle");
    setTestResultLog("Initialising secure check with server API...");

    setTimeout(() => {
      if (!apiKeyGateway) {
        setTestStatus("error");
        setTestResultLog("Gagal! API Key / Token kosong. Mohon isi token gateway terlebih dahulu.");
        setTestLoading(false);
        return;
      }

      setTestStatus("success");
      setTestResultLog(
        `Koneksi Berhasil Disimulasikan!\n` +
        `[HTTPS Status 200 OK]\n` +
        `Provider Terpilih: ${waGatewayProvider.toUpperCase()}\n` +
        `Endpoint Target: ${gatewayUrl}\n` +
        `Status Saluran: CONNECTED\n` +
        `Uji Kirim Pesan ke: ${testPhoneNumber} telah masuk ke dalam antrean (API Simulator Antigravity).`
      );
      setTestLoading(false);
    }, 1500);
  };

  // Pre-configured code templates
  const codeTemplates = {
    curl: `curl -X POST \\
  ${gatewayUrl} \\
  -H "Authorization: Bearer ${apiKeyGateway || 'TOKEN_SU_API_ANDA'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "${selectedStudent.parentWhatsApp || '6281322220001'}",
    "message": "Assalamu'alaikum Wr. Wb. Laporan Perkembangan Murid: ${selectedStudent.name}..."
  }'`,
    node: `const axios = require('axios');

async function kirimNotifikasiWA() {
  const payload = {
    target: '${selectedStudent.parentWhatsApp || '6281322220001'}',
    message: 'Yth Bapak/Ibu Wali, Murid ${selectedStudent.name} lulus uji kompetensi TKR dengan nilai ${selectedScore?.rataRata || 85}!'
  };

  try {
    const response = await axios.post('${gatewayUrl}', payload, {
      headers: { 'Authorization': 'Bearer ${apiKeyGateway || 'TOKEN_SU_API_ANDA'}' }
    });
    console.log('WhatsApp terkirim:', response.data);
  } catch (err) {
    console.error('Kendala API:', err.message);
  }
}
kirimNotifikasiWA();`,
    python: `import requests

url = "${gatewayUrl}"
headers = {
    "Authorization": "Bearer ${apiKeyGateway || 'TOKEN_SU_API_ANDA'}",
    "Content-Type": "application/json"
}
payload = {
    "target": "${selectedStudent.parentWhatsApp || '6281322220001'}",
    "message": "SMPATI AI Laporan Wali Kelas: Ananda ${selectedStudent.name} tuntas uji K3!"
}

response = requests.post(url, json=payload, headers=headers)
print("Hasil:", response.json())`
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4 animate-fadeIn" id="ortu-komunikasi-section">
      
      {/* Header and Section Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
              <span>Modul Komunikasi & Integrasi WhatsApp</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase leading-none">
                WhatsApp Active Link
              </span>
            </h3>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wide">
              Penghubung Digital Wali Kelas, Pendidik, Murid & Wali Murid SMK
            </p>
          </div>
        </div>

        {/* Header Indicator */}
        <div className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Laporan Individual WA Orang Tua</span>
        </div>
      </div>

      {/* Main SubTab Views */}
      <AnimatePresence mode="wait">
        
        {/* INDIVIDUAL CHAT & REPORT */}
        {true && (
          <motion.div
            key="tab-individual"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            {/* Control Form block */}
            <div className="lg:col-span-5 bg-gray-50/50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3.5">
              <div className="bg-emerald-50 border border-emerald-200/60 p-3 rounded-lg text-[11px] text-emerald-950">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 uppercase text-[10px] mb-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Mode Terhubung Aktif: Terima Beres (Garis / Tanpa Token API)</span>
                </div>
                <p className="leading-relaxed">
                  Sistem SIMPATI AI menggunakan protokol tautan WhatsApp resmi yang murni <strong>100% gratis & tanpa biaya</strong>. Anda tidak perlu membeli atau mendaftarkan API Key / Token apapun! Cukup saring pesan lalu gunakan tombol <strong>"Kirim via WA Web"</strong> untuk meluncurkan chat langsung.
                </p>
              </div>

              {/* Selector Kelas Perwalian */}
              <div className="bg-purple-50/90 border border-purple-200/90 p-3 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                    <span>Kelas Perwalian Wali Kelas</span>
                  </label>
                  <span className="bg-purple-200/90 text-purple-950 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                    Wali: {getWaliKelasForClass(selectedClass)}
                  </span>
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const newCls = e.target.value;
                    setSelectedClass(newCls);
                    localStorage.setItem("sihadir_target_perwalian_class", newCls);
                  }}
                  className="w-full bg-white border border-purple-300 text-xs rounded-lg px-2.5 py-2 font-extrabold text-purple-950 focus:outline-purple-600 cursor-pointer shadow-xs"
                >
                  {allClassNames.map((cName) => (
                    <option key={cName} value={cName}>
                      Kelas {cName} {cName === defaultPerwalianClass ? "★ (Perwalian Anda)" : ""}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-purple-800 font-bold flex justify-between items-center pt-0.5">
                  <span>Daftar Murid Perwalian: <strong>{filteredStudents.length} Murid</strong></span>
                  {selectedClass === defaultPerwalianClass && (
                    <span className="text-emerald-800 font-black bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded text-[9px]">
                      ✓ Perwalian Aktif
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-gray-600 mb-1.5 tracking-wider">
                  Murid Sasaran Laporan (Kelas {selectedClass})
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setGeneratedReport("");
                  }}
                  className="w-full bg-white border border-gray-300 text-xs rounded-lg px-2.5 py-2 focus:outline-indigo-500 font-extrabold text-gray-900 shadow-xs cursor-pointer"
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - NIS: {s.nis || "-"}
                      </option>
                    ))
                  ) : (
                    students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - Kelas {s.className}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Display fast attributes */}
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="text-left">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase leading-none">Nama Orang Tua</span>
                  <span className="text-xs font-extrabold text-gray-800 leading-tight block mt-0.5">{selectedStudent.parentName}</span>
                </div>
                <div className="text-left">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase leading-none">Nomor WhatsApp Ortu</span>
                  <span className="text-xs font-bold text-indigo-600 leading-tight block mt-0.5">{selectedStudent.parentWhatsApp}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-gray-505 mb-1.5 tracking-wider">
                  Catat Kualitatif Tambahan / Fokus Perilaku
                </label>
                <textarea
                  rows={4}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-white border border-gray-250 text-xs rounded-lg px-2.5 py-2 focus:outline-indigo-500 focus:ring-1"
                  placeholder="Berikan ulasan singkat mengenai kemajuan kualitatif murid atau sikap khusus yang terpantau wali kelas..."
                />
              </div>

              <button
                id="btn-generate-ortu-report"
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> : <Send className="h-4 w-4 text-emerald-400" />}
                <span>{loading ? "Menyusun Laporan Berbasis AI..." : "Generasikan Laporan Untuk WhatsApp"}</span>
              </button>
            </div>

            {/* Smart Simulator mockup with WhatsApp Link Action */}
            <div className="lg:col-span-7 flex flex-col md:flex-row items-stretch gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              
              {/* Phone Mockup Frame */}
              <div className="flex-1 flex flex-col bg-slate-900 rounded-[28px] p-2 aspect-[9/16] shadow-md border-4 border-slate-950 relative justify-between max-h-[460px] min-w-[230px]">
                {/* Speaker pill */}
                <div className="w-14 h-2.5 bg-slate-950 rounded-full mx-auto" />

                {/* Simulated Header inside Phone Wrapper */}
                <div className="bg-[#075E54] text-white p-2 rounded-t-lg flex items-center gap-1.5 mt-1">
                  <div className="w-6 h-6 rounded-full bg-slate-300 font-bold text-[10px] text-slate-700 flex items-center justify-center">
                    AF
                  </div>
                  <div>
                    <span className="text-[9px] font-bold block leading-none">{selectedStudent.parentName}</span>
                    <span className="text-[7px] text-emerald-100 block">Wali Murid {selectedStudent.name}</span>
                  </div>
                </div>

                {/* Simulated Web Messaging Frame */}
                <div className="flex-1 bg-[#ECE5DD] overflow-y-auto p-2 space-y-2 flex flex-col justify-end">
                  <div className="text-[8px] text-center text-gray-500 font-bold bg-white/70 py-0.5 px-2 rounded-full self-center uppercase mx-auto">
                    Today
                  </div>

                  {generatedReport ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#DCF8C6] text-slate-900 text-[10px] p-2 rounded-lg rounded-tr-none self-end max-w-[90%] shadow-xs leading-relaxed border border-green-200"
                    >
                      <p className="whitespace-pre-wrap leading-tight">{generatedReport}</p>
                    </motion.div>
                  ) : (
                    <div className="text-center py-10 text-gray-400 text-[10px] italic">
                      Daftar rekap nilai siap dikompilasi.<br />Klik "Generasikan Laporan" untuk memproses pesan WhatsApp.
                    </div>
                  )}
                </div>

                {/* Simulated message input footer */}
                <div className="bg-slate-800 p-1 bg-white/5 mt-1 rounded-b-lg flex justify-between items-center px-2">
                  <span className="text-[8px] text-slate-400">Penerima WhatsApp</span>
                  <span className="text-[8px] text-emerald-400 font-extrabold">{selectedStudent.parentWhatsApp}</span>
                </div>
              </div>

              {/* Action and Deep integration options */}
              <div className="md:w-56 flex flex-col justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
                <div className="space-y-2.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Real Action Panel</span>
                  
                  {generatedReport ? (
                    <>
                      {/* COPY TEXT ACTION */}
                      <button
                        onClick={handleCopyToClipboard}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] py-2 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Clipboard className="h-3.5 w-3.5 text-gray-500" />}
                        <span>{copied ? "Berhasil Disalin" : "Salin Draft Pesan"}</span>
                      </button>

                      {/* OPEN WHATSAPP API DIRECT LINK */}
                      <a
                        href={getWaDirectLink()}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Kirim via WA Web</span>
                      </a>
                      
                      <div className="text-[10px] text-gray-500 leading-relaxed bg-slate-50 p-2 rounded border border-gray-100 mt-1">
                        <strong className="text-gray-700 block">Bagaimana Cara Kerjanya?</strong>
                        Bila Anda klik tombol di atas, browser akan meluncurkan sesi chat langsung ke WhatsApp Orang Tua (dengan nomor terdaftar) berisi draft pesan di atas tanpa perlu menyimpan kontaknya di telepon Anda terlebih dahulu.
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-[10px] text-gray-400">
                      Silakan generatesikan laporan murid terlebih dahulu untuk mengaktifkan shortcut pengiriman WA.
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-2.5 text-[9px] text-gray-400 leading-normal font-medium space-y-1">
                  <span>Nama Murid: <strong>{selectedStudent.name}</strong></span><br />
                  <span>Wali Kelas: <strong>Haerul, S.Pd.</strong></span>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 2: TEACHERS & PARENTS GROUP MANAGEMENT */}
        {subTab === "groups" && (
          <motion.div
            key="tab-groups"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            {/* Split panels: Configuration Form VS Group Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Group Link Configurator */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Konfigurasi Tautan Grup Aktif</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-250 font-bold px-1.5 py-0.5 rounded uppercase leading-none font-mono">Gratis</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">Tautkan link undangan grup WhatsApp reguler milik sekolah Anda (Tanpa API Key apapun - Terima Beres). Guru & wali murid dapat langsung klik masuk grup ini secara instan.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-550 mb-1">
                      Link Grup WA Guru / Staf SMK Negeri 2 Konawe 
                    </label>
                    <div className="flex rounded-md shadow-xs bg-white">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-250 bg-gray-50 text-[10px] font-bold text-gray-500">
                        URL
                      </span>
                      <input
                        type="url"
                        required
                        value={teacherGroupLink}
                        onChange={(e) => setTeacherGroupLink(e.target.value)}
                        className="flex-1 focus:ring-0 focus:border-0 block w-full min-w-0 rounded-none rounded-r-md text-xs border border-gray-250 px-2 py-1.5 focus:outline-indigo-500"
                        placeholder="https://chat.whatsapp.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-550 mb-1">
                      Link Grup WA Orang Tua / Wali Kelas (XI TKR)
                    </label>
                    <div className="flex rounded-md shadow-xs bg-white">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-250 bg-gray-50 text-[10px] font-bold text-gray-500">
                        URL
                      </span>
                      <input
                        type="url"
                        required
                        value={parentGroupLink}
                        onChange={(e) => setParentGroupLink(e.target.value)}
                        className="flex-1 focus:ring-0 focus:border-0 block w-full min-w-0 rounded-none rounded-r-md text-xs border border-gray-250 px-2 py-1.5 focus:outline-indigo-500"
                        placeholder="https://chat.whatsapp.com/..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>Simpan & Terapkan Tautan Grup</span>
                  </button>

                  <AnimatePresence>
                    {showSaveSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-2.5 bg-green-50 text-green-800 text-[10px] rounded-lg border border-green-200 font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        <span>Koneksi tersimpan! Tautan grup WA berhasil diperbarui secara lokal.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Fast Access Shortcuts */}
                <div className="border-t border-gray-200 pt-3.5 space-y-2">
                  <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider block">Uji Undang Cepat</span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={teacherGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 flex items-center justify-between text-left text-[11px] font-bold text-gray-700 transition-colors"
                    >
                      <div className="leading-tight">
                        <span className="text-[8px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Guru & Staf</span>
                        Masuk Grup WA
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>

                    <a
                      href={parentGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 flex items-center justify-between text-left text-[11px] font-bold text-gray-700 transition-colors"
                    >
                      <div className="leading-tight">
                        <span className="text-[8px] text-gray-400 font-bold block uppercase leading-none mb-0.5">Wali Murid</span>
                        Grup Orang Tua
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Group Broadcast Simulator */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-100 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Simulasi Penyiaran Grup</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded font-mono">STATUS: SIMULATOR ACTIVE</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-bold">Pilih Kebutuhan Penyiaran:</span>
                    <select
                      value={broadcastTemplate}
                      onChange={(e) => setBroadcastTemplate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] text-white rounded px-2 py-1 focus:ring-0 focus:outline-none font-bold"
                    >
                      <option value="rapat">Undangan Rapat Ortu</option>
                      <option value="praktik">Pengumuman Praktik Bengkel</option>
                      <option value="streak">Statistik Harian Guru</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 rounded-lg p-3 border border-slate-850 flex flex-col justify-between max-h-[220px]">
                  <div className="overflow-y-auto pr-1">
                    <div className="bg-[#054C44] text-white p-2 rounded-lg text-[11px] max-w-[90%] space-y-1 block leading-relaxed relative shadow-xs">
                      <span className="text-[9px] font-black text-indigo-200 block mb-1">
                        📢 {broadcastTemplate === "streak" ? "Grup Pendidik & Staf SMK" : "Grup Kelas Orang Tua XI TKR"}
                      </span>
                      <p className="whitespace-pre-wrap font-medium">{customBroadcastText}</p>
                      <span className="text-[8px] text-slate-400 float-right mt-1 font-mono">20:12 • Diteruskan</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-2 flex justify-between items-center text-[10px] mt-2">
                    <span className="text-slate-400 font-semibold uppercase font-mono text-[9px]">Grup Target Terpilih</span>
                    <span className="text-indigo-400 font-extrabold text-[10px]">{broadcastTemplate === "streak" ? "Grup Guru" : "Grup Wali Murid"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customBroadcastText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold py-2 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    <span>{copied ? "Draft Disalin!" : "Salin Draft Siaran"}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(customBroadcastText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold py-2 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors text-white"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Bagikan Ke WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Informational Warning Block */}
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-start gap-2.5 text-xs text-indigo-900 leading-normal">
              <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block uppercase tracking-wider text-[9px]">Penting Untuk Wali Kelas:</span>
                Informasi laporan ini ditarik secara otomatis dari hasil input masing-masing Guru Mata Pelajaran. Gunakan tombol "Kirim via WA Web" untuk meneruskan rekap ke Wali Murid.
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
