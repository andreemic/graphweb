import logo from './logo.svg';
import './App.css';

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
function App() { 
  const onChange = console.log;
  return (
    <div className="App">
      <AceEditor
        mode="javascript"
        theme="github"
        onChange={onChange}
        name="graphcode"
        editorProps={{}}
      />
    </div>
  );
}

export default App;
