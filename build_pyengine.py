#!/usr/bin/env python3
"""Bundle the pure-Python engine modules the replay needs into a single JSON the
dashboard loads into Pyodide. Re-run this whenever the engine changes so the
in-browser replay stays byte-identical to the bot (single source of truth).

    python3 dashboard/build_pyengine.py     # run from the repo root
"""
import hashlib
import json
import os

# The exact closure src.replay_engine imports (all pure Python — no requests).
FILES = [
    "src/__init__.py",
    "src/models.py",
    "src/config.py",
    "src/parser.py",
    "src/paper.py",
    "src/positions.py",
    "src/rules.py",
    "src/schwab/__init__.py",
    "src/schwab/orders.py",
    "src/schwab/symbols.py",
    "src/schwab/market_calendar.py",  # may be referenced by symbols; bundle to be safe
    "src/engine.py",
    "src/remote_config.py",   # row_to_kwargs: strategy_params row -> Config (bot's own mapping)
    "src/replay_engine.py",
]

OUT = "dashboard/ui_kits/dashboard/pyengine.json"


def main():
    if not os.path.isdir("src"):
        raise SystemExit("run from the repo root (no ./src here)")
    files = {}
    for rel in FILES:
        if os.path.exists(rel):
            with open(rel, "r") as fh:
                files[rel] = fh.read()
        else:
            print("  (skip, not found:", rel, ")")
    blob = "".join(files[k] for k in sorted(files))
    digest = hashlib.sha256(blob.encode()).hexdigest()[:12]
    payload = {"version": digest, "files": files}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(payload, fh)
    kb = os.path.getsize(OUT) // 1024
    print(f"wrote {OUT}: {len(files)} files, {kb} KB, version {digest}")


if __name__ == "__main__":
    main()
