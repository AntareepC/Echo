"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { type AffectedPackage, type GraphResponse, type RiskItem, RISK_COLORS, riskLevel } from "@/lib/types"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface GraphNodeObj {
  id: string
  name: string
  version: string
  vuln_count: number | null
  degree: number
  sizeScale: number
  x?: number
  y?: number
}

interface DependencyGraphProps {
  graph: GraphResponse
  riskItems: RiskItem[] | undefined
  selectedNodeId: string | null
  affected: Map<string, AffectedPackage>
  onSelectNode: (id: string) => void
}

const DEFAULT_VISIBLE = 100

export function DependencyGraph({ graph, riskItems, selectedNodeId, affected, onSelectNode }: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [maxNodes, setMaxNodes] = useState(DEFAULT_VISIBLE)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setSize({ width: rect.width, height: rect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalNodes = graph.nodes.length

  // Degree = number of edges touching a node. Used both for "most connected"
  // filtering and as a centrality proxy for node sizing.
  const degreeById = useMemo(() => {
    const deg = new Map<string, number>()
    for (const n of graph.nodes) deg.set(n.id, 0)
    for (const e of graph.edges) {
      deg.set(e.source, (deg.get(e.source) ?? 0) + 1)
      deg.set(e.target, (deg.get(e.target) ?? 0) + 1)
    }
    return deg
  }, [graph])

  const riskTopIds = useMemo(() => new Set((riskItems ?? []).map((r) => r.id)), [riskItems])

  const data = useMemo(() => {
    const clamped = Math.min(maxNodes, totalNodes)

    // Rank nodes by degree, then always include selected + affected + risk-top
    // so simulations and important packages never get filtered out.
    const ranked = [...graph.nodes].sort((a, b) => (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0))
    const visible = new Set<string>(ranked.slice(0, clamped).map((n) => n.id))
    if (selectedNodeId) visible.add(selectedNodeId)
    for (const id of affected.keys()) visible.add(id)
    for (const id of riskTopIds) visible.add(id)

    const maxDeg = ranked.length ? (degreeById.get(ranked[0].id) ?? 1) : 1

    const nodes: GraphNodeObj[] = graph.nodes
      .filter((n) => visible.has(n.id))
      .map((n) => {
        const degree = degreeById.get(n.id) ?? 0
        // sqrt scaling so a few hub nodes don't dwarf everything else
        const sizeScale = Math.sqrt(degree / (maxDeg || 1))
        return { ...n, degree, sizeScale }
      })

    const links = graph.edges
      .filter((e) => visible.has(e.source) && visible.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }))

    return { nodes, links }
  }, [graph, degreeById, maxNodes, totalNodes, selectedNodeId, affected, riskTopIds])

  // Stronger repulsion + link distance so clusters separate instead of blobbing.
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force("charge")?.strength(-140).distanceMax(600)
    fg.d3Force("link")?.distance(38)
    fg.d3ReheatSimulation?.()
  }, [data])

  const hasSimulation = affected.size > 0 || selectedNodeId !== null

  const nodeRadius = (node: GraphNodeObj) => 3 + node.sizeScale * 9

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Node count control */}
      <div className="absolute left-3 top-3 z-10 w-60 rounded-lg border border-border bg-card/85 p-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <label htmlFor="node-slider" className="text-xs font-medium text-foreground">
            Show more nodes
          </label>
          <span className="font-mono text-xs text-muted-foreground">
            {Math.min(maxNodes, totalNodes)}/{totalNodes}
          </span>
        </div>
        <input
          id="node-slider"
          type="range"
          min={10}
          max={totalNodes}
          step={10}
          value={Math.min(maxNodes, totalNodes)}
          onChange={(e) => setMaxNodes(Number(e.target.value))}
          className="mt-2 w-full accent-violet-500"
          aria-label="Number of most-connected nodes to display"
        />
        <div className="mt-1.5 flex gap-1.5">
          <button
            type="button"
            onClick={() => setMaxNodes(DEFAULT_VISIBLE)}
            className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Top 100
          </button>
          <button
            type="button"
            onClick={() => setMaxNodes(totalNodes)}
            className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Show all
          </button>
        </div>
        <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
          Showing the most-connected packages. Selected & top-risk nodes are always included.
        </p>
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={size.width}
        height={size.height}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTicks={120}
        onEngineStop={() => fgRef.current?.zoomToFit?.(400, 60)}
        nodeRelSize={5}
        nodeLabel={(node: any) => `${node.name}@${node.version} · ${labelForVuln(node.vuln_count)}`}
        onNodeClick={(node: any) => onSelectNode(node.id)}
        linkColor={(link: any) => {
          const targetId = typeof link.target === "object" ? link.target.id : link.target
          const hit = affected.get(targetId)
          if (hit) return `rgba(245, 158, 11, ${0.35 + hit.impact_score * 0.6})`
          return hasSimulation ? "rgba(120,120,130,0.05)" : "rgba(140,140,150,0.18)"
        }}
        linkWidth={(link: any) => {
          const targetId = typeof link.target === "object" ? link.target.id : link.target
          const hit = affected.get(targetId)
          if (hit) return 1 + hit.impact_score * 5
          return 0.6
        }}
        linkDirectionalParticles={(link: any) => {
          const targetId = typeof link.target === "object" ? link.target.id : link.target
          return affected.get(targetId) ? 2 : 0
        }}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => "rgba(245,158,11,0.9)"}
        nodeCanvasObject={(node: GraphNodeObj, ctx, globalScale) => {
          const color = RISK_COLORS[riskLevel(node.vuln_count)]
          const isSelected = node.id === selectedNodeId
          const hit = affected.get(node.id)
          const inPath = isSelected || !!hit
          // Fade everything not part of the propagation path during a simulation.
          const dimmed = hasSimulation && !inPath
          const r = isSelected ? nodeRadius(node) + 2.5 : nodeRadius(node)

          ctx.save()
          ctx.globalAlpha = dimmed ? 0.12 : 1

          // glow for compromised / affected nodes
          if (inPath) {
            const glowColor = isSelected ? "#ef4444" : "#f59e0b"
            const intensity = isSelected ? 1 : 0.4 + (hit?.impact_score ?? 0) * 0.6
            ctx.save()
            ctx.shadowBlur = 18 * intensity
            ctx.shadowColor = glowColor
            ctx.beginPath()
            ctx.arc(node.x!, node.y!, r + 1.5, 0, 2 * Math.PI)
            ctx.fillStyle = glowColor
            ctx.globalAlpha = 0.25 + intensity * 0.35
            ctx.fill()
            ctx.restore()
          }

          // main node
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()

          if (isSelected) {
            ctx.lineWidth = 1.6 / globalScale
            ctx.strokeStyle = "#fca5a5"
            ctx.stroke()
          }

          // Label only for: top-risk nodes, selected node, or affected nodes.
          const isRiskTop = riskTopIds.has(node.id)
          const shouldLabel = !dimmed && (isRiskTop || isSelected || !!hit)
          if (shouldLabel) {
            const label = node.name
            const fontSize = Math.max(10 / globalScale, 3)
            ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillStyle = isSelected ? "#fecaca" : hit ? "#fde68a" : "rgba(228,228,231,0.92)"
            ctx.fillText(label, node.x!, node.y! + r + 1.5)
          }

          ctx.restore()
        }}
      />
    </div>
  )
}

function labelForVuln(v: number | null) {
  if (v === null || v === undefined) return "not checked"
  if (v === 0) return "no known vulns"
  return `${v} vuln${v === 1 ? "" : "s"}`
}
