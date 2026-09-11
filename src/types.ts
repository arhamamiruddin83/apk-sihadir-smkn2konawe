/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  nuptk: string;
  subject: string;
  classes: string[];
  role: string;
  whatsApp: string;
  email: string;
  birthPlace?: string;
  birthDate?: string;
  birthInfo?: string;
  additionalDuty?: string[];
  photoUrl?: string;
  qrCode?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  className: string;
  major: string;
  parentName: string;
  whatsApp: string;
  parentWhatsApp: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  religion?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  statusActive?: string;
  photoUrl?: string;
  qrCode?: string;
}

export interface CurriculumDoc {
  id: string;
  type: "CP" | "ATP" | "TP" | "SOP" | "TATATERTIB" | "PKL_DOC";
  code: string;
  title: string;
  content: string;
  sourceDocument: string;
}

export interface ModulAjar {
  identitas: {
    namaPenyusun: string;
    sekolah: string;
    tahunPelajaran: string;
    jenjang: string;
    mataPelajaran: string;
    kelas: string;
    alokasiWaktu: string;
  };
  kompetensiAwal: string;
  profilPancasila: string[];
  saranaPrasarana: string;
  targetPesertaDidik: string;
  modelPembelajaran: string;
  pendekatanPembelajaran: string;
  tujuanPembelajaran: string[];
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  kegiatanPembelajaran: {
    pendahuluan: string;
    inti: string;
    penutup: string;
  };
  asesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
  };
  pengayaanRemedial: {
    pengayaan: string;
    remedial: string;
  };
  refleksi: {
    guru: string;
    murid: string;
  };
  lkpd: string;
}

export interface JurnalMengajar {
  id: string;
  date: string;
  teacherName?: string;
  subject: string;
  className: string;
  tpCode: string;
  material: string;
  attendancePresent: number;
  attendanceAbsent: string[]; // names list of absent students
  activities: string;
  reflectionGuru: string;
  obstacles: string;
  followUp: string;
  createdAt: string;
  documentationPhoto?: string;
  shortReflection?: string;
  scheduleTime?: string;
  modulAjar?: string;
  points?: number;
  kataKunci?: string;
}

export interface StudentScore {
  studentId: string;
  studentName: string;
  tugas: number;
  praktik: number;
  projek: number;
  ph: number; // Penilaian Harian
  pts: number; // Penilaian Tengah Semester
  pas: number; // Penilaian Akhir Semester
  rataRata: number;
  lulus: boolean;
  remedialRecommendation: string;
}

export interface StudentKarakter {
  studentId: string;
  studentName: string;
  kejujuran: number; // 1 to 5 stars
  disiplin: number;
  tanggungJawab: number;
  kerjaSama: number;
  kepedulian: number;
  kemandirian: number;
  kepemimpinan: number;
  ringkasanKarakter: string;
  kelebihan: string;
  areaPengembangan: string;
  saranPembinaan: string;
}

export interface PklLog {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  activityPhoto: string;
  journalText: string;
  status: "Belum Diperiksa" | "Sesuai" | "Perlu Pembinaan";
  industriFeedback: string;
  nilaiIndustri: number; // 0 to 100
}

export interface TeacherAttendance {
  id: string;
  teacherName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  latitude: number;
  longitude: number;
  distanceMeter: number;
  selfie: string;
  status: "Hadir" | "Ditolak" | "Izin" | "Sakit";
  rejectionReason?: string;
}

export interface TeachingSchedule {
  id: string;
  teacherId: string;
  teacherCode?: string;
  teacherName: string;
  subject: string;
  className: string;
  day: string;
  period: string;
  semester: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderRoleTitle?: string;
  senderAvatar?: string;
  senderClass?: string;
  text: string;
  attachmentUrl?: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  readBy?: string[];
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface ChatChannel {
  id: string;
  type: "group" | "direct";
  name: string;
  description?: string;
  avatar?: string;
  roleBadge?: string;
  participantIds?: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  category: "all" | "group" | "teacher" | "student";
  subCategory?: "kelas_wali" | "guru_wali" | "tu" | "umum" | "custom" | "guru_staff";
  targetClass?: string;
  assignedStudents?: string[];
  createdBy?: string;
  createdAt?: number;
}

