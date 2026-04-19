import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import User from "./User";

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

vi.mock("./Post", () => ({
  default: () => <div>user-post</div>,
}));

vi.mock("./ListPage", () => ({
  default: () => <div>list-page</div>,
}));

describe("Public user profile", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    swalFire.mockReset();
    swalFire.mockResolvedValue({});
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          status: 200,
          user: {
            _id: "u1",
            name: "alex",
            description: "Photographer",
            followers: [],
            followings: [],
            photo: "",
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          status: 200,
          post: [],
        }),
      });
  });

  it("lets guests view a profile but redirects them to login for follow", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/user/u1"]}>
        <Routes>
          <Route
            path="/user/:id"
            element={<User user={null} isAuthenticated={false} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("alex")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Follow" }));

    expect(swalFire).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { from: "/user/u1" },
      });
    });
  });

  it("lets guests view a profile but redirects them to login for messaging", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/user/u1"]}>
        <Routes>
          <Route
            path="/user/:id"
            element={<User user={null} isAuthenticated={false} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("alex")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Message" }));

    expect(swalFire).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { from: "/user/u1" },
      });
    });
  });
});
