"use client";

import { useState } from "react";
import { LEAD_FORM } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/40 transition-colors duration-150 focus:border-moss-600 focus:outline-none focus:ring-2 focus:ring-moss-600/25";

export default function LeadForm({ sourceCta = "direct" }: { sourceCta?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          phone: data.get("phone") || "",
          segment: data.get("segment"),
          annual_spend_band: data.get("annual_spend_band"),
          source_cta: sourceCta,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-moss-600/30 bg-moss-50 p-8 text-center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mx-auto h-10 w-10 text-moss-600"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m8.5 12.5 2.5 2.5 5-5.5" />
        </svg>
        <h3 className="mt-4 font-display text-2xl font-semibold text-navy-900">
          {LEAD_FORM.successHeading}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft/90">
          {LEAD_FORM.successBody}
        </p>
      </div>
    );
  }

  const f = LEAD_FORM.fields;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy-900">
          {f.name.label}
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder={f.name.placeholder}
            className={inputClasses}
          />
        </label>
        <label className="block text-sm font-medium text-navy-900">
          {f.email.label}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={f.email.placeholder}
            className={inputClasses}
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy-900">
          {f.company.label}
          <input
            type="text"
            name="company"
            required
            autoComplete="organization"
            placeholder={f.company.placeholder}
            className={inputClasses}
          />
        </label>
        <label className="block text-sm font-medium text-navy-900">
          {f.phone.label}
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder={f.phone.placeholder}
            className={inputClasses}
          />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy-900">
          {f.segment.label}
          <select name="segment" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              —
            </option>
            {f.segment.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-navy-900">
          {f.annualSpendBand.label}
          <select
            name="annual_spend_band"
            required
            defaultValue=""
            className={inputClasses}
          >
            <option value="" disabled>
              —
            </option>
            {f.annualSpendBand.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {LEAD_FORM.errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full cursor-pointer rounded-full bg-moss-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm shadow-moss-600/25 transition-colors duration-200 hover:bg-moss-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? LEAD_FORM.submittingLabel : LEAD_FORM.submitLabel}
      </button>
      <p className="text-center text-xs text-ink-soft/70">{LEAD_FORM.privacyNote}</p>
    </form>
  );
}
