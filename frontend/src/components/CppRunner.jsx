// src/components/CppRunner.js
import { useEffect } from "react";

const CppRunner = ({ code, setOutput }) => {
  useEffect(() => {
    const runCpp = async () => {
      // Add logic to compile and run C++ code using WebAssembly
      // For now, just set a placeholder output
      setOutput("C++ execution is not yet implemented.");
    };
    runCpp();
  }, [code, setOutput]);

  return null;
};

export default CppRunner;
