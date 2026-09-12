"use client"

import { useMemo } from "react"
import type { GraphResponse, RiskItem } from "@/lib/types"

interface HeroStatsProps {
  graph: GraphResponse | undefined
  riskItems: RiskItem[] | undefined
}

interface Stat {
  label: string
  value: string
  hint: string
  accent: string
}

export function HeroStats({ graph, riskItems }: HeroStatsProps) {
  const stats = useMemo<Stat[]>(() => {
    const nodeCount = graph?.nodes.length ?? 0
    const edgeCount = graph?.edges.length ?? 0
    const vulnCount = graph?.nodes.filter((n) => (n.vuln_count ?? 0) > 0).length ?? 0
    const blastRadius = estimatePeakBlastRadius(graph, riskItems)

    return [
      {
        label: "Packages analyzed",
        value: formatNumber(nodeCount),
        hint: "Nodes in the dependency graph",
        accent: "#60a5fa",
      },
      {
        label: "Dependencies mapped",
        value: formatNumber(edgeCount),
        hint: "Edges between packages",
        accent: "#a78bfa",
      },
      {
        label: "Known vulnerabilities",
        value: formatNumber(vulnCount),
        hint: "Packages with 1+ reported vulns",
        accent: "#f59e0b",
      },
      {
        label: "Peak blast radius",
        value: blastRadius === null ? "—" : formatNumber(blastRadius),
        hint: "Largest downstream reach found",
        accent: "#ef4444",
      },
    ]
  }, [graph, riskItems])

  return (
    <section className="px-4 pb-4 pt-6 sm:px-6">
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Open Source Supply Chain Risk Analyzer
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Map every dependency, surface the packages that hold the ecosystem together, and simulate what breaks when a
          single upstream package is compromised.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-in fade-in slide-in-from-bottom-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm duration-500"
            style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.accent }} aria-hidden />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US")
}

/**
 * Estimates the largest downstream blast radius from already-loaded data.
 * Builds a reverse adjacency (who depends on whom) and runs BFS from each of the
 * top-ranked risk packages, returning the biggest transitively-affected set.
 * Only the top risk nodes are traversed, so this stays cheap even on large graphs.
 */
function estimatePeakBlastRadius(
  graph: GraphResponse | undefined,
  riskItems: RiskItem[] | undefined,
): number | null {
  if (!graph || !riskItems || riskItems.length === 0) return null

  const dependents = new Map<string, string[]>()
  for (const edge of graph.edges) {
    const list = dependents.get(edge.target)
    if (list) list.push(edge.source)
    else dependents.set(edge.target, [edge.source])
  }

  let peak = 0
  for (const item of riskItems) {
    const visited = new Set<string>()
    const queue = [item.id]
    while (queue.length > 0) {
      const current = queue.pop() as string
      const parents = dependents.get(current)
      if (!parents) continue
      for (const p of parents) {
        if (!visited.has(p)) {
          visited.add(p)
          queue.push(p)
        }
      }
    }
    if (visited.size > peak) peak = visited.size
  }

  return peak
}
