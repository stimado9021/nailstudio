// app/components/types.ts
// Todas las interfaces compartidas entre módulos

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  preheader?: string;
  status: string;
  sent: number;
  opens: number;
  clicks: number;
  date: string;
  listId?: string;
  listName?: string;
  templateId?: string;
  brevoId?: number | null;
}

export interface Config {
  senderName: string;
  senderEmail: string;
  replyTo: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  preview: string;
  html: string;
}

export interface BrevoList {
  id: number;
  name: string;
  uniqueSubscribers: number;
}

export interface LocalContact {
  id: number;
  name: string;
  email: string;
  list: string;
  status: "local" | "synced";
}

export interface ToastState {
  msg: string;
  ok: boolean;
}

export interface UploadResult {
  listId: number;
  imported: number;
  listName: string;
}