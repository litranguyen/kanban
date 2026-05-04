"use client";

import { FormEvent, useState } from "react";

import { KanbanBoardClient } from "@/components/KanbanBoardClient";
import { validateCredentials } from "@/lib/auth";

export const AuthGate = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateCredentials(username.trim(), password.trim())) {
      setAuthenticated(true);
      setError(null);
      return;
    }

    setError("Invalid credentials");
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUsername("");
    setPassword("");
    setError(null);
  };

  if (authenticated) {
    return (
      <section className="auth-board-shell">
        <div className="auth-toolbar">
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <KanbanBoardClient />
      </section>
    );
  }

  return (
    <main className="auth-page min-h-screen flex items-center justify-center px-6 py-12">
      <section className="auth-card w-full max-w-md">
        <h1>Login to Kanban MVP</h1>
        <p>Use fixed credentials: user / password</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              aria-label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              aria-label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit">Login</button>
          {error ? <p role="alert">{error}</p> : null}
        </form>
      </section>
    </main>
  );
};
