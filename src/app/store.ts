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
  employeeComments: string;
  reviewerComments: string;
  employeeSignature: string | null;
  reviewerSignature: string | null;
  employeeSignDate: string;
  reviewerSignDate: string;
}

const KEY = "emerge_appraisals";

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
}

export function deleteSubmission(id: string): void {
  const filtered = getSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function replaceSubmission(id: string, s: Submission): void {
  const all = getSubmissions().map((existing) => existing.id === id ? s : existing);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getSubmission(id: string): Submission | undefined {
  return getSubmissions().find((s) => s.id === id);
}

export function findSubmissionByName(name: string): Submission | undefined {
  return getSubmissions().find((s) => s.employeeName.trim().toLowerCase() === name.trim().toLowerCase());
}
