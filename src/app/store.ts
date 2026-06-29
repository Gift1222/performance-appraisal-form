export interface KRA {
  name: string;
  description: string;
  rating: string;
  comment: string;
}

export interface Dimension {
  letter: string;
  title: string;
  objective: string;
  kras: KRA[];
}

export interface CoreValue {
  name: string;
  example: string;
  rating: string;
  comment: string;
}

export interface DevPlanRow {
  area: string;
  action: string;
  timeline: string;
  support: string;
}

export interface Feedback360 {
  supervisorStrengths: string;
  supervisorImprovements: string;
  peerStrengths: string;
  peerImprovements: string;
  directReportStrengths: string;
  directReportImprovements: string;
}

export interface Submission {
  id: string;
  submittedAt: string;
  employeeId: string;
  employeeName: string;
  position: string;
  reviewPeriod: string;
  appraisalDate: string;
  reviewers: string;
  dimensions: Dimension[];
  coreValues: CoreValue[];
  overallRating: string;
  achievements: string[];
  developments: string[];
  devPlan: DevPlanRow[];
  feedback360?: Feedback360;
  employeeComments: string;
  reviewerComments: string;
  employeeSignature: string | null;
  reviewerSignature: string | null;
  employeeSignDate: string;
  reviewerSignDate: string;
}

export interface PeerFeedback {
  id: string;
  role: string;
  strengths: string;
  improvements: string;
  submittedAt: string;
}

const KEY = "emerge_appraisals";
const PEER_KEY = "emerge_peer_feedbacks";

import {
  pushSubmissionToSupabase,
  deleteSubmissionFromSupabase,
  fetchSubmissionsFromSupabase,
  getSupabaseClient
} from "./supabase";

export function getSubmissions(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSubmission(s: Submission): void {
  const all = getSubmissions();
  all.push(s);
  localStorage.setItem(KEY, JSON.stringify(all));

  // Background push to Supabase
  pushSubmissionToSupabase(s).catch((err) => {
    console.error("Async Supabase save error:", err);
  });
}

export function deleteSubmission(id: string): void {
  const filtered = getSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));

  // Background delete from Supabase
  deleteSubmissionFromSupabase(id).catch((err) => {
    console.error("Async Supabase delete error:", err);
  });
}

export function replaceSubmission(id: string, s: Submission): void {
  const all = getSubmissions().map((existing) => existing.id === id ? s : existing);
  localStorage.setItem(KEY, JSON.stringify(all));

  // Background push to Supabase
  pushSubmissionToSupabase(s).catch((err) => {
    console.error("Async Supabase replace error:", err);
  });
}

export function getSubmission(id: string): Submission | undefined {
  return getSubmissions().find((s) => s.id === id);
}

export function findSubmissionByName(name: string): Submission | undefined {
  return getSubmissions().find((s) => s.employeeName.trim().toLowerCase() === name.trim().toLowerCase());
}

// ─── Peer Feedback Store Logic ───────────────────────────────────────────────

export function getPeerFeedbacks(): PeerFeedback[] {
  try {
    return JSON.parse(localStorage.getItem(PEER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePeerFeedbackLocal(pf: PeerFeedback): void {
  const all = getPeerFeedbacks();
  all.push(pf);
  localStorage.setItem(PEER_KEY, JSON.stringify(all));
}

export function getPeerFeedbackForRole(role: string): { strengths: string; improvements: string } {
  const list = getPeerFeedbacks().filter(
    (item) => item.role.trim().toLowerCase() === role.trim().toLowerCase()
  );
  if (list.length === 0) {
    return { strengths: "", improvements: "" };
  }
  // Combine all entries
  const strengthsList = list.map((item) => item.strengths.trim()).filter(Boolean);
  const improvementsList = list.map((item) => item.improvements.trim()).filter(Boolean);

  return {
    strengths: strengthsList.join("\n\n---\n\n"),
    improvements: improvementsList.join("\n\n---\n\n"),
  };
}

export async function savePeerFeedback(role: string, strengths: string, improvements: string): Promise<void> {
  const pf: PeerFeedback = {
    id: crypto.randomUUID(),
    role,
    strengths,
    improvements,
    submittedAt: new Date().toISOString(),
  };
  savePeerFeedbackLocal(pf);
}

/**
 * Sync logic: bidirectional synchronization between LocalStorage and Supabase.
 * Pushes new local objects to cloud, and pulls missing objects from cloud into local cache.
 */
export async function syncWithSupabase(): Promise<Submission[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.log("Supabase is not configured yet. Offline mode active.");
    return getSubmissions();
  }

  try {
    // 1. Sync Appraisal Submissions
    const remote = await fetchSubmissionsFromSupabase();
    const local = getSubmissions();

    const localMap = new Map(local.map((s) => [s.id, s]));
    const remoteMap = new Map(remote.map((s) => [s.id, s]));

    let modified = false;

    for (const rSub of remote) {
      const lSub = localMap.get(rSub.id);
      if (!lSub) {
        local.push(rSub);
        modified = true;
      } else if (rSub.submittedAt > lSub.submittedAt) {
        const idx = local.findIndex((item) => item.id === rSub.id);
        if (idx !== -1) {
          local[idx] = rSub;
          modified = true;
        }
      }
    }

    for (const lSub of local) {
      if (!remoteMap.has(lSub.id)) {
        await pushSubmissionToSupabase(lSub);
      }
    }

    if (modified) {
      localStorage.setItem(KEY, JSON.stringify(local));
    }

  } catch (err) {
    console.error("Synchronization error:", err);
  }

  return getSubmissions();
}

