import { MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Post from "./Post";

const mockNavigate = vi.hoisted(() => vi.fn());
const swalFire = vi.hoisted(() => vi.fn());

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
  },
}));

vi.mock("emoji-picker-react", () => ({
  default: () => <div>emoji-picker</div>,
}));

describe("Post guest protections", () => {
  const post = {
    _id: "post-1",
    user: { name: "author", photo: "" },
    photo: "https://example.com/post.jpg",
    topic: "Topic",
    text: "A sample post body",
    likes: 12,
    commentable: true,
  };

  beforeEach(() => {
    mockNavigate.mockReset();
    swalFire.mockReset();
    swalFire.mockResolvedValue({});
    global.fetch = vi.fn();
  });

  it("prompts guests to sign in when they try to like a post", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/posts"]}>
        <Post post={post} user={{}} admin="false" isAuthenticated={false} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(swalFire).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { from: "/posts" },
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("prompts guests to sign in when they try to follow from a post", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/posts"]}>
        <Post
          post={post}
          user={{}}
          setFollow={vi.fn()}
          isAuthenticated={false}
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Follow" }));

    expect(swalFire).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { from: "/posts" },
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the user identity when isAuthenticated is not passed", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 200, likes: 13 }),
    });

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Post post={post} user={{ name: "alice", liked: [], saved: [] }} admin="false" />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Like post" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/post\/liked$/),
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });
    expect(screen.getByText("13 likes")).toBeInTheDocument();
  });

  it("prompts for login when an authenticated action returns 401", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ status: 401 }),
    });

    render(
      <MemoryRouter initialEntries={["/posts"]}>
        <Post
          post={post}
          user={{ name: "alice", liked: [], saved: [] }}
          admin="false"
          isAuthenticated
        />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Like post" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { from: "/posts" },
      });
    });
  });
});
