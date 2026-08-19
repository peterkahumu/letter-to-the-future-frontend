/**
 * API service layer for communicating with the FastAPI backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LetterPayload {
  recipient_email: string;
  sender_name: string;
  subject: string;
  body: string;
  deliver_at: string; // ISO date string YYYY-MM-DD
}

export interface LetterResponse {
  id: string;
  recipient_email: string;
  sender_name: string;
  subject: string;
  body: string;
  deliver_at: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface LetterStatusResponse {
  id: string;
  recipient_email: string;
  subject: string;
  deliver_at: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
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

  async createLetter(payload: LetterPayload): Promise<LetterResponse> {
    return this.request<LetterResponse>("/api/letters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getLetterStatus(id: string): Promise<LetterStatusResponse> {
    return this.request<LetterStatusResponse>(`/api/letters/${id}`);
  }

  async checkHealth(): Promise<{ status: string; version: string }> {
    return this.request("/health");
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
