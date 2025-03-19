import { create } from "zustand";
import { persist } from "zustand/middleware";

type Team = {
  teamId: string;
  setTeamId: (value: string) => void;
};

export const useTeamStore = create<Team>((set) => ({
  teamId: "",
  setTeamId: (teamId) => set({ teamId }),
}));

type Organization = {
  organizationId: string;
  setOrganizationId: (value: string) => void;
};

export const useOrganizationStore = create<Organization>((set) => ({
  organizationId: "",
  setOrganizationId: (organizationId) => set({ organizationId }),
}));
