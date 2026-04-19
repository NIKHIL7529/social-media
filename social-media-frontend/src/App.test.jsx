import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./Components/NavBar", () => ({
  default: () => <div>nav-bar</div>,
}));

vi.mock("./Components/SideBar", () => ({
  default: () => <div>side-bar</div>,
}));

vi.mock("./Components/Posts", () => ({
  default: () => <div>posts-page</div>,
}));

vi.mock("./Components/Search", () => ({
  default: () => <div>search-page</div>,
}));

vi.mock("./Components/Profile", () => ({
  default: () => <div>profile-page</div>,
}));

vi.mock("./Components/Settings", () => ({
  default: () => <div>settings-page</div>,
}));

vi.mock("./Components/Signup", () => ({
  default: () => <div>signup-page</div>,
}));

vi.mock("./Components/Login", () => ({
  default: () => <div>login-page</div>,
}));

vi.mock("./Components/AddPost", () => ({
  default: () => <div>add-post-page</div>,
}));

vi.mock("./Components/User", () => ({
  default: () => <div>user-page</div>,
}));

vi.mock("./Components/Chat", () => ({
  default: () => <div>chat-page</div>,
}));

vi.mock("./Components/EditProfile", () => ({
  default: () => <div>edit-profile-page</div>,
}));

vi.mock("./Components/SavedPosts", () => ({
  default: () => <div>saved-posts-page</div>,
}));

describe("App routing", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("redirects guests away from protected own-profile route", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ status: 401 }),
    });
    window.history.pushState({}, "", "/profile");

    render(<App />);

    expect(await screen.findByText("login-page")).toBeInTheDocument();
  });

  it("allows guests to open the public search page", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ status: 401 }),
    });
    window.history.pushState({}, "", "/search");

    render(<App />);

    expect(await screen.findByText("search-page")).toBeInTheDocument();
  });

  it("allows authenticated users to open their own profile", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 200,
        user: { _id: "1", name: "alice" },
      }),
    });
    window.history.pushState({}, "", "/profile");

    render(<App />);

    expect(await screen.findByText("profile-page")).toBeInTheDocument();
  });

  it("lands on the public posts page by default", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ status: 401 }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("posts-page")).toBeInTheDocument();
    });
  });
});
