import logo from './logo.svg';
import './App.css';
import React, { useState } from "react"
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
function App() {
  const [codeVal, setCodeVal] = useState(`function onLoad(editor) {
    console.log("i've loaded");
  }`);
  const onChange = (val, e) => setCodeVal(val)
  const runUserCode = () => {
    eval(codeVal)
    console.log(codeVal)
  };

  return (
    <div>
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