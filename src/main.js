import "./style.css";
import initOxigraph, { Store } from "oxigraph/web";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Sigma from "sigma";

const app = document.querySelector("#app");

app.innerHTML = `
  <header class="app-header">
    <h1>WASM NT Graph Visualizer</h1>
    <p>
      Diese Demo lädt eine große <code>.nt</code>-Datei, verarbeitet sie mit Oxigraph (WebAssembly) und rendert sie mit Sigma.js.
    </p>
    <div class="controls">
      <label class="file-loader">
        <span>Andere .nt-Datei laden</span>
        <input id="file-input" type="file" accept=".nt,.nq,.ttl,.txt" />
      </label>
      <button id="reload-sample" type="button">Beispieldatensatz neu laden</button>
    </div>
    <div class="status" id="status"></div>
  </header>
  <main>
    <div id="sigma-container"></div>
  </main>
`;

const statusEl = document.getElementById("status");
const fileInput = document.getElementById("file-input");
const reloadSampleButton = document.getElementById("reload-sample");
const sigmaContainer = document.getElementById("sigma-container");

let renderer = null;
let graph = null;

function updateStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

async function ensureOxigraph() {
  if (!ensureOxigraph._initialized) {
    updateStatus("Initialisiere Oxigraph (WASM)…");
    await initOxigraph();
    ensureOxigraph._initialized = true;
  }
}
ensureOxigraph._initialized = false;

function createGraphFromQuads(quads) {
  const g = new Graph({ type: "directed" });
  const seenNodes = new Map();

  const getNodeId = (term) => {
    if (term.termType === "NamedNode") {
      return term.value;
    }
    if (term.termType === "BlankNode") {
      return `_:${term.value}`;
    }
    return null;
  };

  for (const quad of quads) {
    const source = getNodeId(quad.subject);
    const target = getNodeId(quad.object);
    if (!source || !target) continue;

    if (!seenNodes.has(source)) {
      seenNodes.set(source, true);
      g.addNode(source, {
        label: source.replace(/^https?:\/\//, ""),
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: 1,
      });
    }
    if (!seenNodes.has(target)) {
      seenNodes.set(target, true);
      g.addNode(target, {
        label: target.replace(/^https?:\/\//, ""),
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: 1,
      });
    }

    const edgeKey = `${source}->${target}-${quad.predicate.value}`;
    if (!g.hasEdge(edgeKey)) {
      g.addEdgeWithKey(edgeKey, source, target, {
        label: quad.predicate.value,
      });
      g.updateNodeAttribute(source, "size", (size) => size + 0.2);
      g.updateNodeAttribute(target, "size", (size) => size + 0.2);
    }
  }

  updateStatus(`Graph erstellt: ${g.order} Knoten, ${g.size} Kanten. Berechne Layout…`);

  forceAtlas2.assign(g, {
    iterations: 80,
    settings: {
      scalingRatio: 10,
      gravity: 1,
      slowDown: 10,
      adjustSizes: true,
    },
  });

  return g;
}

async function parseNTriples(text) {
  await ensureOxigraph();
  const store = new Store();
  store.load(text, { format: "application/n-triples" });
  const quads = store.match(null, null, null, null);
  updateStatus(`Parsiere… ${quads.length} Tripel verarbeitet`);
  return quads;
}

function renderGraph(g) {
  if (renderer) {
    renderer.kill();
    renderer = null;
  }

  graph = g;
  renderer = new Sigma(graph, sigmaContainer, {
    allowInvalidContainer: false,
  });

  updateStatus(`Fertig! ${graph.order} Knoten und ${graph.size} Kanten visualisiert.`, "success");
}

async function loadFromResponse(response) {
  if (!response.ok) {
    throw new Error(`Fehler beim Laden: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  updateStatus("Datei geladen, starte Parsing…");
  const quads = await parseNTriples(text);
  const g = createGraphFromQuads(quads);
  renderGraph(g);
}

async function loadSample() {
  updateStatus("Lade Beispieldatensatz…");
  const response = await fetch("./data/sample.nt");
  await loadFromResponse(response);
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    updateStatus(`Lade ${file.name}…`);
    const text = await file.text();
    const quads = await parseNTriples(text);
    const g = createGraphFromQuads(quads);
    renderGraph(g);
  } catch (error) {
    console.error(error);
    updateStatus(`Fehler: ${error.message}`, "error");
  }
});

reloadSampleButton.addEventListener("click", async () => {
  try {
    await loadSample();
  } catch (error) {
    console.error(error);
    updateStatus(`Fehler: ${error.message}`, "error");
  }
});

loadSample().catch((error) => {
  console.error(error);
  updateStatus(`Fehler beim Initial-Laden: ${error.message}`, "error");
});
