-- ─────────────────────────────────────────────────────────────────────────────
-- EMERGE LIVELIHOODS - SUPABASE DATABASE SCHEMA
-- Run this SQL command in your Supabase SQL Editor to create the tables.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  "submittedAt" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  position TEXT NOT NULL,
  "reviewPeriod" TEXT NOT NULL,
  "appraisalDate" TEXT NOT NULL,
  reviewers TEXT NOT NULL,
  "overallRating" TEXT NOT NULL,
  "employeeComments" TEXT,
  "reviewerComments" TEXT,
  "employeeSignature" TEXT,
  "reviewerSignature" TEXT,
  "employeeSignDate" TEXT NOT NULL,
  "reviewerSignDate" TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  "coreValues" JSONB NOT NULL,
  achievements JSONB NOT NULL,
  developments JSONB NOT NULL,
  "devPlan" JSONB NOT NULL,
  "feedback360" JSONB
);

-- Enable Row Level Security (RLS) so the table is managed, and allow public reads/writes
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Allow full access (Select, Insert, Update, Delete) to all users
DROP POLICY IF EXISTS "Allow public select, insert, update, delete" ON submissions;
CREATE POLICY "Allow public select, insert, update, delete"
ON submissions
FOR ALL
USING (true)
WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- PEER FEEDBACKS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS peer_feedbacks (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  strengths TEXT NOT NULL,
  improvements TEXT NOT NULL,
  "submittedAt" TEXT NOT NULL
);

-- Enable Row Level Security (RLS) and allow public reads/writes
ALTER TABLE peer_feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public peer feedbacks select, insert, update, delete" ON peer_feedbacks;
CREATE POLICY "Allow public peer feedbacks select, insert, update, delete"
ON peer_feedbacks
FOR ALL
USING (true)
WITH CHECK (true);

