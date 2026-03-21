import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionState {
  sessionId: string;
  userId: string;
  //initSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: "6aad5be6-24b2-4c00-97ab-7dc3723fdfc5",
      userId: "hitesh",
    }),
    {
      name: "ai-tutor-session",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
