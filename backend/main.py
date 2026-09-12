import json
import networkx as nx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("../data/graph.json", encoding="utf-8") as f:
    graph_data = json.load(f)

G = nx.DiGraph()
for n in graph_data["nodes"]:
    G.add_node(n["id"], **n)
for e in graph_data["edges"]:
    G.add_edge(e["source"], e["target"])

centrality = nx.betweenness_centrality(G, k=min(200, len(G.nodes)))

class SimulateRequest(BaseModel):
    node_id: str

@app.get("/graph")
def get_graph():
    return graph_data

@app.get("/risk-ranking")
def risk_ranking(top: int = 10):
    ranked = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:top]
    result = []
    for node_id, score in ranked:
        node_info = G.nodes[node_id]
        result.append({
            "id": node_id,
            "name": node_info.get("name"),
            "version": node_info.get("version"),
            "vuln_count": node_info.get("vuln_count"),
            "centrality": round(score, 5),
            "reason": f"Sits on {round(score*100, 2)}% of shortest dependency paths in the graph"
        })
    return result

@app.post("/simulate")
def simulate(req: SimulateRequest):
    if req.node_id not in G:
        raise HTTPException(status_code=404, detail="Node not found")

    affected = {}
    for target in G.nodes:
        if target == req.node_id:
            continue
        try:
            path_len = nx.shortest_path_length(G, source=target, target=req.node_id)
            impact = round(1 / (1 + path_len), 3)
            affected[target] = {
                "hops": path_len,
                "impact_score": impact,
                "reason": f"Depends on {req.node_id} through a chain of {path_len} package(s)"
            }
        except nx.NetworkXNoPath:
            continue

    sorted_affected = sorted(affected.items(), key=lambda x: x[1]["impact_score"], reverse=True)
    return {
        "compromised_node": req.node_id,
        "total_affected": len(sorted_affected),
        "affected_packages": [{"id": k, **v} for k, v in sorted_affected[:50]]
    }
