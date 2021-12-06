import logo from './logo.svg';
import './App.css';
import React, { useState, useMemo, useRef } from "react"
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import 'brace/mode/javascript';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import ace from 'brace'

import d3config from "./d3config.json"
import { Graph } from "react-d3-graph";
import { getDefaultGraph } from './GraphStore';

console.log(ace)
// #autocompletion
// let langTools = ace.require('ace/ext/language_tools');
// langTools.addCompleter(customCompleter);

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
    let graphEl = document.getElementById("graph-id-graph-wrapper")

    let elementY = e.clientY - graphEl.clientTop;
    let elementX = e.clientX - graphEl.clientLeft;

    console.log(graphRef.current);
    graphRef.current._onDragMove = onClickNode
    graphRef.current._onDragStart = onClickNode
    graphRef.current._onDragEnd = onClickNode
    graphRef.current._tick();
    // Todo: create node at (elementX, elementY)
  }
  const runUserCode = () => {
    eval(codeVal)
    setG(G.copy())
  };

  const d3Graph = useMemo(() => G.toD3(), [G]);

  const graphRef = useRef(null);
  return (
    <div className={"w-screen h-screen flex flex-col justify-center"}>
      <div>Available functions: {Object.getOwnPropertyNames(Object.getPrototypeOf(G)).join(', ')}</div>
      <div className={"flex items-center justify-center lg:flex-row flex-col"}>
        <div className={" bg-white m-4 graph-con flex shadow-lg min-content"}>
          <Graph
            ref={graphRef}
            id="graph-id" // id is mandatory
            data={d3Graph}
            config={d3config}
            onClickNode={onClickNode}
            onClickLink={onClickLink}
            onClickGraph={onClickGraph}
          />
        </div>
        <div className="code-con">
          <AceEditor
            className={"shadow-lg m-3"}
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
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 4,
            }} />
          <div className={"flex justify-end"}>
            <button onClick={runUserCode} className={"m-4 px-12 py-2 rounded-md bg-white transition shadow-md hover:shadow-sm active:shadow-none"}>Run</button>
          </div>
        </div>
      </div>


    </div>

  );
}

function printTest() {
  console.log("Test");
}

export default App