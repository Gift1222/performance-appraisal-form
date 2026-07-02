import { useRef, useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { saveSubmission, replaceSubmission, findSubmissionByName, getPeerFeedbackForRole } from "../store";
import type { Dimension, CoreValue, DevPlanRow } from "../store";
import emergeLogo from "@/imports/emerge-logo.png";
import { useFormDraft } from "../hooks/useFormDraft";

// ─── Program Officer - Leadership Development dimension config ────────────────
const INITIAL_DIMENSIONS: Dimension[] = [
  {
    letter: "A", title: "PROGRAM PLANNING, MANAGEMENT AND IMPLEMENTATION",
    objective: "To ensure effective planning, coordination and quality implementation of leadership development programs that contribute to organizational strategic objectives.",
    kras: [
      { name: "Strategic Program Planning", description: "Supports development and alignment of leadership development strategies and workplans.", rating: "", comment: "" },
      { name: "Program Coordination", description: "Ensures effective coordination and timely execution of program activities and milestones.", rating: "", comment: "" },
      { name: "Project Quality Assurance", description: "Promotes quality standards and value-for-money approaches in program delivery.", rating: "", comment: "" },
      { name: "Localization and Community Alignment", description: "Ensures programs are responsive to community priorities and localization strategies.", rating: "", comment: "" },
      { name: "Knowledge Documentation", description: "Facilitates documentation of learning, lessons and evidence of impact.", rating: "", comment: "" },
    ],
  },
  {
    letter: "B", title: "RECRUITMENT, SELECTION AND PORTFOLIO MANAGEMENT",
    objective: "To identify, recruit and manage diverse high-potential change leaders while strengthening stakeholder engagement and portfolio development.",
    kras: [
      { name: "Community and Market Analysis", description: "Conducts analysis to identify opportunities and target diverse populations.", rating: "", comment: "" },
      { name: "Recruitment and Selection", description: "Leads sourcing, screening and due diligence of emerging leaders.", rating: "", comment: "" },
      { name: "Pipeline Development", description: "Develops and maintains a diverse portfolio of high-impact leaders.", rating: "", comment: "" },
      { name: "Stakeholder Engagement", description: "Collaborates with communications and partners to promote opportunities.", rating: "", comment: "" },
      { name: "Portfolio Support and Engagement", description: "Coordinates individual and group engagement sessions to enhance participant growth.", rating: "", comment: "" },
    ],
  },
  {
    letter: "C", title: "LEADERSHIP DEVELOPMENT PROGRAM ACTIVITIES",
    objective: "To strengthen leadership capacities of participants through effective implementation, coaching and program delivery.",
    kras: [
      { name: "Program Activity Coordination", description: "Coordinates implementation of leadership development activities across communities.", rating: "", comment: "" },
      { name: "Cohort Development and Coaching", description: "Supports development of quality change leaders and provides strategic guidance.", rating: "", comment: "" },
      { name: "Career Pathway and Opportunity Mapping", description: "Facilitates leadership development roadmaps and employment opportunities.", rating: "", comment: "" },
      { name: "Employer and Partner Linkages", description: "Promotes employer-employee matching and engagement with subsidiaries and partners.", rating: "", comment: "" },
      { name: "Learning and Knowledge Sharing", description: "Represents the organization in learning platforms and disseminates lessons and innovations.", rating: "", comment: "" },
      { name: "Innovation and Trend Monitoring", description: "Tracks emerging trends and recommends improvements in leadership development approaches.", rating: "", comment: "" },
    ],
  },
  {
    letter: "D", title: "JOB PLACEMENT, PARTNERSHIPS AND RESOURCE MOBILIZATION",
    objective: "To strengthen employability and sustainable opportunities for program participants through partnerships and alumni engagement.",
    kras: [
      { name: "Employment Linkages", description: "Facilitates connections with subsidiaries and external organizations for employment opportunities.", rating: "", comment: "" },
      { name: "Alumni Engagement", description: "Supports alumni and portfolio leaders to strengthen talent networks.", rating: "", comment: "" },
      { name: "Investor and Employer Relations", description: "Builds and maintains strategic relationships with investors and employers.", rating: "", comment: "" },
      { name: "Networking and Representation", description: "Represents the organization in national and international forums and events.", rating: "", comment: "" },
      { name: "Investment Mobilization", description: "Supports initiatives that attract opportunities and investments for participants.", rating: "", comment: "" },
    ],
  },
  {
    letter: "E", title: "PROGRAM MONITORING, EVALUATION, ACCOUNTABILITY, LEARNING AND REPORTING (MEAL)",
    objective: "To strengthen accountability, evidence generation and performance improvement through effective monitoring and learning systems.",
    kras: [
      { name: "Workplan Monitoring and Review", description: "Monitors progress and reviews program implementation against objectives.", rating: "", comment: "" },
      { name: "Resource and Budget Management", description: "Ensures efficient utilization and tracking of program resources.", rating: "", comment: "" },
      { name: "Performance Reporting", description: "Produces quality reports demonstrating achievements, learning and accountability.", rating: "", comment: "" },
      { name: "Financial Monitoring and Variance Analysis", description: "Monitors expenditure and advises on budget variances.", rating: "", comment: "" },
      { name: "Evidence-Based Learning", description: "Promotes data-driven decision-making and continuous improvement.", rating: "", comment: "" },
    ],
  },
  {
    letter: "F", title: "POLICY MANAGEMENT, SAFEGUARDING AND COMPLIANCE",
    objective: "To ensure compliance with organizational policies, safeguarding standards and quality program delivery requirements.",
    kras: [
      { name: "Policy Development and Implementation", description: "Supports development and implementation of organizational guidelines and procedures.", rating: "", comment: "" },
      { name: "Program Compliance", description: "Ensures adherence to approved policies and operational standards.", rating: "", comment: "" },
      { name: "Safeguarding, GESI and Inclusion", description: "Promotes gender equality, social inclusion and protection principles in programming.", rating: "", comment: "" },
      { name: "Risk Management and Accountability", description: "Upholds ethical standards and accountability mechanisms.", rating: "", comment: "" },
      { name: "Organizational Values and Professional Conduct", description: "Demonstrates integrity, professionalism and commitment to organizational values.", rating: "", comment: "" },
    ],
  },
];

const INITIAL_CORE_VALUES: CoreValue[] = [
  { name: "Innovation", example: "We encourage new and creative ideas. Co-creation is at the centre of our minds.", rating: "", comment: "" },
  { name: "Collaboration", example: "We believe in building meaningful partnerships. Together we can do more.", rating: "", comment: "" },
  { name: "Passion", example: "We champion strong belief and purpose towards our cause.", rating: "", comment: "" },
  { name: "Visionary", example: "We think beyond today and promote sustainable futures.", rating: "", comment: "" },
  { name: "Resilience", example: "We challenge our experiences including withstanding the most demanding encounters.", rating: "", comment: "" },
  { name: "Inclusion", example: "We promote an environment for everyone to feel a sense of belonging and participate fully.", rating: "", comment: "" },
];

const BLANK_DEVPLAN: DevPlanRow[] = [
  { area: "", action: "", timeline: "", support: "" },
  { area: "", action: "", timeline: "", support: "" },
  { area: "", action: "", timeline: "", support: "" },
];

// ─── Signature Upload ─────────────────────────────────────────────────────────
function SignatureUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={value} alt="signature" style={{ maxHeight: 56, maxWidth: 220, objectFit: "contain", border: "1px solid #C9CDD3", borderRadius: 4, background: "#fafafa", padding: 4 }} />
          <button type="button" onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            style={{ background: "none", border: "1px solid #C9CDD3", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11, color: "#777", fontFamily: "Verdana, Geneva, sans-serif" }}>
            Remove
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          style={{ borderBottom: "1px solid #333", cursor: "pointer", padding: "6px 4px", color: "#4C808A", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "Verdana, Geneva, sans-serif" }}>
          Insert your signature
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function ProgramOfficerLeadershipDevelopmentForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("Program Officer - Leadership Development");
  const [reviewPeriod, setReviewPeriod] = useState("");
  const [appraisalDate, setAppraisalDate] = useState("");
  const [reviewers, setReviewers] = useState("");
  const [dims, setDims] = useState<Dimension[]>(INITIAL_DIMENSIONS);
  const [coreValues, setCoreValues] = useState<CoreValue[]>(INITIAL_CORE_VALUES);
  const [overallRating, setOverallRating] = useState("");
  const [achievements, setAchievements] = useState(["", "", ""]);
  const [developments, setDevelopments] = useState(["", "", ""]);
  const [devPlan, setDevPlan] = useState<DevPlanRow[]>(BLANK_DEVPLAN);
  const [employeeComments, setEmployeeComments] = useState("");
  const [reviewerComments, setReviewerComments] = useState("");
  const [employeeSignature, setEmployeeSignature] = useState<string | null>(null);
  const [reviewerSignature, setReviewerSignature] = useState<string | null>(null);
  const [employeeSignDate, setEmployeeSignDate] = useState("");
  const [reviewerSignDate, setReviewerSignDate] = useState("");
  const [feedback360, setFeedback360] = useState({
    supervisorStrengths: "",
    supervisorImprovements: "",
    peerStrengths: "",
    peerImprovements: "",
    directReportStrengths: "",
    directReportImprovements: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const { clearDraft } = useFormDraft("program-officer-leadership-development", {
    employeeId, employeeName, position, reviewPeriod, appraisalDate, reviewers,
    dims, coreValues, overallRating, achievements, developments, devPlan,
    employeeComments, reviewerComments, employeeSignature, reviewerSignature,
    employeeSignDate, reviewerSignDate, feedback360
  }, {
    setEmployeeId, setEmployeeName, setPosition, setReviewPeriod, setAppraisalDate, setReviewers,
    setDims, setCoreValues, setOverallRating, setAchievements, setDevelopments, setDevPlan,
    setEmployeeComments, setReviewerComments, setEmployeeSignature, setReviewerSignature,
    setEmployeeSignDate, setReviewerSignDate, setFeedback360
  });

  useEffect(() => {
    document.title = "Program Officer – Leadership Development Performance Appraisal Form";
    const peerData = getPeerFeedbackForRole(position);
    setFeedback360(prev => ({
      ...prev,
      peerStrengths: peerData.strengths,
      peerImprovements: peerData.improvements,
    }));
  }, [position]);
  const [duplicateModal, setDuplicateModal] = useState<{ existingId: string; payload: ReturnType<typeof buildPayload> } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  function updateKraRating(di: number, ki: number, val: string) {
    setDims(prev => prev.map((d, i) => i !== di ? d : {
      ...d, kras: d.kras.map((k, j) => j !== ki ? k : { ...k, rating: val }),
    }));
  }
  function updateKraComment(di: number, ki: number, val: string) {
    setDims(prev => prev.map((d, i) => i !== di ? d : {
      ...d, kras: d.kras.map((k, j) => j !== ki ? k : { ...k, comment: val }),
    }));
  }
  function updateCvRating(ci: number, val: string) {
    setCoreValues(prev => prev.map((c, i) => i !== ci ? c : { ...c, rating: val }));
  }
  function updateCvComment(ci: number, val: string) {
    setCoreValues(prev => prev.map((c, i) => i !== ci ? c : { ...c, comment: val }));
  }
  function updateDevPlan(ri: number, field: keyof DevPlanRow, val: string) {
    setDevPlan(prev => prev.map((r, i) => i !== ri ? r : { ...r, [field]: val }));
  }

  const coreValuesTotal = coreValues.reduce((sum, cv) => sum + (parseInt(cv.rating) || 0), 0);

  function buildPayload() {
    return {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      employeeId, employeeName, position, reviewPeriod, appraisalDate, reviewers,
      dimensions: dims, coreValues, overallRating,
      achievements, developments, devPlan,
      feedback360,
      employeeComments, reviewerComments,
      employeeSignature, reviewerSignature,
      employeeSignDate, reviewerSignDate,
    };
  }

  function resetForm() {
    setEmployeeId(""); setEmployeeName(""); setPosition("Program Officer - Leadership Development"); setReviewPeriod(""); setAppraisalDate(""); setReviewers("");
    setDims(INITIAL_DIMENSIONS); setCoreValues(INITIAL_CORE_VALUES);
    setOverallRating(""); setAchievements(["", "", ""]); setDevelopments(["", "", ""]);
    setDevPlan(BLANK_DEVPLAN); setEmployeeComments(""); setReviewerComments("");
    setEmployeeSignature(null); setReviewerSignature(null); setEmployeeSignDate(""); setReviewerSignDate("");
    setFeedback360({
      supervisorStrengths: "",
      supervisorImprovements: "",
      peerStrengths: "",
      peerImprovements: "",
      directReportStrengths: "",
      directReportImprovements: "",
    });
    setErrors({});
    clearDraft();
  }

  function handleConfirmReplace() {
    const { existingId, payload } = duplicateModal!;
    replaceSubmission(existingId, { ...payload, id: existingId });
    setDuplicateModal(null);
    toast.success("Your appraisal form has been submitted and replaced successfully.");
    resetForm();
  }

  function handleSubmit() {
    const newErrors: Record<string, boolean> = {};

    // Info fields
    if (!employeeId.trim() || !/^emp-\d+$/i.test(employeeId.trim())) newErrors["employeeId"] = true;
    if (!employeeName.trim()) newErrors["employeeName"] = true;
    if (!position.trim()) newErrors["position"] = true;
    if (!reviewPeriod.trim()) newErrors["reviewPeriod"] = true;
    if (!appraisalDate.trim()) newErrors["appraisalDate"] = true;
    if (!reviewers.trim()) newErrors["reviewers"] = true;

    // All KRA ratings
    dims.forEach((dim, di) => {
      dim.kras.forEach((kra, ki) => {
        // Removed mandatory KRA rating
      });
    });

    // All core value ratings
    coreValues.forEach((cv, ci) => {
      if (!cv.rating) newErrors[`cv_${ci}`] = true;
    });

    // Overall rating
    if (!overallRating.trim()) newErrors["overallRating"] = true;

    // At least one achievement and one development area
    if (achievements.every(a => !a.trim())) newErrors["achievements"] = true;
    if (developments.every(d => !d.trim())) newErrors["developments"] = true;

    // Signature dates
    if (!employeeSignDate) newErrors["employeeSignDate"] = true;
    if (!reviewerSignDate) newErrors["reviewerSignDate"] = true;

    // Validate Section 5 Peer Feedback (Must be filled via Peer Feedback Form)
    if (!feedback360.peerStrengths.trim() || !feedback360.peerImprovements.trim()) {
      newErrors["peerFeedback"] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors["peerFeedback"]) {
        toast.error("You cannot submit an incomplete form. Section 5 (Peer Feedback) must be completed via the Peer Feedback Form.");
      } else {
        toast.error("Please complete all required fields before submitting.");
      }
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const payload = buildPayload();
    const existing = findSubmissionByName(employeeName);
    if (existing) {
      setDuplicateModal({ existingId: existing.id, payload });
      return;
    }
    saveSubmission(payload);
    toast.success("Appraisal submitted successfully!");
    resetForm();
  }

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif", color: "#222", background: "#f0f4f5", padding: "40px 24px 60px", minHeight: "100vh" }}>
      <Toaster richColors position="top-center" />
      <style>{`
        :root { --navy:#4C808A; --navy-dark:#16294A; --gold:#4C808A; --light-blue:#EAF1F8; --grey-border:#C9CDD3; --dark-blue:#3B4167; --white:#fff}
        .af table { border-collapse:collapse; width:100%; margin-bottom:18px; font-size:12.5px; }
        .af th, .af td { border:1px solid var(--dark-blue); padding:6px 8px; text-align:left; vertical-align:middle; }
        .af th { background:var(--navy); color:#fff; font-size:12px; font-family:Verdana,Geneva,sans-serif; }
        .af td.lbl { background:var(--light-blue); color:var(--navy-dark); font-weight:bold; width:18%; }
        .af td.val { width:32%; }
        .af .sec { border-bottom:3px solid var(--gold); padding-bottom:6px; margin:36px 0 14px; font-size:19px; font-weight:bold; color:var(--navy-dark); }
        .af .dh { background:var(--navy); border-left:6px solid var(--navy); padding:8px 10px; margin:24px 0 4px; font-weight:bold; color:var(--white); font-size:14px; }
        .af .do { font-style:italic; color:#444; font-size:12px; margin:0 0 10px 10px; }
        .af .do b { color:var(--navy-dark); font-style:normal; }
        .af tr.z td { background:#fff; }
        .af td.kra { font-weight:bold; width:16%; }
        .af td.rc { width:9%; text-align:center; }
        .af td.cc { width:24%; }
        .af .trow td { background:var(--light-blue); font-weight:bold; }
        .af .ov { font-size:13px; text-align:justify; margin-bottom:10px; }
        .af .sh { font-weight:bold; color:var(--navy-dark); font-size:14px; margin:18px 0 8px; }
        .af input[type=text],.af input[type=date],.af textarea,.af select { width:100%; border:none; background:transparent; font-family:Verdana,Geneva,sans-serif; font-size:12.5px; color:#222; padding:2px; }
        .af input[type=text]:focus,.af input[type=date]:focus,.af textarea:focus,.af select:focus { outline:2px solid var(--gold); background:#FFFEF6; }
        .af textarea { resize:vertical; min-height:38px; }
        .af select.rs { text-align:center; font-weight:bold; cursor:pointer; font-family:Verdana,Geneva,sans-serif; }
        .af textarea.ach,.af textarea.dev { width:100%; border-bottom:1px solid var(--grey-border); min-height:30px; }
        .af ol.nb { list-style:none; padding:0; margin:0 0 18px; counter-reset:item; }
        .af ol.nb li { display:flex; gap:8px; align-items:flex-start; margin-bottom:10px; }
        .af ol.nb li::before { content:counter(item)"."; counter-increment:item; font-weight:bold; color:#000; padding-top:4px; }
        .af .ca { width:100%; border:1px solid var(--grey-border); min-height:70px; margin-bottom:16px; padding:8px; font-family:Verdana,Geneva,sans-serif; font-size:12.5px; }
        .af .sig-block { margin-top:36px; font-size:13px; }
        .af .sig-line { display:flex; gap:10px; align-items:center; margin-bottom:20px; flex-wrap:wrap; }
        .af .sig-line span.slbl { min-width:150px; font-weight:bold; color:var(--navy-dark); }
        .af .su { flex:1; min-width:200px; border-bottom:1px solid #333; }
        .af .su input { border-bottom:none; }
        .af .mh { text-align:center; border-bottom:3px solid var(--gold); padding-bottom:14px; margin-bottom:28px; }
        .af .mh .title { font-size:26px; font-weight:bold; color:var(--navy); margin:0; }
        .af .mh .subtitle { font-size:15px; font-weight:bold; color:#555; margin:4px 0 0; }
        .af .field-err input, .af .field-err textarea, .af .field-err select { background:#fff5f5 !important; outline:2px solid #dc2626 !important; border-radius:3px; }
        .af .field-err { position:relative; }
        .af .err-badge { display:inline-block; background:#dc2626; color:#fff; font-size:9px; font-weight:bold; border-radius:3px; padding:1px 5px; margin-left:6px; vertical-align:middle; letter-spacing:0.3px; }
        .af .sel-err { outline:2px solid #dc2626 !important; background:#fff5f5 !important; border-radius:3px; }
        .af .req { color:#dc2626; margin-left:2px; }
      `}</style>

      <div ref={formTopRef} className="af" style={{ maxWidth: 1050, margin: "0 auto", background: "#fff", border: "2px solid #4C808A", borderRadius: 8, padding: "40px 36px 48px", lineHeight: 1.45 }}>

        {/* Masthead */}
        <div className="mh">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <img src={emergeLogo} alt="Emerge Livelihoods" style={{ maxHeight: 130, maxWidth: 420, objectFit: "contain" }} />
          </div>
          <p className="title">360-DEGREE PERFORMANCE APPRAISAL FORM</p>
          <p className="subtitle">Program Officer – Leadership Development</p>
        </div>

        {/* Info */}
        <table>
          <tbody>
            <tr>
              <td className="lbl">Employee ID<span className="req">*</span></td>
              <td className={`val${errors["employeeId"] ? " field-err" : ""}`}>
                <input
                  type="text"
                  value={employeeId}
                  onChange={e => { setEmployeeId(e.target.value); setErrors(p => ({ ...p, employeeId: false })); }}
                  placeholder="hint: emp-001"
                />
                {errors["employeeId"] && (
                  <span className="err-badge">{employeeId.trim() ? "Invalid format" : "Required"}</span>
                )}
              </td>
              <td colSpan={2}></td>
            </tr>
            <tr>
              <td className="lbl">Employee Name<span className="req">*</span></td>
              <td className={`val${errors["employeeName"] ? " field-err" : ""}`}>
                <input type="text" value={employeeName} onChange={e => { setEmployeeName(e.target.value); setErrors(p => ({ ...p, employeeName: false })); }} />
                {errors["employeeName"] && <span className="err-badge">Required</span>}
              </td>
              <td className="lbl">Position<span className="req">*</span></td>
              <td className={`val${errors["position"] ? " field-err" : ""}`}>
                <input type="text" value={position} onChange={e => { setPosition(e.target.value); setErrors(p => ({ ...p, position: false })); }} />
                {errors["position"] && <span className="err-badge">Required</span>}
              </td>
            </tr>
            <tr>
              <td className="lbl">Review Period<span className="req">*</span></td>
              <td className={`val${errors["reviewPeriod"] ? " field-err" : ""}`}>
                <input type="text" value={reviewPeriod} onChange={e => { setReviewPeriod(e.target.value); setErrors(p => ({ ...p, reviewPeriod: false })); }} placeholder="hint: Jan – Jun 2026" />
                {errors["reviewPeriod"] && <span className="err-badge">Required</span>}
              </td>
              <td className="lbl">Date<span className="req">*</span></td>
              <td className={`val${errors["appraisalDate"] ? " field-err" : ""}`}>
                <input type="date" value={appraisalDate} onChange={e => { setAppraisalDate(e.target.value); setErrors(p => ({ ...p, appraisalDate: false })); }} />
                {errors["appraisalDate"] && <span className="err-badge">Required</span>}
              </td>
            </tr>
            <tr>
              <td className="lbl">Line Manager<span className="req">*</span></td>
              <td className={`val${errors["reviewers"] ? " field-err" : ""}`} colSpan={3}>
                <input type="text" value={reviewers} onChange={e => { setReviewers(e.target.value); setErrors(p => ({ ...p, reviewers: false })); }} />
                {errors["reviewers"] && <span className="err-badge">Required</span>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section 1 */}
        <div className="sec">1. APPRAISAL OVERVIEW</div>
        <p className="ov">This 360-degree performance appraisal evaluates the Program Officer &ndash; Leadership Development across six core dimensions derived from the role&rsquo;s scope of responsibilities. The appraisal places strong emphasis on <strong>Program Planning and Implementation, Recruitment and Portfolio Management, Leadership Development Activities and Monitoring, Evaluation, Learning and Accountability</strong>, recognizing their critical role in nurturing change leaders and delivering impactful programs aligned with Emerge Livelihoods Strategic Plan 2024&ndash;2029.</p>

        {/* Section 2 */}
        <div className="sec">2. RATING SCALE</div>
        <table>
          <thead><tr><th style={{ width: "8%" }}>Rating</th><th style={{ width: "24%" }}>Category</th><th>Description</th></tr></thead>
          <tbody>
            {[
              [5, "Exceptional", "Consistently exceeds expectations; delivers outstanding results"],
              [4, "Exceeds Expectations", "Frequently surpasses goals"],
              [3, "Meets Expectations", "Achieves set objectives consistently"],
              [2, "Needs Improvement", "Occasionally falls short of expectations"],
              [1, "Unsatisfactory", "Consistently underperforms"],
                        ].map(([r, c, d]) => {
              let bg = 'transparent'; let col = 'inherit';
              if (r === 5) { bg = '#fef3c7'; col = '#b45309'; }
              else if (r === 4) { bg = '#dcfce7'; col = '#15803d'; }
              else if (r === 3) { bg = '#e0f2fe'; col = '#0369a1'; }
              else if (r === 2) { bg = '#ffedd5'; col = '#c2410c'; }
              else if (r === 1) { bg = '#fee2e2'; col = '#b91c1c'; }
              return (
              <tr key={r as number} style={{ background: bg }}>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: col }}>{r}</td>
                <td style={{ fontWeight: 'bold', color: col }}>{c}</td>
                <td style={{ color: col }}>{d}</td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {/* Section 3 — Performance Dimensions */}
        <div className="sec">3. PERFORMANCE DIMENSIONS</div>
        {dims.map((dim, di) => (
          <div key={dim.letter}>
            <div className="dh">{dim.letter}. {dim.title}</div>
            <p className="do"><b>Objective:</b> {dim.objective}</p>
            <table>
              <thead><tr><th>Key Result Area</th><th>Description</th><th style={{ width: "10%" }}>Rating</th><th style={{ width: "24%" }}>Comments</th></tr></thead>
              <tbody>
                {dim.kras.map((kra, ki) => (
                  <tr key={ki} className={ki % 2 === 0 ? "z" : ""}>
                    <td className="kra">{kra.name}</td>
                    <td>{kra.description}</td>
                    <td className="rc">
                      <select
                        className={`rs${errors[`kra_${di}_${ki}`] ? " sel-err" : ""}`}
                        style={{
                          background: kra.rating === '5' ? '#fef3c7' : kra.rating === '4' ? '#dcfce7' : kra.rating === '3' ? '#e0f2fe' : kra.rating === '2' ? '#ffedd5' : kra.rating === '1' ? '#fee2e2' : 'transparent',
                          color: kra.rating === '5' ? '#b45309' : kra.rating === '4' ? '#15803d' : kra.rating === '3' ? '#0369a1' : kra.rating === '2' ? '#c2410c' : kra.rating === '1' ? '#b91c1c' : 'inherit'
                        }}
                        value={kra.rating}
                        onChange={e => { updateKraRating(di, ki, e.target.value); setErrors(p => ({ ...p, [`kra_${di}_${ki}`]: false })); }}
                      >
                        <option value="">—</option>
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td className="cc">
                      <textarea rows={1} value={kra.comment} onChange={e => updateKraComment(di, ki, e.target.value)} />
                    </td>
                  </tr>
                ))}
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold", background: "#EAF1F8", color: "#16294A" }}>Total</td>
                    <td style={{ textAlign: "center", fontWeight: "bold", background: "#EAF1F8", color: "#4C808A", fontSize: 15 }}>
                      {dim.kras.reduce((sum, k) => sum + (parseInt(k.rating) || 0), 0)}
                    </td>
                    <td style={{ background: "#EAF1F8" }}>&nbsp;</td>
                  </tr>
              </tbody>
            </table>
          </div>
        ))}

        {/* Section 4 — Core Values */}
        <div className="sec">4. CORE VALUES ALIGNMENT</div>
        <table>
          <thead><tr><th>Value</th><th>Employee Examples</th><th style={{ width: "10%" }}>Rating</th><th style={{ width: "24%" }}>Comments</th></tr></thead>
          <tbody>
            {coreValues.map((cv, ci) => (
              <tr key={ci} className={ci % 2 === 0 ? "z" : ""}>
                <td className="kra">{cv.name}</td>
                <td>{cv.example}</td>
                <td className="rc">
                  <select
                    className={`rs${errors[`cv_${ci}`] ? " sel-err" : ""}`}
                    style={{
                    background: cv.rating === '5' ? '#fef3c7' : cv.rating === '4' ? '#dcfce7' : cv.rating === '3' ? '#e0f2fe' : cv.rating === '2' ? '#ffedd5' : cv.rating === '1' ? '#fee2e2' : 'transparent',
                    color: cv.rating === '5' ? '#b45309' : cv.rating === '4' ? '#15803d' : cv.rating === '3' ? '#0369a1' : cv.rating === '2' ? '#c2410c' : cv.rating === '1' ? '#b91c1c' : 'inherit'
                  }}
                  value={cv.rating}
                    onChange={e => { updateCvRating(ci, e.target.value); setErrors(p => ({ ...p, [`cv_${ci}`]: false })); }}
                  >
                    <option value="">—</option>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>
                <td className="cc">
                  <textarea rows={1} value={cv.comment} onChange={e => updateCvComment(ci, e.target.value)} />
                </td>
              </tr>
            ))}
            <tr className="trow">
              <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold", color: "#16294A" }}>Total</td>
              <td className="rc" style={{ fontWeight: "bold", textAlign: "center", color: "#4C808A", fontSize: 15 }}>{coreValuesTotal}</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>

                {/* Section 5 — 360-degree feedback */}
        <div className="sec">5. 360-degree feedback</div>
        <p className="ov" style={{ marginBottom: 16 }}>
          Please provide strengths and areas for improvement under the 360-degree feedback cycle.
        </p>

        <p className="sh">Supervisor feedback</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }} className="grid-feedback">
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Strengths:</span>
            <textarea className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0 }} value={feedback360.supervisorStrengths} onChange={e => setFeedback360(prev => ({ ...prev, supervisorStrengths: e.target.value }))} placeholder="Supervisor's observations on key strengths..." />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Areas for improvement:</span>
            <textarea className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0 }} value={feedback360.supervisorImprovements} onChange={e => setFeedback360(prev => ({ ...prev, supervisorImprovements: e.target.value }))} placeholder="Supervisor's observations on areas for growth..." />
          </div>
        </div>

        <p className="sh">Peer feedback</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }} className="grid-feedback">
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Strengths:</span>
            <textarea readOnly className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0, backgroundColor: "#f1f5f9", cursor: "not-allowed" }} value={feedback360.peerStrengths} placeholder="Peers' observations on key strengths (populated automatically from Peer Feedback Form)..." />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Areas for improvement:</span>
            <textarea readOnly className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0, backgroundColor: "#f1f5f9", cursor: "not-allowed" }} value={feedback360.peerImprovements} placeholder="Peers' observations on areas for growth (populated automatically from Peer Feedback Form)..." />
          </div>
        </div>

        <p className="sh">Direct report feedback</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }} className="grid-feedback">
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Strengths:</span>
            <textarea className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0 }} value={feedback360.directReportStrengths} onChange={e => setFeedback360(prev => ({ ...prev, directReportStrengths: e.target.value }))} placeholder="Direct reports' observations on key strengths..." />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: "bold", color: "#6b7280" }}>Areas for improvement:</span>
            <textarea className="ca" style={{ minHeight: 60, marginTop: 4, marginBottom: 0 }} value={feedback360.directReportImprovements} onChange={e => setFeedback360(prev => ({ ...prev, directReportImprovements: e.target.value }))} placeholder="Direct reports' observations on areas for growth..." />
          </div>
        </div>

        {/* Section 6 — Overall Summary */}
        <div className="sec">6. OVERALL PERFORMANCE SUMMARY</div>
        <table>
          <tbody>
            <tr>
              <td className="lbl" style={{ width: "20%" }}>Overall Rating<span className="req">*</span></td>
              <td className={errors["overallRating"] ? "field-err" : ""}>
                <input type="text" value={overallRating} onChange={e => { setOverallRating(e.target.value); setErrors(p => ({ ...p, overallRating: false })); }} placeholder="hint: Exceeds Expectations" />
                {errors["overallRating"] && <span className="err-badge">Required</span>}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="sh">Key Achievements<span className="req">*</span> <span style={{ fontWeight: "normal", fontSize: 11, color: "#6b7280" }}>(at least one)</span></p>
        {errors["achievements"] && <p style={{ color: "#dc2626", fontSize: 11, margin: "-4px 0 8px", fontWeight: "bold" }}>✕ At least one key achievement is required.</p>}
        <ol className="nb">
          {achievements.map((a, i) => (
            <li key={i}>
              <textarea
                className="ach"
                rows={1}
                value={a}
                style={errors["achievements"] && i === 0 ? { borderBottom: "2px solid #dc2626", background: "#fff5f5" } : {}}
                onChange={e => { setAchievements(prev => prev.map((x, j) => j === i ? e.target.value : x)); setErrors(p => ({ ...p, achievements: false })); }}
              />
            </li>
          ))}
        </ol>

        <p className="sh">Areas for Development<span className="req">*</span> <span style={{ fontWeight: "normal", fontSize: 11, color: "#6b7280" }}>(at least one)</span></p>
        {errors["developments"] && <p style={{ color: "#dc2626", fontSize: 11, margin: "-4px 0 8px", fontWeight: "bold" }}>✕ At least one development area is required.</p>}
        <ol className="nb">
          {developments.map((d, i) => (
            <li key={i}>
              <textarea
                className="dev"
                rows={1}
                value={d}
                style={errors["developments"] && i === 0 ? { borderBottom: "2px solid #dc2626", background: "#fff5f5" } : {}}
                onChange={e => { setDevelopments(prev => prev.map((x, j) => j === i ? e.target.value : x)); setErrors(p => ({ ...p, developments: false })); }}
              />
            </li>
          ))}
        </ol>

        {/* Section 6 — Development Plan */}
        <div className="sec">7. DEVELOPMENT PLAN</div>
        <table>
          <thead><tr><th>Development Area</th><th>Action Plan</th><th>Timeline</th><th>Support Required</th></tr></thead>
          <tbody>
            {devPlan.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "z" : ""}>
                <td><textarea rows={2} value={row.area} onChange={e => updateDevPlan(ri, "area", e.target.value)} /></td>
                <td><textarea rows={2} value={row.action} onChange={e => updateDevPlan(ri, "action", e.target.value)} /></td>
                <td><textarea rows={2} value={row.timeline} onChange={e => updateDevPlan(ri, "timeline", e.target.value)} /></td>
                <td><textarea rows={2} value={row.support} onChange={e => updateDevPlan(ri, "support", e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section 7 — Final Comments */}
        <div className="sec">8. FINAL COMMENTS</div>
        <p className="sh" style={{ marginTop: 6 }}>Employee Comments:</p>
        <textarea className="ca" value={employeeComments} onChange={e => setEmployeeComments(e.target.value)} />
        <p className="sh">Line Manager Comments:</p>
        <textarea className="ca" value={reviewerComments} onChange={e => setReviewerComments(e.target.value)} />

        {/* Signatures */}
        <div className="sig-block">
          <div className="sig-line">
            <span className="slbl">Employee Signature:</span>
            <SignatureUpload value={employeeSignature} onChange={setEmployeeSignature} />
            <span className="slbl" style={{ minWidth: 50 }}>Date<span className="req">*</span>:</span>
            <span className={`su${errors["employeeSignDate"] ? " field-err" : ""}`} style={{ maxWidth: 160 }}>
              <input type="date" value={employeeSignDate} onChange={e => { setEmployeeSignDate(e.target.value); setErrors(p => ({ ...p, employeeSignDate: false })); }} />
              {errors["employeeSignDate"] && <span className="err-badge">Required</span>}
            </span>
          </div>
          <div className="sig-line">
            <span className="slbl">Line Manager Signature:</span>
            <SignatureUpload value={reviewerSignature} onChange={setReviewerSignature} />
            <span className="slbl" style={{ minWidth: 50 }}>Date<span className="req">*</span>:</span>
            <span className={`su${errors["reviewerSignDate"] ? " field-err" : ""}`} style={{ maxWidth: 160 }}>
              <input type="date" value={reviewerSignDate} onChange={e => { setReviewerSignDate(e.target.value); setErrors(p => ({ ...p, reviewerSignDate: false })); }} />
              {errors["reviewerSignDate"] && <span className="err-badge">Required</span>}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          style={{ display: "block", margin: "40px auto 0", background: "#4C808A", color: "#fff", border: "none", padding: "13px 48px", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 15, fontWeight: "bold", borderRadius: 5, cursor: "pointer", letterSpacing: "0.5px" }}
          onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        >
          Submit
        </button>
      </div>

      {/* Duplicate submission modal */}
      {duplicateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}>
          <div style={{ background: "#ffffff", border: "2px solid #4C808A", borderRadius: 10, padding: "36px 40px", maxWidth: 460, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "Verdana, Geneva, sans-serif", color: "#4C808A" }}>
            <div style={{ fontSize: 38, textAlign: "center", marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: "bold", color: "#4C808A", textAlign: "center" }}>Submission Already Exists</h2>
            <p style={{ fontSize: 13, color: "#4C808A", margin: "0 0 8px", textAlign: "center", lineHeight: 1.6 }}>
              An appraisal form has already been submitted for <strong>{employeeName}</strong>.
            </p>
            <p style={{ fontSize: 13, color: "#4C808A", margin: "0 0 28px", textAlign: "center", lineHeight: 1.6 }}>
              Would you like to <strong>replace</strong> the existing submission with this new one?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setDuplicateModal(null)}
                style={{ padding: "10px 28px", border: "1px solid #C9CDD3", borderRadius: 6, background: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#444" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReplace}
                style={{ padding: "10px 28px", border: "none", borderRadius: 6, background: "#4C808A", color: "#fff", cursor: "pointer", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, fontWeight: "bold" }}
              >
                Yes, Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
