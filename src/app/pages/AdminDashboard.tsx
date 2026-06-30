import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getSubmissions, deleteSubmission, syncWithSupabase, getPeerFeedbacks, deletePeerFeedback } from "../store";
import type { Submission, PeerFeedback } from "../store";
import { getSupabaseClient } from "../supabase";

const TEAL = "#4C808A";
const NAVY = "#16294A";

const InterventionIcon = () => (
  <img src="/warning.png" alt="Warning" width="18" height="18" style={{ objectFit: "contain" }} />
);

const TopPerformerIcon = () => (
  <img src="/top.png" alt="Top" width="18" height="18" style={{ objectFit: "contain" }} />
);

const HandshakeIcon = () => (
  <img src="/handshake.png" alt="Handshake" width="18" height="18" style={{ objectFit: "contain" }} />
);

function ratingBadge(rating: string) {
  const colors: Record<string, { bg: string; color: string }> = {
    Exceptional:          { bg: "#fef3c7", color: "#b45309" }, // Gold rating
    "Exceeds Expectations": { bg: "#dcfce7", color: "#15803d" }, // Green positive
    "Meets Expectations": { bg: "#e0f2fe", color: "#0369a1" }, // Blue stable
    "Needs Improvement":  { bg: "#ffedd5", color: "#c2410c" }, // Orange Warning
    Unsatisfactory:       { bg: "#fee2e2", color: "#b91c1c" }, // Red Critical Warning
  };
  const c = colors[rating] || { bg: "#e5e7eb", color: "#374151" };
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>
      {rating || "—"}
    </span>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [peerFeedbacks, setPeerFeedbacks] = useState<PeerFeedback[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeletePeer, setConfirmDeletePeer] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"offline" | "syncing" | "synced" | "error">("offline");

  function load() {
    setSubmissions(getSubmissions().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
    setPeerFeedbacks(getPeerFeedbacks().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
  }

  useEffect(() => {
    document.title = "Admin Dashboard — Emerge Livelihoods";
    load();
    const hasClient = getSupabaseClient() !== null;
    if (hasClient) {
      setSyncStatus("syncing");
      syncWithSupabase()
        .then((synchronizedSubmissions) => {
          setSubmissions(synchronizedSubmissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
          setSyncStatus("synced");
        })
        .catch((err) => {
          console.error("Dashboard sync error:", err);
          setSyncStatus("error");
        });
    } else {
      setSyncStatus("offline");
    }
  }, []);

  const positions = ["All", ...Array.from(new Set(submissions.map(s => s.position).filter(Boolean)))];

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.employeeName.toLowerCase().includes(q) || s.position.toLowerCase().includes(q) || s.reviewers.toLowerCase().includes(q);
    const matchPos = positionFilter === "All" || s.position === positionFilter;
    return matchSearch && matchPos;
  });

  function handleDelete(id: string) {
    deleteSubmission(id);
    setConfirmDelete(null);
    load();
  }

  const totalDims = (s: Submission) => s.dimensions.length;
  const totalKRAs = (s: Submission) => s.dimensions.reduce((n, d) => n + d.kras.length, 0);
  const avgRating = (s: Submission) => {
    const all = s.dimensions.flatMap(d => d.kras.map(k => parseInt(k.rating) || 0));
    const rated = all.filter(r => r > 0);
    if (!rated.length) return null;
    return (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1);
  };

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "32px 24px 60px", minHeight: "100vh" }}>
      <style>{`
        .admin-table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
        .admin-table th { background: ${TEAL}; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; border: 1px solid #3a6b73; }
        .admin-table td { padding: 10px 12px; border: 1px solid #d1d5db; vertical-align: middle; }
        .admin-table tr:nth-child(even) td { background: #f8fafb; }
        .admin-table tr:hover td { background: #eaf4f5; }
        .admin-btn { border: none; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-family: Verdana, Geneva, sans-serif; font-weight: bold; cursor: pointer; }
        .btn-view { background: ${TEAL}; color: #fff; }
        .btn-view:hover { opacity: 0.85; }
        .btn-del { background: #fee2e2; color: #991b1b; }
        .btn-del:hover { background: #fca5a5; }
        .stat-card { background: #ffffff; border: 2px solid ${TEAL}; border-radius: 10px; padding: 20px 24px; text-align: center; box-shadow: 0 1px 4px rgba(76,128,138,0.08); }
        .stat-card .num { font-size: 32px; font-weight: bold; color: ${TEAL}; }
        .stat-card .lbl { font-size: 11px; color: ${TEAL}; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold", color: NAVY }}>Admin Dashboard</h1>
              {syncStatus === "syncing" && (
                <span style={{ fontSize: 11, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "#d97706", borderRadius: "50%", display: "inline-block" }}></span> Syncing...
                </span>
              )}
              {syncStatus === "synced" && (
                <span style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "#15803d", borderRadius: "50%", display: "inline-block" }}></span> Supabase Connected
                </span>
              )}
              {syncStatus === "error" && (
                <span style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "2px 8px", borderRadius: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "#b91c1c", borderRadius: "50%", display: "inline-block" }}></span> Sync Connection Error
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Manage all submitted performance appraisals</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div className="stat-card">
            <div className="num">{submissions.length}</div>
            <div className="lbl">Total Submissions</div>
          </div>
          
          {/* New HR Insights */}
          <div className="stat-card">
            <div className="num" style={{ color: "#0369a1" }}>
              {(() => {
                const rated = submissions.filter(s => s.overallRating && avgRating(s) !== null);
                if (!rated.length) return "—";
                return (rated.reduce((acc, s) => acc + parseFloat(avgRating(s)!), 0) / rated.length).toFixed(1);
              })()}
            </div>
            <div className="lbl" style={{ color: "#0369a1" }}>Company Avg Score</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "#15803d" }}>
              {(() => {
                const rated = submissions.filter(s => avgRating(s) !== null);
                if (!rated.length) return "—";
                const tops = rated.filter(s => {
                  const score = avgRating(s);
                  return score !== null && parseFloat(score) >= 4.0;
                });
                return Math.round((tops.length / rated.length) * 100) + "%";
              })()}
            </div>
            <div className="lbl" style={{ color: "#15803d" }}>Top Performers</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "#b45309" }}>
              {(() => {
                const allCVs = submissions.flatMap(s => s.coreValues.map(cv => parseInt(cv.rating) || 0)).filter(r => r > 0);
                if (!allCVs.length) return "—";
                return (allCVs.reduce((a, b) => a + b, 0) / allCVs.length).toFixed(1);
              })()}
            </div>
            <div className="lbl" style={{ color: "#b45309" }}>Values Alignment</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "#b91c1c" }}>
              {submissions.filter(s => {
                const score = avgRating(s);
                return score !== null && parseFloat(score) <= 3.4;
              }).length}
            </div>
            <div className="lbl" style={{ color: "#b91c1c" }}>Needs Intervention</div>
          </div>
        </div>

        {/* HR Insights Tables */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 36 }}>
          {/* Needs Intervention */}
          <div style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(76,128,138,0.05)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#b91c1c", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <InterventionIcon /> Needs Intervention
            </h3>
            {(() => {
              const list = submissions.filter(s => {
                const score = avgRating(s);
                return score !== null && parseFloat(score) <= 3.4;
              });
              if (!list.length) return <div style={{ fontSize: 12, color: "#6b7280" }}>No records found.</div>;
              return (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ fontSize: 11.5 }}>
                    <thead>
                      <tr>
                        <th style={{ background: "#fee2e2", color: "#991b1b", padding: "6px 8px" }}>Employee</th>
                        <th style={{ background: "#fee2e2", color: "#991b1b", padding: "6px 8px" }}>Score</th>
                        <th style={{ background: "#fee2e2", color: "#991b1b", padding: "6px 8px", width: 40 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.slice(0, 10).map(s => (
                        <tr key={s.id}>
                          <td style={{ padding: "6px 8px", fontWeight: "bold", color: NAVY }}>{s.employeeName || "—"}</td>
                          <td style={{ padding: "6px 8px", fontWeight: "bold", color: "#991b1b" }}>{avgRating(s) ?? "—"}</td>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>
                            <button className="admin-btn" style={{ background: "#991b1b", color: "#fff", fontSize: 10, padding: "3px 8px" }} onClick={() => navigate(`/admin/${s.id}`)}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Top Performers */}
          <div style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(76,128,138,0.05)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#15803d", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <TopPerformerIcon /> Top Performers
            </h3>
            {(() => {
              const list = submissions.filter(s => {
                const score = avgRating(s);
                return score !== null && parseFloat(score) >= 4.0;
              }).sort((a, b) => parseFloat(avgRating(b) || "0") - parseFloat(avgRating(a) || "0"));
              if (!list.length) return <div style={{ fontSize: 12, color: "#6b7280" }}>No records found.</div>;
              return (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ fontSize: 11.5 }}>
                    <thead>
                      <tr>
                        <th style={{ background: "#dcfce7", color: "#15803d", padding: "6px 8px" }}>Employee</th>
                        <th style={{ background: "#dcfce7", color: "#15803d", padding: "6px 8px" }}>Score</th>
                        <th style={{ background: "#dcfce7", color: "#15803d", padding: "6px 8px", width: 40 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.slice(0, 10).map(s => (
                        <tr key={s.id}>
                          <td style={{ padding: "6px 8px", fontWeight: "bold", color: NAVY }}>{s.employeeName || "—"}</td>
                          <td style={{ padding: "6px 8px", fontWeight: "bold", color: "#15803d" }}>{avgRating(s) ?? "—"}</td>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>
                            <button className="admin-btn" style={{ background: "#15803d", color: "#fff", fontSize: 10, padding: "3px 8px" }} onClick={() => navigate(`/admin/${s.id}`)}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Core Values Champions */}
          <div style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(76,128,138,0.05)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#b45309", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <HandshakeIcon /> Values Alignment (Avg ≥ 3.0)
            </h3>
            {(() => {
              const list = submissions.filter(s => {
                const cvs = s.coreValues.map(cv => parseInt(cv.rating) || 0).filter(r => r > 0);
                if (!cvs.length) return false;
                const cvAvg = cvs.reduce((a, b) => a + b, 0) / cvs.length;
                return cvAvg >= 3.0;
              }).sort((a, b) => {
                const cvsA = a.coreValues.map(cv => parseInt(cv.rating) || 0).filter(r => r > 0);
                const cvsB = b.coreValues.map(cv => parseInt(cv.rating) || 0).filter(r => r > 0);
                const avgA = cvsA.length ? cvsA.reduce((sum, val) => sum + val, 0) / cvsA.length : 0;
                const avgB = cvsB.length ? cvsB.reduce((sum, val) => sum + val, 0) / cvsB.length : 0;
                return avgB - avgA;
              });
              if (!list.length) return <div style={{ fontSize: 12, color: "#6b7280" }}>No records found.</div>;
              return (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ fontSize: 11.5 }}>
                    <thead>
                      <tr>
                        <th style={{ background: "#fef3c7", color: "#b45309", padding: "6px 8px" }}>Employee</th>
                        <th style={{ background: "#fef3c7", color: "#b45309", padding: "6px 8px" }}>Value Avg</th>
                        <th style={{ background: "#fef3c7", color: "#b45309", padding: "6px 8px", width: 40 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.slice(0, 10).map(s => {
                        const cvs = s.coreValues.map(cv => parseInt(cv.rating) || 0).filter(r => r > 0);
                        const cvAvg = cvs.length ? (cvs.reduce((a, b) => a + b, 0) / cvs.length).toFixed(1) : "—";
                        return (
                          <tr key={s.id}>
                            <td style={{ padding: "6px 8px", fontWeight: "bold", color: NAVY }}>{s.employeeName || "—"}</td>
                            <td style={{ padding: "6px 8px", fontWeight: "bold", color: "#b45309" }}>{cvAvg}</td>
                            <td style={{ padding: "6px 8px", textAlign: "center" }}>
                              <button className="admin-btn" style={{ background: "#b45309", color: "#fff", fontSize: 10, padding: "3px 8px" }} onClick={() => navigate(`/admin/${s.id}`)}>View</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name, position, reviewer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "Verdana, Geneva, sans-serif", fontSize: 12.5 }}
          />
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "Verdana, Geneva, sans-serif", fontSize: 12.5, background: "#fff" }}
          >
            {positions.map(p => <option key={p}>{p}</option>)}
          </select>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>No appraisals found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{submissions.length === 0 ? "No submissions have been made yet." : "Try adjusting your search or filters."}</div>
          </div>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: 10, border: `2px solid ${TEAL}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(76,128,138,0.08)" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Employee</th>
                  <th>Position</th>
                  <th>Review Period</th>
                  <th>Line Manager</th>
                  <th style={{ textAlign: "center" }}>360°</th>
                  <th>Overall Rating</th>
                  <th style={{ textAlign: "center" }}>Dims</th>
                  <th style={{ textAlign: "center" }}>KRAs</th>
                  <th style={{ textAlign: "center" }}>Avg Score</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: TEAL, fontFamily: "monospace", fontSize: 12 }}>{s.employeeId || "—"}</td>
                    <td style={{ fontWeight: "bold", color: NAVY }}>{s.employeeName || "—"}</td>
                    <td>{s.position || "—"}</td>
                    <td>{s.reviewPeriod || "—"}</td>
                    <td>{s.reviewers || "—"}</td>
                    <td style={{ textAlign: "center" }}>
                      {s.feedback360 && (
                        s.feedback360.supervisorStrengths || 
                        s.feedback360.supervisorImprovements ||
                        s.feedback360.peerStrengths ||
                        s.feedback360.peerImprovements ||
                        s.feedback360.directReportStrengths ||
                        s.feedback360.directReportImprovements
                      ) ? (
                        <span style={{ color: "#16a34a", fontWeight: "bold", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>Yes</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>{ratingBadge(s.overallRating)}</td>
                    <td style={{ textAlign: "center" }}>{totalDims(s)}</td>
                    <td style={{ textAlign: "center" }}>{totalKRAs(s)}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold", color: TEAL }}>{avgRating(s) ?? "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(s.submittedAt)}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button className="admin-btn btn-view" onClick={() => navigate(`/admin/${s.id}`)}>View</button>
                        <button className="admin-btn btn-del" onClick={() => setConfirmDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Peer Feedback Section */}
        <div style={{ marginTop: 40, background: "#ffffff", borderRadius: 10, border: `2px solid ${TEAL}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(76,128,138,0.08)" }}>
          <div style={{ background: NAVY, padding: "14px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: "bold", fontFamily: "Verdana, Geneva, sans-serif" }}>Peer Feedback Submissions (360°)</h2>
            <span style={{ fontSize: 12, background: TEAL, padding: "2px 8px", borderRadius: 10, fontWeight: "bold" }}>{peerFeedbacks.length} Feedback(s)</span>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#4b5563" }}>
              Peer feedback entries provided anonymously or specifically for employees/roles. Deleting an entry will permanently remove it from the consolidated feedback.
            </p>
            {peerFeedbacks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>No peer feedback submissions have been made yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }}>Target Position / Employee</th>
                      <th style={{ width: "35%" }}>Strengths</th>
                      <th style={{ width: "35%" }}>Areas for Improvement</th>
                      <th style={{ width: "10%" }}>Submitted At</th>
                      <th style={{ width: "10%", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peerFeedbacks.map(pf => (
                      <tr key={pf.id}>
                        <td style={{ fontWeight: "bold", color: NAVY }}>{pf.role}</td>
                        <td>
                          <div style={{ whiteSpace: "pre-wrap", maxHeight: "100px", overflowY: "auto", fontSize: "11.5px", color: "#374151" }}>
                            {pf.strengths}
                          </div>
                        </td>
                        <td>
                          <div style={{ whiteSpace: "pre-wrap", maxHeight: "100px", overflowY: "auto", fontSize: "11.5px", color: "#374151" }}>
                            {pf.improvements}
                          </div>
                        </td>
                        <td style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{formatDate(pf.submittedAt)}</td>
                        <td style={{ textAlign: "center" }}>
                          <button className="admin-btn btn-del" onClick={() => setConfirmDeletePeer(pf.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "32px 36px", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, color: TEAL }}>Delete Appraisal?</h2>
            <p style={{ fontSize: 13, color: TEAL, margin: "0 0 24px" }}>This action cannot be undone. The appraisal record will be permanently removed.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "9px 24px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "9px 24px", border: "none", borderRadius: 6, background: "#dc2626", color: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Peer Feedback Confirm Modal */}
      {confirmDeletePeer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "32px 36px", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, color: TEAL }}>Delete Peer Feedback?</h2>
            <p style={{ fontSize: 13, color: TEAL, margin: "0 0 24px" }}>This action cannot be undone. This peer feedback entry will be permanently removed.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setConfirmDeletePeer(null)} style={{ padding: "9px 24px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13 }}>Cancel</button>
              <button onClick={() => {
                if (confirmDeletePeer) {
                  deletePeerFeedback(confirmDeletePeer);
                  setConfirmDeletePeer(null);
                  load();
                }
              }} style={{ padding: "9px 24px", border: "none", borderRadius: 6, background: "#dc2626", color: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
