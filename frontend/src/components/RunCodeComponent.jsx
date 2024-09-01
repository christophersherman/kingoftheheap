// src/components/RunCodeComponent.jsx
import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const RunCodeComponent = () => {
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");

  const runCode = () => {
    try {
      // Using Function constructor to execute code
      const result = new Function(code)();
      setOutput(result);
    } catch (error) {
      setOutput(error.toString());
    }
  };

  return (
    <div className="run-code-component">
      <Editor
        height="50vh"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value)}
      />
      <button onClick={runCode} className="run-code-button">
        Run Code
      </button>
      <div className="output">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default RunCodeComponent;
