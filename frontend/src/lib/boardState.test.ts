import { describe, expect, it } from "vitest";

import { seedBoard } from "@/data/seedBoard";
import { addCard, deleteCard, moveCard, renameColumn } from "@/lib/boardState";

describe("boardState helpers", () => {
  it("renames a column", () => {
    const result = renameColumn(seedBoard, "column-backlog", "Ideas");
    expect(result.columns[0].title).toBe("Ideas");
    expect(seedBoard.columns[0].title).toBe("Backlog");
  });

  it("adds a card to the selected column", () => {
    const beforeCount = seedBoard.columns[1].cards.length;
    const result = addCard(seedBoard, "column-ready", {
      title: "New card",
      details: "Details",
    });

    expect(result.columns[1].cards).toHaveLength(beforeCount + 1);
    expect(result.columns[1].cards.at(-1)?.title).toBe("New card");
  });

  it("deletes a card from board", () => {
    const result = deleteCard(seedBoard, "card-5");
    const found = result.columns.some((column) =>
      column.cards.some((card) => card.id === "card-5"),
    );

    expect(found).toBe(false);
  });

  it("moves a card into another column", () => {
    const result = moveCard(seedBoard, "card-1", "column-done", 0);
    expect(result.columns[4].cards[0].id).toBe("card-1");
    const backlogHasCard = result.columns[0].cards.some((card) => card.id === "card-1");
    expect(backlogHasCard).toBe(false);
  });
});
