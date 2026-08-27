/**
 * API service layer for communicating with the FastAPI backend.
 */

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./tokens";

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

// --- Accounts -------------------------------------------------------------

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface SessionInfo {
  id: string;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

// --- Journals -------------------------------------------------------------

export const JOURNAL_COLORS = [
  "turquoise",
  "gold",
  "rose",
  "violet",
  "amber",
  "slate",
] as const;
export type JournalColor = (typeof JOURNAL_COLORS)[number];

export const MOODS = [
  "great",
  "good",
  "okay",
  "low",
  "rough",
  "anxious",
  "grateful",
  "tired",
  "excited",
  "reflective",
] as const;
export type Mood = (typeof MOODS)[number];

export interface Journal {
  id: string;
  title: string;
  description: string | null;
  color: JournalColor;
  is_archived: boolean;
  entry_count: number;
  last_entry_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  journal_id: string;
  title: string;
  body: string;
  entry_date: string;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

/** List view — carries an excerpt, never the whole body. */
export interface EntrySummary {
  id: string;
  journal_id: string;
  journal_title: string | null;
  title: string;
  excerpt: string;
  entry_date: string;
  mood: Mood | null;
  updated_at: string;
}

export interface EntryPage {
  items: EntrySummary[];
  total: number;
  has_more: boolean;
}

// --- Dashboard ------------------------------------------------------------

export interface LetterSummary {
  id: string;
  recipient_email_masked: string;
  subject: string;
  status: LetterStatus;
  deliver_at: string;
  sent_at: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Dashboard {
  user: User;
  letters_total: number;
  letters_scheduled: number;
  letters_sent: number;
  next_delivery: string | null;
  journals_total: number;
  entries_total: number;
  entries_this_month: number;
  current_streak: number;
  recent_letters: LetterSummary[];
  recent_entries: EntrySummary[];
}

// --- Admin ----------------------------------------------------------------

export interface AdminStats {
  users_total: number;
  users_active: number;
  users_verified: number;
  admins_total: number;
  new_users_this_week: number;
  letters_total: number;
  letters_pending: number;
  letters_scheduled: number;
  letters_sent: number;
  letters_failed: number;
  letters_cancelled: number;
  letters_guest: number;
  due_next_7_days: number;
  journals_total: number;
  entries_total: number;
  reports_open: number;
  letters_hidden: number;
  suppressions_total: number;
}

/** Counts only. The admin API never returns journal content. */
export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  letters_count: number;
  journals_count: number;
  entries_count: number;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminUserPage {
  items: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminReport {
  letter_id: string;
  subject: string;
  body: string;
  sender_name: string | null;
  reported_count: number;
  is_hidden: boolean;
  status: LetterStatus;
  sent_at: string | null;
  reasons: string[];
  latest_report_at: string | null;
}

export interface AdminDeliveryLog {
  id: string;
  letter_id: string;
  outcome: string;
  detail: string | null;
  attempted_at: string;
  subject: string | null;
  recipient_email_masked: string | null;
}

export interface AdminSuppression {
  email: string;
  reason: string;
  created_at: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * One in-flight refresh, shared.
   *
   * A dashboard fires several requests at once, so an expired access token
   * produces several simultaneous 401s. Without this they would each try to
   * refresh, and every attempt after the first would present a token the
   * first had already rotated — which the server reads as theft and answers
   * by ending every session. So the first 401 starts a refresh and the rest
   * await the same promise.
   */
  private refreshing: Promise<boolean> | null = null;

  private async refreshSession(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) {
        clearSession();
        return false;
      }
      const body: TokenResponse = await response.json();
      saveSession({
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
      });
      return true;
    } catch {
      // A network blip is not a signal to sign out — the caller sees the
      // original failure and can retry.
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { auth?: boolean; retry?: boolean }
  ): Promise<T> {
    const { auth = true, retry = true, ...init } = options ?? {};
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) ?? {}),
    };

    // Attached when we have one, on every request. Endpoints that don't
    // need it ignore it; /api/letters uses it to attribute the letter.
    const token = auth ? getAccessToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { ...init, headers });

    // One refresh, then one replay. `retry` stops this recursing.
    if (response.status === 401 && auth && retry && getRefreshToken()) {
      this.refreshing ??= this.refreshSession().finally(() => {
        this.refreshing = null;
      });
      if (await this.refreshing) {
        return this.request<T>(endpoint, { ...options, retry: false });
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `Request failed with status ${response.status}`,
      }));
      throw new ApiRequestError(response.status, error);
    }

    // 204 and friends carry no body.
    if (response.status === 204) return undefined as T;
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
    const accessToken = getAccessToken();
    const response = await fetch(url, {
      method: "POST",
      // No Content-Type — the browser must set the multipart boundary.
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
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

  // --- Accounts -----------------------------------------------------------

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        display_name: displayName,
      }),
    });
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
  }

  async verifyEmail(token: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      auth: false,
    });
  }

  async resendVerification(): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/resend-verification", {
      method: "POST",
    });
  }

  /** Ends this one session. Unauthenticated — the token is the credential. */
  async logout(refreshToken: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      auth: false,
    });
  }

  async logoutEverywhere(): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/logout-all", { method: "POST" });
  }

  async listSessions(): Promise<SessionInfo[]> {
    return this.request<SessionInfo[]>("/api/auth/sessions");
  }

  async forgotPassword(email: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    });
  }

  async resetPassword(token: string, password: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      auth: false,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  async updateProfile(displayName: string): Promise<User> {
    return this.request<User>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ display_name: displayName }),
    });
  }

  async deleteAccount(): Promise<SimpleMessage> {
    return this.request<SimpleMessage>("/api/auth/me", { method: "DELETE" });
  }

  // --- Dashboard ----------------------------------------------------------

  async getDashboard(): Promise<Dashboard> {
    return this.request<Dashboard>("/api/dashboard");
  }

  async getMyLetters(status?: LetterStatus): Promise<LetterSummary[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request<LetterSummary[]>(`/api/dashboard/letters${query}`);
  }

  // --- Journals -----------------------------------------------------------

  async getJournals(includeArchived = false): Promise<Journal[]> {
    return this.request<Journal[]>(
      `/api/journals?include_archived=${includeArchived}`
    );
  }

  async getJournal(id: string): Promise<Journal> {
    return this.request<Journal>(`/api/journals/${id}`);
  }

  async createJournal(input: {
    title: string;
    description?: string | null;
    color?: JournalColor;
  }): Promise<Journal> {
    return this.request<Journal>("/api/journals", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateJournal(
    id: string,
    changes: Partial<Pick<Journal, "title" | "description" | "color" | "is_archived">>
  ): Promise<Journal> {
    return this.request<Journal>(`/api/journals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  }

  async deleteJournal(id: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/journals/${id}`, {
      method: "DELETE",
    });
  }

  async getEntries(
    journalId: string,
    options: { limit?: number; offset?: number; search?: string } = {}
  ): Promise<EntryPage> {
    const params = new URLSearchParams({
      limit: String(options.limit ?? 20),
      offset: String(options.offset ?? 0),
    });
    if (options.search) params.set("search", options.search);
    return this.request<EntryPage>(`/api/journals/${journalId}/entries?${params}`);
  }

  /** One timeline across every notebook — the diary view. */
  async getRecentEntries(
    options: { limit?: number; offset?: number } = {}
  ): Promise<EntryPage> {
    const params = new URLSearchParams({
      limit: String(options.limit ?? 20),
      offset: String(options.offset ?? 0),
    });
    return this.request<EntryPage>(`/api/journals/entries/all/recent?${params}`);
  }

  async getEntry(id: string): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/api/journals/entries/${id}`);
  }

  async createEntry(
    journalId: string,
    input: {
      title?: string;
      body: string;
      entry_date?: string | null;
      mood?: Mood | null;
    }
  ): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/api/journals/${journalId}/entries`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateEntry(
    id: string,
    changes: { title?: string; body?: string; entry_date?: string; mood?: Mood | null }
  ): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/api/journals/entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  }

  async deleteEntry(id: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/journals/entries/${id}`, {
      method: "DELETE",
    });
  }

  // --- Admin --------------------------------------------------------------

  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>("/api/admin/stats");
  }

  async getAdminUsers(
    options: { q?: string; role?: UserRole; page?: number } = {}
  ): Promise<AdminUserPage> {
    const params = new URLSearchParams({ page: String(options.page ?? 1) });
    if (options.q) params.set("q", options.q);
    if (options.role) params.set("role", options.role);
    return this.request<AdminUserPage>(`/api/admin/users?${params}`);
  }

  async updateAdminUser(
    id: string,
    changes: { role?: UserRole; is_active?: boolean; is_verified?: boolean }
  ): Promise<AdminUser> {
    return this.request<AdminUser>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
  }

  async deleteAdminUser(id: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminReports(includeResolved = false): Promise<AdminReport[]> {
    return this.request<AdminReport[]>(
      `/api/admin/reports?include_resolved=${includeResolved}`
    );
  }

  async moderateLetter(
    letterId: string,
    hidden: boolean,
    note?: string
  ): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/admin/letters/${letterId}/moderate`, {
      method: "POST",
      body: JSON.stringify({ hidden, note: note?.trim() || null }),
    });
  }

  async getDeliveryLogs(outcome?: string): Promise<AdminDeliveryLog[]> {
    const query = outcome ? `?outcome=${encodeURIComponent(outcome)}` : "";
    return this.request<AdminDeliveryLog[]>(`/api/admin/delivery/logs${query}`);
  }

  async getFailedLetters(): Promise<AdminDeliveryLog[]> {
    return this.request<AdminDeliveryLog[]>("/api/admin/delivery/failed");
  }

  async retryLetter(letterId: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(`/api/admin/delivery/${letterId}/retry`, {
      method: "POST",
    });
  }

  async getSuppressions(): Promise<AdminSuppression[]> {
    return this.request<AdminSuppression[]>("/api/admin/suppressions");
  }

  async removeSuppression(email: string): Promise<SimpleMessage> {
    return this.request<SimpleMessage>(
      `/api/admin/suppressions/${encodeURIComponent(email)}`,
      { method: "DELETE" }
    );
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
