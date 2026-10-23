export function MemberCommentCell({ comment }: { comment?: string | null }) {
  if (!comment?.trim()) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <span
      className="block truncate text-sm text-slate-600 dark:text-zinc-400"
      title={comment}
    >
      {comment}
    </span>
  );
}
