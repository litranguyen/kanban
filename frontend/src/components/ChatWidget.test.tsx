import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatWidget } from "@/components/ChatWidget";

describe("ChatWidget", () => {
  const onBoardUpdate = vi.fn();

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    onBoardUpdate.mockClear();
  });

  it("renders the open button by default", () => {
    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
  });

  it("opens the chat panel when the toggle button is clicked", () => {
    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    expect(screen.getByRole("heading", { name: "AI Assistant" })).toBeInTheDocument();
  });

  it("closes the chat panel when the close button is clicked", () => {
    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "AI Assistant" })).not.toBeInTheDocument();
  });

  it("displays the user message and AI response after sending", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ response: "Hello from AI", board_updated: false }),
    })));

    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));

    fireEvent.change(screen.getByPlaceholderText("Ask me about the board..."), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => screen.getByText("Hello from AI"));
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hello from AI")).toBeInTheDocument();
  });

  it("does not call onBoardUpdate when board_updated is false", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ response: "Just a text reply", board_updated: false }),
    })));

    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    fireEvent.change(screen.getByPlaceholderText("Ask me about the board..."), {
      target: { value: "Tell me something" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => screen.getByText("Just a text reply"));
    expect(onBoardUpdate).not.toHaveBeenCalled();
  });

  it("calls onBoardUpdate when board_updated is true", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ response: "Board updated successfully.", board_updated: true }),
    })));

    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    fireEvent.change(screen.getByPlaceholderText("Ask me about the board..."), {
      target: { value: "Update the board" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(onBoardUpdate).toHaveBeenCalledOnce());
    expect(screen.getByText("Board updated successfully.")).toBeInTheDocument();
  });

  it("shows an error message when the fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("Network error");
    }));

    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    fireEvent.change(screen.getByPlaceholderText("Ask me about the board..."), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      screen.getByText("Sorry, I couldn't process your request."),
    );
    expect(onBoardUpdate).not.toHaveBeenCalled();
  });

  it("disables the Send button when input is empty", () => {
    render(<ChatWidget onBoardUpdate={onBoardUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
