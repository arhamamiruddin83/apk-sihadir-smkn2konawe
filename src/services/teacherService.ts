/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Teacher } from "../types";
import { MOCK_TEACHERS } from "../mockData";
import { dbService } from "../firebase";

const TEACHERS_STORAGE_KEY = "simpati_teachers_list";
const BACKUP_TEACHERS_KEY = "sihadir_master_teachers";
const PHOTO_KEY_PREFIX = "sihadir_photo_teacher_";

/**
 * Normalizes name for matching and key generation
 */
export function cleanTeacherName(rawName: string): string {
  if (!rawName) return "";
  return rawName
    .toLowerCase()
    .replace(/,?\s*(s\.pd|m\.pd|st|drs|h\.|mat|se|s\.si|\([^)]*\))/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Normalizes NIP (removes spaces/dashes)
 */
export function cleanNip(rawNip: string): string {
  if (!rawNip) return "";
  return rawNip.replace(/[^0-9]/g, "");
}

/**
 * Retrieve any cached photo for a teacher by ID, Name, NIP, or username
 */
export function getTeacherPhoto(identifier: string): string {
  if (!identifier) return "";
  const cleanId = identifier.trim();
  const cleanKey = cleanTeacherName(cleanId);
  const cleanNipKey = cleanNip(cleanId);

  // 1. Check dedicated photo keys
  const byId = localStorage.getItem(`${PHOTO_KEY_PREFIX}${cleanId}`);
  if (byId) return byId;

  if (cleanKey) {
    const byName = localStorage.getItem(`${PHOTO_KEY_PREFIX}${cleanKey}`);
    if (byName) return byName;
  }

  // 2. Check profile keys
  if (cleanKey) {
    const profileRaw = localStorage.getItem(`sihadir_teacher_profile_${cleanKey}`);
    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw);
        if (parsed?.photoUrl) return parsed.photoUrl;
      } catch (e) {}
    }
  }

  // 3. Check master teachers list in localStorage
  const saved = localStorage.getItem(TEACHERS_STORAGE_KEY) || localStorage.getItem(BACKUP_TEACHERS_KEY);
  if (saved) {
    try {
      const list: Teacher[] = JSON.parse(saved);
      if (Array.isArray(list)) {
        const found = list.find(t => {
          if (!t) return false;
          if (t.id && t.id.toLowerCase() === cleanId.toLowerCase()) return true;
          if (cleanKey && cleanTeacherName(t.name) === cleanKey) return true;
          if (cleanNipKey && cleanNip(t.nip) === cleanNipKey) return true;
          return false;
        });
        if (found?.photoUrl) return found.photoUrl;
      }
    } catch (e) {}
  }

  // 4. Check active global photo if matching active teacher
  const globalPhoto = localStorage.getItem("sihadir_active_teacher_photo");
  if (globalPhoto) return globalPhoto;

  return "";
}

/**
 * Scan all localStorage keys to recover any previously uploaded teacher photos
 */
export function scanAndRecoverPhotos(currentList?: Teacher[]): Teacher[] {
  let listToScan = currentList;
  if (!listToScan) {
    const saved = localStorage.getItem(TEACHERS_STORAGE_KEY) || localStorage.getItem(BACKUP_TEACHERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          listToScan = parsed;
        }
      } catch (e) {}
    }
  }
  if (!listToScan) {
    listToScan = [...MOCK_TEACHERS];
  }

  let hasRecoveries = false;
  const updated = listToScan.map(t => {
    if (t.photoUrl && t.photoUrl.startsWith("data:image")) {
      // Ensure dedicated key exists
      try {
        localStorage.setItem(`${PHOTO_KEY_PREFIX}${t.id}`, t.photoUrl);
        const cName = cleanTeacherName(t.name);
        if (cName) localStorage.setItem(`${PHOTO_KEY_PREFIX}${cName}`, t.photoUrl);
      } catch (e) {}
      return t;
    }

    // Try finding photo in dedicated keys
    const photo = getTeacherPhoto(t.id) || getTeacherPhoto(t.name) || (t.nip ? getTeacherPhoto(t.nip) : "");
    if (photo && photo.startsWith("data:image")) {
      hasRecoveries = true;
      return { ...t, photoUrl: photo };
    }

    return t;
  });

  if (hasRecoveries) {
    try {
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(BACKUP_TEACHERS_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  return updated;
}

/**
 * Load all teachers safely merging MOCK_TEACHERS with persistent data
 * NEVER drops user changes, custom teachers, or photos!
 */
export function getAllTeachers(): Teacher[] {
  let list: Teacher[] = [];
  const saved = localStorage.getItem(TEACHERS_STORAGE_KEY) || localStorage.getItem(BACKUP_TEACHERS_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    } catch (e) {
      console.error("Error reading teachers from localStorage:", e);
    }
  }

  if (list.length === 0) {
    list = [...MOCK_TEACHERS];
  } else {
    // Merge any missing official mock teachers without overwriting existing data
    const existingIds = new Set(list.map(t => t.id));
    const existingNames = new Set(list.map(t => cleanTeacherName(t.name)));

    MOCK_TEACHERS.forEach(mock => {
      const cName = cleanTeacherName(mock.name);
      if (!existingIds.has(mock.id) && !existingNames.has(cName)) {
        list.push(mock);
      } else {
        // Enforce QR Code and baseline official data if missing on existing item
        const existingIdx = list.findIndex(t => t.id === mock.id || cleanTeacherName(t.name) === cName);
        if (existingIdx > -1) {
          const item = list[existingIdx];
          let changed = false;
          const mergedItem = { ...item };
          if (!mergedItem.qrCode && mock.qrCode) {
            mergedItem.qrCode = mock.qrCode;
            changed = true;
          }
          if (!mergedItem.nip && mock.nip) {
            mergedItem.nip = mock.nip;
            changed = true;
          }
          if (changed) {
            list[existingIdx] = mergedItem;
          }
        }
      }
    });
  }

  // Recover any photos
  list = scanAndRecoverPhotos(list);

  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(BACKUP_TEACHERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save merged teachers list to localStorage:", e);
  }

  return list;
}

/**
 * Save / Update a single teacher record across both localStorage & Firebase Firestore
 */
export async function saveTeacherRecord(teacher: Teacher): Promise<boolean> {
  if (!teacher || !teacher.name) return false;

  const teacherId = teacher.id || `T${Date.now()}`;
  const preparedTeacher: Teacher = {
    ...teacher,
    id: teacherId,
    name: teacher.name.trim()
  };

  // 1. If photo is present, backup to dedicated photo keys immediately
  if (preparedTeacher.photoUrl && preparedTeacher.photoUrl.startsWith("data:image")) {
    try {
      localStorage.setItem(`${PHOTO_KEY_PREFIX}${teacherId}`, preparedTeacher.photoUrl);
      const cName = cleanTeacherName(preparedTeacher.name);
      if (cName) {
        localStorage.setItem(`${PHOTO_KEY_PREFIX}${cName}`, preparedTeacher.photoUrl);
        // Also sync to teacher profile key for active user
        const existingProfRaw = localStorage.getItem(`sihadir_teacher_profile_${cName}`);
        let profObj: any = {};
        if (existingProfRaw) {
          try { profObj = JSON.parse(existingProfRaw); } catch (e) {}
        }
        profObj.photoUrl = preparedTeacher.photoUrl;
        profObj.fullName = preparedTeacher.name;
        profObj.nip = preparedTeacher.nip || profObj.nip;
        profObj.subject = preparedTeacher.subject || profObj.subject;
        localStorage.setItem(`sihadir_teacher_profile_${cName}`, JSON.stringify(profObj));
      }
    } catch (e) {
      console.warn("Could not cache photo to dedicated key:", e);
    }
  }

  // 2. Update local master list
  const currentTeachers = getAllTeachers();
  const index = currentTeachers.findIndex(t => 
    t.id === teacherId || 
    cleanTeacherName(t.name) === cleanTeacherName(preparedTeacher.name) ||
    (t.nip && cleanNip(t.nip) === cleanNip(preparedTeacher.nip))
  );

  let updatedList: Teacher[];
  if (index > -1) {
    // Preserve existing photo if incoming one is empty
    if (!preparedTeacher.photoUrl && currentTeachers[index].photoUrl) {
      preparedTeacher.photoUrl = currentTeachers[index].photoUrl;
    }
    updatedList = [...currentTeachers];
    updatedList[index] = { ...currentTeachers[index], ...preparedTeacher };
  } else {
    updatedList = [...currentTeachers, preparedTeacher];
  }

  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(BACKUP_TEACHERS_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error("Failed to write teachers list to localStorage:", e);
  }

  // 3. Persist to Firebase Firestore for Cloud Synchronization
  try {
    await dbService.saveRecord("master_teachers", teacherId, preparedTeacher);
  } catch (cloudErr) {
    console.warn("Firebase saveRecord for master_teachers error (falling back to local):", cloudErr);
  }

  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("sihadir_data_updated"));

  return true;
}

/**
 * Save teacher profile from TeacherDashboard (updates both profile & master teachers list)
 */
export async function syncTeacherProfileUpdate(
  username: string, 
  profile: {
    fullName: string;
    nip: string;
    subject: string;
    photoUrl?: string;
    classesTaught?: string;
    whatsapp?: string;
    address?: string;
    birthInfo?: string;
    additionalDuty?: string[];
  }
): Promise<void> {
  const cleanU = (username || "").trim().toLowerCase();
  const profileKey = `sihadir_teacher_profile_${cleanU || "default"}`;
  
  // 1. Save profile key
  try {
    localStorage.setItem(profileKey, JSON.stringify(profile));
    if (cleanU) {
      localStorage.setItem(`sihadir_teacher_profile_${cleanU}`, JSON.stringify(profile));
    }
  } catch (e) {}

  // 2. If photo is present, backup to dedicated photo keys
  if (profile.photoUrl) {
    try {
      localStorage.setItem("sihadir_active_teacher_photo", profile.photoUrl);
      if (cleanU) localStorage.setItem(`${PHOTO_KEY_PREFIX}${cleanU}`, profile.photoUrl);
      const cName = cleanTeacherName(profile.fullName);
      if (cName) localStorage.setItem(`${PHOTO_KEY_PREFIX}${cName}`, profile.photoUrl);
    } catch (e) {}
  }

  // 3. Find and update in master teachers
  const currentTeachers = getAllTeachers();
  const cProfName = cleanTeacherName(profile.fullName);
  const cNip = cleanNip(profile.nip);

  const matched = currentTeachers.find(t => 
    (cleanU && cleanTeacherName(t.name).includes(cleanU)) ||
    (cProfName && cleanTeacherName(t.name) === cProfName) ||
    (cNip && cleanNip(t.nip) === cNip)
  );

  if (matched) {
    const updatedTeacher: Teacher = {
      ...matched,
      name: profile.fullName || matched.name,
      nip: profile.nip || matched.nip,
      subject: profile.subject || matched.subject,
      photoUrl: profile.photoUrl || matched.photoUrl || getTeacherPhoto(matched.id) || "",
      whatsApp: profile.whatsapp || matched.whatsApp,
      additionalDuty: profile.additionalDuty || matched.additionalDuty
    };
    await saveTeacherRecord(updatedTeacher);
  } else {
    // Create new teacher record if not exists
    const newTeacher: Teacher = {
      id: `T${Date.now()}`,
      name: profile.fullName || username,
      nip: profile.nip || "",
      nuptk: "",
      subject: profile.subject || "Guru Mata Pelajaran",
      classes: profile.classesTaught ? profile.classesTaught.split(",").map(c => c.trim()) : ["XI TKR A"],
      role: profile.additionalDuty?.[0] || "Guru",
      whatsApp: profile.whatsapp || "",
      email: "",
      photoUrl: profile.photoUrl || "",
      additionalDuty: profile.additionalDuty
    };
    await saveTeacherRecord(newTeacher);
  }
}

/**
 * Subscribe to realtime teacher updates across Firestore and localStorage
 */
export function subscribeTeacherRecords(onUpdate: (teachers: Teacher[]) => void): () => void {
  // 1. Provide current list immediately
  const initial = getAllTeachers();
  onUpdate(initial);

  // 2. Realtime listener for Firestore "master_teachers"
  const unsubFirestore = dbService.subscribeRecords("master_teachers", (cloudRecords) => {
    if (cloudRecords && cloudRecords.length > 0) {
      const localList = getAllTeachers();
      const localMap = new Map(localList.map(t => [t.id, t]));

      // Merge cloud records without erasing local photos if cloud had empty photo
      cloudRecords.forEach((cr: any) => {
        const local = localMap.get(cr.id);
        const resolvedPhoto = cr.photoUrl || local?.photoUrl || getTeacherPhoto(cr.id) || getTeacherPhoto(cr.name) || "";
        const merged: Teacher = {
          ...cr,
          photoUrl: resolvedPhoto
        };
        localMap.set(cr.id, merged);

        // If local had a photo that cloud lacked, sync it back to cloud
        if (!cr.photoUrl && resolvedPhoto) {
          dbService.saveRecord("master_teachers", cr.id, { ...cr, photoUrl: resolvedPhoto });
        }
      });

      const mergedList = Array.from(localMap.values());
      try {
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(mergedList));
        localStorage.setItem(BACKUP_TEACHERS_KEY, JSON.stringify(mergedList));
      } catch (e) {}

      onUpdate(mergedList);
    }
  });

  // 3. Local storage listener
  const handleLocalChange = () => {
    const fresh = getAllTeachers();
    onUpdate(fresh);
  };

  window.addEventListener("storage", handleLocalChange);
  window.addEventListener("sihadir_data_updated", handleLocalChange);

  return () => {
    unsubFirestore();
    window.removeEventListener("storage", handleLocalChange);
    window.removeEventListener("sihadir_data_updated", handleLocalChange);
  };
}
