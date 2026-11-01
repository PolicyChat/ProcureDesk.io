"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { QUESTIONS } from "./content/assessment";
import { analyzeCase, evaluate, type CaseAnalysis } from "./engine";
import type { ActionStatus, CaseState, DocumentMeta, Entitlement, EvidenceStatus, Facts, FactValue, FinancialEvent } from "./types";

/**
 * Case state lives ONLY in this browser by default (sessionStorage — gone
 * when the tab closes). "Remember on this device" moves it to localStorage.
 * Nothing is sent to a server except anonymous funnel events and, when the
 * user clicks an explanation button, the structured facts needed to answer it.
 */

const KEY = "rp_case_v1";
export const INACTIVITY_MS = 30 * 60 * 1000;
export const QUICK_EXIT_URL = "https://weather.com";

const empty = (): CaseState => ({
  schema: 1,
  answers: {},
  ledger: [],
  evidence: {},
  actions: {},
  documents: [],
  entitlement: "free",
  rememberDevice: false,
  createdAt: new Date().toISOString(),
});

/** Remove answers to questions that are no longer shown (e.g. a gateway was changed to "No"). */
export function pruneHidden(answers: Facts): Facts {
  let current = { ...answers };
  for (let i = 0; i < 4; i++) {
    let changed = false;
    for (const q of QUESTIONS) {
      if (q.showIf && current[q.id] !== undefined && evaluate(q.showIf, current) !== "true") {
        delete current[q.id];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return current;
}

type Act =
  | { type: "load"; state: CaseState }
  | { type: "answer"; id: string; value: FactValue | undefined }
  | { type: "preset"; answers: Facts }
  | { type: "addEvent"; event: FinancialEvent }
  | { type: "updateEvent"; event: FinancialEvent }
  | { type: "removeEvent"; id: string }
  | { type: "evidence"; key: string; status: EvidenceStatus }
  | { type: "action"; id: string; status: ActionStatus }
  | { type: "addDoc"; doc: DocumentMeta }
  | { type: "updateDoc"; id: string; category: string }
  | { type: "removeDoc"; id: string }
  | { type: "entitlement"; value: Entitlement }
  | { type: "remember"; value: boolean }
  | { type: "reset" };

function reducer(s: CaseState, a: Act): CaseState {
  switch (a.type) {
    case "load":
      return a.state;
    case "answer": {
      const answers = { ...s.answers };
      if (a.value === undefined) delete answers[a.id];
      else answers[a.id] = a.value;
      return { ...s, answers: pruneHidden(answers) };
    }
    case "preset":
      return { ...s, answers: pruneHidden({ ...s.answers, ...a.answers }) };
    case "addEvent":
      return { ...s, ledger: [...s.ledger, a.event] };
    case "updateEvent":
      return { ...s, ledger: s.ledger.map((e) => (e.id === a.event.id ? a.event : e)) };
    case "removeEvent":
      return { ...s, ledger: s.ledger.filter((e) => e.id !== a.id) };
    case "evidence":
      return { ...s, evidence: { ...s.evidence, [a.key]: a.status } };
    case "action":
      return { ...s, actions: { ...s.actions, [a.id]: a.status } };
    case "addDoc":
      return { ...s, documents: [...s.documents, a.doc] };
    case "updateDoc":
      return { ...s, documents: s.documents.map((d) => (d.id === a.id ? { ...d, category: a.category } : d)) };
    case "removeDoc":
      return { ...s, documents: s.documents.filter((d) => d.id !== a.id) };
    case "entitlement":
      return { ...s, entitlement: a.value };
    case "remember":
      return { ...s, rememberDevice: a.value };
    case "reset":
      return empty();
  }
}

function safeGet(store: "local" | "session"): CaseState | null {
  try {
    const raw = (store === "local" ? window.localStorage : window.sessionStorage).getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaseState;
    return parsed?.schema === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function wipeAllLocalData() {
  try {
    window.sessionStorage.clear();
  } catch {}
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

export function quickExit() {
  wipeAllLocalData();
  window.location.replace(QUICK_EXIT_URL);
}

type Ctx = {
  state: CaseState;
  hydrated: boolean;
  analysis: CaseAnalysis;
  dispatch: (a: Act) => void;
  deleteEverything: () => void;
};

const CaseContext = createContext<Ctx | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, empty);
  const [hydrated, setHydrated] = useState(false);
  const last = useRef(Date.now());

  useEffect(() => {
    const loaded = safeGet("session") ?? safeGet("local");
    if (loaded) dispatch({ type: "load", state: loaded });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = JSON.stringify(state);
      window.sessionStorage.setItem(KEY, raw);
      if (state.rememberDevice) window.localStorage.setItem(KEY, raw);
      else window.localStorage.removeItem(KEY);
    } catch {}
  }, [state, hydrated]);

  // Automatic logout: clear the case after 30 minutes of inactivity.
  useEffect(() => {
    const bump = () => (last.current = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - last.current > INACTIVITY_MS) {
        if (!state.rememberDevice) wipeAllLocalData();
        window.location.replace("/?timeout=1");
      }
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(timer);
    };
  }, [state.rememberDevice]);

  // Quick exit: press Escape twice.
  useEffect(() => {
    let lastEsc = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const now = Date.now();
      if (now - lastEsc < 800) quickExit();
      lastEsc = now;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const deleteEverything = useCallback(() => {
    wipeAllLocalData();
    dispatch({ type: "reset" });
  }, []);

  const analysis = useMemo(() => analyzeCase(state), [state]);

  return <CaseContext.Provider value={{ state, hydrated, analysis, dispatch, deleteEverything }}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCase must be used inside CaseProvider");
  return ctx;
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
