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

export function AttachmentPreview({ attachments, isUser, isDarkMode }: any) {
  const [openModal, setOpenModal] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<any>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleOpen = (att: any) => {
    setActiveAttachment(att);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setActiveAttachment(null);
  };

  return (
    <>
      <div className="mb-3 space-y-2">
        {attachments.map((attachment: any, idx: number) => (
          <div key={idx}>
            {attachment.contentType?.startsWith("image/") ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => handleOpen(attachment)}
              >
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-sm max-h-64 rounded-lg object-cover transition-transform hover:scale-[1.02]"
                />

                <div
                  className={`absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-md text-xs backdrop-blur-sm 
                    ${isUser ? "bg-white/20 text-white" : "bg-black/40 text-white"} 
                    opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <span className="truncate block">{attachment.name}</span>
                </div>
              </div>
            ) : attachment.contentType?.startsWith("video/") ? (
              <div
                className="relative group cursor-pointer"
                onClick={() => handleOpen(attachment)}
              >
                <video
                  src={attachment.url}
                  className="max-w-sm max-h-64 rounded-lg object-cover"
                />

                <div
                  className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <span className="text-white text-sm">Play Video</span>
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
                  📄
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
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ---------- MODAL VIEWER ---------- */}
      {openModal && activeAttachment && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-3xl font-bold"
              onClick={handleClose}
            >
              ×
            </button>

            {/* IMAGE VIEW */}
            {activeAttachment.contentType?.startsWith("image/") && (
              <img
                src={activeAttachment.url}
                alt={activeAttachment.name}
                className="rounded-xl max-h-[90vh] object-contain"
              />
            )}

            {/* VIDEO VIEW */}
            {activeAttachment.contentType?.startsWith("video/") && (
              <video
                controls
                autoPlay
                className="rounded-xl max-h-[90vh] object-contain"
              >
                <source src={activeAttachment.url} type={activeAttachment.contentType} />
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
}
