import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast, Toaster } from "sonner";
import { savePeerFeedback } from "../store";
import emergeLogo from "@/imports/emerge-logo.png";
import { useFormDraft } from "../hooks/useFormDraft";

const TEAL = "#4C808A";
const NAVY = "#16294A";

const ROLES = [
  "Programs Director",
  "Accounting Officer",
  "Administration Officer",
  "Administration and Logistics Assistant",
  "Human Resource Coordinator",
  "ICT Support Officer - Charles Mulero",
  "ICT Support Officer - Gift Chimwendo",
  "MEAL Coordinator",
  "MEAL Officer",
  "Team Leader - Communications and Marketing",
  "Team Leader - Leadership Development, Education and Training (TL-LDET)",
  "Team Leader - Technical Operations (TL-TO)",
  "Investment and Portfolio Analyst - Acceleration",
  "Team Leader - Sustainable Entrepreneurship and Livelihoods (TL-SEL)",
  "Procurement and Logistics Officer"
];

export default function PeerFeedback() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const { clearDraft } = useFormDraft("peer-feedback", {
    role, strengths, improvements
  }, {
    setRole, setStrengths, setImprovements
  });

  // Pre-select role if specified in search query (?role=...)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && ROLES.includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};

    if (!role) newErrors.role = true;
    if (!strengths.trim()) newErrors.strengths = true;
    if (!improvements.trim()) newErrors.improvements = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please complete all fields honestly before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      await savePeerFeedback(role, strengths.trim(), improvements.trim());
      clearDraft();
      setSubmitted(true);
      toast.success("Peer feedback submitted successfully!");
    } catch (err) {
      console.error("Peer feedback submit error:", err);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 16px", fontFamily: "Verdana, Geneva, sans-serif" }}>
      <Toaster richColors position="top-center" />
      <div style={{ maxWidth: 680, margin: "0 auto", background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: `1px solid #e2e8f0`, overflow: "hidden" }}>
        
        {/* Top Header Logo Centered */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px 20px", borderBottom: `2px solid #e2e8f0` }}>
          <img src={emergeLogo} alt="Emerge Livelihoods Logo" style={{ height: 60, objectFit: "contain", marginBottom: 12 }} />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: NAVY, textAlign: "center", letterSpacing: "-0.5px" }}>Peer Feedback Form</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: TEAL, textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>360-Degree appraisal cycle</p>
        </div>

        {/* Content Body */}
        <div style={{ padding: "28px 24px" }}>
          
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: 64, height: 64, background: "#dcfce7", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, fontWeight: "bold" }}>
                ✓
              </div>
              <h2 style={{ fontSize: 20, color: NAVY, fontWeight: "bold", margin: "0 0 8px" }}>Thank You for Your Feedback!</h2>
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 24px", lineHeight: "1.6" }}>
                Your feedback for the <strong style={{ color: NAVY }}>{role}</strong> position has been successfully recorded. It has been automatically populated and protected under Section 5 of their appraisal.
              </p>
              <div style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "12px", borderRadius: 6, display: "inline-block", lineHeight: "1.5" }}>
                The submit button has been disabled as your response is complete.
                <br />
                You can now exit.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Honest Feedback Disclaimer Box */}
              <div style={{ background: "#f0fdfa", border: `1px solid #99f6e4`, borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#0d9488", fontWeight: "bold", display: "flex", alignItems: "center", gap: 6 }}>
                  Professional and Unbiased Assessment Note
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#0f766e", lineHeight: "1.5" }}>
                  Please ensure you remain completely objective, constructive and honest when providing this peer evaluation. Your feedback is highly valuable for the professional development of your peer and will be protected to maintain the integrity of the 360° appraisal.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: NAVY, marginBottom: 6 }}>
                  Employee Position / Role Being Reviewed <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: `1px solid ${errors.role ? "#f43f5e" : "#cbd5e1"}`,
                    fontSize: 13,
                    background: "#fff",
                    color: NAVY,
                    outline: "none"
                  }}
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrors((p) => ({ ...p, role: false }));
                  }}
                >
                  <option value="">-- Choose Position --</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#e11d48" }}>Please select the peer position.</p>
                )}
              </div>

              {/* Section 1: Strengths */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: NAVY, marginBottom: 4 }}>
                  1. Peer Strengths <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                  What does this peer do exceptionally well? Highlight skills, positive collaboration, or key successes.
                </p>
                <textarea
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: `1px solid ${errors.strengths ? "#f43f5e" : "#cbd5e1"}`,
                    fontSize: 13,
                    color: "#1e293b",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    resize: "vertical"
                  }}
                  placeholder="Provide honest, constructive observations on key strengths..."
                  value={strengths}
                  onChange={(e) => {
                    setStrengths(e.target.value);
                    setErrors((p) => ({ ...p, strengths: false }));
                  }}
                />
                {errors.strengths && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#e11d48" }}>Please enter strengths observations.</p>
                )}
              </div>

              {/* Section 2: Areas for Improvement */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "bold", color: NAVY, marginBottom: 4 }}>
                  2. Areas for Improvement <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                  Where can this peer improve or grow? Provide specific and constructive feedback.
                </p>
                <textarea
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: `1px solid ${errors.improvements ? "#f43f5e" : "#cbd5e1"}`,
                    fontSize: 13,
                    color: "#1e293b",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    resize: "vertical"
                  }}
                  placeholder="Provide honest, constructive recommendations on areas for growth..."
                  value={improvements}
                  onChange={(e) => {
                    setImprovements(e.target.value);
                    setErrors((p) => ({ ...p, improvements: false }));
                  }}
                />
                {errors.improvements && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#e11d48" }}>Please enter areas for improvement observations.</p>
                )}
              </div>

              {/* Submit Button Centered */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting ? "#cbd5e1" : TEAL,
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: "bold",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Peer Feedback"}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
