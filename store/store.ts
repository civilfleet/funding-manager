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
  id: number;
  name: string;
  roleName: string;
  email: string;
};

type TeamStore = {
  team: Team;
  setTeam: (user: Team) => void;
  updateTeam: (updates: Partial<Team>) => void;
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      team: {
        id: 0,
        name: "",
        roleName: "",
        email: "",
      },
      setTeam: (team) => set({ team }),
      updateTeam: (updates) =>
        set((state) => ({ team: { ...state.team, ...updates } })),
    }),
    { name: "team-store" }
  )
);
