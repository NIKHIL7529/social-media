"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { queryKeys } from "@/lib/query-keys";
import type { Chat } from "@/types/social";
import { chatService } from "@/features/chat/chat-service";

export function GroupForm({ onDone }: { onDone: (chat?: Chat) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const followingsQuery = useQuery({
    queryKey: queryKeys.chatFollowings,
    queryFn: chatService.getFollowings,
  });
  const followings = followingsQuery.data?.followings[0]?.followings || [];
  const mutation = useMutation({
    mutationFn: () => chatService.createGroup({ name, users: members }),
    onSuccess: (data) => {
      toast.success("Group created");
      queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
      onDone(data.addGroup);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Group creation failed"),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="space-y-3 border-b border-line p-4"
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="min-h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
        placeholder="Group name optional"
      />
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-line p-2">
        {followingsQuery.isLoading && <p className="p-2 text-sm text-ink-muted">Loading followings...</p>}
        {!followingsQuery.isLoading && followings.length === 0 && <p className="p-2 text-sm text-ink-muted">Follow people to add them to groups.</p>}
        {followings.map((member) => (
          <label key={member} className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink hover:bg-accent-soft">
            <input
              type="checkbox"
              checked={members.includes(member)}
              onChange={(event) =>
                setMembers((current) =>
                  event.target.checked ? [...current, member] : current.filter((item) => item !== member),
                )
              }
              className="size-4 accent-accent"
            />
            {member}
          </label>
        ))}
      </div>
      <button disabled={mutation.isPending || members.length === 0} className="min-h-10 w-full rounded-md bg-accent text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        Create group
      </button>
    </form>
  );
}
