import DashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";

export type NavItem = {
  label: string;
  short: string;
  path: string;
  icon: typeof SendRoundedIcon;
  blurb: string;
  accent: string;
};

/** Single source of truth for navigation + dashboard launcher tiles. */
export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    short: "Dashboard",
    path: "dashboard",
    icon: DashboardRoundedIcon,
    blurb: "Delivery analytics and campaign overview",
    accent: "#10B981",
  },
  {
    label: "Bulk Messages",
    short: "Bulk",
    path: "bulk",
    icon: SendRoundedIcon,
    blurb: "Blast a text message to a list of numbers",
    accent: "#10B981",
  },
  {
    label: "Bulk Images",
    short: "Images",
    path: "bulkimage",
    icon: ImageRoundedIcon,
    blurb: "Send a captioned image to many recipients",
    accent: "#06B6D4",
  },
  {
    label: "Bulk Files",
    short: "Files",
    path: "bulkfile",
    icon: DescriptionRoundedIcon,
    blurb: "Attach any document and deliver in bulk",
    accent: "#8B5CF6",
  },
  {
    label: "Bulk Video",
    short: "Video",
    path: "bulkvideo",
    icon: MovieRoundedIcon,
    blurb: "Push video content with a caption",
    accent: "#F59E0B",
  },
  {
    label: "Excel Campaign",
    short: "Excel",
    path: "bulkexcel",
    icon: TableChartRoundedIcon,
    blurb: "Personalised sends driven by a spreadsheet",
    accent: "#22D3EE",
  },
  {
    label: "Single Message",
    short: "Single",
    path: "phone",
    icon: PersonRoundedIcon,
    blurb: "One-off message to a single phone number",
    accent: "#34D399",
  },
  {
    label: "Group Campaign",
    short: "Groups",
    path: "group",
    icon: GroupsRoundedIcon,
    blurb: "Pick any groups and send text or any media",
    accent: "#F43F5E",
  },
  {
    label: "Contacts Campaign",
    short: "Contacts",
    path: "contacts",
    icon: ContactPhoneRoundedIcon,
    blurb: "Tick people from your saved WhatsApp contacts",
    accent: "#22D3EE",
  },
];
