import type { Agency, Source } from "@/lib/types";

export function SourceList({ sources, agencies }: { sources: Source[]; agencies: Agency[] }) {
  if (!sources.length && !agencies.length) return null;
  return (
    <div className="grid gap-4 text-sm sm:grid-cols-2">
      {sources.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-ink">Official sources</p>
          <ul className="space-y-1 text-ink-soft">
            {sources.map((s) => (
              <li key={s.title}>
                {s.url ? <a className="text-teal-700 underline-offset-2 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : s.title}
                {s.citation && <span className="text-ink-mute"> — {s.citation}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {agencies.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-ink">Where to go</p>
          <ul className="space-y-1 text-ink-soft">
            {agencies.map((a) => (
              <li key={a.name}>
                {a.url ? <a className="text-teal-700 underline-offset-2 hover:underline" href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a> : a.name}
                <span className="text-ink-mute"> — {a.purpose}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
