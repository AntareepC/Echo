"use client"

import { useEffect, useMemo, useState } from "react"
import type { GraphNode } from "@/lib/types"

interface AttackSimulationProps {
  nodes: GraphNode[]
  selectedNodeId: string | null
  onSimulate: (id: string) => void
  loading: boolean
  disabled?: boolean
}

export function AttackSimulation({ nodes, selectedNodeId, onSimulate, loading, disabled }: AttackSimulationProps) {
  const sorted = useMemo(() => [...nodes].sort((a, b) => a.name.localeCompare(b.name)), [nodes])
  const [choice, setChoice] = useState("")

  // Keep the dropdown in sync when a package is selected elsewhere (graph, search).
  useEffect(() => {
    if (selectedNodeId) setChoice(selectedNodeId)
  }, [selectedNodeId])

  const effective = choice || selectedNodeId || sorted[0]?.id || ""

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-slate-100">Attack Simulation</h2>
        <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-300">
          BFS
        </span>
      </div>

      <label htmlFor="attack-target" className="mb-1 block text-[11px] text-slate-400">
        Compromise target
      </label>
      <select
        id="attack-target"
        value={effective}
        disabled={disabled || sorted.length === 0}
        onChange={(e) => setChoice(e.target.value)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-2 text-sm text-slate-100 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 disabled:opacity-50"
      >
        {sorted.length === 0 && <option value="">No packages loaded</option>}
        {sorted.map((n) => (
          <option key={n.id} value={n.id}>
            {n.name} · v{n.version}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => effective && onSimulate(effective)}
        disabled={disabled || !effective || loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Simulating…" : "Simulate Compromise"}
      </button>
    </section>
  )
}
