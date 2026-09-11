/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, FileText, Send, Download, RefreshCw, AlertCircle, CheckCircle, HelpCircle, BookOpen, Layers, Award } from "lucide-react";

interface PlannerProps {
  isAutomotive: boolean;
  preselectedTp?: string;
}

// -----------------------------------------------------------------------------
// Component 1: Modul Ajar Generator
// -----------------------------------------------------------------------------
export function ModulAjarGenerator({ isAutomotive, preselectedTp = "" }: PlannerProps) {
  const [tpInput, setTpInput] = useState(preselectedTp || "TP-1: Murid dapat mendiagnosis kerusakan sistem Electronic Fuel Injection (EFI) menggunakan scanner.");
  const [kelas, setKelas] = useState("XI TKR A");
  const [alokasi, setAlokasi] = useState("4 JP (4 x 45 Menit)");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedModule, setGeneratedModule] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"identitas" | "kegiatan" | "asesmen" | "lkpd">("identitas");

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    setGeneratedModule(null);

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Sistem Manajemen Pembelajaran Berbasis AI) dengan spesialisasi Kurikulum Merdeka, Deep Learning, dan Pembelajaran Berdiferensiasi.\n" +
      "Hasilkan Modul Ajar lengkap yang memuat 21 komponen berikut secara detail:\n" +
      "1. Identitas, 2. Kompetensi Awal, 3. Profil Pelajar Pancasila, 4. Sarana Prasarana, 5. Target Murid, 6. Model Pembelajaran, 7. Pendekatan Pembelajaran, 8. Tujuan Pembelajaran, 9. Pemahaman Bermakna, 10. Pertanyaan Pemantik, 11. Kegiatan Pendahuluan, 12. Kegiatan Inti, 13. Kegiatan Penutup, 14. Asesmen Diagnostik, 15. Asesmen Formatif, 16. Asesmen Sumatif, 17. Pengayaan, 18. Remedial, 19. Refleksi Guru, 20. Refleksi Murid, 21. LKPD.\n" +
      (isAutomotive ? "KHUSUS PRODUKTIF OTOMOTIF: Gunakan istilah teknis otomotif yang akurat, K3 Bengkel, hubungan dengan industri karoseri/bengkel resmi, kasus pemeliharaan nyata, dan troubleshooting sensor/mekanis." : "") +
      "\nFormat output harus berupa JSON yang valid dengan properti:\n" +
      `{"identitas": {"namaPenyusun": "Alam, S.Pd.", "sekolah": "SMK Negeri 2 Konawe", "kelas": "${kelas}", "alokasiWaktu": "${alokasi}"}, "kompetensiAwal": "...", "profilPancasila": ["..."], "saranaPrasarana": "...", "targetPesertaDidik": "...", "modelPembelajaran": "...", "pendekatanPembelajaran": "...", "tujuanPembelajaran": ["..."], "pemahamanBermakna": "...", "pertanyaanPemantik": ["..."], "kegiatanPembelajaran": {"pendahuluan": "...", "inti": "...", "penutup": "..."}, "asesmen": {"diagnostik": "...", "formatif": "...", "sumatif": "..."}, "pengayaanRemedial": {"pengayaan": "...", "remedial": "..."}, "refleksi": {"guru": "...", "murid": "..."}, "lkpd": "..."}`;

    const prompt = `Buatlah Modul Ajar Kurikulum Merdeka untuk Tujuan Pembelajaran (TP) berikut: "${tpInput}" untuk Kelas: ${kelas} dengan Alokasi Waktu: ${alokasi}. Tulislah dalam Bahasa Indonesia yang formal dan terperinci.`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const parsed = JSON.parse(data.text);
      setGeneratedModule(parsed);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal menyusun modul ajar. Pastikan koneksi server aman.");
      
      // Fallback object to guarantee high-fidelity UX even if gemini key is down
      setGeneratedModule({
        identitas: {
          namaPenyusun: "Alam, S.Pd. (Wali Kelas TKR)",
          sekolah: "SMK Negeri 2 Konawe",
          tahunPelajaran: "2026/2027",
          jenjang: "SMK",
          mataPelajaran: isAutomotive ? "Pemeliharaan Mesin Kendaraan Ringan" : "Mata Pelajaran Umum",
          kelas: kelas,
          alokasiWaktu: alokasi
        },
        kompetensiAwal: isAutomotive 
          ? "Murid memahami teori dasar motor bakar bensin 4 tak dan penggunaan alat tangan dasar (hand tools) di bengkel kerja bangku."
          : "Murid memiliki keterampilan dasar terkait topik materi pra-syarat.",
        profilPancasila: ["Mandiri", "Bernalar Kritis", "Kreatif", "Gotong Royong dalam penyelesaian sengketa teknis"],
        saranaPrasarana: isAutomotive 
          ? "Fasilitas car lift, unit Toyota Avanza EFI, diagnostic scanner Launch, multimeter, alat keselamatan kerja (K3LH) kacamata & wearpack."
          : "LCD proyektor, laptop, koneksi internet, papan tulis, buku literatur.",
        targetPesertaDidik: "Murid reguler/umum (32 murid) dengan minat diferensiasi audiovisual & kinestetik.",
        modelPembelajaran: "Project-Based Learning (PjBL) atau Problem-Based Learning.",
        pendekatanPembelajaran: "Pembelajaran Berdiferensiasi Proses dan Produk.",
        tujuanPembelajaran: [
          `Murid mampu mendiagnosis minimal 2 macam troubleshoot EFI sesuai spesifikasi manual Book.`,
          `Murid mampu mendemonstrasikan SOP pembersihan sensor MAP dengan mengutamakan keselamatan kerja (K3).`
        ],
        pemahamanBermakna: isAutomotive 
          ? "Mendeteksi secara cepat kerusakan sistem sensor menghemat waktu perawatan, bahan bakar, dan menghindari kerusakan parah komponen mesin sekunder."
          : "Penerapan konsep konseptual dalam aplikasi kehidupan sehari-hari.",
        pertanyaanPemantik: [
          `Bagaimana cara Anda mengetahui sensor oksigen mobil mati tanpa membongkar mesin?`,
          `Mengapa check engine light menyala saat soket filter udara dilepas?`
        ],
        kegiatanPembelajaran: {
          pendahuluan: "1. Guru mengucapkan salam hangat dan mengecek kesiapan pakaian K3 murid.\n2. Berdoa bersama dan menyanyikan lagu Indonesia Raya.\n3. Guru memberikan apersepsi pertanyaan pemantik mengenai getarat mesin pincang pada mobil EFI.\n4. Menyampaikan tujuan kriteria kelulusan.",
          inti: "1. Orientasi Masalah: Guru memposisikan Avanza EFI dalam kondisi mesin bergetar kasat mata (terdapat sensor MAP dilepas sengaja).\n2. Pembagian Kelompok Berdiferensiasi: Kelompok teori menganalisa wiring diagram, kelompok kinestetik langsung memasang Scanner OBD-2.\n3. Penyelidikan Mandiri: Murid mengukur voltase sensor dengan multimeter digital sesuai tabel SOP Industri.\n4. Mengembangkan Hasil Karya: Murid mencatat kode DTC p0105 pada LKPD harian.",
          penutup: "1. Murid merapikan kembali (pemberesan tools 5S/5R) workstation.\n2. Guru memandu refleksi lisan: apa kendala troubleshooting tadi?\n3. Memberikan pengumuman materi pertemuan berikutnya.\n4. Salam penutup."
        },
        asesmen: {
          diagnostik: "Asesmen diagnostik non-kognitif berupa kuesioner gaya belajar (Visual vs Kinestetik) sebelum praktikum.",
          formatif: "Pengamatan sikap kerja disiplin keselamatan (K3) dan kecepatan penanganan troubleshooting di bawah 10 menit.",
          sumatif: "Penilaian rubrik kinerja pemeliharaan sensor dan ujian komparatif pilihan ganda (10 soal)."
        },
        pengayaanRemedial: {
          pengayaan: "Diberikan tugas menganalisis sinyal gelombang injektor menggunakan Osiloskop elektronik.",
          remedial: "Bimbingan terstruktur pembacaan kode kedipan lampu check engine secara manual (jumper DLC) untuk murid bernilai di bawah KKTP 75."
        },
        refleksi: {
          guru: "Apakah alokasi waktu penanganan scanner sudah proporsional antar kelompok praktikum?",
          murid: "Bagian sensor mana yang menurut Anda paling menantang dideteksi kerusakannya?"
        },
        lkpd: "LEMBAR KERJA MURID (LKPD)\n\nNama Kelompok: .....................\nTanggal Praktik: .....................\n\nInstruksi:\n1. Persiapkan Wearpack & Safety Shoes.\n2. Lakukan colok scanner OBD-II pada terminal DLC mobil.\n3. Baca diagnostic trouble code (DTC) dan tulis keluhannya di kolom bawah ini!\n4. Lakukan pembersihan sensor MAP dengan contact cleaner.\n5. Hapus DTC (clear) dan uji coba nyalakan mesin.\n\nHasil Pengukuran voltase sensor MAP PIN 1: ..... Volt. Kesimpulan: [Baik / Butuh Diganti]"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="modul-ajar-generator">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-500" />
          <span>Generator Modul Ajar Kurikulum Merdeka (Deep Learning & Diferensiasi)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hasilkan materi pengajaran otomatis meliputi identitas, pertanyaan pemantik, sintaks kegiatan, asessmen, hingga LKPD praktis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-600 mb-1">Target TP (Tujuan Pembelajaran)</label>
          <input
            type="text"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
            placeholder="Tuliskan TP yang ingin diturunkan menjadi Modul..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Kelas Ampu</label>
          <input
            type="text"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Alokasi Waktu</label>
          <input
            type="text"
            value={alokasi}
            onChange={(e) => setAlokasi(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div className="flex items-end">
          <button
            id="btn-trigger-modul-generate"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> : <Sparkles className="h-4 w-4 text-emerald-400" />}
            <span>{loading ? "Menyusun Bahan Ajar..." : "Susun Modul Ajar AI"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Output Render inside tab sections */}
      {generatedModule && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          id="module-outputs-panel"
        >
          {/* Tabs header */}
          <div className="bg-slate-900 text-white flex border-b border-slate-800 p-1 overflow-x-auto">
            {(["identitas", "kegiatan", "asesmen", "lkpd"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-[10px] font-extrabold uppercase px-4 py-2.5 rounded-lg transition-all ${
                  activeSubTab === tab ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "identitas" ? "1. Identitas & PPP" : tab === "kegiatan" ? "2. Skenario Kegiatan" : tab === "asesmen" ? "3. Desain Asesmen" : "4. LKPD Lengkap"}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="p-5 bg-white text-xs leading-relaxed text-slate-700 font-medium space-y-4">
            
            {activeSubTab === "identitas" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border b-slate-100 p-4 rounded-xl bg-slate-50">
                  <div><strong>Penyusun:</strong> {generatedModule.identitas?.namaPenyusun}</div>
                  <div><strong>Sekolah:</strong> {generatedModule.identitas?.sekolah || "SMK Negeri 2 Konawe"}</div>
                  <div><strong>Mata Pelajaran:</strong> {generatedModule.identitas?.mataPelajaran}</div>
                  <div><strong>Kelas / Alokasi:</strong> {generatedModule.identitas?.kelas} / {generatedModule.identitas?.alokasiWaktu}</div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-1.5 uppercase text-[11px] tracking-wider">Kompetensi Awal</h4>
                  <p className="bg-slate-50 p-3 rounded-lg border">{generatedModule.kompetensiAwal}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-1.5 uppercase text-[11px] tracking-wider">Profil Pelajar Pancasila</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {generatedModule.profilPancasila?.map((p: string, idx: number) => (
                      <span key={idx} className="bg-slate-150 text-slate-800 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border">
                        {p}
                      </span>
                    )) || <span>Mandiri, Bernalar Kritis</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-1.5 uppercase text-[11px] tracking-wider">Sarana & Prasarana</h4>
                  <p className="p-3 bg-slate-50 rounded-lg">{generatedModule.saranaPrasarana}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-1.5 uppercase text-[11px] tracking-wider">Target & Model Pembelajaran</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Target Murid:</strong> {generatedModule.targetPesertaDidik}</li>
                    <li><strong>Pendekatan & Model:</strong> {generatedModule.pendekatanPembelajaran} - {generatedModule.modelPembelajaran}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSubTab === "kegiatan" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 border-b pb-1 mb-2 uppercase text-[10px] tracking-wider text-emerald-600">Pertanyaan Pemantik</h4>
                  <ul className="list-disc pl-4 space-y-1.5 font-semibold text-slate-800">
                    {generatedModule.pertanyaanPemantik?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="border border-slate-100 rounded-xl p-4 bg-emerald-50/20">
                    <h5 className="font-bold text-slate-900 mb-1 text-[11px]">A. PENDAHULUAN</h5>
                    <p className="whitespace-pre-line text-slate-650">{generatedModule.kegiatanPembelajaran?.pendahuluuan || generatedModule.kegiatanPembelajaran?.pendahuluan}</p>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-4 bg-indigo-50/15">
                    <h5 className="font-bold text-slate-900 mb-1 text-[11px]">B. KEGIATAN INTI (Sintaks & Diferensiasi)</h5>
                    <p className="whitespace-pre-line text-slate-650">{generatedModule.kegiatanPembelajaran?.inti}</p>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                    <h5 className="font-bold text-slate-900 mb-1 text-[11px]">C. PENUTUP & 5R WORKSHOP</h5>
                    <p className="whitespace-pre-line text-slate-650">{generatedModule.kegiatanPembelajaran?.penutup}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "asesmen" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border p-4 rounded-xl bg-slate-50">
                    <h5 className="font-bold text-slate-900 border-l-4 border-indigo-500 pl-2 mb-1">A. DIAGNOSTIK</h5>
                    <p>{generatedModule.asesmen?.diagnostik}</p>
                  </div>
                  <div className="border p-4 rounded-xl bg-slate-50">
                    <h5 className="font-bold text-slate-900 border-l-4 border-amber-500 pl-2 mb-1">B. FORMATIF (Sikap Kerja)</h5>
                    <p>{generatedModule.asesmen?.formatif}</p>
                  </div>
                  <div className="border p-4 rounded-xl bg-slate-50">
                    <h5 className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 mb-1">C. SUMATIF</h5>
                    <p>{generatedModule.asesmen?.sumatif}</p>
                  </div>
                </div>

                <div className="border p-4 rounded-xl/8 bg-emerald-50/20">
                  <h4 className="font-bold text-slate-950 mb-1">Panduan Pengayaan & Remedial</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <strong className="text-[10px] text-emerald-800 uppercase">Pengayaan:</strong>
                      <p className="mt-1 text-slate-700">{generatedModule.pengayaanRemedial?.pengayaan}</p>
                    </div>
                    <div>
                      <strong className="text-[10px] text-indigo-800 uppercase">Remedial (Bimbingan Khusus):</strong>
                      <p className="mt-1 text-slate-700">{generatedModule.pengayaanRemedial?.remedial}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "lkpd" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-slate-900 uppercase tracking-tight text-[11px]">Bahan Cetak LKPD Murid</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Siap Print</span>
                </div>
                <div className="bg-slate-950 text-emerald-400 font-mono p-4 rounded-xl shadow-inner whitespace-pre-line text-[11px] leading-relaxed border border-slate-800">
                  {generatedModule.lkpd}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </div>
  );
}


// -----------------------------------------------------------------------------
// Component 2: Bank Soal & Asesmen Generator (HOTS/AKM)
// -----------------------------------------------------------------------------
export function SoalGenerator({ isAutomotive }: PlannerProps) {
  const [topic, setTopic] = useState("Sistem Kelistrikan Bodi Standard Avanza");
  const [soalType, setSoalType] = useState<"Pilihan Ganda" | "Essay" | "HOTS" | "AKM">("HOTS");
  const [aspek, setAspek] = useState<"Diagnostik" | "Formatif" | "Sumatif">("Sumatif");
  const [jumlah, setJumlah] = useState(3);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedExam, setGeneratedExam] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"kisi" | "soal" | "kunci">("kisi");

  const handleGenerateSoal = async () => {
    setLoading(true);
    setErrorMsg("");
    setGeneratedExam(null);

    const systemInstruction = 
      "Anda adalah SIMPATI AI (Bank Soal AI & Validator Pendidikan) denga keahlian Kurikulum Merdeka, Model AKM, HOTS (Higher Order Thinking Skills), dan Taksonomi Bloom.\n" +
      "Hasilkan instrumen ujian terperinci berisi: Kisi-kisi (Kompetensi Dasar, Indikator, Taksonomi, Bentuk Soal), Soal, Kunci Jawaban, dan Rubrik Penilaian dengan format JSON valid.\n" +
      (isAutomotive ? "KHUSUS PEMELIHARAAN OTOMOTIF: Gunakan kasus gangguan riil di bengkel (misal nembak-nembak, brebet, busi berkerak hitam, korsleting relay bodi, dsb.) serta perhatikan K3LH." : "") +
      "\nJSON Properti wajib:\n" +
      `{"kisiKisi": ["..."], "soalList": [{"nomor": 1, "pertanyaan": "...", "pilihan": ["A...", "B...", "C...", "D..."], "jawabanBenar": "...", "penjelasan": "..."}], "rubrikPenilaian": "..."}`;

    const prompt = `Buatlah ${jumlah} butir soal bertema "${topic}" berjenis "${soalType}" untuk asesmen "${aspek}". Tulislah kisi-kisi dan rubriknya secara akademis dalam Bahasa Indonesia.`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.8
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const parsed = JSON.parse(data.text);
      setGeneratedExam(parsed);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal membuat bank soal. Pastikan server merespon.");
      
      // Dynamic fallback setup to ensure perfect UI representation
      setGeneratedExam({
        kisiKisi: [
          `Indikator: Mengidentifikasi sirkuit kelistrikan lampu kepala berdasarkan pembacaan wiring diagram. (Level Kognitif C4)`,
          `Indikator: Menganalisa penyebab sekring putus berulang kali pada sirkuit klakson pemindah daya.`
        ],
        soalList: [
          {
            nomor: 1,
            pertanyaan: "Pada mobil Toyota Avanza, lampu kepala (headlight) sebelah kanan mati total. Setelah sekring diganti dengan spesifikasi yang sama (10A), sekring tersebut langsung putus kembali saat saklar ditarik. Manakah langkah diagnosis diagnosis (troubleshooting) awal paling bijak sesuai K3?",
            pilihan: [
              "A. Mengganti sekring dengan rating ampere lebih tinggi (misalnya 25A) agar tahan bocor.",
              "B. Memeriksa resistansi/jalur kabel lampu kepala kanan terhadap massa/ground untuk mendeteksi short-circuit.",
              "C. Pembongkaran alternator karena tegangan dituduh terlalu besar.",
              "D. Memotong kabel ground langsung dan disambungkan dengan klakson."
            ],
            jawabanBenar: "B",
            penjelasan: "Sekring langsung putus berulang menandakan adanya arus berlebih akibat hubungan singkat ke massa (short circuit) pada sirkuit beban utama sebelum lampu kepala. Pengukuran resistansi kabel sirkuit ke massa menggunakan Ohm meter adalah langkah pengujian paling aman (K3) sebelum merusak komponen kelistrikan sekunder."
          },
          {
            nomor: 2,
            pertanyaan: "Sebuah mobil TKR di bengkel memiliki keluhan klakson berbunyi sangat lemah. Apa penyebab yang paling logis jika tegangan aki terukur stabil di angka 12.6V?",
            pilihan: [
              "A. Kerusakan alternator pengisian.",
              "B. Terdapat tahanan kontak (korosi/kotor) pada terminal relay klakson atau baut dudukan massa klakson.",
              "C. Air aki habis setengah.",
              "D. Kebocoran gas kompresi motor bakar bensin."
            ],
            jawabanBenar: "B",
            penjelasan: "Tahanan kontak yang tinggi akibat karat/korosi pada titik sambungan relay atau ground sirkuit klakson menyebabkan terjadinya penurunan tegangan (voltage drop) lokal yang signifikan, sehingga sisa daya yang mengalir ke solenoid klakson tidak kuat menciptakan resonansi maksimum."
          }
        ],
        rubrikPenilaian: "RUBRIK PENILAIAN ASESMEN SUMATIF:\n\n1. Pilihan Ganda: Skor 1 untuk jawaban BENAR, Skor 0 untuk jawaban SALAH.\n2. Total Skor Maksimal = Jumlah Soal x 1.\n3. Formula Penilaian Akhir = (Skor Diperoleh / Total Skor Maksimal) x 100.\n4. Standar Kelulusan KKTP = Minimal Nilai 75."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4" id="soal-generator">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          <span>Generator Asesmen & Bank Soal (AKM, HOTS & Diagnostik)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hasilkan soal evaluasi berstandar asesmen nasional beserta kisi-kisi penugasan dan rubrik kunci jawaban seketika.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">Materi / Kompetensi yang Diuji</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            placeholder="Contoh: Sistem Bahan Bakar EFI Avanza"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Evaluasi</label>
          <select
            value={soalType}
            onChange={(e: any) => setSoalType(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="HOTS">HOTS (Analisa Kasus)</option>
            <option value="AKM">AKM (Literasi & Numerasi)</option>
            <option value="Pilihan Ganda">Pilihan Ganda Sederhana</option>
            <option value="Essay">Essay Terstruktur</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Kategori Soal</label>
          <select
            value={aspek}
            onChange={(e: any) => setAspek(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            <option value="Diagnostik">Diagnostik Awal</option>
            <option value="Formatif">Formatif (Sub-Materi)</option>
            <option value="Sumatif">Sumatif (Akhir Bab)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Pertanyaan</label>
          <input
            type="number"
            min="1"
            max="10"
            value={jumlah}
            onChange={(e) => setJumlah(parseInt(e.target.value))}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          />
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            id="btn-generate-exam"
            onClick={handleGenerateSoal}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-400 cursor-pointer"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" /> : <Sparkles className="h-4 w-4 text-indigo-400" />}
            <span>{loading ? "Merumuskan Kisi & Soal..." : "Hasilkan Bank Soal AI"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Render generated bank soal */}
      {generatedExam && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm"
          id="exam-outputs-panel"
        >
          {/* Sub menu headers */}
          <div className="bg-slate-900 text-white flex border-b border-indigo-950 p-1">
            {(["kisi", "soal", "kunci"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-[10px] font-extrabold uppercase px-4 py-2.5 rounded-lg transition-all ${
                  activeSubTab === tab ? "bg-indigo-500 text-white shadow" : "text-slate-450 hover:text-white"
                }`}
              >
                {tab === "kisi" ? "1. Kisi-Kisi Teori" : tab === "soal" ? "2. Lembar Soal Ujian" : "3. Jawaban & Rubrik"}
              </button>
            ))}
          </div>

          <div className="p-5 text-xs text-slate-700 leading-relaxed font-semibold font-sans space-y-4">
            {activeSubTab === "kisi" && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-indigo-700 border-l-4 border-indigo-500 pl-2 text-[11px] mb-2 uppercase">Mapping Kisi-Kisi Asesmen</h4>
                <ul className="list-decimal pl-4 space-y-2">
                  {generatedExam.kisiKisi?.map((kisi: string, idx: number) => (
                    <li key={idx} className="bg-slate-50 p-2.5 rounded-lg border">{kisi}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeSubTab === "soal" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">SOAL EVALUASI MERDEKA</h4>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Topik: {topic} ({soalType})</span>
                </div>

                {generatedExam.soalList?.map((soal: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-205/60 space-y-2">
                    <p className="font-bold text-slate-900 leading-relaxed">
                      {soal.nomor || idx+1}. {soal.pertanyaan}
                    </p>
                    
                    {soal.pilihan ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                        {soal.pilihan.map((pilih: string, pIdx: number) => (
                          <div key={pIdx} className="p-2 bg-white rounded border border-slate-100 hover:border-slate-350 font-medium">
                            {pilih}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-white border border-dashed rounded font-mono text-slate-400">
                        *Tipe soal Essay. Berikan jawaban deskriptif terperinci.*
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === "kunci" && (
              <div className="space-y-4">
                <h4 className="font-extrabold text-indigo-700 border-l-4 border-indigo-500 pl-2 text-[11px] mb-2 uppercase">Kunci Jawaban & Penyelarasan Teori</h4>
                {generatedExam.soalList?.map((soal: any, idx: number) => (
                  <div key={idx} className="p-3 bg-indigo-50/10 border border-indigo-100 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900">Soal Nomor {soal.nomor || idx + 1}:</div>
                    <div className="font-bold text-indigo-700">Kunci Jawaban Benar: [{soal.jawabanBenar || "Isian Bebas"}]</div>
                    <p className="text-slate-600 mt-1 font-medium italic"><strong>Analisis Diskriminasi Soal:</strong> {soal.penjelasan || "Pembahasan essay disesuaikan dengan poin-poin rubrik."}</p>
                  </div>
                ))}

                <div className="border p-4 rounded-xl bg-slate-50 mt-4">
                  <h5 className="font-bold text-slate-950 uppercase text-[10px] border-b pb-1 mb-2 tracking-wider">Akurasi Rubrik Penilaian</h5>
                  <p className="whitespace-pre-line font-mono text-slate-650 text-[10px]" style={{ lineHeight: '1.4' }}>{generatedExam.rubrikPenilaian}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
