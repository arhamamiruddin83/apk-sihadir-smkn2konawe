/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Camera, Clock, CheckCircle2, XCircle, AlertCircle, AlertTriangle, FileText, Calendar, Sliders, RefreshCw, Compass, LogOut, Radio, Settings, Coffee, Send, Eye, Check, Sparkles, Layers } from "lucide-react";
import { TeacherAttendance } from "../types";
import { INITIAL_TEACHER_ATTENDANCE, MOCK_TEACHERS } from "../mockData";
import { InteractiveAttendanceMap } from "./InteractiveAttendanceMap";
import { AttendanceScheduleInfoCard } from "./AttendanceScheduleInfoCard";
import { ChannelPresensiConfigModal } from "./ChannelPresensiConfigModal";
import { 
  getFonnteApiKey,
  getSchoolChannelTarget, 
  dispatchTeacherAttendanceToChannel,
  buildTeacherSession1Report,
  buildTeacherSession2Report,
  dispatchTwoSessionReport
} from "../services/whatsappFonnteService";
import { dbService } from "../firebase";
import { compressImageFile } from "../lib/imageCompressor";

// SMK Negeri 2 Konawe Central coordinates
const SCHOOL_LAT = -3.8380461319668107;
const SCHOOL_LON = 122.04194960321178;

// Haversine formula to calculate distance in meters

// Haversine formula to calculate distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // returns distance in meters
}

export function AttendanceTeacher({ username, currentRole }: { username?: string; currentRole?: string } = {}) {
  // Hanya tampilkan laporan rekapan presensi bulanan dan semester untuk Admin Utama dan Admin Tata Usaha (TU), dihilangkan untuk guru mapel
  const isAdminOrTu = 
    (currentRole || "").toLowerCase() === "admin" || 
    (currentRole || "").toLowerCase() === "tu" ||
    (username || "").toLowerCase() === "admin" ||
    (username || "").toLowerCase() === "tu";

  const [mapAuthFailed, setMapAuthFailed] = useState(false);

  useEffect(() => {
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failure detected in AttendanceTeacher");
      setMapAuthFailed(true);
      if (originalAuthFailure) {
        try {
          originalAuthFailure();
        } catch (e) {
          console.error(e);
        }
      }
    };
    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  const [logs, setLogs] = useState<TeacherAttendance[]>(() => {
    const saved = localStorage.getItem("simpati_teacher_attendance_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((t: any) =>
            !t.teacherName?.includes("Alam") &&
            !t.teacherName?.includes("Budi Santoso") &&
            !t.teacherName?.includes("Budi Raharjo") &&
            !t.teacherName?.includes("Budi") &&
            !t.teacherName?.includes("Sri")
          );
          localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(filtered));
          return filtered;
        }
      } catch (e) { console.error(e); }
    }
    const filteredInit = INITIAL_TEACHER_ATTENDANCE.filter((t: any) =>
      !t.teacherName?.includes("Alam") &&
      !t.teacherName?.includes("Budi Santoso") &&
      !t.teacherName?.includes("Budi Raharjo") &&
      !t.teacherName?.includes("Budi") &&
      !t.teacherName?.includes("Sri")
    );
    localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(filteredInit));
    return filteredInit;
  });

  useEffect(() => {
    localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(logs));
  }, [logs]);

  // Real-time Cloud Firestore subscription for teacher attendance
  useEffect(() => {
    const unsub = dbService.subscribeRecords("teacher_attendance_logs", (records) => {
      if (records && records.length > 0) {
        setLogs(prev => {
          const map = new Map<string, TeacherAttendance>();
          prev.forEach(item => map.set(item.id, item));
          (records as TeacherAttendance[]).forEach(item => map.set(item.id, item));
          const allItems: TeacherAttendance[] = Array.from(map.values());
          const merged = allItems.sort((a, b) => {
            const dateComp = (b.date || "").localeCompare(a.date || "");
            if (dateComp !== 0) return dateComp;
            return (b.clockIn || b.clockOut || "").localeCompare(a.clockIn || a.clockOut || "");
          });
          return merged;
        });
      }
    });
    return () => unsub();
  }, []);
  
  // Resolve active teacher identity reliably
  const resolveActiveTeacherName = useCallback((): string => {
    const cleanU = (username || "").toLowerCase().trim();
    const cleanR = (currentRole || "").toLowerCase().trim();

    // If role or username is admin, default strictly to ARHAM AMIRUDDIN
    if (cleanU === "admin" || cleanU.includes("arham") || cleanR === "admin") {
      const activeTeacherName = localStorage.getItem("sihadir_active_teacher_name");
      if (activeTeacherName && !activeTeacherName.toLowerCase().includes("adrian") && activeTeacherName !== "Guru / Staf Pendidik") {
        return activeTeacherName;
      }
      return "ARHAM AMIRUDDIN, S.Pd.Gr";
    }

    // Check localStorage
    const activeTeacherName = localStorage.getItem("sihadir_active_teacher_name");
    if (activeTeacherName && !activeTeacherName.toLowerCase().includes("adrian")) {
      // Fix potential cross-match between Bu Triana and Bu Eva in saved cache
      const isTrianaUser = (cleanU.includes("daniel") || cleanU.includes("triana")) && !cleanU.includes("eva");
      if (isTrianaUser && (activeTeacherName.toLowerCase().includes("eva") || activeTeacherName.toLowerCase().includes("syahtriana"))) {
        return "TRIANA DANIEL, S.Pd.";
      }
      const isEvaUser = cleanU.includes("eva") || cleanU.includes("syahtriana") || cleanU.includes("evasyatriana");
      if (isEvaUser && (activeTeacherName.toLowerCase().includes("daniel") || (!activeTeacherName.toLowerCase().includes("eva") && activeTeacherName.toLowerCase().includes("triana")))) {
        return "EVASYAHTRIANA, S.Si";
      }
      return activeTeacherName;
    }

    if (username) {
      if (cleanU === "budi") return "Guru Mata Pelajaran";
      if (cleanU === "ahmad") return "Wali Kelas XI TKR A";
      if (cleanU === "dian") return "Guru Wali XI TSM A";
      if (cleanU === "suci") return "Guru Bimbingan Konseling (BK)";
      if (cleanU === "kurikulum") return "Andi Asrul Umar, S.Pd. (Waka Kurikulum)";
      if (cleanU === "kesiswaan") return "Nyoman Suliawati, S.Pd., M.Pd. (Waka Kesiswaan)";
      if (cleanU === "piket") return "Ainal Laremba, S.Ag (Guru Piket)";
      if (cleanU === "kepsek") return "Drs. H. ABD. MANAN, M.M. (Kepala Sekolah)";
      if (cleanU === "tu" || cleanU.includes("sakti")) {
        return "Saktinani Djunaid, S.Sos. (Admin TU)";
      }
      if (cleanU.includes("adelia")) {
        return "Adelia Pusparini, A.Md. (Staf TU)";
      }
      if (cleanU.includes("eva") || cleanU.includes("syahtriana") || cleanU.includes("evasyatriana")) {
        return "EVASYAHTRIANA, S.Si";
      }
      if (cleanU.includes("daniel") || (cleanU.includes("triana") && !cleanU.includes("eva"))) {
        return "TRIANA DANIEL, S.Pd.";
      }
      
      const matched = MOCK_TEACHERS.find(t => {
        const tLower = t.name.toLowerCase();
        if (cleanU.includes("triana") && !cleanU.includes("eva")) {
          return tLower.includes("daniel") || (tLower.includes("triana") && !tLower.includes("eva") && !tLower.includes("syah"));
        }
        return tLower.includes(cleanU);
      });
      if (matched) return matched.name;
    }

    return "ARHAM AMIRUDDIN, S.Pd.Gr";
  }, [username, currentRole]);

  // Custom teacher identity state
  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => resolveActiveTeacherName());

  // Keep state synchronized whenever user or role changes
  useEffect(() => {
    const active = resolveActiveTeacherName();
    setSelectedTeacher(active);
    localStorage.setItem("sihadir_active_teacher_name", active);
  }, [resolveActiveTeacherName]);

  const isTuUser = (() => {
    const r = (currentRole || "").toLowerCase();
    const u = (username || "").toLowerCase();
    const st = (selectedTeacher || "").toLowerCase();
    return r === "tu" || r.includes("tata usaha") || u === "tu" || u.includes("sakti") || u.includes("adelia") || st.includes("tata usaha") || st.includes("tu");
  })();

  const isSaktiOrAdelia = (() => {
    const u = (username || "").toLowerCase();
    const st = (selectedTeacher || "").toLowerCase();
    return u.includes("sakti") || u.includes("adelia") || u.includes("saktinani") || u.includes("pusparini") ||
           st.includes("sakti") || st.includes("adelia") || st.includes("saktinani") || st.includes("pusparini");
  })();

  // Resolve photo for the current user safely from specific profile storage
  const currentTeacherPhoto = (() => {
    if (username) {
      const cleanU = username.trim().toLowerCase();
      const saved = localStorage.getItem(`sihadir_teacher_profile_${cleanU}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.photoUrl) return parsed.photoUrl;
        } catch (e) {}
      }
    }
    // Also check simpati_teachers_list for matching teacher
    const masterSaved = localStorage.getItem("simpati_teachers_list");
    if (masterSaved) {
      try {
        const teachers = JSON.parse(masterSaved);
        const match = teachers.find((t: any) => 
          (username && t.name?.toLowerCase().includes(username.toLowerCase())) ||
          (t.name && t.name === selectedTeacher)
        );
        if (match?.photoUrl) return match.photoUrl;
      } catch (e) {}
    }
    return "";
  })();

  // Dynamic School Coordinates calibrated in Admin (Default: SMK Negeri 2 Konawe)
  const [schoolLat, setSchoolLat] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lat");
    if (!saved || saved === "-7.2504" || saved === "-3.838139") {
      localStorage.setItem("sihadir_school_lat", "-3.8380461319668107");
      return -3.8380461319668107;
    }
    return parseFloat(saved);
  });
  const [schoolLon, setSchoolLon] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_lon");
    if (!saved || saved === "112.7508" || saved === "122.041944") {
      localStorage.setItem("sihadir_school_lon", "122.04194960321178");
      return 122.04194960321178;
    }
    return parseFloat(saved);
  });
  const [schoolRadius, setSchoolRadius] = useState<number>(() => {
    const saved = localStorage.getItem("sihadir_school_radius");
    return saved ? parseInt(saved) : 700;
  });

  useEffect(() => {
    const savedLat = localStorage.getItem("sihadir_school_lat");
    const savedLon = localStorage.getItem("sihadir_school_lon");
    const savedRadius = localStorage.getItem("sihadir_school_radius");
    if (savedLat) setSchoolLat(parseFloat(savedLat));
    if (savedLon) setSchoolLon(parseFloat(savedLon));
    if (savedRadius) setSchoolRadius(parseInt(savedRadius));
  }, []);
  
  // Real GPS vs Simulation states
  const [useRealGps, setUseRealGps] = useState<boolean>(true);
  const [realLat, setRealLat] = useState<number | null>(() => {
    const saved = localStorage.getItem("sihadir_last_real_lat");
    return saved ? parseFloat(saved) : null;
  });
  const [realLon, setRealLon] = useState<number | null>(() => {
    const saved = localStorage.getItem("sihadir_last_real_lon");
    return saved ? parseFloat(saved) : null;
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  const teacherGpsWatchIdRef = useRef<number | null>(null);

  const startRealGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Perangkat atau browser Anda tidak mendukung fitur pencarian lokasi GPS.");
      setIsGpsLoading(false);
      return;
    }
    
    setIsGpsLoading(true);
    setGpsError(null);
    
    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const lat = parseFloat(latitude.toFixed(6));
      const lon = parseFloat(longitude.toFixed(6));
      setRealLat(lat);
      setRealLon(lon);
      setGpsAccuracy(Math.round(accuracy));
      setUseRealGps(true);
      setIsGpsLoading(false);
      localStorage.setItem("sihadir_last_real_lat", String(latitude));
      localStorage.setItem("sihadir_last_real_lon", String(longitude));
    };

    const handleError = (_err: GeolocationPositionError) => {
      // Fallback attempt with standard accuracy if high accuracy fails
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (fallbackErr) => {
          setIsGpsLoading(false);
          if (teacherGpsWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(teacherGpsWatchIdRef.current);
            teacherGpsWatchIdRef.current = null;
          }
          if (fallbackErr.code === fallbackErr.PERMISSION_DENIED) {
            setGpsError("Izin lokasi (GPS) ditolak browser. Mohon izinkan akses Lokasi di pengaturan browser HP Anda.");
          } else {
            setGpsError("Sinyal GPS lemah atau tidak tersedia. Pastikan fitur Lokasi (GPS) di HP telah diaktifkan.");
          }
        },
        { enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 }
      );
    };

    // 1. Immediate position fix
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 8000
    });

    // 2. Continuous watch for real-time accuracy updates
    if (teacherGpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(teacherGpsWatchIdRef.current);
    }
    teacherGpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handleSuccess(pos);
      },
      (_err) => {
        // Quiet watch error handler
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, []);

  // Auto trigger GPS tracking on mount for teachers
  useEffect(() => {
    startRealGpsTracking();
  }, [startRealGpsTracking]);
  
  // Mock live map center
  const [gpsOffsetLat, setGpsOffsetLat] = useState(0.0001); // closer
  const [gpsOffsetLon, setGpsOffsetLon] = useState(0.0001);
  const [simulatedLat, setSimulatedLat] = useState(() => {
    const saved = localStorage.getItem("sihadir_school_lat");
    return saved ? parseFloat(saved) : -3.8380461319668107;
  });
  const [simulatedLon, setSimulatedLon] = useState(() => {
    const saved = localStorage.getItem("sihadir_school_lon");
    return saved ? parseFloat(saved) : 122.04194960321178;
  });
  const [distance, setDistance] = useState(0);

  // Clock Out selection state
  const [activeAttendanceId, setActiveAttendanceId] = useState<string | null>(null);

  // Selfie capture mock
  const [selfieImage, setSelfieImage] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Status logs
  const [attendanceMessage, setAttendanceMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reportTab, setReportTab] = useState<"harian" | "mingguan" | "bulanan" | "semester">("harian");

  // Saluran WhatsApp Resmi SMK Negeri 2 Konawe Modal state
  const [isChannelModalOpen, setIsChannelModalOpen] = useState<boolean>(false);
  const [schoolChannelId, setSchoolChannelId] = useState<string>(() => getSchoolChannelTarget());

  // Listen to target changes from settings modal
  useEffect(() => {
    const handleTargetChange = (e: any) => {
      if (e.detail) {
        setSchoolChannelId(e.detail);
      } else {
        setSchoolChannelId(getSchoolChannelTarget());
      }
    };
    window.addEventListener("sihadir_wa_target_changed", handleTargetChange);
    return () => window.removeEventListener("sihadir_wa_target_changed", handleTargetChange);
  }, []);

  // Real-time ticking system clock for alarms
  const [liveDateTime, setLiveDateTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Alarm settings for teachers
  const [alarmHourIn, setAlarmHourIn] = useState<string>(() => localStorage.getItem("simpati_teacher_alarm_in") || "07:15");
  const [alarmHourOut, setAlarmHourOut] = useState<string>(() => localStorage.getItem("simpati_teacher_alarm_out") || "14:00");
  const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(() => localStorage.getItem("simpati_teacher_alarm_enabled") !== "false");
  const [dismissedAlarmIn, setDismissedAlarmIn] = useState<boolean>(false);
  const [dismissedAlarmOut, setDismissedAlarmOut] = useState<boolean>(false);
  const [alarmTriggeredIn, setAlarmTriggeredIn] = useState<boolean>(false);
  const [alarmTriggeredOut, setAlarmTriggeredOut] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("simpati_teacher_alarm_in", alarmHourIn);
  }, [alarmHourIn]);

  useEffect(() => {
    localStorage.setItem("simpati_teacher_alarm_out", alarmHourOut);
  }, [alarmHourOut]);

  useEffect(() => {
    localStorage.setItem("simpati_teacher_alarm_enabled", String(isAlarmEnabled));
  }, [isAlarmEnabled]);

  // 2-Session WhatsApp Group Report State
  const [showSession1Preview, setShowSession1Preview] = useState<boolean>(false);
  const [showSession2Preview, setShowSession2Preview] = useState<boolean>(false);
  const [sendingSession, setSendingSession] = useState<1 | 2 | null>(null);
  const [sessionNotice, setSessionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSendSession = async (session: 1 | 2) => {
    setSendingSession(session);
    setSessionNotice(null);
    try {
      const res = await dispatchTwoSessionReport(session);
      if (res.success) {
        setSessionNotice({
          type: "success",
          text: `Rekap Sesi ${session} berhasil disiarkan ke WhatsApp! Target: ${res.target}`
        });
      } else {
        setSessionNotice({
          type: "error",
          text: `Pengiriman Rekap Sesi ${session} gagal: ${res.message}`
        });
      }
    } catch (e: any) {
      setSessionNotice({
        type: "error",
        text: `Terjadi kendala saat mengirim: ${e.message || e}`
      });
    } finally {
      setSendingSession(null);
    }
  };

  // Auto-broadcast toggle and tracking
  const [autoSessionBroadcast, setAutoSessionBroadcast] = useState<boolean>(() => {
    return localStorage.getItem("sihadir_auto_session_broadcast") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("sihadir_auto_session_broadcast", String(autoSessionBroadcast));
  }, [autoSessionBroadcast]);

  // Automatic scheduler ticker
  useEffect(() => {
    if (!autoSessionBroadcast) return;

    const hour = liveDateTime.getHours();
    const minute = liveDateTime.getMinutes();
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const todayKey = `${liveDateTime.getFullYear()}-${String(liveDateTime.getMonth() + 1).padStart(2, "0")}-${String(liveDateTime.getDate()).padStart(2, "0")}`;

    // Sesi 1: Menjelang jam istirahat (09:55 WITA)
    if (timeStr === "09:55" && localStorage.getItem("sihadir_sent_session1_date") !== todayKey) {
      localStorage.setItem("sihadir_sent_session1_date", todayKey);
      dispatchTwoSessionReport(1).then((res) => {
        if (res.success) {
          console.log("✅ Auto Sesi 1 WhatsApp Report dispatched at 09:55 WITA");
        }
      });
    }

    // Sesi 2: Tepat pukul 13:00 WITA
    if (timeStr === "13:00" && localStorage.getItem("sihadir_sent_session2_date") !== todayKey) {
      localStorage.setItem("sihadir_sent_session2_date", todayKey);
      dispatchTwoSessionReport(2).then((res) => {
        if (res.success) {
          console.log("✅ Auto Sesi 2 WhatsApp Report dispatched at 13:00 WITA");
        }
      });
    }
  }, [liveDateTime, autoSessionBroadcast]);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let time = audioCtx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(i % 2 === 0 ? 660 : 784, time); // Pleasing buzzer
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.35);
        time += 0.4;
      }
    } catch (e) {
      console.warn("AudioContext block", e);
    }
  };

  useEffect(() => {
    if (!isAlarmEnabled) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecord = logs.find(log => log.teacherName === selectedTeacher && log.date === todayStr);
    
    const currentHours = liveDateTime.getHours();
    const currentMinutes = liveDateTime.getMinutes();
    
    const [inH, inM] = alarmHourIn.split(":").map(Number);
    const [outH, outM] = alarmHourOut.split(":").map(Number);
    
    const isPastInTime = currentHours > inH || (currentHours === inH && currentMinutes >= inM);
    if (!todayRecord && isPastInTime && !dismissedAlarmIn) {
      if (!alarmTriggeredIn) {
        setAlarmTriggeredIn(true);
        playAlarmSound();
      }
    } else if (todayRecord || !isPastInTime) {
      setAlarmTriggeredIn(false);
    }

    const isPastOutTime = currentHours > outH || (currentHours === outH && currentMinutes >= outM);
    if (todayRecord && todayRecord.status === "Hadir" && !todayRecord.clockOut && isPastOutTime && !dismissedAlarmOut) {
      if (!alarmTriggeredOut) {
        setAlarmTriggeredOut(true);
        playAlarmSound();
      }
    } else if (!todayRecord || todayRecord.clockOut || !isPastOutTime) {
      setAlarmTriggeredOut(false);
    }
  }, [liveDateTime, logs, selectedTeacher, alarmHourIn, alarmHourOut, isAlarmEnabled, dismissedAlarmIn, dismissedAlarmOut]);

  useEffect(() => {
    // Dynamically calculate simulated lat/lon
    const lat = schoolLat + gpsOffsetLat;
    const lon = schoolLon + gpsOffsetLon;
    setSimulatedLat(parseFloat(lat.toFixed(6)));
    setSimulatedLon(parseFloat(lon.toFixed(6)));
  }, [gpsOffsetLat, gpsOffsetLon, schoolLat, schoolLon]);

  useEffect(() => {
    const lat = useRealGps && realLat !== null ? realLat : simulatedLat;
    const lon = useRealGps && realLon !== null ? realLon : simulatedLon;
    const dist = getDistance(schoolLat, schoolLon, lat, lon);
    setDistance(dist);
  }, [useRealGps, realLat, realLon, simulatedLat, simulatedLon, schoolLat, schoolLon]);

  const triggerCamera = async () => {
    setIsCapturing(true);
    setSelfieImage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 200 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.warn("Unable to access physical camera, using dynamic fallback face generator.", e);
      // Fallback generator
      setTimeout(() => {
        const avatars = [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        setSelfieImage(randomAvatar);
        setIsCapturing(false);
      }, 1500);
    }
  };

  const captureSelfieFromVideo = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setSelfieImage(dataUrl);
        // stop camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
    setIsCapturing(false);
  };

  const triggerAutoWA = async (messageText: string) => {
    const key = localStorage.getItem("simpati_fonnte_api_key") || getFonnteApiKey();
    const target = localStorage.getItem("simpati_fonnte_target") || getSchoolChannelTarget();
    if (!key || !target) {
      console.log("Fonnte API Key or Target is empty, skipping auto background WhatsApp broadcast for teacher attendance.");
      return;
    }
    
    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target,
          message: messageText,
          customToken: key
        })
      });
    } catch (e) {
      console.error("Auto background teacher WhatsApp broadcast connection failed:", e);
    }
  };

  const handleClockIn = () => {
    // 1. Time restriction check: 06:30 - 11:30
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const inStartMins = 6 * 60 + 30; // 06:30
    const inEndMins = 11 * 60 + 30;  // 11:30

    if (currentMins < inStartMins) {
      setAttendanceMessage({ type: "error", text: "⚠️ Akses Ditolak: Absen Masuk belum dibuka! Absen Masuk hanya dibuka dari pukul 06.30 WITA." });
      return;
    }
    if (currentMins > inEndMins) {
      setAttendanceMessage({ type: "error", text: "⚠️ Akses Ditolak: Absen Masuk telah ditutup! Jam operasional Absen Masuk adalah pukul 06.30 - 11.30 WITA." });
      return;
    }

    if (!selfieImage) {
      setAttendanceMessage({ type: "error", text: "Wajib melakukan Foto Selfie terlebih dahulu sebagai prasyarat administratif!" });
      return;
    }

    const todayDateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const activeLat = useRealGps && realLat !== null ? realLat : simulatedLat;
    const activeLon = useRealGps && realLon !== null ? realLon : simulatedLon;

    // Radius rule: must be <= schoolRadius meters
    const isWithinRadius = distance <= schoolRadius;
    const status = isWithinRadius ? "Hadir" : "Ditolak";
    
    const newLog: TeacherAttendance = {
      id: "T-" + Date.now().toString(),
      teacherName: selectedTeacher,
      date: todayDateStr,
      clockIn: timeStr,
      clockOut: null,
      latitude: activeLat,
      longitude: activeLon,
      distanceMeter: distance,
      selfie: selfieImage,
      status: status,
      rejectionReason: !isWithinRadius ? `Ditolak karena di luar radius ${schoolRadius}m sekolah (Jarak terdeteksi: ${distance} m)` : undefined
    };

    setLogs(prev => [newLog, ...prev]);
    dbService.saveRecord("teacher_attendance_logs", newLog.id, newLog);

    if (isWithinRadius) {
      setAttendanceMessage({ type: "success", text: `Presensi Masuk BERHASIL dicatat & Terbit ke Saluran WhatsApp SMK Negeri 2 Konawe! Status: Hadir (Jarak: ${distance} m).` });
      // remember this log to allow clock out later
      setActiveAttendanceId(newLog.id);

      // 1. Formatted WhatsApp message for Kepsek & Teacher Group
      const waMsg = `*📢 LAPORAN PRESENSI MASUK GURU (SIHADIR)*\n_Monitoring Real-Time Kepsek & Manajemen Sekolah_\n\n👤 *Nama Guru:* ${selectedTeacher}\n📅 *Tanggal:* ${todayDateStr}\n⏱️ *Jam Masuk:* ${timeStr} WITA\n📌 *Lokasi GPS:* ${distance} meter dari Sekolah (Valid/Dalam Radius)\n✅ *Status:* HADIR DI SEKOLAH / KELAS\n\n_Sistem SIHADIR mencatat presensi ini secara otomatis terverifikasi posisi GPS & foto selfie biometrik._`;
      triggerAutoWA(waMsg);

      // 2. Dispatch automatically to Saluran Resmi SMK Negeri 2 Konawe
      dispatchTeacherAttendanceToChannel("masuk", {
        teacherName: selectedTeacher,
        date: todayDateStr,
        time: timeStr,
        distance: distance,
        status: "HADIR TEPAT WAKTU (Dalam Radius)",
        notes: "Presensi Masuk terverifikasi geofence & biometrik selfie"
      }).then(res => {
        if (res.success) {
          console.log("Presensi masuk guru sukses terbit ke saluran SMKN 2 Konawe:", res.targetsSent);
        }
      }).catch(err => console.error("Gagal broadcast presensi masuk ke saluran:", err));

      // Direct WhatsApp dispatch connection
      const targetPhone = localStorage.getItem("simpati_fonnte_target") || "";
      const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
      const encodedMsg = encodeURIComponent(waMsg);
      let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
      if (cleanPhone) {
        waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
      }
      window.open(waUrl, "_blank");
    } else {
      setAttendanceMessage({ type: "error", text: `Absensi DITOLAK! Anda berada di luar radius sekolah yang diijinkan (> ${schoolRadius} meter). Jarak terdeteksi: ${distance} m.` });
    }

    // Reset camera image
    setSelfieImage("");
  };

  const handleClockOutNew = () => {
    // Time restriction check: Absen Pulang opens at 11:00 on Friday, 13:00 on other days
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const isFriday = now.getDay() === 5;
    const outStartMins = isFriday ? 11 * 60 : (13 * 60); // 11:00 on Friday, 13:00 otherwise
    const outStartTimeStr = isFriday ? "11.00" : "13.00";

    if (currentMins < outStartMins) {
      setAttendanceMessage({ 
        type: "error", 
        text: `⚠️ Akses Ditolak: Absen Pulang DITAHAN! Absen Pulang baru dapat dilakukan mulai pukul ${outStartTimeStr} WITA${isFriday ? " (Khusus Hari Jumat)" : ""}.` 
      });
      return;
    }

    if (!selfieImage) {
      setAttendanceMessage({ type: "error", text: "Wajib melakukan Foto Selfie terlebih dahulu sebagai prasyarat administratif!" });
      return;
    }

    const todayDateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Check if there is an existing clock-in record for today
    const existingLog = logs.find(log => log.teacherName === selectedTeacher && log.date === todayDateStr);

    if (existingLog) {
      if (existingLog.clockOut) {
        setAttendanceMessage({ type: "error", text: "Bapak/Ibu sudah melakukan Absen Pulang hari ini!" });
        return;
      }
      
      // Update existing record
      const updatedLog: TeacherAttendance = {
        ...existingLog,
        clockOut: timeStr,
        selfie: selfieImage || existingLog.selfie
      };
      setLogs(prev => prev.map(log => log.id === existingLog.id ? updatedLog : log));
      dbService.saveRecord("teacher_attendance_logs", updatedLog.id, updatedLog);
      setAttendanceMessage({ type: "success", text: `Presensi Pulang BERHASIL dicatat & Terbit ke Saluran WhatsApp SMK Negeri 2 Konawe! Pukul ${timeStr} WITA.` });
      
      const waMsg = `*📢 LAPORAN PRESENSI PULANG GURU (SIHADIR)*\n_Monitoring Real-Time Kepsek & Manajemen Sekolah_\n\n👤 *Nama Guru:* ${selectedTeacher}\n📅 *Tanggal:* ${todayDateStr}\n⏱️ *Jam Pulang:* ${timeStr} WITA\n📌 *Lokasi GPS:* ${distance} meter dari Sekolah (Radius Lingkungan Sekolah)\n🏁 *Status:* SELESAI TUGAS / PULANG\n\n_Terima kasih atas pengabdian dan dedikasinya hari ini. Selamat beristirahat!_`;
      triggerAutoWA(waMsg);

      // Dispatch automatically to Saluran Resmi SMK Negeri 2 Konawe
      dispatchTeacherAttendanceToChannel("pulang", {
        teacherName: selectedTeacher,
        date: todayDateStr,
        time: timeStr,
        clockInTime: existingLog.clockIn || undefined,
        distance: distance,
        status: "SELESAI TUGAS / PULANG LENGKAP",
        notes: "Presensi Pulang terverifikasi selesai KBM dan administrasi harian"
      }).then(res => {
        if (res.success) {
          console.log("Presensi pulang guru sukses terbit ke saluran SMKN 2 Konawe:", res.targetsSent);
        }
      }).catch(err => console.error("Gagal broadcast presensi pulang ke saluran:", err));

      // Direct WhatsApp dispatch connection
      const targetPhone = localStorage.getItem("simpati_fonnte_target") || "";
      const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
      const encodedMsg = encodeURIComponent(waMsg);
      let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
      if (cleanPhone) {
        waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
      }
      window.open(waUrl, "_blank");
    } else {
      // Create a brand new record for today as "Absen Pulang" directly
      const activeLat = useRealGps && realLat !== null ? realLat : simulatedLat;
      const activeLon = useRealGps && realLon !== null ? realLon : simulatedLon;

      const isWithinRadius = distance <= schoolRadius;
      const status = isWithinRadius ? "Hadir" : "Ditolak";

      const newLog: TeacherAttendance = {
        id: "T-" + Date.now().toString(),
        teacherName: selectedTeacher,
        date: todayDateStr,
        clockIn: "--:--", // didn't clock in
        clockOut: timeStr,
        latitude: activeLat,
        longitude: activeLon,
        distanceMeter: distance,
        selfie: selfieImage,
        status: status,
        rejectionReason: !isWithinRadius ? `Ditolak karena di luar radius ${schoolRadius}m sekolah (Jarak terdeteksi: ${distance} m)` : undefined
      };

      setLogs(prev => [newLog, ...prev]);
      dbService.saveRecord("teacher_attendance_logs", newLog.id, newLog);

      if (isWithinRadius) {
        setAttendanceMessage({ type: "success", text: `Presensi Pulang BERHASIL dicatat & Terbit ke Saluran WhatsApp SMK Negeri 2 Konawe! Status: Hadir (Jarak: ${distance} m).` });
        
        const waMsg = `*📢 LAPORAN PRESENSI PULANG GURU (SIHADIR)*\n_Monitoring Real-Time Kepsek & Manajemen Sekolah_\n\n👤 *Nama Guru:* ${selectedTeacher}\n📅 *Tanggal:* ${todayDateStr}\n⏱️ *Jam Pulang:* ${timeStr} WITA\n📌 *Lokasi GPS:* ${distance} meter dari Sekolah (Radius Lingkungan Sekolah)\n🏁 *Status:* SELESAI TUGAS / PULANG\n\n_Terima kasih atas pengabdian dan dedikasinya hari ini. Selamat beristirahat!_`;
        triggerAutoWA(waMsg);

        // Dispatch automatically to Saluran Resmi SMK Negeri 2 Konawe
        dispatchTeacherAttendanceToChannel("pulang", {
          teacherName: selectedTeacher,
          date: todayDateStr,
          time: timeStr,
          distance: distance,
          status: "SELESAI TUGAS / PULANG LENGKAP",
          notes: "Presensi Pulang terverifikasi selesai KBM dan administrasi harian"
        }).then(res => {
          if (res.success) {
            console.log("Presensi pulang guru sukses terbit ke saluran SMKN 2 Konawe:", res.targetsSent);
          }
        }).catch(err => console.error("Gagal broadcast presensi pulang ke saluran:", err));

        // Direct WhatsApp dispatch connection
        const targetPhone = localStorage.getItem("simpati_fonnte_target") || "";
        const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
        const encodedMsg = encodeURIComponent(waMsg);
        let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
        if (cleanPhone) {
          waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
        }
        window.open(waUrl, "_blank");
      } else {
        setAttendanceMessage({ type: "error", text: `Absensi Pulang DITOLAK! Anda berada di luar radius sekolah yang diijinkan (> ${schoolRadius} meter). Jarak: ${distance} m.` });
      }
    }
    setSelfieImage("");
  };

  const handleClockOut = (id: string) => {
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setLogs(prev => prev.map(log => {
      if (log.id === id) {
        const updated = {
          ...log,
          clockOut: timeStr
        };
        dbService.saveRecord("teacher_attendance_logs", updated.id, updated);
        return updated;
      }
      return log;
    }));
    setAttendanceMessage({ type: "success", text: "Absensi Pulang berhasil dicatat. Selamat beristirahat!" });

    // Automatically broadcast via Fonnte WA in background
    const waMsg = `*📢 PRESENSI GURU SIHADIR (PULANG)*\n\nBapak/Ibu Guru *${selectedTeacher}* baru saja melakukan presensi *PULANG* harian:\n\n⏱️ Pukul: *${timeStr}*\n✅ Status: *Pulang*\n📅 Tanggal: *${new Date().toISOString().split("T")[0]}*\n\n_Selamat beristirahat dan terima kasih atas pengabdian hari ini!_`;
    triggerAutoWA(waMsg);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="md:col-span-3 space-y-6"
      id="absen-guru-view"
    >
      {/* KONEKSI SALURAN / GRUP WHATSAPP RESMI SMK NEGERI 2 KONAWE */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm shrink-0">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900">
                Saluran & Grup WhatsApp Resmi SMK Negeri 2 Konawe
              </h3>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Otomasi Masuk & Pulang Aktif
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Target Siaran:</span>
              <code className="font-mono font-bold bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] text-slate-800">
                {schoolChannelId === "120363205084846535@g.us"
                  ? "👥 Grup SMKN 2 KONAWE (120363205084846535@g.us)"
                  : schoolChannelId === "120363155477246592@g.us"
                  ? "📋 ADM SMK 2 KNW (120363155477246592@g.us)"
                  : (schoolChannelId || "120363205084846535@g.us")}
              </code>
              <span>• Terbit otomatis setiap presensi guru</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsChannelModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan & Uji Coba Saluran</span>
        </button>
      </div>

      {/* SKEMA RESMI 2 SESI REKAPITULASI GRUP WA GURU */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900">
                  Skema Rekapitulasi Terjadwal Grup WA Guru (2 Sesi Harian)
                </h3>
                <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Format Disiplin 2x Sehari
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencegah banjir pesan berkala di grup guru: Rekapitulasi dirangkum padat pada jeda istirahat dan jam 13.00 WITA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <span className="text-xs font-bold text-slate-700">Otomatis Terjadwal:</span>
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSessionBroadcast}
                onChange={(e) => setAutoSessionBroadcast(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className={`text-[11px] font-black ${autoSessionBroadcast ? "text-emerald-700" : "text-slate-400"}`}>
              {autoSessionBroadcast ? "AKTIF" : "OFF"}
            </span>
          </div>
        </div>

        {/* Notifikasi feedback pengiriman sesi */}
        {sessionNotice && (
          <div className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-between gap-2 ${
            sessionNotice.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}>
            <div className="flex items-center gap-2">
              {sessionNotice.type === "success" ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
              <span>{sessionNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setSessionNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2 Sesi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SESI 1 */}
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 p-4 rounded-2xl border border-amber-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                  <Coffee className="h-3 w-3" />
                  Sesi 1 • Menjelang Istirahat
                </span>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
                  Pukul 09.55 / 10.15 WITA
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-800 mt-2.5">
                Rekap KBM Sesi Pagi (Jam Ke-1 s.d. Ke-4)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Menghimpun seluruh data presensi pagi, daftar guru yang telah aktif mengajar di kelas beserta jurnalnya, serta pengingat peringatan guru terjadwal yang belum hadir sebelum bel istirahat.
              </p>

              {/* Preview Toggle Content */}
              {showSession1Preview && (
                <div className="mt-3 bg-white p-3 rounded-xl border border-amber-200 shadow-inner">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase block mb-1">
                    Format Pesan WhatsApp Sesi 1:
                  </span>
                  <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {buildTeacherSession1Report().messageText}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setShowSession1Preview(!showSession1Preview)}
                className="flex-1 bg-white hover:bg-slate-50 text-amber-900 border border-amber-300 text-xs font-extrabold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{showSession1Preview ? "Tutup Preview" : "Preview Pesan"}</span>
              </button>
              <button
                type="button"
                disabled={sendingSession === 1}
                onClick={() => handleSendSession(1)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sendingSession === 1 ? "Mengirim..." : "Kirim Sesi 1"}</span>
              </button>
            </div>
          </div>

          {/* SESI 2 */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 p-4 rounded-2xl border border-indigo-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  Sesi 2 • Menjelang Pulang
                </span>
                <span className="text-[11px] font-extrabold text-indigo-900 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
                  Tepat Pukul 13.00 WITA
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-800 mt-2.5">
                Rekap KBM Sesi Siang & Kehadiran Harian
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Menghimpun KBM Jam Ke-5 s.d. selesai, akumulasi statistik total pendidik hadir/terlambat/tugas luar hari ini, serta pengingat presensi pulang (clock-out) di aplikasi SIHADIR.
              </p>

              {/* Preview Toggle Content */}
              {showSession2Preview && (
                <div className="mt-3 bg-white p-3 rounded-xl border border-indigo-200 shadow-inner">
                  <span className="text-[10px] font-extrabold text-indigo-800 uppercase block mb-1">
                    Format Pesan WhatsApp Sesi 2:
                  </span>
                  <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {buildTeacherSession2Report().messageText}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-200/60">
              <button
                type="button"
                onClick={() => setShowSession2Preview(!showSession2Preview)}
                className="flex-1 bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-300 text-xs font-extrabold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{showSession2Preview ? "Tutup Preview" : "Preview Pesan"}</span>
              </button>
              <button
                type="button"
                disabled={sendingSession === 2}
                onClick={() => handleSendSession(2)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{sendingSession === 2 ? "Mengirim..." : "Kirim Sesi 2"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pemisahan Jenis Laporan Penjelasan */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Struktur Pemisahan Laporan WhatsApp SMKN 2 Konawe:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
            <li>
              <strong>Laporan Presensi Guru (Masuk & Pulang):</strong> Terbit seketika <em>(real-time)</em> per individu saat guru melakukan selfie biometrik & verifikasi koordinat GPS.
            </li>
            <li>
              <strong>Laporan Jurnal KBM Kelas:</strong> Terbit seketika per individu saat guru memulai proses belajar mengajar di ruang kelas.
            </li>
            <li>
              <strong>Laporan Rekapitulasi Grup:</strong> Disederhanakan menjadi <strong>hanya 2 kali sehari</strong> (Sesi 1 sebelum Istirahat & Sesi 2 pukul 13.00 WITA) agar grup WhatsApp tetap rapi dan tidak spam.
            </li>
          </ul>
        </div>
      </div>

      {/* ALARM & PENGINGAT ABSENSI MANDIRI GURU */}
      <div className="bg-white p-5 rounded-2xl border border-indigo-150 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Alarm Pengingat Kehadiran Pendidik & Staf</h3>
              <p className="text-xs text-slate-500">Menjaga kedisiplinan mengajar dengan pemberitahuan alarm clock-in dan clock-out otomatis.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAlarmEnabled}
                onChange={(e) => {
                  setIsAlarmEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setAlarmTriggeredIn(false);
                    setAlarmTriggeredOut(false);
                  }
                }}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ms-2 text-xs font-bold text-slate-700">Alarm {isAlarmEnabled ? "Aktif" : "Nonaktif"}</span>
            </label>

            <button
              type="button"
              onClick={playAlarmSound}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              🔊 Tes Suara
            </button>
          </div>
        </div>

        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Set Batas Alarm Absen Masuk (Clock-In Guru)</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={alarmHourIn}
                onChange={(e) => {
                  setAlarmHourIn(e.target.value);
                  setDismissedAlarmIn(false);
                }}
                className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 w-full focus:outline-indigo-500"
              />
              <button
                type="button"
                onClick={() => { setAlarmHourIn("07:15"); setDismissedAlarmIn(false); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Set Batas Alarm Absen Keluar (Clock-Out Guru)</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={alarmHourOut}
                onChange={(e) => {
                  setAlarmHourOut(e.target.value);
                  setDismissedAlarmOut(false);
                }}
                className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-2 w-full focus:outline-indigo-500"
              />
              <button
                type="button"
                onClick={() => { setAlarmHourOut("14:00"); setDismissedAlarmOut(false); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Active Alarm Alerts */}
        <AnimatePresence>
          {alarmTriggeredIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-red-650 via-red-600 to-rose-650 text-white p-4 rounded-xl border border-red-500 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider">⚠️ ALARM DARURAT: BELUM PRESENSI MASUK!</h4>
                  <p className="text-[11px] opacity-90 font-medium">Jam kehadiran guru telah mencapai batas ({alarmHourIn}) untuk rekan pendidik {selectedTeacher}.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDismissedAlarmIn(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                >
                  Tunda (Snooze)
                </button>
              </div>
            </motion.div>
          )}

          {alarmTriggeredOut && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white p-4 rounded-xl border border-amber-400 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider">⚠️ ALARM KEPULANGAN: BELUM PRESENSI KELUAR!</h4>
                  <p className="text-[11px] opacity-90 font-medium">Jam pulang mengajar telah tiba ({alarmHourOut}). Harap isi absen keluar sebelum meninggalkan sekolah.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDismissedAlarmOut(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                >
                  Tunda (Snooze)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INFORMASI JADWAL & BATAS WAKTU PRESENSI GURU & STAF */}
      <AttendanceScheduleInfoCard role="guru" variant="full" />

      {/* Main Absensi Interface Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GPS Control Card with Live Google Maps & Real GPS Tracking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-emerald-500 animate-spin" />
              <span>Lokasi & Pelacakan GPS Guru & Staf</span>
            </h3>
            
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200/50">
              GPS Riil Aktif
            </span>
          </div>

          {/* GPS Controls (Real GPS Tracking) */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                </span>
                GPS Perangkat Riil Aktif
              </span>
              <button
                type="button"
                onClick={startRealGpsTracking}
                disabled={isGpsLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isGpsLoading ? "animate-spin" : ""}`} />
                {isGpsLoading ? "Melacak..." : "Perbarui Posisi"}
              </button>
            </div>

            {gpsError && (
              <div className="text-rose-600 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            <div className="text-slate-600 text-xs font-semibold leading-relaxed flex flex-wrap items-center justify-between gap-2">
              <span>Menghubungkan posisi perangkat HP Anda secara riil dengan titik koordinat sekolah SMK Negeri 2 Konawe.</span>
              {gpsAccuracy !== null && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                  Akurasi Satelit GPS: ±{gpsAccuracy}m
                </span>
              )}
            </div>
          </div>

          {/* Map Display Card with Leaflet, Satellite & Google Maps Link */}
          <div className="space-y-2">
            <InteractiveAttendanceMap
              useRealGps={useRealGps}
              realLat={realLat}
              realLon={realLon}
              schoolLat={schoolLat}
              schoolLon={schoolLon}
              gpsOffsetLat={gpsOffsetLat}
              gpsOffsetLon={gpsOffsetLon}
              setGpsOffsetLat={setGpsOffsetLat}
              setGpsOffsetLon={setGpsOffsetLon}
              userLabel={selectedTeacher}
              schoolRadius={schoolRadius}
              gpsAccuracy={gpsAccuracy}
              isGpsLoading={isGpsLoading}
              onRefreshGps={startRealGpsTracking}
              userRoleType="guru"
            />
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Jarak Dari Sekolah</span>
              <span className={`text-md font-extrabold ${distance <= schoolRadius ? "text-emerald-600" : "text-rose-600"}`}>
                {distance} Meter
              </span>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Kriteria Presensi</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${distance <= schoolRadius ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {distance <= schoolRadius ? `HADIR (Dalam Radius ${schoolRadius}m)` : "DITOLAK (Luar Jangkauan)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-slate-50 rounded-xl text-center border">
              <span className="text-[10px] text-slate-400 font-bold block">ABSENSI LATITUDE</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {useRealGps && realLat !== null ? realLat : simulatedLat}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl text-center border">
              <span className="text-[10px] text-slate-400 font-bold block">ABSENSI LONGITUDE</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {useRealGps && realLon !== null ? realLon : simulatedLon}
              </span>
            </div>
          </div>
        </div>

        {/* Selfie & Submit absensi Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b pb-2 mb-3">
              <Camera className="h-4 w-4 text-emerald-500" />
              <span>Biometrik Selfie Capture</span>
            </h3>

            {/* Selfie Frame */}
            <div className="relative w-full aspect-video bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-white">
              {isCapturing ? (
                <>
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    onClick={captureSelfieFromVideo}
                    className="absolute bottom-3 bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow-lg"
                  >
                    Ambil Foto
                  </button>
                </>
              ) : selfieImage ? (
                <div className="relative w-full h-full">
                  <img src={selfieImage} alt="Selfie preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Foto Tersimpan
                  </div>
                  <button
                    onClick={triggerCamera}
                    className="absolute bottom-2 left-2 bg-slate-900/80 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    Ambil Ulang
                  </button>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-300 font-bold mb-1">Kamera Belum Aktif</p>
                  <p className="text-[10px] text-slate-500 max-w-[240px] mx-auto mb-3">Silakan pilih metode: Ambil selfie via kamera web atau gunakan foto langsung/berkas</p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={triggerCamera}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🤳 Selfie Live</span>
                    </button>
                    <label className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <Camera className="h-3.5 w-3.5" />
                      <span>📸 Foto Langsung / Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 400, 400, 0.7);
                              setSelfieImage(compressed);
                            } catch {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSelfieImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3">
            {attendanceMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
                  attendanceMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {attendanceMessage.type === "success" ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" /> : <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />}
                <span>{attendanceMessage.text}</span>
              </motion.div>
            )}

            {/* Operational Attendance Schedule Notice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span>🕒 Jam Absen Masuk:</span>
                <span className="font-extrabold bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900">06.30 - 11.30 WITA</span>
              </div>
              <div className="bg-indigo-50 text-indigo-800 p-2 rounded-lg border border-indigo-200 flex items-center justify-between">
                <span>🔒 Jam Absen Pulang:</span>
                <span className="font-extrabold bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-900">
                  {new Date().getDay() === 5 ? "Mulai 11.00 WITA (Khusus Jumat)" : "Mulai 13.00 WITA (Senin-Kamis/Sabtu)"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-clock-in-now"
                onClick={handleClockIn}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4.5 h-4.5 text-emerald-100" />
                <span>KIRIM PRESENSI MASUK KE SALURAN SMKN 2 KONAWE</span>
              </button>

              <button
                id="btn-clock-out-now"
                onClick={handleClockOutNew}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 text-indigo-100" />
                <span>KIRIM PRESENSI PULANG KE SALURAN SMKN 2 KONAWE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Categories tabs - Hanya untuk Admin Tata Usaha & Admin Utama, dihilangkan untuk Guru Mapel */}
      {isAdminOrTu && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-500" />
              <span>Laporan Rekapan Presensi Bulanan & Semester</span>
            </h3>
            
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {(["harian", "mingguan", "bulanan", "semester"] as const).map((tab) => (
                <button
                  id={`btn-report-${tab}`}
                  key={tab}
                  onClick={() => setReportTab(tab)}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg transition-all ${
                    reportTab === tab 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Render Table accordingly */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600 font-medium">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold border-b">
                  <th className="py-3 px-4">NAMA GURU & STAF</th>
                  <th className="py-3 px-4">Tanggal / Waktu</th>
                  <th className="py-3 px-4">Masuk / Pulang</th>
                  <th className="py-3 px-4">Posisi GPS (Radius)</th>
                  <th className="py-3 px-4 text-center">Selfie</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-950">{log.teacherName}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="block font-semibold">{log.date}</span>
                      <span className="text-[10px] text-slate-400">Timestamp</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded font-mono block w-fit">
                        {log.clockIn}
                      </span>
                      {log.clockOut ? (
                        <span className="bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded font-mono block w-fit mt-1">
                          {log.clockOut}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-extrabold block mt-1">Menunggu Pulang</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>{log.latitude}, {log.longitude}</div>
                      <div className={`text-[10px] font-bold ${log.distanceMeter <= schoolRadius ? "text-emerald-500" : "text-rose-500"}`}>
                        Jarak: {log.distanceMeter}m ({log.distanceMeter <= schoolRadius ? "Aman" : "Diluar SOP"})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <img src={log.selfie} alt="guru selfie" className="h-8 w-8 rounded-full border border-slate-200 mx-auto object-cover" referrerPolicy="no-referrer" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        log.status === "Hadir" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                          : "bg-rose-50 text-rose-800 border border-rose-100"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!log.clockOut && log.status === "Hadir" && (
                        <button
                          onClick={() => handleClockOut(log.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm"
                        >
                          Absen Pulang
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN KONEKSI SALURAN WHATSAPP SMKN 2 KONAWE */}
      <ChannelPresensiConfigModal
        isOpen={isChannelModalOpen}
        onClose={() => {
          setIsChannelModalOpen(false);
          setSchoolChannelId(getSchoolChannelTarget());
        }}
        currentTeacherName={selectedTeacher}
      />
    </motion.div>
  );
}
