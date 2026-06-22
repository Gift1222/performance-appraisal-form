import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { getSubmission } from "../store";
import type { Submission } from "../store";
import emergeLogo from "@/imports/emerge-logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TEAL = "#4C808A";
const NAVY = "#16294A";
const LIGHT_BLUE = "#EAF1F8";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ratingColor(r: string | number): React.CSSProperties {
  const n = typeof r === "string" ? parseInt(r) : r;
  if (n === 5) return { background: "#fef3c7", color: "#b45309" }; // Gold
  if (n === 4) return { background: "#dcfce7", color: "#15803d" }; // Green
  if (n === 3) return { background: "#e0f2fe", color: "#0369a1" }; // Blue
  if (n === 2) return { background: "#ffedd5", color: "#c2410c" }; // Orange Warning
  if (n === 1) return { background: "#fee2e2", color: "#b91c1c" }; // Red Critical
  return { background: "#f3f4f6", color: "#6b7280" };
}

function RatingBadge({ rating }: { rating: string }) {
  return (
    <span style={{ ...ratingColor(rating), borderRadius: 12, padding: "3px 12px", fontSize: 12, fontWeight: "bold" }}>
      {rating || "—"}
    </span>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div style={{ borderBottom: `3px solid ${TEAL}`, paddingBottom: 6, margin: "36px 0 14px", fontSize: 18, fontWeight: "bold", color: NAVY }}>
      {title}
    </div>
  );
}

function DimHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: TEAL, borderLeft: `6px solid ${TEAL}`, padding: "8px 10px", margin: "24px 0 4px", fontWeight: "bold", color: "#ffffff", fontSize: 14 }}>
      {children}
    </div>
  );
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [s, setS] = useState<Submission | null>(null);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) setS(getSubmission(id) || null);
  }, [id]);

  async function exportToPDF() {
    if (!contentRef.current || !s) return;
    setExporting(true);

    try {
      const el = contentRef.current;

      // Convert all images to inline base64 so html2canvas has no CORS issues
      const imgEls = Array.from(el.querySelectorAll("img")) as HTMLImageElement[];
      await Promise.all(
        imgEls.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (!img.src || img.src.startsWith("data:")) { resolve(); return; }
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                try { img.src = canvas.toDataURL(); } catch { /* keep original */ }
              }
              resolve();
            })
        )
      );

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      let remaining = imgH - pageH;
      let page = 1;
      while (remaining > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -(page * pageH), imgW, imgH);
        remaining -= pageH;
        page++;
      }

      const filename = `Appraisal_${(s.employeeName || "Employee").replace(/\s+/g, "_")}.pdf`;
      pdf.save(filename);
      toast.success(`Appraisal exported successfully as "${filename}".`);
    } catch (err) {
      console.error("PDF export error:", err);
      // Fallback: open print dialog
      toast.info("Switching to print dialog — choose 'Save as PDF' from your printer options.");
      setTimeout(() => window.print(), 300);
    } finally {
      setExporting(false);
    }
  }

  if (!s) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", textAlign: "center", padding: "80px 24px", color: "#6b7280" }}>
        <div style={{ fontSize: 40 }}>📄</div>
        <p style={{ fontSize: 14, marginTop: 12 }}>Appraisal not found.</p>
        <button onClick={() => navigate("/admin")} style={backBtnStyle}>Back to Dashboard</button>
      </div>
    );
  }

  const coreValuesTotal = s.coreValues.reduce((sum, cv) => sum + (parseInt(cv.rating) || 0), 0);
  const allKRAs = s.dimensions.flatMap(d => d.kras.map(k => parseInt(k.rating) || 0)).filter(r => r > 0);
  const avgScore = allKRAs.length ? (allKRAs.reduce((a, b) => a + b, 0) / allKRAs.length).toFixed(2) : "—";

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "32px 24px 60px", minHeight: "100vh" }}>
      <Toaster richColors position="top-center" />
      <style>{`
        @media print { .no-print { display: none !important; } body { background: #fff; } }
        .det-table { border-collapse: collapse; width: 100%; margin-bottom: 18px; font-size: 12.5px; }
        .det-table th { background: ${TEAL}; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; border: 1px solid #3a6b73; }
        .det-table td { border: 1px solid #3B4167; padding: 7px 10px; vertical-align: top; }
        .det-table tr:nth-child(even) td { background: #f8fafb; }
        .det-table td.lbl { background: ${LIGHT_BLUE}; color: ${NAVY}; font-weight: bold; width: 20%; }
        .det-table td.kra { font-weight: bold; width: 18%; }
        .det-table td.rc { width: 8%; text-align: center; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Top bar */}
        <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => navigate("/admin")} style={backBtnStyle}>Back to Dashboard</button>
          <button onClick={() => window.print()} style={{ ...backBtnStyle, background: TEAL, color: "#fff", borderColor: TEAL }}>Print</button>
          <button
            onClick={exportToPDF}
            disabled={exporting}
            style={{ ...backBtnStyle, background: "#16294A", color: "#fff", borderColor: "#16294A", opacity: exporting ? 0.7 : 1, cursor: exporting ? "wait" : "pointer" }}
          >
            {exporting ? "Exporting…" : "Export to PDF"}
          </button>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>Submitted: {formatDateTime(s.submittedAt)}</span>
        </div>

        {/* Card */}
        <div ref={contentRef} style={{ background: "#fff", border: `2px solid ${TEAL}`, borderRadius: 10, padding: "40px 40px 48px", lineHeight: 1.5 }}>

          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: `3px solid ${TEAL}`, paddingBottom: 16, marginBottom: 28 }}>
            <img src={emergeLogo} alt="Emerge Livelihoods" style={{ maxHeight: 100, maxWidth: 320, objectFit: "contain", marginBottom: 12 }} />
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: TEAL }}>360-DEGREE PERFORMANCE APPRAISAL FORM</h1>
            <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: "bold", color: "#555" }}>{s.position}</p>
          </div>

          {/* Score summary strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Dimensions", value: s.dimensions.length },
              { label: "Total KRAs", value: s.dimensions.reduce((n, d) => n + d.kras.length, 0) },
              { label: "Avg KRA Score", value: avgScore },
              { label: "Core Values Total", value: coreValuesTotal },
            ].map(item => (
              <div key={item.label} style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: TEAL }}>{item.value}</div>
                <div style={{ fontSize: 10, color: TEAL, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Employee Info */}
          <Section title="Employee Information" />
          <table className="det-table">
            <tbody>
              <tr>
                <td className="lbl">Employee ID</td><td>{s.employeeId || "—"}</td>
                <td className="lbl">Employee Name</td><td>{s.employeeName || "—"}</td>
              </tr>
              <tr>
                <td className="lbl">Position</td><td colSpan={3}>{s.position || "—"}</td>
              </tr>
              <tr>
                <td className="lbl">Review Period</td><td>{s.reviewPeriod || "—"}</td>
                <td className="lbl">Appraisal Date</td><td>{formatDate(s.appraisalDate)}</td>
              </tr>
              <tr>
                <td className="lbl">Reviewer(s)</td><td colSpan={3}>{s.reviewers || "—"}</td>
              </tr>
            </tbody>
          </table>

          {/* Performance Dimensions */}
          <Section title="Performance Dimensions" />
          {s.dimensions.map((dim) => (
            <div key={dim.letter}>
              <DimHeading>{dim.letter}. {dim.title}</DimHeading>
              <p style={{ fontStyle: "italic", color: "#444", fontSize: 12, margin: "0 0 10px 10px" }}>
                <strong style={{ color: NAVY, fontStyle: "normal" }}>Objective:</strong> {dim.objective}
              </p>
              <table className="det-table">
                <thead>
                  <tr>
                    <th>Key Result Area</th>
                    <th>Description</th>
                    <th style={{ width: "8%", textAlign: "center" }}>Rating</th>
                    <th style={{ width: "26%" }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {dim.kras.map((kra, ki) => (
                    <tr key={ki} style={ki % 2 === 0 ? { background: "#fff" } : {}}>
                      <td className="kra">{kra.name}</td>
                      <td style={{ fontSize: 12 }}>{kra.description}</td>
                      <td style={{ textAlign: "center" }}>
                        <RatingBadge rating={kra.rating} />
                      </td>
                      <td style={{ fontSize: 12, color: "#374151" }}>{kra.comment || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold", background: LIGHT_BLUE, color: NAVY }}>Total</td>
                    <td style={{ textAlign: "center", fontWeight: "bold", background: LIGHT_BLUE, color: TEAL, fontSize: 16 }}>
                      {dim.kras.reduce((sum, k) => sum + (parseInt(k.rating) || 0), 0)}
                    </td>
                    <td style={{ background: LIGHT_BLUE }}>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Core Values */}
          <Section title="Core Values Alignment" />
          <table className="det-table">
            <thead>
              <tr>
                <th>Value</th>
                <th>Employee Example</th>
                <th style={{ width: "8%", textAlign: "center" }}>Rating</th>
                <th style={{ width: "26%" }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {s.coreValues.map((cv, ci) => (
                <tr key={ci} style={ci % 2 === 0 ? { background: "#fff" } : {}}>
                  <td className="kra">{cv.name}</td>
                  <td style={{ fontSize: 12 }}>{cv.example}</td>
                  <td style={{ textAlign: "center" }}><RatingBadge rating={cv.rating} /></td>
                  <td style={{ fontSize: 12 }}>{cv.comment || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold", background: LIGHT_BLUE, color: NAVY }}>Total</td>
                <td style={{ textAlign: "center", fontWeight: "bold", background: LIGHT_BLUE, color: TEAL, fontSize: 16 }}>{coreValuesTotal}</td>
                <td style={{ background: LIGHT_BLUE }}>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          {/* Overall Summary */}
          <Section title="Overall Performance Summary" />
          <p style={{ fontSize: 14, margin: "0 0 16px", fontFamily: "Verdana, Geneva, sans-serif" }}>
            <span style={{ fontWeight: "bold", color: NAVY }}>Overall Rating: </span>
            <span style={{ color: TEAL, fontWeight: "bold" }}>{s.overallRating || "—"}</span>
          </p>

          <p style={{ fontWeight: "bold", color: NAVY, fontSize: 14, margin: "18px 0 8px" }}>Key Achievements</p>
          <ol style={{ paddingLeft: 20, margin: "0 0 16px", fontSize: 13 }}>
            {s.achievements.filter(a => a.trim()).map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}
            {s.achievements.every(a => !a.trim()) && <li style={{ color: "#9ca3af" }}>No achievements recorded.</li>}
          </ol>

          <p style={{ fontWeight: "bold", color: NAVY, fontSize: 14, margin: "18px 0 8px" }}>Areas for Development</p>
          <ol style={{ paddingLeft: 20, margin: "0 0 16px", fontSize: 13 }}>
            {s.developments.filter(d => d.trim()).map((d, i) => <li key={i} style={{ marginBottom: 6 }}>{d}</li>)}
            {s.developments.every(d => !d.trim()) && <li style={{ color: "#9ca3af" }}>No development areas recorded.</li>}
          </ol>

          {/* Development Plan */}
          <Section title="Development Plan" />
          <table className="det-table">
            <thead>
              <tr><th>Development Area</th><th>Action Plan</th><th>Timeline</th><th>Support Required</th></tr>
            </thead>
            <tbody>
              {s.devPlan.map((row, ri) => (
                <tr key={ri} style={ri % 2 === 0 ? { background: "#fff" } : {}}>
                  <td style={{ fontSize: 12 }}>{row.area || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{row.action || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{row.timeline || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{row.support || <span style={{ color: "#d1d5db" }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Final Comments */}
          <Section title="Final Comments" />
          <p style={{ fontWeight: "bold", color: NAVY, fontSize: 13, margin: "0 0 6px" }}>Employee Comments</p>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: s.employeeComments ? "#222" : "#9ca3af", marginBottom: 18, minHeight: 60, background: "#fafafa" }}>
            {s.employeeComments || "No comments provided."}
          </div>
          <p style={{ fontWeight: "bold", color: NAVY, fontSize: 13, margin: "0 0 6px" }}>Reviewer Comments</p>
          <div style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: s.reviewerComments ? "#222" : "#9ca3af", marginBottom: 24, minHeight: 60, background: "#fafafa" }}>
            {s.reviewerComments || "No comments provided."}
          </div>

          {/* Signatures */}
          <Section title="Signatures" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { label: "Employee Signature", sig: s.employeeSignature, date: s.employeeSignDate },
              { label: "Reviewer Signature", sig: s.reviewerSignature, date: s.reviewerSignDate },
            ].map(({ label, sig, date }) => (
              <div key={label} style={{ background: "#ffffff", border: `2px solid ${TEAL}`, borderRadius: 8, padding: "16px 20px" }}>
                <p style={{ fontWeight: "bold", color: TEAL, fontSize: 12, margin: "0 0 12px" }}>{label}</p>
                {sig ? (
                  <img src={sig} alt={label} style={{ maxHeight: 70, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 4, background: "#fafafa", padding: 4 }} />
                ) : (
                  <div style={{ height: 50, borderBottom: "1px solid #9ca3af", display: "flex", alignItems: "flex-end", paddingBottom: 4, color: "#9ca3af", fontSize: 12 }}>Not provided</div>
                )}
                <p style={{ fontSize: 11, color: "#6b7280", margin: "10px 0 0" }}>Date: {formatDate(date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  padding: "8px 18px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 12,
  fontWeight: "bold",
  color: NAVY,
};
