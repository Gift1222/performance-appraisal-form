import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import ProgramsDirectorForm from "./pages/ProgramsDirectorForm";
import AccountingOfficerForm from "./pages/AccountingOfficerForm";
import AdministrationOfficerForm from "./pages/AdministrationOfficerForm";
import AdministrationLogisticsAssistantForm from "./pages/AdministrationLogisticsAssistantForm";
import HumanResourceCoordinatorForm from "./pages/HumanResourceCoordinatorForm";
import ICTSupportOfficerGiftChimwendoForm from "./pages/ICTSupportOfficerGiftChimwendoForm";
import ICTSupportOfficerCharlesMuleroForm from "./pages/ICTSupportOfficerCharlesMuleroForm";
import MEALCoordinatorForm from "./pages/MEALCoordinatorForm";
import MEALOfficerForm from "./pages/MEALOfficerForm";
import TLCMTeamLeaderCommunicationsMarketingForm from "./pages/TLCMTeamLeaderCommunicationsMarketingForm";
import TLLDETTeamLeaderLeadershipDevelopmentForm from "./pages/TLLDETTeamLeaderLeadershipDevelopmentForm";
import TLTOTeamLeaderTechnicalOperationsForm from "./pages/TLTOTeamLeaderTechnicalOperationsForm";
import IPAInvestmentPortfolioAnalystForm from "./pages/IPAInvestmentPortfolioAnalystForm";
import TLSELTeamLeaderSustainableEntrepreneurshipForm from "./pages/TLSELTeamLeaderSustainableEntrepreneurshipForm";
import PLOProcurementLogisticsOfficerForm from "./pages/PLOProcurementLogisticsOfficerForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SubmissionDetail from "./pages/SubmissionDetail";
import PeerFeedback from "./pages/PeerFeedback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ProgramsDirectorForm },
      { path: "accounting-officer", Component: AccountingOfficerForm },
      { path: "administration-officer", Component: AdministrationOfficerForm },
      { path: "administration-logistics-assistant", Component: AdministrationLogisticsAssistantForm },
      { path: "human-resource-coordinator", Component: HumanResourceCoordinatorForm },
      { path: "ict-support-officer-gift-chimwendo", Component: ICTSupportOfficerGiftChimwendoForm },
      { path: "ict-support-officer-charles-mulero", Component: ICTSupportOfficerCharlesMuleroForm },
      { path: "meal-coordinator", Component: MEALCoordinatorForm },
      { path: "meal-officer", Component: MEALOfficerForm },
      { path: "tlcm-team-leader-communications-marketing", Component: TLCMTeamLeaderCommunicationsMarketingForm },
      { path: "tl-ldet-team-leader-leadership-development", Component: TLLDETTeamLeaderLeadershipDevelopmentForm },
      { path: "tl-to-team-leader-technical-operations", Component: TLTOTeamLeaderTechnicalOperationsForm },
      { path: "ipa-investment-portfolio-analyst", Component: IPAInvestmentPortfolioAnalystForm },
      { path: "tl-sel-team-leader-sustainable-entrepreneurship", Component: TLSELTeamLeaderSustainableEntrepreneurshipForm },
      { path: "plo-procurement-logistics-officer", Component: PLOProcurementLogisticsOfficerForm },
      { path: "peer-feedback", Component: PeerFeedback },
      { path: "admin/login", Component: AdminLogin },
      {
        Component: RequireAuth,
        children: [
          { path: "admin", Component: AdminDashboard },
          { path: "admin/:id", Component: SubmissionDetail },
        ],
      },
    ],
  },
]);
