import React, { forwardRef } from "react";
import Editor from "@monaco-editor/react";

const MonacoEditorComponent = forwardRef(({ code, setCode, language }, ref) => (
  <Editor
    ref={ref}
    height="300px"
    language={language}
    value={code}
    onChange={(value) => setCode(value)}
    options={{
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: "line",
      automaticLayout: true,
      minimap: { enabled: false },
    }}
  />
));

export default MonacoEditorComponent;
