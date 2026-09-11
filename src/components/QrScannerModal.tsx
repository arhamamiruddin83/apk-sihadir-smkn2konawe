import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { checkIsPiketDutyToday } from "./GuruPiketDashboard";
import { MOCK_TEACHERS, MOCK_STUDENTS } from "../mockData";
import {
  QrCode,
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  UserCheck,
  Clock,
  RotateCw,
  Info,
  Building2,
  ShieldAlert,
  ArrowRight,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { dbService } from "../firebase";
import { notifyStudentAttendanceInstant } from "../services/whatsappFonnteService";
import { AttendanceScheduleInfoCard } from "./AttendanceScheduleInfoCard";

export type QrScanRole = "Ketua Kelas" | "Guru Piket" | "Guru BK" | "Admin Tata Usaha" | "Umum";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: QrScanRole;
  defaultClassName?: string;
  onScanSuccess?: (scannedCode: string, studentOrTeacherName?: string) => void;
}

interface ScanHistoryItem {
  id: string;
  code: string;
  name: string;
  roleType: "Murid" | "Guru" | "Personel TU" | "Lainnya";
  classOrDept: string;
  time: string;
  date: string;
  mode: "Masuk" | "Pulang" | "Verifikasi";
  status: "Hadir" | "Terlambat" | "Pulang" | "Tercatat";
  isDuplicate?: boolean;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  role,
  defaultClassName,
  onScanSuccess
}) => {
  const [scanMode, setScanMode] = useState<"Masuk" | "Pulang" | "Verifikasi">("Masuk");
  const [manualCode, setManualCode] = useState("");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Result Banner States
  const [lastScanResult, setLastScanResult] = useState<{
    status: "success" | "duplicate" | "error";
    title: string;
    message: string;
    timestamp: string;
    personName?: string;
    personDetail?: string;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "qr-reader-viewport-" + role.replace(/\s+/g, "-").toLowerCase();

  // Play Web Audio Chime
  const playAudioFeedback = (type: "success" | "duplicate" | "error") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "success") {
        // High dual chime
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

        osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } else if (type === "duplicate") {
        // Low double warning buzz
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.setValueAtTime(180, now + 0.15); // Low A3

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Error sound
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(150, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Web audio playback error:", e);
    }
  };

  // Helper to look up person from master lists
  const findPersonByQrCode = (rawCode: string) => {
    let cleanCode = rawCode.trim();

    // Remove potential file extension like .png, .jpg, .jpeg, .webp
    const baseCodeWithoutExt = cleanCode.replace(/\.(png|jpg|jpeg|webp|jfif)$/i, "");

    // Check if code is JSON format
    let targetCode = cleanCode;
    let targetName = "";
    if (cleanCode.startsWith("{") && cleanCode.endsWith("}")) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.nis) targetCode = String(parsed.nis);
        if (parsed.nip) targetCode = String(parsed.nip);
        if (parsed.id) targetCode = String(parsed.id);
        if (parsed.qrCode) targetCode = String(parsed.qrCode);
        if (parsed.name || parsed.nama) targetName = parsed.name || parsed.nama;
      } catch (e) {
        console.warn("JSON parse error for QR:", e);
      }
    }

    const normalize = (str: string = "") => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetNorm = normalize(targetCode);
    const baseCodeNorm = normalize(baseCodeWithoutExt);

    // 1. Search in Teacher Master List (from localStorage OR fallback to MOCK_TEACHERS)
    let teachersList = MOCK_TEACHERS;
    try {
      const rawTeachers = localStorage.getItem("simpati_teachers_list") || localStorage.getItem("sihadir_master_teachers");
      if (rawTeachers) {
        const parsedList = JSON.parse(rawTeachers);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          teachersList = parsedList;
        }
      }
    } catch (e) {
      console.warn("Error reading teacher master list:", e);
    }

    let foundTeacher: { name: string; nip?: string; dept?: string; id?: string; qrCode?: string } | null = null;
    if (Array.isArray(teachersList)) {
      const match = teachersList.find((t: any) => {
        const tName = t.nama || t.name || "";
        const tNip = t.nip || "";
        const tNuptk = t.nuptk || "";
        const tId = t.id || "";
        const tQr = t.qrCode || "";

        const tNameNorm = normalize(tName);
        const tNipNorm = normalize(tNip);
        const tNuptkNorm = normalize(tNuptk);
        const tIdNorm = normalize(tId);
        const tQrNorm = normalize(tQr);

        return (
          (tQr && (tQr.toLowerCase() === targetCode.toLowerCase() || tQr.toLowerCase() === baseCodeWithoutExt.toLowerCase())) ||
          (tQrNorm && (tQrNorm === targetNorm || tQrNorm === baseCodeNorm)) ||
          (tIdNorm && (tIdNorm === targetNorm || tIdNorm === baseCodeNorm)) ||
          (tNipNorm && (tNipNorm === targetNorm || tNipNorm === baseCodeNorm)) ||
          (tNuptkNorm && (tNuptkNorm === targetNorm || tNuptkNorm === baseCodeNorm)) ||
          (tNameNorm && (targetNorm.includes(tNameNorm) || tNameNorm.includes(targetNorm) || baseCodeNorm.includes(tNameNorm) || tNameNorm.includes(baseCodeNorm))) ||
          (targetName && tNameNorm.includes(normalize(targetName)))
        );
      });

      if (match) {
        const m = match as any;
        foundTeacher = {
          name: m.nama || m.name || "Guru",
          nip: m.nip || m.qrCode || targetCode,
          dept: m.mapel || m.subject || m.role || m.jabatan || "Pengajar / Personel SMK Negeri 2 Konawe",
          id: m.id,
          qrCode: m.qrCode
        };
      }
    }

    // 2. Search in Student Master List (from localStorage OR fallback to MOCK_STUDENTS)
    let studentsList = MOCK_STUDENTS;
    try {
      const rawStudents = localStorage.getItem("simpati_students_list") || localStorage.getItem("sihadir_master_students");
      if (rawStudents) {
        const parsedStudents = JSON.parse(rawStudents);
        if (Array.isArray(parsedStudents) && parsedStudents.length > 0) {
          studentsList = parsedStudents;
        }
      }
    } catch (e) {
      console.warn("Error reading student master list:", e);
    }

    // Extract potential class from folder name, e.g. "X_DKV" or "XII_TKR_A"
    let inferredClass = "";
    if (cleanCode.includes("/")) {
      const folderPart = cleanCode.split("/")[0].replace(/_/g, " ").trim();
      if (folderPart) inferredClass = folderPart;
    }

    // Extract clean name and numeric ID from filename, e.g. "099_MUHAMMAD_NANDA_SEPRIAN"
    const extractedNumberMatch = baseCodeWithoutExt.match(/^([0-9]{1,4})/);
    const extractedNumber = extractedNumberMatch ? extractedNumberMatch[1] : "";
    const extractedNameFromCode = baseCodeWithoutExt
      .replace(/^[0-9]+[_\-\s]*/, "")
      .replace(/_/g, " ")
      .trim();

    // Parse structured card QR payload (Nama Murid, NISN, Jurusan, Sekolah)
    let payloadNisn = "";
    let payloadName = "";
    let payloadMajor = "";
    const nisnMatch = cleanCode.match(/NISN\s*[:=]\s*([0-9A-Za-z]+)/i);
    if (nisnMatch) payloadNisn = nisnMatch[1].trim();

    const nameMatch = cleanCode.match(/Nama\s*[:=]\s*([^\n\r]+)/i);
    if (nameMatch) payloadName = nameMatch[1].trim();

    const jurMatch = cleanCode.match(/Jurusan\s*[:=]\s*([^\n\r]+)/i);
    if (jurMatch) payloadMajor = jurMatch[1].trim();

    let foundStudent: { name: string; nis?: string; class?: string } | null = null;
    if (Array.isArray(studentsList)) {
      const match = studentsList.find((s: any) => {
        const sName = s.nama || s.name || "";
        const sNis = s.nis || "";
        const sNisn = s.nisn || "";
        const sId = s.id || "";
        const sQr = s.qrCode || "";

        const sNameNorm = normalize(sName);
        const sNisNorm = normalize(sNis);
        const sNisnNorm = normalize(sNisn);
        const sIdNorm = normalize(sId);
        const sQrNorm = normalize(sQr);

        // Check structured QR payload match
        if (payloadNisn && (sNisnNorm === normalize(payloadNisn) || sIdNorm === normalize(payloadNisn) || sNisNorm === normalize(payloadNisn))) {
          return true;
        }
        if (payloadName && (sNameNorm === normalize(payloadName) || sNameNorm.includes(normalize(payloadName)) || normalize(payloadName).includes(sNameNorm))) {
          return true;
        }

        // Check exact ID match or number match (e.g. S099 vs 099)
        const idMatchesNumber = extractedNumber && (
          sIdNorm === `s${extractedNumber}` ||
          sIdNorm === `s${parseInt(extractedNumber, 10)}` ||
          sIdNorm === extractedNumber ||
          sNisNorm === extractedNumber
        );

        const nameFromCodeNorm = normalize(extractedNameFromCode);
        const nameMatchesExtracted = nameFromCodeNorm.length >= 3 && (
          sNameNorm === nameFromCodeNorm ||
          sNameNorm.includes(nameFromCodeNorm) ||
          nameFromCodeNorm.includes(sNameNorm)
        );

        return (
          (sQr && (sQr.toLowerCase() === targetCode.toLowerCase() || sQr.toLowerCase() === baseCodeWithoutExt.toLowerCase())) ||
          (sQrNorm && (sQrNorm === targetNorm || sQrNorm === baseCodeNorm)) ||
          (sIdNorm && (sIdNorm === targetNorm || sIdNorm === baseCodeNorm)) ||
          idMatchesNumber ||
          (sNisNorm && (sNisNorm === targetNorm || sNisNorm === baseCodeNorm)) ||
          (sNisnNorm && (sNisnNorm === targetNorm || sNisnNorm === baseCodeNorm)) ||
          (sNameNorm && (targetNorm.includes(sNameNorm) || sNameNorm.includes(targetNorm) || baseCodeNorm.includes(sNameNorm) || sNameNorm.includes(baseCodeNorm))) ||
          nameMatchesExtracted ||
          (targetName && sNameNorm.includes(normalize(targetName)))
        );
      });

      if (match) {
        const m = match as any;
        foundStudent = {
          name: m.nama || m.name || payloadName || "Murid",
          nis: m.nisn || m.nis || payloadNisn || targetCode,
          class: m.kelas || m.className || payloadMajor || inferredClass || defaultClassName || "SMK Negeri 2 Konawe"
        };
      } else if (payloadName || payloadNisn) {
        // Fallback directly from QR payload if student not yet in local storage
        foundStudent = {
          name: payloadName || "Murid",
          nis: payloadNisn || targetCode,
          class: payloadMajor || "SMK Negeri 2 Konawe"
        };
      }
    }

    if (foundTeacher) {
      const isTU = foundTeacher.name.toLowerCase().includes("tata usaha") || (foundTeacher.dept && foundTeacher.dept.toLowerCase().includes("tata usaha")) || (foundTeacher.id && foundTeacher.id.startsWith("TU"));
      return {
        type: (isTU ? "Personel TU" : "Guru") as "Guru" | "Personel TU",
        name: foundTeacher.name,
        code: foundTeacher.nip || foundTeacher.qrCode || targetCode,
        detail: foundTeacher.dept || "Pengajar / Staf"
      };
    }

    if (foundStudent) {
      return {
        type: "Murid" as const,
        name: foundStudent.name,
        code: foundStudent.nis || targetCode,
        detail: `Kelas ${foundStudent.class}`
      };
    }

    // Fallback: If not found, extrapolate neatly
    if (targetName) {
      return {
        type: "Murid" as const,
        name: targetName,
        code: targetCode,
        detail: `Terdaftar via QR (ID: ${targetCode})`
      };
    }

    // Clean up filename display for unknown QR codes
    const prettyName = baseCodeWithoutExt
      .replace(/^[0-9]+[_\-\s]*/, "")
      .replace(/_/g, " ");

    return {
      type: "Lainnya" as const,
      name: prettyName.length > 2 ? prettyName.toUpperCase() : `Kartu QR ${cleanCode}`,
      code: cleanCode,
      detail: `Kode ID / Unik: ${cleanCode}`
    };
  };

  // Process Scanned Code
  const handleScannedCode = (codeText: string) => {
    if (!codeText || !codeText.trim()) return;
    const cleanCode = codeText.trim();
    const todayStr = new Date().toISOString().split("T")[0];
    const nowTimeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const personInfo = findPersonByQrCode(cleanCode);

    // Check for duplicate scan today in history or storage
    const duplicateInSession = scanHistory.find(
      h => h.code.toLowerCase() === personInfo.code.toLowerCase() && h.date === todayStr && h.mode === scanMode
    );

    if (duplicateInSession) {
      // DUPLICATE DETECTED!
      playAudioFeedback("duplicate");
      setLastScanResult({
        status: "duplicate",
        title: "⚠️ PERINGATAN SCAN GANDA / SUDAH ABSEN!",
        message: `${personInfo.type} ${personInfo.name} sudah tercatat melakukan absensi ${scanMode.toLowerCase()} hari ini pada jam ${duplicateInSession.time} WITA.`,
        timestamp: nowTimeStr,
        personName: personInfo.name,
        personDetail: `${personInfo.type} • ${personInfo.detail}`
      });
      return;
    }

    // Calculate Status
    let status: "Hadir" | "Terlambat" | "Pulang" | "Tercatat" = "Hadir";
    if (scanMode === "Masuk") {
      const currentHourMinute = new Date().getHours() * 100 + new Date().getMinutes();
      status = currentHourMinute > 730 ? "Terlambat" : "Hadir";
    } else if (scanMode === "Pulang") {
      status = "Pulang";
    } else {
      status = "Tercatat";
    }

    // Record new Scan Item
    const newItem: ScanHistoryItem = {
      id: "scan-" + Date.now(),
      code: personInfo.code,
      name: personInfo.name,
      roleType: personInfo.type,
      classOrDept: personInfo.detail,
      time: nowTimeStr,
      date: todayStr,
      mode: scanMode,
      status
    };

    // Save to Local Storage according to role & type
    try {
      if (personInfo.type === "Murid") {
        const rawAtt = localStorage.getItem("simpati_saved_attendance_logs");
        let attLogs = rawAtt ? JSON.parse(rawAtt) : [];
        if (!Array.isArray(attLogs)) attLogs = [];

        // Add or update student log
        const existingIdx = attLogs.findIndex((a: any) => a.studentName === personInfo.name && a.date === todayStr);
        if (existingIdx >= 0) {
          attLogs[existingIdx] = {
            ...attLogs[existingIdx],
            status: status === "Terlambat" ? "Hadir" : status,
            clockIn: scanMode === "Masuk" ? nowTimeStr : attLogs[existingIdx].clockIn,
            clockOut: scanMode === "Pulang" ? nowTimeStr : attLogs[existingIdx].clockOut,
            qrScanned: true,
            scanRole: role
          };
        } else {
          attLogs.unshift({
            id: "att-qr-" + Date.now(),
            studentName: personInfo.name,
            className: personInfo.detail.replace("Kelas ", "") || defaultClassName || "SMK Negeri 2 Konawe",
            date: todayStr,
            status: status === "Terlambat" ? "Hadir" : status,
            clockIn: scanMode === "Masuk" ? nowTimeStr : undefined,
            clockOut: scanMode === "Pulang" ? nowTimeStr : undefined,
            notes: `Absen via Scan QR (${role})`,
            qrScanned: true
          });
        }
        localStorage.setItem("simpati_saved_attendance_logs", JSON.stringify(attLogs));

        // Also sync to student_self_attendance in Cloud Firestore so it appears in live recap immediately
        const studentCls = personInfo.detail.replace("Kelas ", "") || defaultClassName || "XI TKR A";
        const selfRecord = {
          id: `qr-${todayStr}-${personInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          studentName: personInfo.name,
          className: studentCls,
          date: todayStr,
          clockIn: scanMode === "Masuk" ? nowTimeStr : "--:--",
          clockOut: scanMode === "Pulang" ? nowTimeStr : null,
          status: status === "Terlambat" ? "Hadir" : status,
          reason: `Verifikasi QR Scanner (${role})`,
          photoLabel: "Terverifikasi QR Scanner"
        };
        dbService.saveRecord("student_self_attendance", selfRecord.id, selfRecord);

        // Instantly notify Admin TU and Guru BK via Fonnte WA Gateway
        notifyStudentAttendanceInstant({
          studentName: personInfo.name,
          nis: (personInfo as any).nis || undefined,
          className: studentCls,
          status: status === "Terlambat" ? "Terlambat" : status,
          clockIn: nowTimeStr,
          method: "Scan Barcode / QR Kios",
          recordedBy: `Kios Scanner Mandiri (${role})`,
          notes: `Verifikasi Presensi QR / Barcode Murid`
        }).catch(err => console.warn("Failed real-time notification to TU & BK:", err));
      } else if (personInfo.type === "Guru") {
        const rawTeachers = localStorage.getItem("simpati_teacher_attendance_logs");
        let teacherLogs = rawTeachers ? JSON.parse(rawTeachers) : [];
        if (!Array.isArray(teacherLogs)) teacherLogs = [];

        const existingIdx = teacherLogs.findIndex((t: any) => t.teacherName === personInfo.name && t.date === todayStr);
        if (existingIdx >= 0) {
          teacherLogs[existingIdx] = {
            ...teacherLogs[existingIdx],
            status: "Hadir",
            clockIn: scanMode === "Masuk" ? nowTimeStr : teacherLogs[existingIdx].clockIn,
            clockOut: scanMode === "Pulang" ? nowTimeStr : teacherLogs[existingIdx].clockOut,
            qrScanned: true
          };
          const targetLog = teacherLogs[existingIdx];
          dbService.saveRecord("teacher_attendance_logs", targetLog.id, targetLog);
        } else {
          const newTeacherLog = {
            id: "t-qr-" + Date.now(),
            teacherName: personInfo.name,
            date: todayStr,
            status: "Hadir",
            clockIn: scanMode === "Masuk" ? nowTimeStr : undefined,
            clockOut: scanMode === "Pulang" ? nowTimeStr : undefined,
            qrScanned: true
          };
          teacherLogs.unshift(newTeacherLog);
          dbService.saveRecord("teacher_attendance_logs", newTeacherLog.id, newTeacherLog);
        }
        localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(teacherLogs));
      }

      // Add to Ketua Kelas Reports if applicable
      if (role === "Ketua Kelas") {
        const rawKK = localStorage.getItem("sihadir_ketua_kelas_reports");
        let kkLogs = rawKK ? JSON.parse(rawKK) : [];
        if (!Array.isArray(kkLogs)) kkLogs = [];
        kkLogs.unshift({
          id: "kk-qr-" + Date.now(),
          studentName: personInfo.name,
          date: todayStr,
          time: nowTimeStr,
          status,
          type: "Absensi QR Kelas",
          note: `Di-scan oleh Ketua Kelas (${scanMode})`
        });
        localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(kkLogs));
      }

      // Add to Guru Piket Logs if applicable
      if (role === "Guru Piket") {
        const rawPiket = localStorage.getItem("simpati_guru_piket_logs");
        let piketLogs = rawPiket ? JSON.parse(rawPiket) : [];
        if (!Array.isArray(piketLogs)) piketLogs = [];
        piketLogs.unshift({
          id: "piket-qr-" + Date.now(),
          studentName: personInfo.name,
          className: personInfo.detail,
          date: todayStr,
          time: nowTimeStr,
          status,
          reason: `Scan QR Pos Gerbang / Piket (${scanMode})`
        });
        localStorage.setItem("simpati_guru_piket_logs", JSON.stringify(piketLogs));
      }

      // Add to BK Logs if applicable
      if (role === "Guru BK") {
        const rawBK = localStorage.getItem("simpati_bk_counseling_logs");
        let bkLogs = rawBK ? JSON.parse(rawBK) : [];
        if (!Array.isArray(bkLogs)) bkLogs = [];
        bkLogs.unshift({
          id: "bk-qr-" + Date.now(),
          studentName: personInfo.name,
          className: personInfo.detail,
          date: todayStr,
          time: nowTimeStr,
          topic: `Pemeriksaan Presensi QR (${scanMode})`,
          notes: `Status: ${status}`
        });
        localStorage.setItem("simpati_bk_counseling_logs", JSON.stringify(bkLogs));
      }
    } catch (e) {
      console.error("Error saving scan record to localStorage:", e);
    }

    // Update Local History
    setScanHistory(prev => [newItem, ...prev]);

    // Audio Playback
    playAudioFeedback("success");

    // Success Banner Output
    setLastScanResult({
      status: "success",
      title: `✅ ABSENSI ${scanMode.toUpperCase()} BERHASIL!`,
      message: `${personInfo.type} ${personInfo.name} (${personInfo.detail}) tercatat ${status.toLowerCase()} pada jam ${nowTimeStr} WITA.`,
      timestamp: nowTimeStr,
      personName: personInfo.name,
      personDetail: `${personInfo.type} • ${personInfo.detail}`
    });

    // Notify Callback if passed
    if (onScanSuccess) {
      onScanSuccess(cleanCode, personInfo.name);
    }
  };

  // Initialize Camera Scanner when Modal Opens
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startCameraScanner = async () => {
      setScannerError(null);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices.map(d => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
          const defaultCam = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("belakang")) || devices[0];
          setSelectedCameraId(defaultCam.id);

          initHtml5Qrcode(defaultCam.id);
        } else {
          setScannerError("Kamera tidak ditemukan pada perangkat ini. Anda tetap dapat menggunakan input manual di bawah.");
        }
      } catch (err) {
        console.warn("Camera permission or initialization error:", err);
        setScannerError("Izin kamera belum diberikan atau kamera sedang digunakan aplikasi lain. Gunakan input kode manual atau aktifkan izin kamera.");
      }
    };

    startCameraScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  // Init HTML5 Qrcode instance
  const initHtml5Qrcode = async (cameraId: string) => {
    try {
      await stopScanner();

      const html5QrCode = new Html5Qrcode(scannerRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      html5QrcodeRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        () => {
          // Ignore frame decode failures
        }
      );

      setIsScanning(true);
      setScannerError(null);
    } catch (err) {
      console.error("Failed to start QR Code Scanner:", err);
      setIsScanning(false);
      setScannerError("Gagal memulai kamera scanner. Silakan coba pilih kamera lain atau gunakan simulasi kode manual.");
    }
  };

  // Stop Scanner Safely
  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        await html5QrcodeRef.current.clear();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
      html5QrcodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Switch camera dropdown
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const camId = e.target.value;
    setSelectedCameraId(camId);
    if (camId) {
      initHtml5Qrcode(camId);
    }
  };

  const [isFileScanning, setIsFileScanning] = useState(false);

  // Scan QR Code from Uploaded Image File (JPEG, JPG, PNG, WEBP, etc.)
  const handleFileUploadScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileScanning(true);
    try {
      const tempId = "temp-qr-file-decoder";
      let container = document.getElementById(tempId);
      if (!container) {
        container = document.createElement("div");
        container.id = tempId;
        container.style.display = "none";
        document.body.appendChild(container);
      }

      const qrScanner = new Html5Qrcode(tempId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      const decodedText = await qrScanner.scanFile(file, true);
      try {
        await qrScanner.clear();
      } catch {
        // Safe ignore
      }
      handleScannedCode(decodedText);
    } catch (err) {
      console.warn("File QR scan error:", err);
      setLastScanResult({
        status: "error",
        title: "Gagal Membaca Gambar QR",
        message: "File gambar (JPEG/JPG/PNG) tidak memuat QR Code yang terbaca dengan jelas. Pastikan foto QR tidak buram dan fokus.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      });
      playAudioFeedback("error");
    } finally {
      setIsFileScanning(false);
      e.target.value = "";
    }
  };

  // Manual Test Code Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScannedCode(manualCode);
    setManualCode("");
  };

  if (!isOpen) return null;

  // Piket Duty Day Guard Check
  const storedUser = localStorage.getItem("sihadir_username") || "";
  const piketCheck = role === "Guru Piket" ? checkIsPiketDutyToday(storedUser) : { isDutyToday: true, todayDay: "", assignedDays: [] };

  if (role === "Guru Piket" && !piketCheck.isDutyToday) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5 text-center my-auto">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-rose-200">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md">
              Scanner Kehadiran Terkunci
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">BUKAN HARI PIKET ANDA</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Sebagai <strong>Guru Piket</strong>, Anda hanya berwenang melakukan Scan QR Kehadiran Murid pada HARI PIKET Anda (<strong>{piketCheck.assignedDays.join(", ")}</strong>).
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs text-slate-700 font-semibold mt-2">
              Hari ini adalah <strong>{piketCheck.todayDay}</strong>. Di luar hari piket Anda, Kios Scanner QR Kehadiran Murid dikunci.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md cursor-pointer transition-all"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
              <QrCode className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base tracking-wide text-white uppercase">
                  Scanner QR Code Absensi
                </h3>
                <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dekatkan kartu QR Code murid/guru ke arah kamera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              }`}
              title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Mute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => setScanMode("Masuk")}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === "Masuk"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Absen Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => setScanMode("Pulang")}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === "Pulang"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Absen Pulang</span>
            </button>
            <button
              type="button"
              onClick={() => setScanMode("Verifikasi")}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === "Verifikasi"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Verifikasi / Cek</span>
            </button>
          </div>

          {/* Informasi Aturan Waktu Absen Masuk & Pulang */}
          <AttendanceScheduleInfoCard 
            id="qr-modal-schedule-info"
            variant="compact" 
            highlightMode={scanMode === "Masuk" ? "masuk" : scanMode === "Pulang" ? "pulang" : "all"} 
            role="siswa" 
          />

          {/* Last Scan Result Alert Banner */}
          {lastScanResult && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in zoom-in-95 duration-200 ${
                lastScanResult.status === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm"
                  : lastScanResult.status === "duplicate"
                  ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm"
                  : "bg-rose-50 border-rose-300 text-rose-950 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                {lastScanResult.status === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : lastScanResult.status === "duplicate" ? (
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider">
                    {lastScanResult.title}
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold">
                    {lastScanResult.message}
                  </p>
                  {lastScanResult.personName && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-white/80 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        <UserCheck className="h-3 w-3 text-indigo-600" />
                        {lastScanResult.personName}
                      </span>
                      {lastScanResult.personDetail && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {lastScanResult.personDetail}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Camera Viewport Container */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner min-h-[260px] flex flex-col items-center justify-center p-2">
            {/* Target ID div for html5-qrcode */}
            <div id={scannerRegionId} className="w-full max-w-sm rounded-xl overflow-hidden" />

            {!isScanning && !scannerError && (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Camera className="h-10 w-10 mx-auto text-indigo-400 animate-pulse" />
                <p className="text-xs font-semibold">Menghubungkan Kamera Web...</p>
              </div>
            )}

            {scannerError && (
              <div className="p-4 text-center text-rose-300 space-y-2 max-w-md">
                <AlertTriangle className="h-8 w-8 mx-auto text-rose-400" />
                <p className="text-xs leading-relaxed">{scannerError}</p>
              </div>
            )}

            {/* Camera Switch Dropdown */}
            {cameras.length > 1 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                <RotateCw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Pilih Kamera:</span>
                <select
                  value={selectedCameraId}
                  onChange={handleCameraChange}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload File QR Code Image (JPEG/JPG/PNG) Option */}
            <div className="mt-3 w-full flex items-center justify-center">
              <label className="flex items-center gap-2 bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-indigo-400/40">
                <Upload className="h-3.5 w-3.5" />
                <span>{isFileScanning ? "Memproses Gambar..." : "Unggah Gambar QR (JPEG / JPG / PNG)"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/*,.jpeg,.jpg,.png,.jfif"
                  disabled={isFileScanning}
                  onChange={handleFileUploadScan}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Manual Input Form for Testing / Fallback */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-indigo-600" />
                <span>Input / Simulasi Pembacaan Kode QR</span>
              </label>
              <span className="text-[10px] text-slate-500">
                Gunakan jika kamera bermasalah / uji coba NIS/NIP
              </span>
            </div>

            <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="Masukkan NIS, NIP, Nama, atau Teks QR Code..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Proses</span>
              </button>
            </form>
          </div>

          {/* Recent Scans Session Log */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>Riwayat Scan Sesi Ini ({scanHistory.length})</span>
              </h4>
              {scanHistory.length > 0 && (
                <button
                  onClick={() => setScanHistory([])}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {scanHistory.length === 0 ? (
              <div className="p-4 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs italic">
                Belum ada data QR Code yang ter-scan pada sesi ini.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-indigo-300 transition-all shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-md">
                          {item.roleType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {item.classOrDept} • Kode: <span className="font-mono">{item.code}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-extrabold text-slate-800">{item.time} WITA</span>
                      <span
                        className={`block text-[10px] font-extrabold px-2 py-0.2 rounded-md ${
                          item.status === "Terlambat"
                            ? "bg-amber-100 text-amber-800"
                            : item.status === "Pulang"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.mode}: {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Sistem dilengkapi pendeteksi otomatis scan ganda & umpan balik suara.</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
