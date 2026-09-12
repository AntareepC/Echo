export interface GraphNode {
  id: string
  name: string
  version: string
  vuln_count: number | null
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface RiskItem {
  id: string
  name: string
  version: string
  vuln_count: number | null
  centrality: number
  reason: string
}

export interface AffectedPackage {
  id: string
  hops: number
  impact_score: number
  reason: string
}

export interface SimulateResponse {
  compromised_node: string
  total_affected: number
  affected_packages: AffectedPackage[]
}

export type RiskLevel = "high" | "medium" | "clean" | "unchecked"

export function riskLevel(vulnCount: number | null | undefined): RiskLevel {
  if (vulnCount === null || vulnCount === undefined) return "unchecked"
  if (vulnCount <= 0) return "clean"
  if (vulnCount === 1) return "medium"
  return "high"
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  high: "#ef4444", // red
  medium: "#f59e0b", // amber
  clean: "#22c55e", // green
  unchecked: "#6b7280", // gray
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  high: "High risk",
  medium: "Has vulns",
  clean: "Clean",
  unchecked: "Not checked",
}
