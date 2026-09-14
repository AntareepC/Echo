"use client"

import type { GraphResponse } from "@/lib/types"

interface PackageOverviewProps {
  graph: GraphResponse | undefined
}

export function PackageOverview({ graph }: PackageOverviewProps) {
  const nodes = graph?.nodes.length ?? 0
  const edges = graph?.edges.length ?? 0
  const rootCves = graph?.nodes.filter((n) => (n.vuln_count ?? 0) > 0).length ?? 0

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-100">Package Overview</h2>
      <div className="grid grid-cols-3 gap-2.5">
        <Box label="Nodes" value={nodes} accent="#a78bfa" />
        <Box label="Edges" value={edges} accent="#a78bfa" />
        <Box label="Root CVEs" value={rootCves} accent="#ef4444" />
      </div>
    </section>
  )
}

function Box({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-center">
      <p className="font-mono text-xl font-semibold tabular-nums" style={{ color: accent }}>
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-[11px] leading-tight text-slate-400">{label}</p>
    </div>
  )
}
