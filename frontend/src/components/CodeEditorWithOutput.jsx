import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditorWithOutput = () => {
  const [code, setCode] = useState("// Write your C++ code here...");
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);

  const handleRunCode = async () => {
    // Mocking a code execution - replace this with the actual API call
    const result = await fetch('http://your-judge0-server-url/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-secret-api-key',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: 54, // Language ID for C++
        cpu_time_limit: 5, // 5 seconds timeout
      })
    });

    const data = await result.json();
    if (data.stdout) {
      setOutput(data.stdout);
    } else if (data.stderr) {
      setOutput(data.stderr);
    } else if (data.compile_output) {
      setOutput(data.compile_output);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '10px' }}>
        <Editor
          height="100%"
          language="cpp"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <button onClick={handleRunCode} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Run Code
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px', backgroundColor: '#f5f5f5', borderLeft: '1px solid #ddd' }}>
        <h3>Output:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '10px', backgroundColor: '#fff', height: '90%', overflowY: 'auto', borderRadius: '5px' }}>
          {output || 'Your output will appear here after running the code.'}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditorWithOutput;