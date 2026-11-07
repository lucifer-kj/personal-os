import json
import os
import sys
from pathlib import Path

from graphify.detect import detect
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

out_dir = Path("graphify-out")
out_dir.mkdir(exist_ok=True)
root_dir = Path(".")

print("[1/5] Detecting codebase files...")
detection = detect(root_dir)
(out_dir / ".graphify_detect.json").write_text(json.dumps(detection, ensure_ascii=False), encoding="utf-8")

code_files = []
for f in detection.get("files", {}).get("code", []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    elif p.is_file():
        code_files.append(p)

print(f"Detected {detection.get('total_files')} files ({len(code_files)} code files).")

print("[2/5] Performing structural AST extraction...")
ast_result = extract(code_files, cache_root=root_dir, root=root_dir)
(out_dir / ".graphify_ast.json").write_text(json.dumps(ast_result, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Extracted {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges from code.")

# Merge AST extraction into final extraction
(out_dir / ".graphify_extract.json").write_text(json.dumps(ast_result, indent=2, ensure_ascii=False), encoding="utf-8")

print("[3/5] Building graph & clustering communities...")
G = build_from_json(ast_result, root=root_dir, directed=False)
if G.number_of_nodes() == 0:
    print("ERROR: Graph is empty.")
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": 0, "output": 0}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: f"Community {cid}" for cid in communities}
questions = suggest_questions(G, communities, labels)

# Derive human-friendly labels from top nodes in each community
for cid, nodes in communities.items():
    top_labels = [G.nodes[n].get("label") or str(n) for n in nodes[:3] if n in G.nodes]
    if top_labels:
        labels[cid] = " / ".join(top_labels[:2])

print("[4/5] Generating GRAPH_REPORT.md and graph.json...")
to_json(G, communities, "graphify-out/graph.json", community_labels=labels)
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, ".", suggested_questions=questions)
(out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

print(f"[5/5] Success! Built graph with {G.number_of_nodes()} nodes, {G.number_of_edges()} edges across {len(communities)} communities.")
