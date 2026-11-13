"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX } from "lucide-react";
import { api, ApiRequestError, type AdminUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import { formatDate, formatDateTime } from "@/lib/format";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.getAdminUsers({ q: query || undefined, page });
      setUsers(result.items);
      setTotal(result.total);
      setPages(result.pages);
    } catch {
      setError("Couldn't load users.");
    }
  }, [query, page]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  async function apply(
    target: AdminUser,
    changes: { role?: "user" | "admin"; is_active?: boolean }
  ) {
    setError("");
    try {
      const updated = await api.updateAdminUser(target.id, changes);
      setUsers((current) =>
        (current ?? []).map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't apply that."
      );
    }
  }

  async function remove(target: AdminUser) {
    setError("");
    try {
      await api.deleteAdminUser(target.id);
      setUsers((current) => (current ?? []).filter((row) => row.id !== target.id));
      setTotal((value) => value - 1);
      setPendingDelete(null);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Couldn't delete them."
      );
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Users</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {total} {total === 1 ? "account" : "accounts"}
        </p>
      </header>

      {error && <Alert>{error}</Alert>}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by email or name"
          aria-label="Search users"
          className="w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-muted"
        />
      </div>

      {users === null ? (
        <div className="h-64 animate-pulse rounded-[var(--radius-md)] border border-line bg-surface" />
      ) : users.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface/50 p-12 text-center text-sm text-ink-muted">
          No users match that.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-elevated text-left">
                <th className="px-4 py-3 font-medium text-ink-soft">Account</th>
                <th className="px-4 py-3 font-medium text-ink-soft">Role</th>
                <th className="px-4 py-3 font-medium text-ink-soft">Wrote</th>
                <th className="px-4 py-3 font-medium text-ink-soft">Last seen</th>
                <th className="px-4 py-3 text-right font-medium text-ink-soft">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const isMe = row.id === me?.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3">
                      <p className="text-ink">
                        {row.display_name || "—"}
                        {isMe && (
                          <span className="ml-2 text-xs text-ink-muted">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-ink-muted">{row.email}</p>
                      <p className="mt-1 flex gap-2 text-[10px] uppercase tracking-wider">
                        {!row.is_active && (
                          <span className="text-danger">Suspended</span>
                        )}
                        {!row.is_verified && (
                          <span className="text-ink-muted">Unverified</span>
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          row.role === "admin"
                            ? "border-line-strong bg-tint text-accent-text"
                            : "border-line text-ink-muted"
                        }`}
                      >
                        {row.role}
                      </span>
                    </td>

                    {/* Counts, never content. */}
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <p>{row.letters_count} letters</p>
                      <p>
                        {row.journals_count} journals · {row.entries_count} entries
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <p>{formatDateTime(row.last_login_at)}</p>
                      <p>joined {formatDate(row.created_at)}</p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          label={
                            row.role === "admin" ? "Demote to user" : "Make admin"
                          }
                          disabled={isMe}
                          onClick={() =>
                            void apply(row, {
                              role: row.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          {row.role === "admin" ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </IconButton>

                        <IconButton
                          label={row.is_active ? "Suspend" : "Reinstate"}
                          disabled={isMe}
                          onClick={() =>
                            void apply(row, { is_active: !row.is_active })
                          }
                        >
                          {row.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </IconButton>

                        <IconButton
                          label="Delete account"
                          danger
                          disabled={isMe}
                          onClick={() => setPendingDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="h-9 rounded-[var(--radius-sm)] border border-line-strong px-3.5 text-sm text-ink-soft disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-ink-muted">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
            disabled={page === pages}
            className="h-9 rounded-[var(--radius-sm)] border border-line-strong px-3.5 text-sm text-ink-soft disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this account?"
        description={pendingDelete?.email}
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          This removes the account and its{" "}
          {pendingDelete?.journals_count ?? 0} journals with{" "}
          {pendingDelete?.entries_count ?? 0} entries, permanently.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Their {pendingDelete?.letters_count ?? 0} letters are kept and stay
          scheduled — a confirmed letter is a promise to a recipient who is
          usually somebody else.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="h-11 flex-1 rounded-[var(--radius-sm)] border border-line-strong text-sm text-ink-soft hover:border-line-hover hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => pendingDelete && void remove(pendingDelete)}
            className="h-11 flex-1 rounded-[var(--radius-sm)] border border-danger-line bg-danger-tint text-sm text-danger"
          >
            Delete account
          </button>
        </div>
      </Modal>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-line-strong text-ink-muted transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "hover:border-danger-line hover:text-danger"
          : "hover:border-line-hover hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
