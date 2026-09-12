"use client"

import type { SimulateResponse } from "@/lib/types"

interface SimulationPanelProps {
  result: SimulateResponse | null
  loading: boolean
  error: string | null
  onClear: () => void
}

function urgency(hops: number): { label: string; color: string } {
  if (hops <= 1) return { label: "Patch first", color: "#ef4444" }
  if (hops <= 3) return { label: "High", color: "#f59e0b" }
  return { label: "Lower", color: "#22c55e" }
}

export function SimulationPanel({ result, loading, error, onClear }: SimulationPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Compromise Simulation</h2>
          <p className="text-xs text-muted-foreground">Blast radius if a package is compromised</p>
        </div>
        {result && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && <p className="px-4 py-6 text-xs text-muted-foreground">Simulating propagation…</p>}
        {error && !loading && <p className="px-4 py-6 text-xs text-red-400">{error}</p>}

        {!loading && !error && !result && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Click a node in the graph or a package in the risk ranking to simulate what would be affected if it were
              compromised.
            </p>
          </div>
        )}

        {result && !loading && (
          <div>
            <div className="border-b border-border px-4 py-4">
              <p className="font-mono text-xs text-amber-400">{result.compromised_node}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums text-foreground">{result.total_affected}</span>
                <span className="text-xs text-muted-foreground">downstream packages affected</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-border px-4 py-2">
              <span className="text-[11px] font-medium text-foreground">Mitigation Priority</span>
              <span className="text-[11px] text-muted-foreground">fewer hops = patch sooner</span>
            </div>

            <ol className="divide-y divide-border">
              {result.affected_packages.map((pkg) => {
                const u = urgency(pkg.hops)
                return (
                  <li key={pkg.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate font-mono text-xs text-foreground">{pkg.id}</span>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: `${u.color}22`, color: u.color }}
                      >
                        {u.label}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {pkg.hops} hop{pkg.hops === 1 ? "" : "s"}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(4, pkg.impact_score * 100))}%`,
                            backgroundColor: u.color,
                          }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                        {pkg.impact_score.toFixed(2)}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{pkg.reason}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
