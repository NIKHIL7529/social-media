import { MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Login from "./Login";

const mockNavigate = vi.hoisted(() => vi.fn());
const swalFire = vi.hoisted(() => vi.fn());
const swalClose = vi.hoisted(() => vi.fn());
const swalLoading = vi.hoisted(() => vi.fn());

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFire,
    close: swalClose,
    showLoading: swalLoading,
  },
}));

describe("Login", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    swalFire.mockReset();
    swalClose.mockReset();
    global.fetch = vi.fn();
  });

  it("returns authenticated users to the protected page they originally requested", async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: "/chat" } }]}>
        <Login
          setUser={vi.fn()}
          isAuthenticated
          authChecked
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/chat", { replace: true });
    });
  });

  it("logs in successfully and navigates back to the stored return path", async () => {
    const user = userEvent.setup();
    const setUser = vi.fn();

    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 200,
        user: { _id: "1", name: "alice" },
      }),
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: "/profile" } }]}>
        <Login
          setUser={setUser}
          isAuthenticated={false}
          authChecked
        />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Username"), "alice");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByDisplayValue("Login"));

    await waitFor(() => {
      expect(setUser).toHaveBeenCalledWith({ _id: "1", name: "alice" });
      expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
    });
  });
});
