import { Board } from "@/types/kanban";

export const seedBoard: Board = {
  id: "board-main",
  title: "Product Roadmap Board",
  columns: [
    {
      id: "column-backlog",
      title: "Backlog",
      cards: [
        {
          id: "card-1",
          title: "Onboarding flow copy pass",
          details: "Refine tone and shorten first-run experience copy.",
        },
        {
          id: "card-2",
          title: "Mobile spacing audit",
          details: "Review all key screens for spacing consistency.",
        },
      ],
    },
    {
      id: "column-ready",
      title: "Ready",
      cards: [
        {
          id: "card-3",
          title: "Dashboard loading state",
          details: "Add graceful skeleton transitions for first load.",
        },
      ],
    },
    {
      id: "column-progress",
      title: "In Progress",
      cards: [
        {
          id: "card-4",
          title: "Billing screen refresh",
          details: "Polish hierarchy and update plan comparison section.",
        },
      ],
    },
    {
      id: "column-review",
      title: "Review",
      cards: [
        {
          id: "card-5",
          title: "Accessibility keyboard pass",
          details: "Verify focus order and labels across core flows.",
        },
      ],
    },
    {
      id: "column-done",
      title: "Done",
      cards: [
        {
          id: "card-6",
          title: "Brand color system",
          details: "Finalized semantic token mapping for launch theme.",
        },
      ],
    },
  ],
};
