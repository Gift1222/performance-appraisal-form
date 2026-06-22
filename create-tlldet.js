import fs from 'fs';

const accountingContent = fs.readFileSync('src/app/pages/AccountingOfficerForm.tsx', 'utf-8');

const dimensionsCode = `const INITIAL_DIMENSIONS: Dimension[] = [
  {
    letter: "A", title: "ADVOCACY AND CAPACITY BUILDING",
    objective: "To strengthen organizational and stakeholder capacity in leadership development, education, training and technology integration while promoting awareness and advocacy on key thematic areas.",
    kras: [
      { name: "Capacity Building", description: "Strengthens internal capacity of staff and stakeholders in leadership development, education and training.", rating: "", comment: "" },
      { name: "Advocacy and Awareness", description: "Promotes awareness and understanding of emerging trends, standards and best practices in leadership development, education and technology integration.", rating: "", comment: "" },
      { name: "Stakeholder Engagement", description: "Engages local and international organizations, institutions and communities to advance leadership development and education initiatives.", rating: "", comment: "" },
      { name: "Program Quality Assurance", description: "Ensures quality implementation of leadership development, education, training and technology integration programs.", rating: "", comment: "" },
    ],
  },
  {
    letter: "B", title: "PROGRAM DEVELOPMENT",
    objective: "To design and develop inclusive, sustainable and impactful leadership development, education and training programs aligned with organizational strategy.",
    kras: [
      { name: "Program Design and Formulation", description: "Leads the design and development of leadership development, education and training programs aligned with strategic priorities.", rating: "", comment: "" },
      { name: "Strategic Alignment", description: "Ensures programs contribute to Emerge Livelihoods Strategic Plan 2024–2029 and community development priorities.", rating: "", comment: "" },
      { name: "Livelihoods Transformation", description: "Develops interventions that improve employability, employment opportunities and sustainable livelihoods.", rating: "", comment: "" },
      { name: "Gender Equality and Social Inclusion (GESI)", description: "Ensures programs promote gender equality, youth empowerment, and inclusion of vulnerable populations.", rating: "", comment: "" },
    ],
  },
  {
    letter: "C", title: "PROGRAM / PROJECT MANAGEMENT",
    objective: "To effectively manage program implementation, resources and performance to achieve desired results.",
    kras: [
      { name: "Operational Planning", description: "Develops and implements annual work plans, targets and implementation schedules.", rating: "", comment: "" },
      { name: "Resource Management", description: "Ensures effective allocation and utilization of financial, human and technical resources.", rating: "", comment: "" },
      { name: "Program Implementation", description: "Oversees effective execution of projects and activities within approved plans and budgets.", rating: "", comment: "" },
      { name: "Innovation and Adaptability", description: "Develops innovative approaches that respond to changing operating environments and stakeholder needs.", rating: "", comment: "" },
      { name: "Results Management", description: "Ensures achievement of program targets, outputs, outcomes and impact indicators.", rating: "", comment: "" },
    ],
  },
  {
    letter: "D", title: "MONITORING, EVALUATION, ACCOUNTABILITY, LEARNING AND REPORTING (MEAL)",
    objective: "To ensure effective monitoring, learning, accountability, reporting and evidence-based decision making.",
    kras: [
      { name: "Monitoring and Evaluation", description: "Ensures effective monitoring and evaluation systems are implemented and utilized.", rating: "", comment: "" },
      { name: "Program Reviews", description: "Conducts regular reviews of program performance, progress and effectiveness.", rating: "", comment: "" },
      { name: "Learning and Knowledge Management", description: "Promotes organizational learning, documentation of lessons learned and knowledge sharing.", rating: "", comment: "" },
      { name: "Reporting", description: "Produces accurate, timely and quality program performance reports.", rating: "", comment: "" },
      { name: "Financial Monitoring", description: "Monitors program expenditure, budget utilization and variance reporting.", rating: "", comment: "" },
    ],
  },
  {
    letter: "E", title: "PARTNERSHIPS, NETWORKS AND RESOURCE MOBILIZATION",
    objective: "To build strategic partnerships and mobilize resources that support program growth and sustainability.",
    kras: [
      { name: "Partnership Development", description: "Establishes and maintains strategic partnerships with key stakeholders and development partners.", rating: "", comment: "" },
      { name: "Network Strengthening", description: "Builds and leverages networks that advance leadership development, education and training objectives.", rating: "", comment: "" },
      { name: "Resource Mobilization", description: "Supports fundraising and resource mobilization efforts for program implementation and growth.", rating: "", comment: "" },
      { name: "Cross-Functional Collaboration", description: "Collaborates effectively with internal departments and subsidiary enterprises to achieve program goals.", rating: "", comment: "" },
    ],
  },
  {
    letter: "F", title: "POLICY MANAGEMENT AND COMPLIANCE",
    objective: "To ensure compliance with organizational policies, donor requirements and regulatory frameworks.",
    kras: [
      { name: "Policy Implementation", description: "Implements organizational policies, procedures and operational guidelines.", rating: "", comment: "" },
      { name: "Policy Review and Improvement", description: "Contributes to policy development, review and continuous improvement initiatives.", rating: "", comment: "" },
      { name: "Compliance Management", description: "Ensures compliance with donor requirements, organizational standards and legal obligations.", rating: "", comment: "" },
      { name: "Safeguarding and Ethics", description: "Upholds safeguarding, accountability, transparency and ethical standards in program implementation.", rating: "", comment: "" },
    ],
  },
  {
    letter: "G", title: "TEAM LEADERSHIP AND PEOPLE MANAGEMENT",
    objective: "To provide effective leadership, supervision and development of staff and teams.",
    kras: [
      { name: "Team Leadership", description: "Provides strategic leadership and direction to team members and program staff.", rating: "", comment: "" },
      { name: "Staff Development", description: "Supports coaching, mentoring, capacity building and professional growth of team members.", rating: "", comment: "" },
      { name: "Performance Management", description: "Monitors performance, provides feedback and supports achievement of individual and team objectives.", rating: "", comment: "" },
      { name: "Team Culture and Collaboration", description: "Promotes teamwork, accountability, innovation, inclusion and organizational values.", rating: "", comment: "" },
    ],
  },
];`;

const accountingParts = accountingContent.split(/const BLANK_DEVPLAN[^;]+;/);
let restOfComponent = accountingParts[1];

restOfComponent = restOfComponent.replace(/AccountingOfficerForm/g, "TLLDETTeamLeaderLeadershipDevelopmentForm");
restOfComponent = restOfComponent.replace(/setPosition\("Accounting Officer"\)/g, 'setPosition("Team Leader - Leadership Development, Education and Training (TL-LDET)")');
restOfComponent = restOfComponent.replace(/<p className="subtitle">Accounting Officer<\/p>/, '<p className="subtitle">Team Leader - Leadership Development, Education &amp; Training</p>');

// overview
const newOverview = `This 360-degree performance appraisal evaluates the Team Leader – Leadership Development, Education and Training (TL-LDET) across seven core dimensions derived from the role's scope of responsibilities. The appraisal places strong emphasis on Program Development, Program Management, Advocacy and Capacity Building, Partnerships and Resource Mobilization and Monitoring, Evaluation, Accountability and Learning (MEAL), recognizing their critical contribution to advancing Emerge Livelihoods' Strategic Plan 2024–2029.`;
restOfComponent = restOfComponent.replace(/<p className="ov">This 360-degree.*?(?=<\/p>)/s, `<p className="ov">${newOverview}`);

// section 3 title
restOfComponent = restOfComponent.replace(/<div className="sec">3\. PERFORMANCE DIMENSIONS<\/div>/, '<div className="sec">3. PERFORMANCE DIMENSIONS / KEY RESULT AREAS (KRAs)</div>');

restOfComponent = restOfComponent.replace(/>Submit Appraisal<\/button>/g, '>Submit</button>');

const finalSource = `import { useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { saveSubmission, replaceSubmission, findSubmissionByName } from "../store";
import type { Dimension, CoreValue, DevPlanRow } from "../store";
import emergeLogo from "@/imports/emerge-logo.png";

// ─── TL-LDET dimension config ──────────────────────────────────────────────────
${dimensionsCode}

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
${restOfComponent}`;

fs.writeFileSync('src/app/pages/TLLDETTeamLeaderLeadershipDevelopmentForm.tsx', finalSource);
console.log("Updated TLLDET successfully.");
