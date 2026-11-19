"use client";

import { useLocalStorage } from "./use-local-storage";

export const allGroups = [
  { id: "g1", name: "Product Design India", members: 48200, desc: "For product designers across India to share work, get feedback, and find jobs.", joined: true },
  { id: "g2", name: "Fintech Builders", members: 22100, desc: "People building fintech products in India — engineers, designers, and PMs.", joined: true },
  { id: "g3", name: "IIT Bombay Alumni Network", members: 61500, desc: "Official alumni group for IIT Bombay graduates.", joined: true },
  { id: "g4", name: "Women in Tech Leadership", members: 33400, desc: "A community for women in senior tech and product roles.", joined: false },
  { id: "g5", name: "Remote Work India", members: 76200, desc: "Discussions on remote jobs, tools, and working across time zones.", joined: false },
  { id: "g6", name: "UX Research Guild", members: 15800, desc: "Sharing research methods, templates, and job leads for UX researchers.", joined: false },
];

const JOINED_KEY = "jobportal_joined_groups";
const defaultJoined = allGroups.filter((g) => g.joined).map((g) => g.id);

/** Which groups the seeker has joined (kept in this browser). */
export function useJoinedGroups() {
  const [stored, write] = useLocalStorage<string[]>(JOINED_KEY);
  const joined = stored ?? defaultJoined;
  return {
    joined,
    isJoined: (id: string) => joined.includes(id),
    toggle: (id: string) => write(joined.includes(id) ? joined.filter((x) => x !== id) : [...joined, id]),
  };
}
