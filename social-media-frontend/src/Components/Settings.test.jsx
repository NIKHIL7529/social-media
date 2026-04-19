import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Settings from "./Settings";

describe("Settings", () => {
  it("shows login and signup actions for guests", () => {
    render(
      <MemoryRouter>
        <Settings setUser={vi.fn()} isAuthenticated={false} />
      </MemoryRouter>
    );

    expect(screen.getByText("Create New Account")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("shows account actions for authenticated users", () => {
    render(
      <MemoryRouter>
        <Settings setUser={vi.fn()} isAuthenticated />
      </MemoryRouter>
    );

    expect(screen.getByText("Switch Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});
