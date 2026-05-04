import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KanbanBoard } from "@/components/KanbanBoard";
import { seedBoard } from "@/data/seedBoard";

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input, init) => {
      const url = typeof input === "string" ? input : input.url;
      const method = init?.method ?? "GET";

      if (url.endsWith("/api/board") && method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => seedBoard,
        };
      }

      if (url.endsWith("/api/board") && method === "PUT") {
        return {
          ok: true,
          status: 200,
          json: async () => seedBoard,
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders five columns from seed data", async () => {
    render(<KanbanBoard />);
    const inputs = await screen.findAllByLabelText(/title$/i);
    expect(inputs.length).toBeGreaterThanOrEqual(5);
  });

  it("renames a column", async () => {
    render(<KanbanBoard />);
    const input = await screen.findByLabelText("Backlog title");
    fireEvent.change(input, { target: { value: "Ideas" } });

    expect(await screen.findByDisplayValue("Ideas")).toBeInTheDocument();
  });

  it("adds and deletes a card", async () => {
    render(<KanbanBoard />);
    const titleInput = await screen.findAllByLabelText("Card title");
    const detailsInput = await screen.findAllByLabelText("Card details");
    const addButton = await screen.findAllByRole("button", { name: "Add Card" });

    fireEvent.change(titleInput[0], { target: { value: "Regression test card" } });
    fireEvent.change(detailsInput[0], { target: { value: "Details go here" } });
    fireEvent.click(addButton[0]);

    expect(await screen.findByText("Regression test card")).toBeInTheDocument();

    const newCardTitle = screen.getByText("Regression test card");
    const newCard = newCardTitle.closest("article");
    const deleteButton = newCard?.querySelector("button");
    fireEvent.click(deleteButton as HTMLButtonElement);
    expect(screen.queryByText("Regression test card")).not.toBeInTheDocument();
  });
});
