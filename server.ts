/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize environment variables
dotenv.config();

// Prepopulated documents to ensure no hallucination when querying official records
const SCHOOL_DOCUMENTS = [
  {
    id: "D01",
    type: "CP",
    code: "CP-TKR-01",
    title: "Capaian Pembelajaran (CP) TKR Fase F",
    content: "Pada akhir Fase F (kelas XI & XII SMK), peserta didik dibekali keterampilan melakukan perawatan berkala dan perbaikan pada mesin (Engine), sasis (Chassis), pemindah daya (Power Train), sistem kelistrikan otomotif, K3 Lingkungan Kerja, dan troubleshoot sistem EFI (Electronic Fuel Injection) secara mandiri dan profesional sesuai dengan rekomendasi pabrikan.",
    sourceDocument: "Kurikulum Merdeka SMK SIMPATI - Dokumen CP TKR Fase F 2024"
  },
  {
    id: "D02",
    type: "ATP",
    code: "ATP-TKR-01",
    title: "Alur Tujuan Pembelajaran (ATP) Perbaikan Engine",
    content: "Alur pembelajaran dimulai dengan: (1) Penerapan prinsip K3LH di bengkel industri. (2) Identifikasi komponen motor 4 tak dan cara kerja mesin bensin. (3) Melakukan perawatan sistem pelumasan dan pendinginan kendaraan. (4) Troubleshooting sistem bahan bakar konvensional. (5) Diagnosis kerusakan sistem Electronic Fuel Injection (EFI) menggunakan scanner diagnostik OBD-II. (6) Pembersihan/kalibrasi sensor mesin injeksi.",
    sourceDocument: "Alur Tujuan Pembelajaran SMK SIMPATI - ATP TKR Fase F 2024"
  },
  {
    id: "D03",
    type: "TP",
    code: "TP-TKR-01",
    title: "Tujuan Pembelajaran (TP) Sistem EFI",
    content: "TP-1: Peserta didik mampu menjelaskan prinsip dasar Electronic Fuel Injection (EFI) dengan teliti.\nTP-2: Peserta didik mampu mengukur tegangan dan resistansi sensor Air Flow Meter (MAF) dan Coolant Temperature Sensor (ECT) menggunakan multimeter.\nTP-3: Peserta didik mampu melakukan diagnosis kode kerusakan (DTC) menggunakan Diagnostic Scan Tool OBD-II.\nTP-4: Peserta didik dapat melakukan troubleshooting kelistrikan pompa bahan bakar.",
    sourceDocument: "Tujuan Pembelajaran SMK SIMPATI - TP TKR-EFI 2024"
  },
  {
    id: "D04",
    type: "SOP",
    code: "SOP-GUR-01",
    title: "SOP Presensi Kehadiran Guru Dengan GPS",
    content: "Guru wajib melakukan presensi masuk paling lambat pukul 06.45 WIB dan presensi pulang paling cepat pukul 15.30 WIB menggunakan aplikasi SIMPATI AI berbasis GPS. Guru dianggap Hadir jika posisi presensi berjarak maksimal 700 meter dari koordinat pusat sekolah SMK SIMPATI (Pusat Koordinat: Lat -7.2504, Lon 112.7508). Presensi yang diperoleh di luar radius 700m otomatis Ditolak oleh sistem kecuali menyertakan surat izin sakit/tugas luar resmi yang disetujui Kepala Sekolah.",
    sourceDocument: "SOP Kehadiran Guru SMK SIMPATI - No. SOP-GUR-01"
  },
  {
    id: "D05",
    type: "TATATERTIB",
    code: "SK-DIR-05",
    title: "Dokumen Tata Tertib dan Disiplin Murid",
    content: "Seluruh murid wajib hadir di kelas sebelum bel masuk berbunyi pukul 07.00 WIB. Murid dilarang membawa kendaraan berknalpot bising (brong). Murid laki-laki tidak boleh berambut panjang melebihi 3 cm di atas kerah serta wajib mengenakan sepatu warna hitam dominan. Pelanggaran aturan ini akan diproses oleh Guru BK dengan pemberian sanksi akumulatif poin perilaku.",
    sourceDocument: "Tata Tertib Murid SMK SIMPATI - SK-DIR-05"
  },
  {
    id: "D06",
    type: "PKL_DOC",
    code: "SOP-PKL-03",
    title: "SOP Pelaksanaan PKL (Praktek Kerja Lapangan)",
    content: "Siswa PKL wajib melakukan pengisian jurnal harian aktivitas kerja dan absen masuk-pulang disertai unggahan bukti foto di tempat industri lewat aplikasi SIMPATI AI. Pembimbing sekolah dan instansi wajib melakukan monitoring mingguan. Kelulusan kegiatan PKL mensyaratkan perolehan nilai minimal 75 dari instruktur industri di akhir semester dan seluruh logbook kegiatan terisi 100%.",
    sourceDocument: "SOP Pelaksanaan PKL SMK SIMPATI - No. SOP-PKL-03"
  }
];

// Lazy initialization of Gemini client to avoid crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required and missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 1. Search endpoint for official school documents
  app.post("/api/documents/search", (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.json({
          found: false,
          text: "Informasi tidak ditemukan pada dokumen yang tersedia."
        });
      }

      const q = query.toLowerCase();
      // Search matching documents
      const matches = SCHOOL_DOCUMENTS.filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q)
      );

      if (matches.length > 0) {
        // Return matching document details with CITATION
        const resultText = matches.map(doc => {
          return `**${doc.title} (${doc.code})**\n${doc.content}\n\n*Sumber: ${doc.sourceDocument}*`;
        }).join("\n\n---\n\n");

        return res.json({
          found: true,
          text: resultText,
          matches: matches
        });
      } else {
        // If not found, output strict prompt response text
        return res.json({
          found: false,
          text: "Informasi tidak ditemukan pada dokumen yang tersedia."
        });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // 2. Gemini content generation proxy
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, temperature, responseMimeType } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt parameter." });
      }

      const ai = getGeminiClient();

      // Configure parameters
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (temperature !== undefined) config.temperature = temperature;
      if (responseMimeType) config.responseMimeType = responseMimeType;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: config
      });

      return res.json({
        text: response.text
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({
        error: error.message || "An error occurred while calling the Gemini API. Please make sure the GEMINI_API_KEY is configured in Settings > Secrets."
      });
    }
  });

  // 2.5. PDF & Document Master Data Parser proxy via Gemini AI
  app.post("/api/parse-master-pdf", async (req, res) => {
    try {
      const { base64Data, mimeType, fileType, rawText } = req.body;

      if (!fileType) {
        return res.status(400).json({ status: false, reason: "Tipe data (guru/siswa/mapel) tidak ditentukan." });
      }

      const ai = getGeminiClient();

      let promptInstruction = "";
      if (fileType === "guru") {
        promptInstruction = `Anda adalah sistem AI pengolah data induk SMK Negeri 2 Konawe. 
Tugas Anda: Analisis dan ekstrak seluruh data guru/tenaga pendidik dari dokumen/teks berikut menjadi array JSON berisi objek-objek guru yang terstandarisasi.

Skema JSON yang WAJIB dipenuhi:
[
  {
    "name": "Nama Lengkap Guru beserta gelar lengkap (contoh: Drs. Muslimin. L, S.Pd. atau Haerul, S.Pd.)",
    "nip": "NIP (18 digit angka atau '-' jika honorer/tidak tertera)",
    "nuptk": "NUPTK (16 digit angka atau '-' jika tidak tertera)",
    "subject": "Mata Pelajaran Utama yang diampu",
    "classes": ["XI TKR A", "XI TKR B"],
    "role": "Jabatan/Peran (misal: Guru Mata Pelajaran / Wali Kelas XI TKR A / Waka Kurikulum)",
    "whatsApp": "Nomor WhatsApp aktif (misal 081234567890)",
    "email": "Email sch.id (misal nama@smkn2konawe.sch.id)"
  }
]
Ketentuan:
1. Bersihkan karakter acak/ruwet dari hasil cetak PDF.
2. Format nama agar konsisten (kapitalisasi awal kata, gelar di belakang nama).
3. Hanya kirimkan JSON array murni.`;
      } else if (fileType === "siswa") {
        promptInstruction = `Anda adalah sistem AI pengolah data induk SMK Negeri 2 Konawe. 
Tugas Anda: Analisis dan ekstrak seluruh data siswa/murid dari dokumen/teks berikut menjadi array JSON berisi objek-objek siswa yang terstandarisasi.

Skema JSON yang WAJIB dipenuhi:
[
  {
    "name": "Nama Lengkap Siswa",
    "nis": "NIS (Nomor Induk Siswa)",
    "nisn": "NISN (10 digit angka)",
    "className": "Kelas Digital (misal: XI TKR A, XI TKR B, X TSM A, XI DKV)",
    "major": "Konsentrasi Keahlian / Jurusan",
    "parentName": "Nama Orang Tua / Wali Siswa",
    "parentWhatsApp": "Nomor WhatsApp Orang Tua/Wali"
  }
]
Ketentuan:
1. Bersihkan karakter acak dari hasil scan PDF.
2. Hanya kirimkan JSON array murni.`;
      } else {
        promptInstruction = `Anda adalah sistem AI pengolah data induk SMK Negeri 2 Konawe. 
Tugas Anda: Analisis dan ekstrak seluruh data mata pelajaran dari dokumen/teks berikut menjadi array JSON terstandarisasi.

Skema JSON yang WAJIB dipenuhi:
[
  {
    "code": "Kode Mapel (misal: MP-01)",
    "name": "Nama Mata Pelajaran Terstandar",
    "category": "Kategori (Kejuruan / Umum / Muatan Lokal)",
    "hours": "Jumlah Jam Mengajar (misal: 4 Jam/Minggu)"
  }
]
Ketentuan: Hanya kirimkan JSON array murni.`;
      }

      const contents: any[] = [];

      if (base64Data && mimeType) {
        const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: mimeType === "application/pdf" ? "application/pdf" : mimeType,
            data: cleanBase64
          }
        });
      }

      if (rawText) {
        contents.push(`Teks mentah dokumen:\n${rawText}`);
      }

      contents.push(promptInstruction);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsedData = JSON.parse(cleanJson);
      return res.json({ status: true, data: parsedData });
    } catch (error: any) {
      console.error("PDF Parsing Error:", error);
      return res.status(500).json({
        status: false,
        reason: error.message || "Gagal memproses dokumen PDF dengan AI. Pastikan file PDF valid."
      });
    }
  });

  // 3. Fonnte WhatsApp Gateway proxy endpoint
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { target, message, customToken } = req.body;

      if (!message) {
        return res.status(400).json({ status: false, reason: "Parameter pesan (message) tidak boleh kosong." });
      }

      // Determine target and token (allowing override from client or using env)
      const token = customToken || process.env.FONNTE_API_KEY || "LMJoXs8WD3g78VGgFuTM";
      const finalTarget = target || process.env.FONNTE_TARGET;

      if (!token) {
        return res.status(400).json({
          status: false,
          reason: "Fonnte API Key belum dikonfigurasi di server. Silakan isi API Key Anda di tab Pengaturan Fonnte di aplikasi."
        });
      }

      if (!finalTarget) {
        return res.status(400).json({
          status: false,
          reason: "Target nomor WhatsApp atau ID grup tujuan belum ditentukan."
        });
      }

      // Construct form payload
      const params = new URLSearchParams();
      params.append("target", finalTarget);
      params.append("message", message);
      params.append("countryCode", "62");

      console.log(`Mengirim pesan WhatsApp ke target Fonnte: ${finalTarget}`);

      let data: any = null;
      try {
        const fonnteResponse = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": token
          },
          body: params
        });
        data = await fonnteResponse.json();
        console.log("Fonnte API response:", data);
      } catch (fErr: any) {
        console.warn("Fonnte API fetch error:", fErr.message);
      }

      if (!data) {
        return res.status(500).json({
          status: false,
          reason: "Gagal menghubungi Fonnte WhatsApp Gateway."
        });
      }

      // Jika Fonnte menolak target @newsletter, berikan penjelasan transparan
      if (data.status === false && finalTarget.includes("@newsletter")) {
        data.reason = "Fonnte API belum mendukung pengiriman ke Saluran WhatsApp (@newsletter). Fonnte hanya mendukung ID Grup WhatsApp (@g.us) seperti 120363205084846535@g.us atau nomor HP.";
      }

      return res.json(data);
    } catch (error: any) {
      console.error("Fonnte API error proxying:", error);
      return res.status(500).json({
        status: false,
        reason: error.message || "Gagal menghubungi Fonnte WhatsApp Gateway."
      });
    }
  });

  // 3.5. Fonnte Fetch Groups endpoint
  app.post("/api/whatsapp/fetch-groups", async (req, res) => {
    try {
      const { customToken } = req.body;
      const token = customToken || process.env.FONNTE_API_KEY || "LMJoXs8WD3g78VGgFuTM";

      if (!token) {
        return res.status(400).json({
          status: false,
          reason: "Fonnte API Key belum dikonfigurasi. Silakan lengkapi di tab Pengaturan Fonnte."
        });
      }

      console.log("Mengambil daftar grup WhatsApp dari Fonnte...");
      let fonnteResponse = await fetch("https://api.fonnte.com/get-whatsapp-group", {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });

      let data = await fonnteResponse.json();
      console.log("Fonnte Fetch Groups response:", data);

      // If never fetched or empty, auto-trigger a fetch-group sync and retry
      const hasNoGroupsDetail = data.detail && (
        data.detail.toLowerCase().includes("no whatsapp group yet") ||
        data.detail.toLowerCase().includes("never update") ||
        data.detail.toLowerCase().includes("never call")
      );

      if (data.status === false && hasNoGroupsDetail) {
        console.log("Grup WA belum disinkronisasi di Fonnte. Memicu sinkronisasi awal...");
        const syncResponse = await fetch("https://api.fonnte.com/fetch-group", {
          method: "POST",
          headers: {
            "Authorization": token
          }
        });
        const syncData = await syncResponse.json();
        console.log("Hasil sinkronisasi Fonnte:", syncData);

        if (syncData.status === true) {
          console.log("Mencoba mengambil kembali daftar grup setelah sinkronisasi...");
          fonnteResponse = await fetch("https://api.fonnte.com/get-whatsapp-group", {
            method: "POST",
            headers: {
              "Authorization": token
            }
          });
          data = await fonnteResponse.json();
        }
      }

      return res.json(data);
    } catch (error: any) {
      console.error("Fonnte Fetch Groups error:", error);
      return res.status(500).json({
        status: false,
        reason: error.message || "Gagal menghubungi Fonnte WhatsApp Gateway."
      });
    }
  });

  // 3.6. Fonnte Device Status diagnostics endpoint
  app.post("/api/whatsapp/device-status", async (req, res) => {
    try {
      const { customToken } = req.body;
      const token = customToken || process.env.FONNTE_API_KEY || "LMJoXs8WD3g78VGgFuTM";

      if (!token) {
        return res.status(400).json({
          status: false,
          reason: "Fonnte API Key belum dikonfigurasi. Silakan lengkapi di tab Pengaturan Fonnte."
        });
      }

      console.log("Memeriksa status perangkat WhatsApp dari Fonnte...");
      const fonnteResponse = await fetch("https://api.fonnte.com/device", {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });

      const data = await fonnteResponse.json();
      console.log("Fonnte Device Status response:", data);
      return res.json(data);
    } catch (error: any) {
      console.error("Fonnte Device Status error:", error);
      return res.status(500).json({
        status: false,
        reason: error.message || "Gagal menghubungi server Fonnte untuk mengecek status perangkat."
      });
    }
  });

  // 4. Vite development middleware setup or production static files distribution
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIMPATI AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start SIMPATI AI server:", err);
  process.exit(1);
});
