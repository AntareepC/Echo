import type { GraphResponse, RiskItem, SimulateResponse } from "./types"

export const DEFAULT_API_BASE = "https://echo-nwwq.onrender.com"

function join(base: string, path: string) {
  return `${base.replace(/\/$/, "")}${path}`
}

export async function fetchGraph(base: string): Promise<GraphResponse> {
  const res = await fetch(join(base, "/graph"))
  if (!res.ok) throw new Error(`GET /graph failed (${res.status})`)
  return res.json()
}

export async function fetchRiskRanking(base: string, top = 10): Promise<RiskItem[]> {
  const res = await fetch(join(base, `/risk-ranking?top=${top}`))
  if (!res.ok) throw new Error(`GET /risk-ranking failed (${res.status})`)
  return res.json()
}

export async function simulate(base: string, nodeId: string): Promise<SimulateResponse> {
  const res = await fetch(join(base, "/simulate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id: nodeId }),
  })
  if (!res.ok) throw new Error(`POST /simulate failed (${res.status})`)
  return res.json()
}
