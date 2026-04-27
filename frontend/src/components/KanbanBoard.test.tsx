import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KanbanBoard } from "@/components/KanbanBoard";

describe("KanbanBoard", () => {
  it("renders five columns from seed data", () => {
    render(<KanbanBoard />);
    expect(screen.getAllByLabelText(/title$/i).length).toBeGreaterThanOrEqual(5);
  });

  it("renames a column", () => {
    render(<KanbanBoard />);
    const input = screen.getAllByLabelText("Backlog title")[0];
    fireEvent.change(input, { target: { value: "Ideas" } });

    expect(screen.getByDisplayValue("Ideas")).toBeInTheDocument();
  });

  it("adds and deletes a card", () => {
    render(<KanbanBoard />);
    const titleInput = screen.getAllByLabelText("Card title")[0];
    const detailsInput = screen.getAllByLabelText("Card details")[0];
    const addButton = screen.getAllByRole("button", { name: "Add Card" })[0];

    fireEvent.change(titleInput, { target: { value: "Regression test card" } });
    fireEvent.change(detailsInput, { target: { value: "Details go here" } });
    fireEvent.click(addButton);

    expect(screen.getByText("Regression test card")).toBeInTheDocument();

    const newCardTitle = screen.getByText("Regression test card");
    const newCard = newCardTitle.closest("article");
    const deleteButton = newCard?.querySelector("button");
    fireEvent.click(deleteButton as HTMLButtonElement);
    expect(screen.queryByText("Regression test card")).not.toBeInTheDocument();
  });
});
