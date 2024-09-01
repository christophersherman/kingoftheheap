// src/components/RustRunner.js
import { useEffect } from "react";

const RustRunner = ({ code, setOutput }) => {
  useEffect(() => {
    const runRust = async () => {
      // Add logic to compile and run Rust code using WebAssembly
      // For now, just set a placeholder output
      setOutput("Rust execution is not yet implemented.");
    };
    runRust();
  }, [code, setOutput]);

  return null;
};

export default RustRunner;
