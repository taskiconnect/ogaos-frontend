"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import {
  AudiencePreview,
  findRecipients,
  MessagePayload,
  previewMessage,
  Recipient,
  sendMessage,
  sentMessages,
} from "./api";
import {
  Block,
  DocumentView,
  formatMessageDate,
  Run,
  safeLink,
} from "./document";
const field = "w-full rounded-xl border border-border bg-background p-3";
const button =
  "rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40";
const emptyBlock = (): Block => ({ kind: "paragraph", runs: [{ text: "" }] });
export default function Composer() {
  const role = useAdminAuthStore((s) => s.user?.role);
  const allowed = role === "super_admin" || role === "support";
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([emptyBlock()]);
  const [all, setAll] = useState(false);
  const [email, setEmail] = useState(false);
  const [selected, setSelected] = useState<Recipient[]>([]);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [preview, setPreview] = useState<AudiencePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const users = useQuery({
    queryKey: ["message-recipients", term],
    queryFn: () => findRecipients(term),
    enabled: allowed && !all,
  });
  const history = useQuery({
    queryKey: ["admin-messages"],
    queryFn: sentMessages,
    enabled: allowed,
  });
  function edit(action: () => void) {
    action();
    setPreview(null);
    setNotice("");
  }
  function updateRun(b: number, r: number, change: Partial<Run>) {
    edit(() =>
      setBlocks((prev) =>
        prev.map((block, i) =>
          i === b
            ? {
                ...block,
                runs: block.runs.map((run, j) =>
                  j === r ? { ...run, ...change } : run,
                ),
              }
            : block,
        ),
      ),
    );
  }
  const payload: MessagePayload = {
    subject: subject.trim(),
    document: blocks,
    all,
    email,
    user_ids: all ? [] : selected.map((u) => u.id).sort(),
  };
  const valid =
    new TextEncoder().encode(payload.subject).length <= 160 &&
    !!payload.subject &&
    (all || (selected.length > 0 && selected.length <= 1000)) &&
    blocks.some((b) => b.runs.some((r) => r.text.trim())) &&
    new TextEncoder().encode(
      blocks.flatMap((b) => b.runs.map((r) => r.text)).join(""),
    ).length <= 50000 &&
    blocks.every((b) => b.runs.every((r) => !r.link || safeLink(r.link)));
  async function act(send: boolean) {
    if (!valid || busy || (send && !preview)) return;
    setBusy(true);
    setNotice("");
    try {
      if (send && preview) {
        const result = await sendMessage({
          ...payload,
          confirmation: preview.confirmation,
        });
        setNotice(
          `Message sent to ${result.recipients} users.${email ? " Email delivery is queued." : ""}`,
        );
        setSubject("");
        setBlocks([emptyBlock()]);
        setSelected([]);
        setAll(false);
        setPreview(null);
        await qc.invalidateQueries({ queryKey: ["admin-messages"] });
      } else setPreview(await previewMessage(payload));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Request failed. Please retry.",
      );
      if (!send) setPreview(null);
    } finally {
      setBusy(false);
    }
  }
  if (!allowed)
    return (
      <p className="p-8">
        Messaging is available to support and super administrators.
      </p>
    );
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header>
        <p className="text-sm text-blue-400">Customer communication</p>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Send a formatted update to one user, selected users, or everyone with
          an active account.
        </p>
      </header>
      <fieldset
        disabled={busy}
        className="space-y-5 rounded-2xl border border-border bg-card p-5 disabled:opacity-70"
      >
        <label className="block space-y-2">
          <span>Subject</span>
          <input
            className={field}
            maxLength={160}
            value={subject}
            onChange={(e) => edit(() => setSubject(e.target.value))}
          />
        </label>
        <div className="flex flex-wrap gap-5">
          <label>
            <input
              type="checkbox"
              checked={all}
              onChange={(e) => edit(() => setAll(e.target.checked))}
            />{" "}
            All active users
          </label>
          <label>
            <input
              type="checkbox"
              checked={email}
              onChange={(e) => edit(() => setEmail(e.target.checked))}
            />{" "}
            Also send by email
          </label>
        </div>
        {!all && (
          <section className="space-y-3">
            <label className="block">
              Find recipients
              <input
                className={field}
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <p className="text-sm">
              {selected.length} selected · search returns up to 50 users
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <button
                  type="button"
                  className={button}
                  key={u.id}
                  onClick={() =>
                    edit(() =>
                      setSelected((prev) => prev.filter((x) => x.id !== u.id)),
                    )
                  }
                  aria-label={`Remove ${u.email}`}
                >
                  {u.email} ×
                </button>
              ))}
            </div>
            {users.isLoading && <p role="status">Loading recipients…</p>}
            {users.isError && (
              <p role="alert">
                Could not load recipients.{" "}
                <button type="button" onClick={() => users.refetch()}>
                  Retry
                </button>
              </p>
            )}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              {users.data?.map((u) => (
                <label
                  className="flex gap-3 border-b border-border p-3"
                  key={u.id}
                >
                  <input
                    type="checkbox"
                    checked={selected.some((x) => x.id === u.id)}
                    onChange={(e) =>
                      edit(() =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, u]
                            : prev.filter((x) => x.id !== u.id),
                        ),
                      )
                    }
                  />
                  <span>
                    {u.first_name} {u.last_name}
                    <span className="block text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </span>
                </label>
              ))}
              {users.data?.length === 0 && (
                <p className="p-3">No matching users.</p>
              )}
            </div>
          </section>
        )}
        <section className="space-y-4">
          <h2 className="font-semibold">Message content</h2>
          <p className="text-sm text-muted-foreground">
            Add text segments within a block to format individual phrases.
          </p>
          {blocks.map((b, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-border p-3"
            >
              <div className="flex justify-between gap-3">
                <select
                  aria-label={`Block ${i + 1} style`}
                  className="rounded border border-border bg-background p-2"
                  value={b.kind}
                  onChange={(e) =>
                    edit(() =>
                      setBlocks((prev) =>
                        prev.map((v, j) =>
                          j === i
                            ? { ...v, kind: e.target.value as Block["kind"] }
                            : v,
                        ),
                      ),
                    )
                  }
                >
                  {["paragraph", "heading", "quote", "bullet"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={button}
                  disabled={blocks.length === 1}
                  onClick={() =>
                    edit(() =>
                      setBlocks((prev) => prev.filter((_, j) => j !== i)),
                    )
                  }
                >
                  Remove block
                </button>
              </div>
              {b.runs.map((r, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(["bold", "italic", "underline", "strike"] as const).map(
                      (mark) => (
                        <button
                          type="button"
                          aria-pressed={!!r[mark]}
                          key={mark}
                          className={`${button} ${r[mark] ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => updateRun(i, j, { [mark]: !r[mark] })}
                        >
                          {mark}
                        </button>
                      ),
                    )}
                    {b.runs.length > 1 && (
                      <button
                        type="button"
                        className={button}
                        onClick={() =>
                          edit(() =>
                            setBlocks((prev) =>
                              prev.map((v, k) =>
                                k === i
                                  ? {
                                      ...v,
                                      runs: v.runs.filter((_, n) => n !== j),
                                    }
                                  : v,
                              ),
                            ),
                          )
                        }
                      >
                        Remove segment
                      </button>
                    )}
                  </div>
                  <textarea
                    aria-label={`Block ${i + 1}, text ${j + 1}`}
                    className={field}
                    rows={3}
                    value={r.text}
                    onChange={(e) => updateRun(i, j, { text: e.target.value })}
                  />
                  <input
                    aria-label={`Block ${i + 1}, link ${j + 1}`}
                    className={field}
                    placeholder="Optional HTTPS link"
                    value={r.link ?? ""}
                    onChange={(e) => updateRun(i, j, { link: e.target.value })}
                  />
                  {r.link && !safeLink(r.link) && (
                    <p role="alert" className="text-red-500">
                      Use an HTTPS URL without embedded credentials.
                    </p>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={button}
                onClick={() =>
                  edit(() =>
                    setBlocks((prev) =>
                      prev.map((v, j) =>
                        j === i ? { ...v, runs: [...v.runs, { text: "" }] } : v,
                      ),
                    ),
                  )
                }
              >
                Add text segment
              </button>
            </div>
          ))}
          <button
            type="button"
            className={button}
            disabled={blocks.length >= 100}
            onClick={() =>
              edit(() => setBlocks((prev) => [...prev, emptyBlock()]))
            }
          >
            Add block
          </button>
        </section>
        <section className="space-y-4 rounded-xl bg-background p-5">
          <h2 className="font-semibold">
            Preview: {subject || "Untitled message"}
          </h2>
          <DocumentView document={blocks} />
        </section>
        <button
          type="button"
          className={button}
          disabled={!valid}
          onClick={() => act(false)}
        >
          Review recipients
        </button>
        {preview && (
          <div className="rounded-xl border border-blue-500 p-4">
            <p>
              This message will reach <strong>{preview.count} users</strong>
              {email ? " in their inbox and by email" : " in their inbox"}.
            </p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-40"
              disabled={preview.count === 0 || !valid}
              onClick={() => act(true)}
            >
              Send message
            </button>
          </div>
        )}
      </fieldset>
      {busy && <p role="status">Processing…</p>}
      {notice && (
        <p role="status" className="rounded-xl border border-border p-4">
          {notice}
        </p>
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sent messages</h2>
        {history.isLoading && <p>Loading history…</p>}
        {history.isError && (
          <p role="alert">
            History unavailable.{" "}
            <button onClick={() => history.refetch()}>Retry</button>
          </p>
        )}
        {history.data?.length === 0 && <p>No messages yet.</p>}
        {history.data?.map((m) => (
          <article key={m.id} className="rounded-xl border border-border p-4">
            <h3 className="font-semibold">{m.subject}</h3>
            <p className="text-sm text-muted-foreground">
              {formatMessageDate(m.created_at)} · {m.recipients} recipients ·{" "}
              {m.read_count} read
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
