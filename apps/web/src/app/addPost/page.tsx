"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { addPostToCaches } from "@/features/feed/post-cache";
import { postService } from "@/features/feed/post-service";
import { queryKeys } from "@/lib/query-keys";

export default function AddPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [commentable, setCommentable] = useState(true);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await toast.promise(
        postService.create({ topic, text, photo, commentable }),
        {
          loading: "Publishing...",
          success: "Post published",
          error: (error) => error.message || "Could not publish",
        },
      );
      addPostToCaches(queryClient, result.post);
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profilePosts });
      router.push("/posts");
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <form
          onSubmit={submit}
          className="rounded-lg border border-line bg-white p-5 shadow-card"
        >
          <h1 className="text-2xl font-extrabold text-ink">New post</h1>
          <div className="mt-5">
            <ImageUploadField
              label="Post preview"
              emptyText="Select photo from device"
              helperText="Image uploads support up to 10MB"
              preview={photo}
              onChange={setPhoto}
              required
            />
          </div>
          <div className="mt-5">
            <TextField label="Topic" value={topic} onChange={setTopic} />
          </div>
          <div className="mt-4 [&_textarea]:min-h-32">
            <TextAreaField label="Text" value={text} onChange={setText} />
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={commentable}
              onChange={(event) => setCommentable(event.target.checked)}
              className="size-5 accent-accent"
            />
            Allow comments
          </label>
          <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">
            Publish
          </button>
        </form>
      </section>
    </AppShell>
  );
}
