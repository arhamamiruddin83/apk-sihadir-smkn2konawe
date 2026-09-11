// Utility for auto-pruning / auto-deleting real-time activity signals & school logs older than 3 weeks (21 days)

export const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000; // 21 days in milliseconds

/**
 * Checks if a given date string (YYYY-MM-DD, ISO, etc.) or timestamp is older than 21 days (3 weeks).
 */
export function isLogOlderThan3Weeks(dateOrTs?: string | number): boolean {
  if (!dateOrTs) return false;
  let logTime = 0;
  if (typeof dateOrTs === "number") {
    logTime = dateOrTs;
  } else {
    const parsed = Date.parse(dateOrTs);
    if (isNaN(parsed)) return false;
    logTime = parsed;
  }
  const now = Date.now();
  return (now - logTime) > THREE_WEEKS_MS;
}

/**
 * Prunes an array of items, removing any item whose date is older than 3 weeks (21 days).
 */
export function pruneItemsOlderThan3Weeks<T>(
  items: T[],
  getDateFn: (item: T) => string | number | undefined
): { items: T[]; removedCount: number } {
  let removedCount = 0;
  const filtered = items.filter((item) => {
    const d = getDateFn(item);
    if (d && isLogOlderThan3Weeks(d)) {
      removedCount++;
      return false; // Remove expired item
    }
    return true; // Keep
  });
  return { items: filtered, removedCount };
}

/**
 * Performs auto-clean of all real-time activity and attendance logs in localStorage
 * that have been stored for more than 3 weeks (21 days).
 */
export function autoPruneAllStorageLogs(): number {
  let totalRemoved = 0;

  // 1. Teacher Attendance
  try {
    const raw = localStorage.getItem("simpati_teacher_attendance_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_teacher_attendance_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune teacher logs error:", e);
  }

  // 2. Jurnal Mengajar
  try {
    const raw = localStorage.getItem("simpati_jurnal_mengajar_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_jurnal_mengajar_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune journal logs error:", e);
  }

  // 3. Saved Student Attendance Logs
  try {
    const raw = localStorage.getItem("simpati_saved_attendance_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_saved_attendance_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune student logs error:", e);
  }

  // 4. Student Self Attendance Logs
  try {
    const raw = localStorage.getItem("simpati_student_self_attendance");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_student_self_attendance", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune self attendance logs error:", e);
  }

  // 5. BK Counseling
  try {
    const raw = localStorage.getItem("simpati_bk_counseling_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_bk_counseling_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune BK logs error:", e);
  }

  // 6. Ketua Kelas Reports
  try {
    const raw = localStorage.getItem("sihadir_ketua_kelas_reports");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp || l.created_at);
        if (removedCount > 0) {
          localStorage.setItem("sihadir_ketua_kelas_reports", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune ketua kelas reports error:", e);
  }

  // 7. Guru Piket Logs
  try {
    const raw = localStorage.getItem("simpati_guru_piket_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_guru_piket_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune guru piket logs error:", e);
  }

  // 8. Guru Wali Logs
  try {
    const raw = localStorage.getItem("simpati_guru_wali_logs");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_guru_wali_logs", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune guru wali logs error:", e);
  }

  // 9. Student Reflections
  try {
    const raw = localStorage.getItem("simpati_student_reflections");
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) {
        const { items, removedCount } = pruneItemsOlderThan3Weeks(logs, l => l.date || l.timestamp);
        if (removedCount > 0) {
          localStorage.setItem("simpati_student_reflections", JSON.stringify(items));
          totalRemoved += removedCount;
        }
      }
    }
  } catch (e) {
    console.error("Auto-prune reflections error:", e);
  }

  return totalRemoved;
}
