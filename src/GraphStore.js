import * as m from 'mathjs';
// https://coolors.co/555b6e-89b0ae-bee3db-faf9f9-ffd6ba
// https://coolors.co/ff9f1c-ffbf69-ffffff-cbf3f0-2ec4b6
const COLOR_ACTIVE = "#ff9f1c"
const COLOR_VISITED = "#ffbf69"
const COLOR_INIT = "#2ec4b6"

class Node {
  constructor(visited = false, active = false, value = null, color = null) {
    this.visited = visited;
    this.active = active;
    this.value = value;
    this._color = color;
  }

  get color() {
    return this._color || (this.active && COLOR_ACTIVE) || (this.visited && COLOR_VISITED)
      || COLOR_INIT;
  }
  toObject() {
    return {
      visited: this.visited,
      value: this.value,
      color: this.color
    };
  }
}

class Edge extends Node {}


class GraphStore {
  constructor(A, potentials, nodes, edges) {
    this.A = A || m.zeros();
    this.potentials = potentials || m.zeros();

    // this stores per-node metadata. the indices correlate to this.A and no data is stored double.
    this.nodes = nodes || [];

    // this stores per-edge metadata. this.edges[i][j] corresponds to this.A[i][j]
    this.edges = edges || {};
  }

  getNodeNumber() {
    return this.A.size()[0];
  }

  addNode(visited = false, active = false, value = null) {
    let newNode = new Node(visited, active, value);
    this.nodes.push(newNode);
    let n = this.getNodeNumber();

    this.A = this.A.resize([n + 1, n + 1], 0);
    return this;
  }
  addNodes(nodes) {
    for (const node of nodes) {
      this.addNode();
    }
    return this;
  }

  setEdge(node1Idx, node2Idx, val) {
    this.A.subset(m.index(node1Idx, node2Idx), val);
    return this;
  }
  removeEdge(node1Idx, node2Idx) { return this.setEdge(node1Idx, node2Idx, 0); }
  addEdge(node1Idx, node2Idx) { return this.setEdge(node1Idx, node2Idx, 1); }
  getEdge(node1Idx, node2Idx) {
    return this.A.subset(m.index(node1Idx, node2Idx));
  }
  addEdges(edges) {
    for (const edge of edges) {
      const [node1, node2] = edge;
      this.addEdge(node1, node2);
    }
    return this;
  }

  toD3() {
    let nodes = this.nodes.map((node, idx) => ({ id: idx, label: `${idx} ${node.value ? `: ${node.value}` : ""}`, ...node.toObject() }));
    let links = this.getEdgesFromA((val, [fromIdx, toIdx]) => ({ source: fromIdx, target: toIdx }))

    return { nodes, links };
  }

  // mapper maps Adjacency matrix value and indicies to the object you need.
  // (A_{i,j}, [i, j]) => any
  getEdgesFromA(mapper) {
    let links = [];

    this.A.forEach((val, [fromIdx, toIdx]) => {
      if (val > 0) {
        links.push(mapper(val, [fromIdx, toIdx]));
      }
    });

    return links
  }

  copy() {
    return new GraphStore(this.A, this.potentials, this.nodes)
  }

  get V() {
    return this.nodes;
  }

  get E() {
    return this.getEdgesFromA((val, [fromIdx, toIdx]) => [fromIdx, toIdx])
  }

  visit(instance) {
    let edge;
    let node;
    if (instance.constructor.name == "Node") {
      node = instance
    } else if (typeof instance === "number") {
      node = this.nodes[instance]
    } else if (Array.isArray(instance)) {
      edge = instance;
    } else {
      throw new TypeError(`visit got an invalid argument: ${instance}`)
    }

    if (node) {
      this.nodes.forEach(node => node.active = false);
      node.visited = true;
      node.active = true;
    } else if (edge) {
      
    }
  }

}
export let getDefaultGraph = () => {
  let G = new GraphStore();
  G.addNode();
  G.addNode();
  G.addNode();
  G.addNode();

  G.addEdge(0, 1);
  G.addEdge(1, 2);
  G.addEdge(2, 0);
  G.addEdge(0, 3);

  return G;

};
