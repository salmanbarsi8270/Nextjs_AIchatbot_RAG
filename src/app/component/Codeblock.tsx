"use client";

import React, { useState } from "react";
import { ClipboardCopy, Check, ClipboardCheck } from "lucide-react";

// =======================================
// PRISMLIGHT IMPORT (IMPORTANT)
// =======================================
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

// Themes
import oneDark from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/cjs/styles/prism/one-light";

// Languages
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";

// Register languages (NOW works with PrismLight)
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("bash", bash);

// Auto-detect language
const detectLanguage = (code: string) => {
  if (/class |def |import /.test(code)) return "python";
  if (/const |let |function |=>/.test(code)) return "javascript";
  if (/<.*?>/.test(code)) return "jsx";
  return "bash"; // fallback
};

const Codeblock = ({ text, isDarkMode = true }: any) => {
  if (!text || typeof text !== "string") return null;

  // Split text into code + inline code + normal text
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (!part) return null;

        // =============================
        // MULTILINE CODEBLOCK ``` ```
        // =============================
        if (part.startsWith("```")) {
          const code = part
            .replace(/```[\w]*/, "")
            .replace(/```$/, "")
            .trim();

          return (
            <CopyableCode key={index} code={code} isDarkMode={isDarkMode} />
          );
        }

        // =============================
        // INLINE CODE `example`
        // =============================
        if (part.startsWith("`") && part.endsWith("`")) {
          const code = part.slice(1, -1);
          return (
            <code key={index} className={`px-2 py-1 rounded font-mono text-sm ${ isDarkMode ? "bg-gray-800 text-yellow-300" : "bg-gray-200 text-yellow-700"}`} >
              {code}
            </code>
          );
        }

        // =============================
        // NORMAL TEXT
        // =============================
        return (
          <p key={index} className={`leading-6 text-sm text-left whitespace-pre-wrap font-mono ${ isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            {part}
          </p>
        );
      })}
    </div>
  );
};

export default Codeblock;

// =======================================
// COPYABLE CODE BLOCK COMPONENT
// =======================================

const CopyableCode = ({ code, isDarkMode }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const lang = detectLanguage(code);

  return (
    <div className="relative">
      {/* Copy Button */}
      <button onClick={handleCopy} className={`absolute top-2 right-3 p-1 rounded-md transition ${ isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <ClipboardCopy className="w-4 h-4" />
        )}
      </button>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter language={lang} style={isDarkMode ? oneDark : oneLight} wrapLines={true} showLineNumbers={true}
        customStyle={{
          borderRadius: "12px",
          padding: "16px",
          fontSize: "14px",
          marginTop: "40px",
        }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};


// helpers/fileHelpers.ts

interface Attachment {
  url: string;
  name: string;
  contentType: string;
}

interface Props {
  attachments: Attachment[];
  isUser: boolean;
  isDarkMode: boolean;
}

export function AttachmentPreview({ attachments, isUser, isDarkMode }: Props) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      {attachments.map((attachment, idx) => (
        <div key={idx}>
          {attachment.contentType?.startsWith("image/") ? (
            <div className="relative group">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-sm max-h-64 rounded-lg object-cover cursor-pointer transition-transform hover:scale-[1.02]"
              />

              <div
                className={`absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-md text-xs backdrop-blur-sm 
                  ${isUser ? "bg-white/20 text-white" : "bg-black/40 text-white"} 
                  opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <span className="truncate block">{attachment.name}</span>
              </div>
            </div>
          ) : (
            <a
              href={attachment.url}
              download={attachment.name}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all hover:scale-[1.02] 
                ${
                  isUser
                    ? "bg-white/20 hover:bg-white/30"
                    : isDarkMode
                    ? "bg-gray-700/50 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center 
                  ${isUser ? "bg-white/30" : isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}
              >
                {attachment.contentType?.includes("pdf") ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                    <text x="6" y="13" fontSize="6" fontWeight="bold">
                      PDF
                    </text>
                  </svg>
                ) : attachment.contentType?.includes("video") ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : attachment.contentType?.includes("audio") ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p
                  className={`text-xs ${
                    isUser ? "text-white/70" : isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {attachment.contentType?.split("/")[1]?.toUpperCase() || "FILE"}
                </p>
              </div>

              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707
                  V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
