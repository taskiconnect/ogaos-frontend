import admin from "@/lib/api/adminClient";
import api from "@/lib/api/client";
import type { MessageDocument } from "./document";
export type Recipient = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};
export type MessagePayload = {
  subject: string;
  document: MessageDocument;
  user_ids: string[];
  all: boolean;
  email: boolean;
};
export type AudiencePreview = { count: number; confirmation: string };
export type SentMessage = {
  id: string;
  subject: string;
  created_at: string;
  recipients: number;
  read_count: number;
};
export type InboxMessage = {
  id: string;
  subject: string;
  document: MessageDocument;
  created_at: string;
  read_at: string | null;
};
export async function findRecipients(q: string) {
  return (
    (
      await admin.get<{ data: Recipient[] | null }>(
        "/api/admin/messages/recipients",
        { params: { q } },
      )
    ).data.data ?? []
  );
}
export async function previewMessage(payload: MessagePayload) {
  return (
    await admin.post<{ data: AudiencePreview }>(
      "/api/admin/messages/preview",
      payload,
    )
  ).data.data;
}
export async function sendMessage(
  payload: MessagePayload & { confirmation: string },
) {
  return (
    await admin.post<{ data: { id: string; recipients: number } }>(
      "/api/admin/messages",
      payload,
    )
  ).data.data;
}
export async function sentMessages() {
  return (
    (await admin.get<{ data: SentMessage[] | null }>("/api/admin/messages"))
      .data.data ?? []
  );
}
export async function inboxMessages() {
  return (
    (await api.get<{ data: InboxMessage[] | null }>("/messages")).data.data ??
    []
  );
}
export async function markRead(id: string) {
  await api.patch(`/messages/${id}/read`);
}
