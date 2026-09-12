"use client"

import { type RiskItem, RISK_COLORS, RISK_LABELS, riskLevel } from "@/lib/types"

interface RiskRankingPanelProps {
  items: RiskItem[] | undefined
  isLoading: boolean
  error: unknown
  selectedNodeId: string | null
  onSelect: (id: string) => void
}

export function RiskRankingPanel({ items, isLoading, error, selectedNodeId, onSelect }: RiskRankingPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Risk Ranking</h2>
        <p className="text-xs text-muted-foreground">Most structurally important packages</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <PanelMessage>Loading ranking…</PanelMessage>}
        {error != null && !isLoading && (
          <PanelMessage tone="error">Could not load risk ranking. Check the API connection.</PanelMessage>
        )}
        {items && items.length === 0 && !isLoading && <PanelMessage>No packages returned.</PanelMessage>}

        <ol className="divide-y divide-border">
          {items?.map((item, i) => {
            const level = riskLevel(item.vuln_count)
            const active = item.id === selectedNodeId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none ${
                    active ? "bg-accent" : ""
                  }`}
                  aria-pressed={active}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 shrink-0 text-xs font-mono tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">v{item.version}</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${RISK_COLORS[level]}22`, color: RISK_COLORS[level] }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
                          {RISK_LABELS[level]}
                          {item.vuln_count ? ` (${item.vuln_count})` : ""}
                        </span>
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground">
                          centrality {(item.centrality * 100).toFixed(2)}%
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function PanelMessage({ children, tone }: { children: React.ReactNode; tone?: "error" }) {
  return (
    <p className={`px-4 py-6 text-xs ${tone === "error" ? "text-red-400" : "text-muted-foreground"}`}>{children}</p>
  )
}
