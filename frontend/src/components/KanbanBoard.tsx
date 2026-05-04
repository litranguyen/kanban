"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { addCard, deleteCard, renameColumn } from "@/lib/boardState";
import { Board, Card, Column } from "@/types/kanban";

type CardFormProps = {
  onSubmit: (title: string, details: string) => void;
};

const CardForm = ({ onSubmit }: CardFormProps) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextDetails = details.trim();
    if (!nextTitle || !nextDetails) {
      return;
    }
    onSubmit(nextTitle, nextDetails);
    setTitle("");
    setDetails("");
  };

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <input
        aria-label="Card title"
        placeholder="Card title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        aria-label="Card details"
        placeholder="Card details"
        value={details}
        onChange={(event) => setDetails(event.target.value)}
      />
      <button type="submit">Add Card</button>
    </form>
  );
};

type SortableCardProps = {
  card: Card;
  onDelete: (cardId: string) => void;
};

const SortableCard = ({ card, onDelete }: SortableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "card" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      data-testid={`card-${card.id}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        Drag
      </div>
      <h3>{card.title}</h3>
      <p>{card.details}</p>
      <button onClick={() => onDelete(card.id)} type="button">
        Delete
      </button>
    </article>
  );
};

type ColumnProps = {
  column: Column;
  onRenameColumn: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

const KanbanColumn = ({
  column,
  onRenameColumn,
  onAddCard,
  onDeleteCard,
}: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: "column" } });

  return (
    <section
      ref={setNodeRef}
      className="kanban-column"
      data-column-id={column.id}
      data-testid={`column-${column.id}`}
    >
      <input
        aria-label={`${column.title} title`}
        className="column-title"
        value={column.title}
        onChange={(event) => onRenameColumn(column.id, event.target.value)}
      />
      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>
      <CardForm onSubmit={(title, details) => onAddCard(column.id, title, details)} />
    </section>
  );
};

export const KanbanBoard = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const response = await fetch("/api/board");
        if (!response.ok) {
          throw new Error("Board fetch failed");
        }
        const boardData = await response.json();
        setBoard(boardData);
      } catch (fetchError) {
        setError("Unable to load board data.");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, []);

  const persistBoard = async (nextBoard: Board) => {
    try {
      const response = await fetch("/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextBoard),
      });
      if (!response.ok) {
        throw new Error("Save failed");
      }
    } catch (saveError) {
      setError("Unable to save board changes.");
    }
  };

  const updateBoard = (updater: (current: Board) => Board) => {
    setBoard((current) => {
      if (!current) {
        return current;
      }
      const nextBoard = updater(current);
      persistBoard(nextBoard);
      return nextBoard;
    });
  };

  const cardLocations = useMemo(() => {
    const lookup = new Map<string, { columnId: string; index: number; card: Card }>();
    if (!board) {
      return lookup;
    }
    board.columns.forEach((column) => {
      column.cards.forEach((card, index) => {
        lookup.set(card.id, { columnId: column.id, index, card });
      });
    });
    return lookup;
  }, [board]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const location = cardLocations.get(activeId);
    setActiveCard(location?.card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId || activeId === overId) {
      return;
    }

    const activeLocation = cardLocations.get(activeId);
    const overLocation = cardLocations.get(overId);
    if (!activeLocation) {
      return;
    }

    if (overLocation) {
      updateBoard((current) => {
        const fromColumnIndex = current.columns.findIndex(
          (column) => column.id === activeLocation.columnId,
        );
        const toColumnIndex = current.columns.findIndex(
          (column) => column.id === overLocation.columnId,
        );
        if (fromColumnIndex < 0 || toColumnIndex < 0) {
          return current;
        }

        const fromColumn = current.columns[fromColumnIndex];
        const toColumn = current.columns[toColumnIndex];
        const fromIndex = fromColumn.cards.findIndex((card) => card.id === activeId);
        if (fromIndex < 0) {
          return current;
        }

        if (fromColumn.id === toColumn.id) {
          const toIndex = toColumn.cards.findIndex((card) => card.id === overId);
          if (toIndex < 0 || toIndex === fromIndex) {
            return current;
          }
          const updatedColumns = [...current.columns];
          updatedColumns[fromColumnIndex] = {
            ...fromColumn,
            cards: arrayMove(fromColumn.cards, fromIndex, toIndex),
          };
          return { ...current, columns: updatedColumns };
        }

        const movingCard = fromColumn.cards[fromIndex];
        const nextFromCards = fromColumn.cards.filter((card) => card.id !== activeId);
        const targetIndex = toColumn.cards.findIndex((card) => card.id === overId);
        const nextToCards = [...toColumn.cards];
        nextToCards.splice(targetIndex < 0 ? nextToCards.length : targetIndex, 0, movingCard);

        const updatedColumns = [...current.columns];
        updatedColumns[fromColumnIndex] = { ...fromColumn, cards: nextFromCards };
        updatedColumns[toColumnIndex] = { ...toColumn, cards: nextToCards };
        return { ...current, columns: updatedColumns };
      });
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId || activeId === overId) {
      return;
    }

    updateBoard((current) => {
      const activeColumn = current.columns.find((column) =>
        column.cards.some((card) => card.id === activeId),
      );
      if (!activeColumn) {
        return current;
      }

      const overColumn =
        current.columns.find((column) => column.cards.some((card) => card.id === overId)) ??
        current.columns.find((column) => column.id === overId);
      if (!overColumn || overColumn.id === activeColumn.id) {
        return current;
      }

      const activeColumnIndex = current.columns.findIndex(
        (column) => column.id === activeColumn.id,
      );
      const overColumnIndex = current.columns.findIndex((column) => column.id === overColumn.id);
      const activeCardIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
      if (activeCardIndex < 0 || activeColumnIndex < 0 || overColumnIndex < 0) {
        return current;
      }

      const movingCard = activeColumn.cards[activeCardIndex];
      const nextActiveCards = activeColumn.cards.filter((card) => card.id !== activeId);
      const overCardIndex = overColumn.cards.findIndex((card) => card.id === overId);
      const insertIndex = overCardIndex >= 0 ? overCardIndex : overColumn.cards.length;
      const nextOverCards = [...overColumn.cards];
      nextOverCards.splice(insertIndex, 0, movingCard);

      const nextColumns = [...current.columns];
      nextColumns[activeColumnIndex] = { ...activeColumn, cards: nextActiveCards };
      nextColumns[overColumnIndex] = { ...overColumn, cards: nextOverCards };
      return { ...current, columns: nextColumns };
    });
  };

  if (loading) {
    return <div className="kanban-page">Loading board...</div>;
  }

  if (error || !board) {
    return <div className="kanban-page">{error ?? "Board unavailable."}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <main className="kanban-page">
        <header>
          <h1>{board.title}</h1>
          <p>Single-board planning, simplified.</p>
        </header>
        <div className="kanban-grid">
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onRenameColumn={(columnId, title) =>
                updateBoard((current) => renameColumn(current, columnId, title))
              }
              onAddCard={(columnId, title, details) =>
                updateBoard((current) => addCard(current, columnId, { title, details }))
              }
              onDeleteCard={(cardId) =>
                updateBoard((current) => deleteCard(current, cardId))
              }
            />
          ))}
        </div>
      </main>
      <DragOverlay>
        {activeCard ? (
          <article className="kanban-card dragging">
            <h3>{activeCard.title}</h3>
            <p>{activeCard.details}</p>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
