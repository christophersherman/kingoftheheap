import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditorWithToggleablePanel = () => {
  const [code, setCode] = useState("// Write your C++ code here...");
  const [output, setOutput] = useState("");
  const [vimMode, setVimMode] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [hasRunCode, setHasRunCode] = useState(false);
  const [viewOutput, setViewOutput] = useState(false); // Toggle between output and settings

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

    setHasRunCode(true); // Allow toggling to output after running code
    setViewOutput(true); // Automatically switch to view output after running code
  };

  const handleVimModeToggle = () => {
    setVimMode(!vimMode);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '10px' }}>
        <Editor
          height="100%"
          language="cpp"
          theme={theme}
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
          <button onClick={handleRunCode} style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
            Submit Code
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px', backgroundColor: '#f5f5f5', borderLeft: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>{viewOutput ? "Output" : "Settings"}</h3>
          {hasRunCode && (
            <button onClick={() => setViewOutput(!viewOutput)} style={{ padding: '5px 10px' }}>
              {viewOutput ? "View Settings" : "View Output"}
            </button>
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          {viewOutput ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '10px', backgroundColor: '#fff', height: '90%', overflowY: 'auto', borderRadius: '5px' }}>
              {output || 'Your output will appear here after running the code.'}
            </pre>
          ) : (
            <div className="Options">
              <button onClick={handleVimModeToggle} style={{ display: 'block', marginBottom: '10px' }}>
                {vimMode ? "Disable" : "Enable"} Vim Mode
              </button>
              <button onClick={handleThemeToggle} style={{ display: 'block' }}>
                Switch to {theme === "vs-dark" ? "Light" : "Dark"} Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorWithToggleablePanel;