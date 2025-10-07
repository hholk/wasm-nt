"""Generate a reproducible synthetic N-Triples dataset with thousands of nodes."""
from __future__ import annotations

import random
from pathlib import Path

NUM_NODES = 3000
NUM_EDGES = 9000
RELATIONS = [f"http://example.org/relation/{i}" for i in range(20)]
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "sample.nt"


def main() -> None:
  random.seed(42)
  nodes = [f"http://example.org/node/{i}" for i in range(NUM_NODES)]
  OUTPUT.parent.mkdir(parents=True, exist_ok=True)
  with OUTPUT.open("w", encoding="utf-8") as fh:
    for _ in range(NUM_EDGES):
      s = random.choice(nodes)
      o = random.choice(nodes)
      while o == s:
        o = random.choice(nodes)
      p = random.choice(RELATIONS)
      fh.write(f"<{s}> <{p}> <{o}> .\n")


if __name__ == "__main__":
  main()
