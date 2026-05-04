import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthGate } from "@/components/AuthGate";
import { validateCredentials } from "@/lib/auth";

describe("AuthGate", () => {
  it("renders the login form initially", () => {
    render(<AuthGate />);

    expect(screen.getByRole("heading", { name: /login to kanban mvp/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows an error for invalid credentials", () => {
    render(<AuthGate />);

    fireEvent.change(screen.getAllByLabelText(/username/i)[0], { target: { value: "bad" } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: "wrong" } });
    fireEvent.click(screen.getAllByRole("button", { name: /login/i })[0]);

    expect(screen.getByRole("alert")).toHaveTextContent(/invalid credentials/i);
    expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument();
  });

  it("unlocks the board with valid credentials", () => {
    render(<AuthGate />);

    fireEvent.change(screen.getAllByLabelText(/username/i)[0], { target: { value: "user" } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: "password" } });
    fireEvent.click(screen.getAllByRole("button", { name: /login/i })[0]);

    expect(screen.getByText(/^user$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("returns to login when logging out", () => {
    render(<AuthGate />);

    fireEvent.change(screen.getAllByLabelText(/username/i)[0], { target: { value: "user" } });
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: "password" } });
    fireEvent.click(screen.getAllByRole("button", { name: /login/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /logout/i })[0]);

    expect(screen.getAllByRole("heading", { name: /login to kanban mvp/i })[0]).toBeInTheDocument();
  });
});
