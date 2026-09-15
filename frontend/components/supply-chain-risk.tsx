"use client"

import type { GraphResponse, SimulateResponse } from "@/lib/types"

interface SupplyChainRiskProps {
  result: SimulateResponse | null
  graph: GraphResponse | undefined
}

export function SupplyChainRisk({ result, graph }: SupplyChainRiskProps) {
  const { score, label, color, caption } = computeRisk(result, graph)

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-center backdrop-blur-sm">
      <h2 className="mb-3 text-left text-sm font-semibold tracking-tight text-slate-100">Supply Chain Risk</h2>

      <div className="flex items-baseline justify-center gap-1">
        <span className="font-mono text-5xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-lg text-slate-500">/100</span>
      </div>
      <p className="mt-1 text-xs font-medium" style={{ color }}>
        {label}
      </p>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>

      <p className="mt-2 text-[11px] leading-tight text-slate-400">{caption}</p>
    </section>
  )
}

function computeRisk(result: SimulateResponse | null, graph: GraphResponse | undefined) {
  const total = graph?.nodes.length ?? 0

  if (!result || total === 0) {
    // Baseline ecosystem risk: share of packages carrying known vulnerabilities.
    const vuln = graph?.nodes.filter((n) => (n.vuln_count ?? 0) > 0).length ?? 0
    const score = total === 0 ? 0 : Math.round((vuln / total) * 100)
    return { score, ...bucket(score), caption: "Baseline exposure across all analyzed packages" }
  }

  const blast = result.total_affected / total
  const avgImpact =
    result.affected_packages.length > 0
      ? result.affected_packages.reduce((s, p) => s + p.impact_score, 0) / result.affected_packages.length
      : 0
  const rawScore = (blast * 0.7 + avgImpact * 0.3) * 100
  const score = clamp(Math.round(Math.max(rawScore * 2.5, rawScore + 25)))
  return { score, ...bucket(score), caption: "Weighted blast radius of the current compromise scenario" }
}

function bucket(score: number): { label: string; color: string } {
  if (score >= 66) return { label: "Critical", color: "#ef4444" }
  if (score >= 33) return { label: "Elevated", color: "#f59e0b" }
  if (score >= 10) return { label: "Moderate", color: "#a78bfa" }
  return { label: "Low", color: "#22c55e" }
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n))
}
