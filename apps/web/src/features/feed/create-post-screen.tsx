"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { addPostToCaches } from "@/features/feed/post-cache";
import { postService } from "@/features/feed/post-service";
import { queryKeys } from "@/lib/query-keys";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { LoginRequired } from "@/components/login-required";
import { CreatePostSkeleton } from "@/components/skeletons";

export default function CreatePostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useCurrentUser();
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [commentable, setCommentable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
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
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not publish your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <CreatePostSkeleton />;
  if (!user) return error ? null : <LoginRequired message="to share a post." />;
  return (
      <section className="mx-auto w-full max-w-feed">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-line bg-surface p-5 shadow-card"
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
          {formError && <p role="alert" className="mt-4 break-words text-sm text-danger">{formError}</p>}
          <button disabled={submitting} className="mt-6 min-h-11 w-full rounded-xl bg-accent font-bold text-accent-contrast disabled:cursor-wait disabled:opacity-60">
            {submitting ? "Publishing…" : "Publish"}
          </button>
        </form>
      </section>
  );
}
