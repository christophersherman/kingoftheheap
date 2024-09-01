import { useEffect, useState } from "react";

const PythonRunner = ({
  code,
  setOutput,
  runCodeTrigger,
  resetRunCodeTrigger,
}) => {
  const [isPyodideReady, setIsPyodideReady] = useState(false);

  useEffect(() => {
    const loadPyodide = async () => {
      if (!window.pyodidePromise) {
        console.log("Loading Pyodide...");
        window.pyodidePromise = window
          .loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/",
          })
          .then((pyodide) => {
            window.pyodide = pyodide;
            console.log("Pyodide fully loaded");
            setIsPyodideReady(true);
          })
          .catch((error) => {
            console.error("Error loading Pyodide:", error);
          });
      } else {
        window.pyodidePromise.then(() => {
          setIsPyodideReady(true);
        });
      }
    };

    loadPyodide();
  }, []);

  useEffect(() => {
    const runPython = async () => {
      if (isPyodideReady && runCodeTrigger) {
        try {
          console.log("Executing Python code...");
          const pyodide = window.pyodide;
          pyodide.runPython(`
            import sys
            from io import StringIO

            class OutputCapture:
              def __init__(self):
                self._stdout = sys.stdout
                self._stderr = sys.stderr
                self._captured_stdout = StringIO()
                self._captured_stderr = StringIO()
                sys.stdout = self._captured_stdout
                sys.stderr = self._captured_stderr

              def get_output(self):
                sys.stdout = self._stdout
                sys.stderr = self._stderr
                return self._captured_stdout.getvalue() + self._captured_stderr.getvalue()

            output_capture = OutputCapture()
          `);
          await pyodide.runPythonAsync(code);
          const output = pyodide.runPython("output_capture.get_output()");
          console.log("Python code executed, result:", output);
          setOutput(output);
        } catch (error) {
          console.log("Error executing Python code:", error);
          setOutput(error.toString());
        } finally {
          resetRunCodeTrigger();
        }
      }
    };

    runPython();
  }, [isPyodideReady, runCodeTrigger, code, setOutput, resetRunCodeTrigger]);

  return null; // No need to return anything since we are setting the output directly
};

export default PythonRunner;
