import { create } from "zustand";
import { persist } from "zustand/middleware";

type StoreState = {
  isTeamMember: boolean;
  setIsTeamMember: (value: boolean) => void;
};

export const useUserStore = create<StoreState>((set) => ({
  isTeamMember: false, // Default value
  setIsTeamMember: (value) => set({ isTeamMember: value }),
}));

type Team = {
  id: string;
  name: string;
  roleName?: string | undefined;
  email: string;
};

type TeamStore = {
  team: Team;
  setTeam: (user: Team) => void;
  updateTeam: (updates: Partial<Team>) => void;
  reset: () => void;
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      team: {
        id: "",
        name: "",
        roleName: "",
        email: "",
      },
      setTeam: (team) => set({ team }),
      updateTeam: (updates) =>
        set((state) => ({ team: { ...state.team, ...updates } })),
      reset: () => set({ team: { id: "", name: "", roleName: "", email: "" } }),
    }),
    { name: "team-store" }
  )
);

type Organization = {
  id: string;
  name: string;
  email: string;
};

type OrganizationStore = {
  organization: Organization;
  setOrganization: (user: Organization) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  reset: () => void;
};

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      organization: {
        id: "",
        name: "",
        email: "",
      },
      setOrganization: (organization) => set({ organization }),
      updateOrganization: (updates) =>
        set((state) => ({
          organization: { ...state.organization, ...updates },
        })),
      reset: () => set({ organization: { id: "", name: "", email: "" } }),
    }),
    { name: "org-store" }
  )
);
