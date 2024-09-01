import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { initVimMode } from "monaco-vim";
import * as monaco from 'monaco-editor';  // Import monaco
import Latex from "react-latex-next";
import Crown from "./components/Crown";
import Timer from "./components/Timer";
import Navbar from "./components/Navbar";
import HallOfFame from "./pages/HallOfFame";
import AboutPage from "./pages/AboutPage";
import "katex/dist/katex.min.css";
import "./App.css";

function App() {
  const [code, setCode] = useState("// Write your C++ code here...");
  const [lintErrors, setLintErrors] = useState([]);
  const [vimMode, setVimMode] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [isFlipped, setIsFlipped] = useState(false);
  const [output, setOutput] = useState("");
  const [hasRunCode, setHasRunCode] = useState(false);
  const [viewOutput, setViewOutput] = useState(false);
  const editorRef = useRef(null);
  const vimModeRef = useRef(null);

  const defaultProblem = `
  You are given an array of integers, and your task is to find the sum of the largest contiguous subarray.
  `;

  const endTime = new Date().setHours(24, 0, 0, 0); // Set end time to midnight
  const [currentKing, setCurrentKing] = useState({
    name: "Loading...",
  });
  const [dailyProblem, setDailyProblem] = useState(defaultProblem);
  const [defaultCode, setDefaultCode] = useState("// Write your C++ code here...");

  useEffect(() => {
    // Fetch the daily problem and default code from the backend
    fetch("http://localhost:5000/api/daily-problem")
      .then((response) => response.json())
      .then((data) => {
        setDailyProblem(data.problem);
        setDefaultCode(data.defaultCode);
      })
      .catch((error) => {
        console.error("Error fetching daily problem:", error);
        setDailyProblem(defaultProblem);
        setDefaultCode("// Write your C++ code here...");
      });
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleVimModeToggle = () => {
    setVimMode(!vimMode);
  };

  useEffect(() => {
    if (vimMode && editorRef.current) {
      vimModeRef.current = initVimMode(editorRef.current, document.getElementById('statusbar'));
    } else if (vimModeRef.current) {
      vimModeRef.current.dispose();
    }
  }, [vimMode]);

  const handleThemeToggle = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  const handleRun = () => {
    console.log('Sending request:', { 
      url: 'http://localhost:5000/api/run-code', 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    fetch('http://localhost:5000/api/run-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),  // Send the code to the backend
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
      console.log(data);  // Log the data to verify the response structure
      setOutput(data.stdout || 'No output');  // Set the output state with the stdout value
      setHasRunCode(true);
      setViewOutput(true);  // Automatically switch to view output after running code
    })
    .catch(error => {
      console.error('Error running code:', error);
      setOutput('Error running code');
      setHasRunCode(true);
      setViewOutput(true);
    });
  };

  const handleSubmit = () => {
    fetch('http://localhost:5000/api/submit-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    .then(response => response.json())
    .then(data => {
      const combinedOutput = `Output: ${data.stdout || 'No output'}\nRuntime: ${data.execution_time || 'Unknown runtime'}\nMemory: ${data.memory_used || 'Unknown memory usage'}`;
      setOutput(combinedOutput);
      setHasRunCode(true);
      setViewOutput(true);
    })
    .catch(error => {
      console.error('Error submitting code:', error);
      setOutput('Error submitting code');
      setHasRunCode(true);
      setViewOutput(true);
    });
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Initialize Vim mode if enabled
    if (vimMode) {
      vimModeRef.current = initVimMode(editorRef.current, document.getElementById('statusbar'));
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={false} />
        <main className="Content">
          <div className="TopSection">
            <div className="KingDisplay">
              <Crown />
              <h1>{currentKing.name}</h1>
            </div>
            <Timer endTime={endTime} />
            <div className="Blurb">
              <div className="DailyProblem">
                <h3>Daily Problem</h3>
                <Latex>{dailyProblem}</Latex>
                <button className="FlipButton" onClick={toggleFlip}>
                  ?
                </button>
                {isFlipped && (
                  <div className="AdditionalDetails">
                    <p>
                      Here you can provide additional details on the daily problem for users that need it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="MainContent">
            <section className="EditorColumn">
              <div className="EditorContainer">
                <Editor
                  height="400px"
                  defaultLanguage="cpp"
                  value={defaultCode}
                  onChange={handleEditorChange}
                  theme={theme}
                  onMount={handleEditorDidMount}
                  options={{
                    tabSize: 4,
                    automaticLayout: true,
                  }}
                />
                <div id="statusbar" style={{ height: "20px", backgroundColor: "#333", color: "#fff", padding: "5px" }}></div>
                <div className="ButtonContainer">
                  <button className="runButton" onClick={handleRun} style={{ marginRight: '10px' }}>
                    Run Code
                  </button>
                  <button className="SubmitButton" onClick={handleSubmit}>
                    Submit Code
                  </button>
                </div>
              </div>
            </section>
            <section className="SettingsColumn">
              <div className="Sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>{viewOutput ? "Output" : "Options"}</h3>
                  {hasRunCode && (
                    <button onClick={() => setViewOutput(!viewOutput)} style={{ padding: '5px 10px' }}>
                      {viewOutput ? "View Options" : "View Output"}
                    </button>
                  )}
                </div>
                <div className="Options" style={{ marginTop: '10px' }}>
                  {viewOutput ? (
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', padding: '10px', backgroundColor: '#fff', height: '90%', overflowY: 'auto', borderRadius: '5px' }}>
                      {output || 'Your output will appear here after running the code.'}
                    </pre>
                  ) : (
                    <>
                      <button onClick={handleVimModeToggle} style={{ display: 'block', marginBottom: '10px' }}>
                        {vimMode ? "Disable" : "Enable"} Vim Mode
                      </button>
                      <button onClick={handleThemeToggle} style={{ display: 'block' }}>
                        Switch to {theme === "vs-dark" ? "Light" : "Dark"} Mode
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
          <section className="About">
            <p>
              King of the Heap is a daily coding challenge website where users can test their skills and compete for the top spot!
            </p>
          </section>
        </main>
        <footer className="Footer">
          <p>&copy; 2024 King of the Heap</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;