"use client";

import { useState, type FormEvent } from "react";

export function DataRequestForm() {
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState("");
  const [details, setDetails] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult("");
    const res = await fetch("/api/data-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, projects, details, confirm }),
    });
    const data = (await res.json()) as { error?: string; reference?: string; deleted?: number; requested?: number };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setResult(`Request received (reference ${data.reference}). Deleted ${data.deleted} of ${data.requested} project(s).${details ? " We'll handle the rest within 30 days." : ""}`);
    setProjects("");
    setDetails("");
    setConfirm(false);
  }

  return (
    <form onSubmit={submit} className="not-prose grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <label className="grid gap-1.5 text-sm font-medium text-slate-950">
        Project links or IDs
        <textarea value={projects} onChange={(e) => setProjects(e.target.value)} rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900" placeholder="https://…/projects/…" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-950">
        Other details (optional)
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-950">
        Email for our reply (optional — only used for this request)
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900" autoComplete="email" />
      </label>
      <label className="flex items-start gap-3 text-sm text-slate-800">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 h-4 w-4" required />
        I understand deletion is permanent and cannot be undone.
      </label>
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {result ? <p role="status" className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-900">{result}</p> : null}
      <button type="submit" disabled={busy} className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
        {busy ? "Submitting…" : "Submit deletion request"}
      </button>
    </form>
  );
}
