import { Building, BookOpen, Scroll, BookUser, FolderOpen, Users, Settings, UserCircle2, Calendar, UsersRound, type LucideIcon } from "lucide-react";

type NavItemBase = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
};

type NavItemSeparator = {
  type: "separator";
  label?: string;
};

type NavItem = NavItemBase | NavItemSeparator;

const navItems: {
  admin: NavItem[];
  team: NavItem[];
  organization: NavItem[];
} = {
  admin: [
    {
      title: "Teams",
      url: "teams",
      icon: Users,
      isActive: true,
    },
    {
      title: "Organizations",
      url: "organizations",
      icon: Building,
      isActive: true,
    },
  ],
  team: [
    {
      type: "separator",
      label: "Funding",
    },
    {
      title: "Organizations",
      url: "organizations",
      icon: Building,
      isActive: true,
    },
    {
      title: "Funding Requests",
      url: "funding-requests",
      icon: BookOpen,
    },
    {
      title: "Donation Agreements",
      url: "donation-agreements",
      icon: Scroll,
    },
    {
      title: "Transactions",
      url: "transactions",
      icon: Scroll,
    },
    {
      title: "Files",
      url: "files",
      icon: FolderOpen,
    },
    {
      type: "separator",
      label: "CRM",
    },
    {
      title: "Contacts",
      url: "contacts",
      icon: UserCircle2,
    },
    {
      title: "Events",
      url: "events",
      icon: Calendar,
    },
    {
      type: "separator",
    },
    {
      title: "Users",
      url: "users",
      icon: BookUser,
    },
    {
      title: "Groups",
      url: "groups",
      icon: UsersRound,
    },
    {
      title: "Settings",
      url: "settings",
      icon: Settings,
    },
  ],
  organization: [
    {
      title: "Organization Profile",
      url: "profile",
      icon: Building,
      isActive: true,
    },

    {
      title: "Funding Requests",
      url: "funding-requests",
      icon: BookOpen,
    },
    {
      title: "Donation Agreements",
      url: "donation-agreements",
      icon: Scroll,
    },

    {
      title: "Users",
      url: "users",
      icon: BookUser,
    },
    {
      title: "Files",
      url: "files",
      icon: FolderOpen,
    },
    {
      title: "Transactions",
      url: "transactions",
      icon: Scroll,
    },
  ],
};

export default navItems;
