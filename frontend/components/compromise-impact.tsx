"use client"

import { useMemo } from "react"
import type { GraphResponse, SimulateResponse } from "@/lib/types"

interface CompromiseImpactProps {
  result: SimulateResponse | null
  graph: GraphResponse | undefined
  loading: boolean
  error: string | null
}

export function CompromiseImpact({ result, graph, loading, error }: CompromiseImpactProps) {
  const vulnById = useMemo(() => {
    const map = new Map<string, number>()
    graph?.nodes.forEach((n) => map.set(n.id, n.vuln_count ?? 0))
    return map
  }, [graph])

  const depth = result ? result.affected_packages.reduce((m, p) => Math.max(m, p.hops), 0) : 0
  const vulnsFound = result
    ? result.affected_packages.filter((p) => (vulnById.get(p.id) ?? 0) > 0).length
    : 0

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-slate-100">Compromise Impact</h2>
        {result && (
          <span className="truncate font-mono text-[11px] text-amber-400" title={result.compromised_node}>
            {result.compromised_node}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Affected Packages" value={result ? result.total_affected : "—"} accent="#ef4444" />
        <StatBox label="Propagation Depth" value={result ? depth : "—"} accent="#60a5fa" unit="hops" />
        <StatBox label="Vulnerabilities Found" value={result ? vulnsFound : "—"} accent="#f59e0b" />
      </div>

      {loading && <p className="mt-3 text-xs text-slate-400">Simulating propagation…</p>}
      {error && !loading && <p className="mt-3 text-xs text-red-400">{error}</p>}
      {!loading && !error && !result && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Select a package in the graph, the search bar, or the attack simulation card to model the blast radius if it
          were compromised.
        </p>
      )}

      {result && result.affected_packages.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-200">Mitigation priority</span>
            <span className="text-[11px] text-slate-500">fewer hops = patch sooner</span>
          </div>
          <ol className="max-h-52 divide-y divide-white/5 overflow-y-auto rounded-lg border border-white/5 bg-slate-950/40">
            {result.affected_packages.slice(0, 40).map((pkg) => {
              const u = urgency(pkg.hops)
              return (
                <li key={pkg.id} className="px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate font-mono text-[11px] text-slate-200">{pkg.id}</span>
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${u.color}22`, color: u.color }}
                    >
                      {u.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[10px] text-slate-500">
                      {pkg.hops} hop{pkg.hops === 1 ? "" : "s"}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(4, pkg.impact_score * 100))}%`,
                          backgroundColor: u.color,
                        }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-slate-500">
                      {pkg.impact_score.toFixed(2)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}

function StatBox({
  label,
  value,
  accent,
  unit,
}: {
  label: string
  value: number | string
  accent: string
  unit?: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold tabular-nums text-slate-100" style={{ color: accent }}>
          {typeof value === "number" ? value.toLocaleString("en-US") : value}
        </span>
        {unit && <span className="text-[10px] text-slate-500">{unit}</span>}
      </div>
      <p className="mt-1 text-[11px] leading-tight text-slate-400">{label}</p>
    </div>
  )
}

function urgency(hops: number): { label: string; color: string } {
  if (hops <= 1) return { label: "Patch first", color: "#ef4444" }
  if (hops <= 3) return { label: "High", color: "#f59e0b" }
  return { label: "Lower", color: "#22c55e" }
}
