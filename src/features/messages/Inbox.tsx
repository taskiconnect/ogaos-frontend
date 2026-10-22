"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inboxMessages, markRead } from "./api";
import { DocumentView, formatMessageDate } from "./document";
export default function Inbox() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["messages"], queryFn: inboxMessages });
  const read = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
  return (
    <main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-8">
      <header>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Updates and subscription notices from OgaOS.
        </p>
      </header>
      {query.isLoading && <p role="status">Loading messages…</p>}
      {query.isError && (
        <p role="alert">
          Messages could not be loaded.{" "}
          <button onClick={() => query.refetch()}>Retry</button>
        </p>
      )}
      {query.data?.length === 0 && <p>No messages yet.</p>}
      {read.isError && <p role="alert">{read.error.message}</p>}
      {query.data?.map((m) => (
        <article
          key={m.id}
          className={`space-y-4 rounded-2xl border p-5 ${m.read_at ? "border-border" : "border-blue-500"}`}
        >
          <header>
            <h2 className="text-xl font-semibold">{m.subject}</h2>
            <p className="text-xs text-muted-foreground">
              {formatMessageDate(m.created_at)} ·{" "}
              {m.read_at ? "Read" : "Unread"}
            </p>
          </header>
          <DocumentView document={m.document} />
          {!m.read_at && (
            <button
              disabled={read.isPending}
              onClick={() => read.mutate(m.id)}
              className="rounded-lg border border-border px-4 py-2 disabled:opacity-40"
            >
              Mark as read
            </button>
          )}
        </article>
      ))}
    </main>
  );
}
