import json
import time
import requests

with open("graph.json", encoding="utf-8") as f:
    graph = json.load(f)

nodes = graph["nodes"]

def query_osv(name, version):
    url = "https://api.osv.dev/v1/query"
    body = {"package": {"name": name, "ecosystem": "npm"}, "version": version}
    try:
        r = requests.post(url, json=body, timeout=5)
        r.raise_for_status()
        vulns = r.json().get("vulns", [])
        return len(vulns)
    except Exception:
        return 0

# To keep this fast for a hackathon demo, only check the top N most-connected packages
from collections import Counter
edge_counts = Counter()
for e in graph["edges"]:
    edge_counts[e["source"]] += 1
    edge_counts[e["target"]] += 1

top_nodes = sorted(nodes, key=lambda n: edge_counts.get(n["id"], 0), reverse=True)[:150]
top_ids = {n["id"] for n in top_nodes}

checked = 0
for n in nodes:
    if n["id"] in top_ids:
        n["vuln_count"] = query_osv(n["name"], n["version"])
        checked += 1
        if checked % 20 == 0:
            print(f"Checked {checked}/{len(top_ids)}...")
        time.sleep(0.1)
    else:
        n["vuln_count"] = None

with open("graph.json", "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)

flagged = [n for n in nodes if n.get("vuln_count", 0) and n["vuln_count"] > 0]
print(f"Done. Checked {checked} top-connected packages. Found {len(flagged)} with known vulnerabilities.")
for n in flagged[:10]:
    print(f"  - {n['id']}: {n['vuln_count']} vuln(s)")
