"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api/adminClient";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
type Preview = {
  name: string;
  status: string;
  can_delete: boolean;
  records: Record<string, number>;
};
export default function AccountControls({ id }: { id: string }) {
  const role = useAdminAuthStore((s) => s.user?.role);
  const [password, setPassword] = useState(""),
    [reason, setReason] = useState(""),
    [name, setName] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const qc = useQueryClient(),
    router = useRouter();
  const valid =
    password.length > 0 &&
    password.length <= 256 &&
    reason.trim().length >= 10 &&
    new TextEncoder().encode(reason).length <= 1000;
  async function act(action: string) {
    if (busy) return;
    if (action !== "preview" && !valid) return;
    if (action === "delete" && (!preview?.can_delete || name !== preview.name))
      return;
    setBusy(true);
    setNotice("");
    try {
      if (action === "preview") {
        setPreview(
          (
            await api.get<{ data: Preview }>(
              `/api/admin/businesses/${id}/deletion-preview`,
            )
          ).data.data,
        );
      } else if (action === "delete") {
        await api.delete(`/api/admin/businesses/${id}`, {
          data: { password, reason, name },
        });
        setPassword("");
        await qc.invalidateQueries({ queryKey: ["admin-businesses"] });
        router.push("/admin/dashboard/businesses");
      } else {
        await api.patch(`/api/admin/businesses/${id}/status`, {
          password,
          reason,
          status: action,
        });
        setPassword("");
        setPreview(null);
        setName("");
        setNotice(`Business status changed to ${action}.`);
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["admin-business", id] }),
          qc.invalidateQueries({ queryKey: ["admin-businesses"] }),
        ]);
      }
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Account action failed",
      );
    } finally {
      setBusy(false);
    }
  }
  if (role !== "super_admin") return null;
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-xl font-semibold">Account controls</h2>
      <p className="text-sm text-muted-foreground">
        Suspend or close access while retaining financial records. Permanent
        deletion is available only for closed businesses without protected
        records. Shared user accounts are preserved.
      </p>
      <fieldset disabled={busy} className="space-y-4">
        <label className="block">
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            className="mt-2 block w-full rounded-lg border border-border bg-background p-3"
          />
        </label>
        <label className="block">
          Your admin password
          <input
            type="password"
            autoComplete="current-password"
            maxLength={256}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-border bg-background p-3"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          {(["active", "suspended", "closed"] as const).map((status) => (
            <button
              key={status}
              disabled={!valid}
              className="rounded-lg border border-border px-4 py-2 disabled:opacity-40"
              onClick={() => act(status)}
            >
              Set {status}
            </button>
          ))}
          <button
            className="rounded-lg border border-border px-4 py-2"
            onClick={() => act("preview")}
          >
            Preview deletion
          </button>
        </div>
        {preview && (
          <div className="space-y-3 rounded-xl border border-red-400/40 p-4">
            <p>
              {preview.name} · {preview.status}
            </p>
            <p>
              {preview.can_delete
                ? "No protected financial records. Type the business name to delete it."
                : "Deletion is blocked. The business must be closed and have no protected financial records."}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(preview.records).map(([table, count]) => (
                <div key={table}>
                  <dt className="capitalize text-muted-foreground">
                    {table.replaceAll("_", " ")}
                  </dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
            {preview.can_delete && (
              <>
                <label className="block">
                  Type <strong>{preview.name}</strong>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-border bg-background p-3"
                  />
                </label>
                <button
                  disabled={!valid || name !== preview.name}
                  onClick={() => act("delete")}
                  className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-40"
                >
                  Permanently delete business
                </button>
              </>
            )}
          </div>
        )}
      </fieldset>
      {busy && <p role="status">Processing…</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
