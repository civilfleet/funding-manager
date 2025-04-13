import { Building, BookOpen, Scroll, BookUser, FolderOpen, Users } from "lucide-react";

export default {
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
      title: "Users",
      url: "users",
      icon: BookUser,
    },
    {
      title: "Files",
      url: "files",
      icon: FolderOpen,
    },
  ],
  organization: [
    {
      title: "Organizations",
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
  ],
};
