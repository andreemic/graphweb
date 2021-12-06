import * as m from 'mathjs';
// https://coolors.co/555b6e-89b0ae-bee3db-faf9f9-ffd6ba
// https://coolors.co/ff9f1c-ffbf69-ffffff-cbf3f0-2ec4b6
const COLOR_ACTIVE = "#ff9f1c"
const COLOR_VISITED = "#ffbf69"
const COLOR_INIT = "#2ec4b6"
function shadeColor(color, percent) {

  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

class Node {
  constructor({visited = false, active = false, value = null, color = null, startX=null, startY=null}) {
    this.visited = visited;
    this.active = active;
    this.value = value;
    this._color = color;
    this.selected = false;

    this.startX = startX;
    this.startY = startY;
  }

  get color() {
    let selectedColor = this._color || (this.active && COLOR_ACTIVE) || (this.visited && COLOR_VISITED)
      || COLOR_INIT;

    return (this.selected ? shadeColor(selectedColor, -30) : selectedColor)
  }
  toObject() {
    return {
      visited: this.visited,
      value: this.value,
      color: this.color,
      selected: this.selected,
      x: this.startX,
      y: this.startY
    };
  }
}

class Edge extends Node { }


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

  addNode({visited = false, active = false, value = null, startX=null, startY=null} = {}) {
    let newNode = new Node({visited, active, value, startX, startY});
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
  
  removeNode(node) {
    // Todo: make nodes an object. this is whacky
    node = this._retrieveNode(node) 

    let thisNodeIdx = this.nodes.indexOf(node)
    this.nodes.forEach((_, otherNodeIdx) => this.removeEdge(thisNodeIdx, otherNodeIdx))
    this.nodes = this.nodes.map(n => n == node ? null : n)
  }

  setEdge(node1Idx, node2Idx, val) {
    this.A.subset(m.index(node1Idx, node2Idx), val);
    this.A.subset(m.index(node2Idx, node1Idx), val);
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
    // this maps nodes to objects, then filters out nulls
    let nodes = this.nodes.map((node, idx) => node && ({ id: idx, label: `${idx} ${node.value ? `: ${node.value}` : ""}`, ...node.toObject() })).filter(n => n);
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

  _retrieveNode(node) {
    try {
      if (node?.constructor?.name === "Node") {
        return this.nodes.find(node => node === node);
      } else if (typeof node === "number") {
        return this.nodes[node]
      }
    } catch (e) {
      throw Error('Called select with node which is not in the graph')
    }
  }

  select(node) {
    this._retrieveNode(node).selected = true;
  }

  unselect(node) {
    if (!node) {
      this.nodes.forEach(n => n && (n.selected = false));
    } else if (typeof node === "number") {
      node = this.nodes[node]
      node.selected = false;
    } else if (node?.constructor?.name === "Node") {
      node = this.nodes.find(node => node === node);
      node.selected = false;
    }
  }

  get selectedNodes() {
    return this.nodes.filter(n => n && n.selected)
  }

  get selectedNodesIdx() {
    return this.nodes.map((n, idx) => n?.selected ? idx : -1).filter(n => n != -1)
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
