// components/ui/code-block.tsx
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock = ({ language, code }: CodeBlockProps) => {
  // Clean up indentation from template literal
  const cleanedCode = code
    .replace(/^\n/, "") // Remove initial newline
    .replace(/\n\s+$/, "\n") // Remove trailing spaces on last line
    .replace(/^\s+/gm, ""); // Remove common indentation

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
        }}
      >
        {cleanedCode}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
