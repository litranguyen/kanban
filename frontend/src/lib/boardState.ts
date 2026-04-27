import { Board, Card } from "@/types/kanban";

const nextCardId = () => `card-${globalThis.crypto.randomUUID()}`;

export const renameColumn = (
  board: Board,
  columnId: string,
  title: string,
): Board => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId ? { ...column, title } : column,
  ),
});

export const addCard = (
  board: Board,
  columnId: string,
  payload: Pick<Card, "title" | "details">,
): Board => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [...column.cards, { id: nextCardId(), ...payload }],
        }
      : column,
  ),
});

export const deleteCard = (board: Board, cardId: string): Board => ({
  ...board,
  columns: board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  })),
});

export const moveCard = (
  board: Board,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Board => {
  let movedCard: Card | undefined;

  const boardWithoutCard = {
    ...board,
    columns: board.columns.map((column) => {
      const card = column.cards.find((candidate) => candidate.id === cardId);
      if (card) {
        movedCard = card;
      }

      return {
        ...column,
        cards: column.cards.filter((candidate) => candidate.id !== cardId),
      };
    }),
  };

  if (!movedCard) {
    return board;
  }
  const cardToMove = movedCard;

  return {
    ...boardWithoutCard,
    columns: boardWithoutCard.columns.map((column) => {
      if (column.id !== toColumnId) {
        return column;
      }

      const nextCards = [...column.cards];
      const insertIndex = Math.min(Math.max(toIndex, 0), nextCards.length);
      nextCards.splice(insertIndex, 0, cardToMove);

      return { ...column, cards: nextCards };
    }),
  };
};
