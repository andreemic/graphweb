import logo from './logo.svg';
import './App.css';
import React, { useState, useMemo, useRef } from "react"
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import d3config from "./d3config.json"
import { Graph } from "react-d3-graph";
import { getDefaultGraph } from './GraphStore';

function App() {
  const [codeVal, setCodeVal] = useState(`function onLoad(editor) {
    console.log("i've loaded");
  }`);
  const onChange = (val, e) => setCodeVal(val)
  const [G, setG] = useState(getDefaultGraph())

  const onClickNode = (nodeId, node, c) => {
    console.log(nodeId, node, c)
  }
  const onClickLink = (source, target) => {
    source = parseInt(source); 
    target = parseInt(target);

    G.removeEdge(source, target);
    setG(G.copy())
  }

  const onClickGraph = (e) => {
    console.log(e)
    console.log(document.getElementById("graph-id-graph-wrapper"))
    let graphEl = document.getElementById("graph-id-graph-wrapper")

    let elementY =  e.clientY - graphEl.clientTop;
    let elementX =  e.clientX - graphEl.clientLeft;

    // Todo: create node at (elementX, elementY)
  }
  const runUserCode = () => {
    eval(codeVal)
    setG(G.copy())
  };

  const d3Graph = useMemo(() => G.toD3(), [G]);

  const graphRef = useRef(null);
  return (
    <div>
      <Graph
        ref={graphRef}
        id="graph-id" // id is mandatory
        data={d3Graph}
        config={d3config}
        onClickNode={onClickNode}
        onClickLink={onClickLink}
        onClickGraph={onClickGraph}
      />;
      <AceEditor
        placeholder="Placeholder Text"
        mode="javascript"
        theme="github"
        name="graph-code"
        onChange={onChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={codeVal}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }} />

      <button onClick={runUserCode}>Run</button>

    </div>

  );
}

function printTest() {
  console.log("Test");
}

export default App