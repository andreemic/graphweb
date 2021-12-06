import logo from './logo.svg';
import './App.css';
import React, { useState, useMemo, useRef } from "react";
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

import Alert from "@mui/material/Alert";
import Button from '@mui/material/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FloatingButton from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@material-ui/icons/Delete';

console.log(ace)
// #autocompletion
// let langTools = ace.require('ace/ext/language_tools');
// langTools.addCompleter(customCompleter);

function App() {
  const [codeVal, setCodeVal] = useState('//Do magic here\n');
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorAnnotation, setErrorAnnotation] = useState([]);
  const [logOutput, setLogOutput] = useState('');
  const onChange = (val, e) => setCodeVal(val)
  const [G, setG] = useState(getDefaultGraph())

  let temporaryLogOutput = '';
  const log = (message='') => temporaryLogOutput += `${message}\n`;
  const clearLogs = () => setLogOutput('');

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

    let elementY = e.clientY - graphEl.clientTop;
    let elementX = e.clientX - graphEl.clientLeft;

    // Todo: create node at (elementX, elementY)
  }
  const runUserCode = () => {
    try {
      eval(codeVal);
      setErrorMessage(null);
    } catch (error) {
      console.log("error occured");
      setErrorMessage(error.message);
      /*setErrorAnnotation([{row: error.lineNumber, column: error.columnNumber, type: 'error', text: error.message}]);
      -- line and column numbers aren't supported on any browser except firefox
      */
    }
    setG(G.copy())
    setLogOutput(`${logOutput}${temporaryLogOutput}`);
    temporaryLogOutput = '';
  };

  const d3Graph = useMemo(() => G.toD3(), [G]);

  const graphRef = useRef(null);

  const bfsExample = `
function bfs(startNode=0) {
      var queue = [startNode];
      const v = G.V;
      while (queue.length > 0) {
          var current = queue.shift();
          v[current].visited = true;
          log('visiting node ' + current);
          for (let other = 0; other < v.length; other++) {
              if (!v[other].visited && G.getEdge(current, other)) {
                  queue.push(other);
              }
          }
      }
  }

bfs();`;

  const tree10nodes = `
    G.addNodes([4, 5, 6, 7, 8, 9]);
    G.addEdges([[5, 6], [7, 5], [1, 8], [9, 8], [2, 7], [1, 5], [3, 4], [4, 2]]);
    `;
  return (
    <div className={"w-screen h-screen flex flex-col justify-center"}>
      <div><p>Available functions: {Object.getOwnPropertyNames(Object.getPrototypeOf(G)).join(', ')}</p></div>
      <div><p>{`Use log(string) for debugging`}</p></div>
      <div>
        <Button
          variant='text'
          onClick={() => setCodeVal(bfsExample)}>
          Load BFS example
        </Button>
        <Button
          variant='text'
          onClick={() => setCodeVal(tree10nodes)}>
          Load tree with 10 nodes
        </Button>
      </div>
      <div className={"flex items-center lg:flex-row flex-col"}>
        <div className={" m-4 bg-white graph-con flex shadow-lg min-content"}>
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
          <Alert severity={errorMessage ? 'error' : 'success'}>{errorMessage || 'Compiled successfully'}</Alert>
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
            }}
            annotations={errorAnnotation}
          />
          <FloatingButton variant='extended' color='primary' onClick={runUserCode}>
            Run code
            <PlayArrowIcon/>
          </FloatingButton>
        </div>
        <div>
          <TextField
            variant='filled'
            disabled
            value={logOutput}
            onChange={() => {}}
            multiline
            fullWidth
            />
          <Button
            variant='contained'
            onClick={clearLogs}
            color='primary'
          >
            Clear logs
            <DeleteIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;