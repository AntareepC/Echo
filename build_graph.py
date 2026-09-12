import json

with open("vscode-src/package-lock.json", encoding="utf-8") as f:
    raw = json.load(f)

packages = raw.get("packages", {})

nodes = {}
name_to_ids = {}

for path, info in packages.items():
    if path == "":
        continue
    name = path.split("node_modules/")[-1]
    version = info.get("version", "unknown")
    node_id = f"{name}@{version}"
    if node_id not in nodes:
        nodes[node_id] = {"id": node_id, "name": name, "version": version}
        name_to_ids.setdefault(name, []).append(node_id)

edges = []
edge_set = set()

for path, info in packages.items():
    if path == "":
        continue
    name = path.split("node_modules/")[-1]
    version = info.get("version", "unknown")
    source_id = f"{name}@{version}"
    for dep_name in info.get("dependencies", {}).keys():
        candidates = name_to_ids.get(dep_name, [])
        for target_id in candidates:
            edge_key = (source_id, target_id)
            if edge_key not in edge_set:
                edge_set.add(edge_key)
                edges.append({"source": source_id, "target": target_id})

graph = {"nodes": list(nodes.values()), "edges": edges}

with open("graph.json", "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)

print(f"Nodes: {len(nodes)}, Edges: {len(edges)}")
