import { MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Search from "./Search";

const swalFire = vi.hoisted(() => vi.fn());

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFire,
    close: vi.fn(),
    showLoading: vi.fn(),
  },
}));

describe("Search", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        status: 200,
        search_users: [{ _id: "u1", name: "alex", photo: "" }],
      }),
    });
    swalFire.mockReset();
  });

  it("lets guests search and see public user results", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Search here..."), "alex");
    await user.click(container.querySelector('[class*="searchIcon"]'));

    expect(await screen.findByText("alex")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/user/search"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("shows an empty-state message when no results are found", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        status: 200,
        search_users: [],
      }),
    });
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Search here..."), "nobody");
    await user.click(container.querySelector('[class*="searchIcon"]'));

    expect(await screen.findByText("No Match Found")).toBeInTheDocument();
  });
});
