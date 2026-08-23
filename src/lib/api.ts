/**
 * API service layer for communicating with the FastAPI backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type LetterStatus =
  | "pending"
  | "scheduled"
  | "sent"
  | "failed"
  | "cancelled";

export interface LetterPayload {
  recipient_email: string;
  sender_name: string;
  subject: string;
  body: string;
  media_url?: string | null;
  media_type?: "image" | "audio" | "video" | null;
  is_public: boolean;
  is_anonymous: boolean;
  deliver_at: string; // ISO date string YYYY-MM-DD
  timezone_name: string; // IANA zone the date was chosen in
}

/** Returned on create. Carries no letter content — the writer hasn't
 *  proven they control the address yet. */
export interface LetterCreatedResponse {
  id: string;
  status: LetterStatus;
  recipient_email_masked: string;
  deliver_at: string;
  message: string;
}

export interface LetterResponse {
  id: string;
  recipient_email: string;
  sender_name: string;
  subject: string;
  body: string;
  media_url: string | null;
  is_public: boolean;
  is_anonymous: boolean;
  deliver_at: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface LetterStatusResponse {
  id: string;
  /** Masked server-side — the full address is never returned. */
  recipient_email_masked: string;
  subject: string;
  is_public: boolean;
  is_anonymous: boolean;
  deliver_at: string;
  status: LetterStatus;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

/** The public feed's shape. No recipient address, and sender_name is null
 *  when the writer chose to stay anonymous. */
export interface PublicLetter {
  id: string;
  sender_name: string | null;
  subject: string;
  body: string;
  media_url: string | null;
  media_type: "image" | "audio" | "video" | null;
  deliver_at: string;
  sent_at: string | null;
}

export interface PublicFeedPage {
  items: PublicLetter[];
  next_cursor: string | null;
}

export interface SimpleMessage {
  status: string;
  message: string;
}

export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`,
      }));
      throw new ApiRequestError(response.status, error);
    }

    return response.json();
  }

  async createLetter(payload: LetterPayload): Promise<LetterCreatedResponse> {
    return this.request<LetterCreatedResponse>("/api/letters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async confirmLetter(id: string, token: string): Promise<LetterStatusResponse> {
    return this.request<LetterStatusResponse>(
      `/api/letters/${id}/confirm?token=${encodeURIComponent(token)}`,
      { method: "POST" }
    );
  }

  async getLetterStatus(id: string, token?: string): Promise<LetterStatusResponse> {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    return this.request<LetterStatusResponse>(`/api/letters/${id}${query}`);
  }

  async cancelLetter(id: string, token: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(
      `/api/letters/${id}?token=${encodeURIComponent(token)}`,
      { method: "DELETE" }
    );
  }

  async reportLetter(
    id: string,
    reason: string,
    details?: string
  ): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/letters/${id}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, details: details?.trim() || null }),
    });
  }

  async unsubscribe(email: string, token: string): Promise<SimpleMessage> {
    const query = `?email=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`;
    return this.request<SimpleMessage>(`/api/letters/unsubscribe${query}`, {
      method: "POST",
    });
  }

  async checkHealth(): Promise<{ status: string; version: string }> {
    return this.request("/health");
  }

  async uploadMedia(
    file: File
  ): Promise<{ url: string; media_type: "image" | "audio" | "video" | null }> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseUrl}/api/letters/upload`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `Upload failed with status ${response.status}`,
      }));
      throw new ApiRequestError(response.status, error);
    }

    return response.json();
  }

  async getPublicLetters(cursor?: string, limit = 20): Promise<PublicFeedPage> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return this.request<PublicFeedPage>(`/api/letters/feed/public?${params}`);
  }
}

export class ApiRequestError extends Error {
  status: number;
  error: ApiError;

  constructor(status: number, error: ApiError) {
    const message =
      typeof error.detail === "string"
        ? error.detail
        : error.detail.map((d) => d.msg).join(", ");
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.error = error;
  }
}

// Singleton export
export const api = new ApiService();
