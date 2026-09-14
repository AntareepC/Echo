"use client"

import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"
import { DEFAULT_API_BASE, fetchGraph, fetchRiskRanking, simulate } from "@/lib/api"
import type { AffectedPackage, SimulateResponse } from "@/lib/types"
import { AttackSimulation } from "./attack-simulation"
import { CompromiseImpact } from "./compromise-impact"
import { DashboardHeader } from "./dashboard-header"
import { DependencyGraph } from "./dependency-graph"
import { PackageOverview } from "./package-overview"
import { PackageSearch } from "./package-search"
import { SupplyChainRisk } from "./supply-chain-risk"
import { VulnerabilitiesPanel } from "./vulnerabilities-panel"

export function Dashboard() {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [simResult, setSimResult] = useState<SimulateResponse | null>(null)
  const [simLoading, setSimLoading] = useState(false)
  const [simError, setSimError] = useState<string | null>(null)

  const graphQuery = useSWR([apiBase, "graph"], () => fetchGraph(apiBase), {
    revalidateOnFocus: false,
  })
  const riskQuery = useSWR([apiBase, "risk"], () => fetchRiskRanking(apiBase, 10), {
    revalidateOnFocus: false,
  })

  const runSimulation = useCallback(
    async (nodeId: string) => {
      setSelectedNodeId(nodeId)
      setSimLoading(true)
      setSimError(null)
      try {
        const res = await simulate(apiBase, nodeId)
        setSimResult(res)
      } catch (e) {
        setSimResult(null)
        setSimError(e instanceof Error ? e.message : "Simulation failed")
      } finally {
        setSimLoading(false)
      }
    },
    [apiBase],
  )

  const affectedMap = useMemo(() => {
    const map = new Map<string, AffectedPackage>()
    simResult?.affected_packages.forEach((p) => map.set(p.id, p))
    return map
  }, [simResult])

  const graph = graphQuery.data
  const connected = !graphQuery.error && graph != null
  const nodes = graph?.nodes ?? []

  return (
    <div className="text-slate-100">
      <DashboardHeader apiBase={apiBase} onApiBaseChange={setApiBase} connected={connected} />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Hero */}
        <section className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Open Source Supply Chain Risk Analyzer
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-400">
            Map every dependency, surface the packages that hold the ecosystem together, and simulate what breaks when a
            single upstream package is compromised.
          </p>
        </section>

        {/* Search */}
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <PackageSearch nodes={nodes} onAnalyze={runSimulation} disabled={!connected} />
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <section className="animate-in fade-in slide-in-from-bottom-3 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm duration-500">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-sm font-semibold tracking-tight text-slate-100">Dependency Graph</h2>
                <StatusBadge loading={graphQuery.isLoading} live={connected} />
              </div>
              <div className="relative h-[480px] w-full">
                {graphQuery.isLoading && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-xs text-slate-400">Loading dependency graph…</p>
                  </div>
                )}
                {graphQuery.error != null && !graphQuery.isLoading && (
                  <div className="flex h-full items-center justify-center px-6">
                    <div className="max-w-sm text-center">
                      <p className="text-sm font-medium text-red-400">Cannot reach the API</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Could not load <span className="font-mono">{apiBase}/graph</span>. Make sure the backend is
                        running and reachable, then re-connect from the status badge in the top bar.
                      </p>
                    </div>
                  </div>
                )}
                {graph && !graphQuery.isLoading && (
                  <DependencyGraph
                    graph={graph}
                    riskItems={riskQuery.data}
                    selectedNodeId={selectedNodeId}
                    affected={affectedMap}
                    onSelectNode={runSimulation}
                  />
                )}
              </div>
            </section>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <CompromiseImpact result={simResult} graph={graph} loading={simLoading} error={simError} />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <PackageOverview graph={graph} />
            <VulnerabilitiesPanel graph={graph} onSelect={runSimulation} selectedNodeId={selectedNodeId} />
            <AttackSimulation
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSimulate={runSimulation}
              loading={simLoading}
              disabled={!connected}
            />
            <SupplyChainRisk result={simResult} graph={graph} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ loading, live }: { loading: boolean; live: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Waiting
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        live
          ? "border-green-500/30 bg-green-500/10 text-green-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400" : "bg-red-400"}`} />
      {live ? "Live" : "Offline"}
    </span>
  )
}
