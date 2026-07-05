export function PresenceDot({ online }: { online: boolean }) {
  return <span className={`size-2 flex-shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />;
}

export function typingText(users?: Record<string, boolean>) {
  const names = Object.keys(users || {});
  if (!names.length) return "";
  return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing`;
}
