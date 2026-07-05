"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { TextAreaField, TextField } from "@/components/form-controls";
import { fileToDataUrl } from "@/lib/file-to-data-url";
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
      await toast.promise(
        postService.create({ topic, text, photo, commentable }),
        {
          loading: "Publishing...",
          success: "Post published",
          error: (error) => error.message || "Could not publish",
        },
      );
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
          <label className="mt-5 block cursor-pointer overflow-hidden rounded-lg border border-dashed border-line bg-slate-50">
            <input
              required
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setPhoto(await fileToDataUrl(file));
                } catch (error) {
                  event.currentTarget.value = "";
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Could not read image",
                  );
                }
              }}
              className="sr-only"
            />
            <div className="relative grid aspect-[4/3] place-items-center">
              {photo ? (
                <Image
                  src={photo}
                  alt="Post preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-ink-muted">
                  <span className="grid size-14 place-items-center rounded-full bg-white text-accent-deep shadow-soft">
                    <Camera />
                  </span>
                  <span className="font-bold">Select photo from device</span>
                  <span className="text-sm">
                    Image uploads support up to 10MB
                  </span>
                </div>
              )}
            </div>
          </label>
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
