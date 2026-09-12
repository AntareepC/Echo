"use client"

import { useMemo } from "react"
import type { GraphResponse } from "@/lib/types"

interface VulnerabilitiesPanelProps {
  graph: GraphResponse | undefined
  onSelect: (id: string) => void
  selectedNodeId: string | null
}

export function VulnerabilitiesPanel({ graph, onSelect, selectedNodeId }: VulnerabilitiesPanelProps) {
  const vulnerable = useMemo(() => {
    return (graph?.nodes ?? [])
      .filter((n) => (n.vuln_count ?? 0) > 0)
      .sort((a, b) => (b.vuln_count ?? 0) - (a.vuln_count ?? 0))
  }, [graph])

  return (
    <section className="flex flex-col rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-slate-100">Vulnerabilities</h2>
        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-red-300">
          OSV
        </span>
      </div>

      {vulnerable.length === 0 ? (
        <p className="text-xs text-slate-400">No packages with known vulnerabilities.</p>
      ) : (
        <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto rounded-lg border border-white/5 bg-slate-950/40">
          {vulnerable.map((n) => {
            const active = n.id === selectedNodeId
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onSelect(n.id)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-white/5 ${
                    active ? "bg-blue-500/10" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-100">{n.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">v{n.version}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                    {n.vuln_count} vuln{n.vuln_count === 1 ? "" : "s"}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
