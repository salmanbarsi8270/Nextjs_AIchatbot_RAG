"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from 'react';
import Inputarea from '../component/Inputarea';
import Codeblock, { AttachmentPreview } from "../component/Codeblock";
import { useApp } from "@/context/AppContext";
import { processpdfFile } from "../upload/actions";
import { Loader } from "@/components/ai-elements/loader";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("nvidia/nemotron-nano-12b-v2-vl:free");
  const { messages, sendMessage, status, error, stop }: any = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<any>('');
  const { isDarkMode, clearChatSignal } = useApp();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [fileuploaing, setfileuploaing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to extract text from message
  const getMessageText = (m: any) => {
    let textContent = '';
    
    if (m.content) {
      if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (Array.isArray(m.content)) {
        textContent = m.content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
      }
    } else if (m.parts) {
      textContent = m.parts.map((part: any) => part.text).join('');
    }
    
    return textContent;
  };

  // Helper function to get attachments
  const getMessageAttachments = (m: any) => {
    return m.data?.attachments || m.attachments || [];
  };

  // Clear chat
  useEffect(() => {
    if (clearChatSignal) {
      stop();
      setInputMessage('');
      setSelectedFiles([]);
    }
  }, [clearChatSignal, stop]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    try {
      let finalContent: any = inputMessage;
      let attachments: any = [];

      // Process file attachments first
      if (selectedFiles.length > 0) {
        attachments = await Promise.all(
          selectedFiles.map(async (file) => {
            const imgId = crypto.randomUUID();

            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  imgId,
                  name: file.name,
                  contentType: file.type,
                  url: reader.result as string,
                });
              };
              reader.onerror = (error) => {
                console.error('Error reading file:', file.name, error);
                reject(error);
              };
              reader.readAsDataURL(file);
            });
          })
        );

        // If PDF uploaded → extract content BEFORE sending
        const hasPDF = selectedFiles.some(file => file.type === 'application/pdf');
        if (hasPDF) {
          setfileuploaing(true);

          const formData = new FormData();
          selectedFiles.forEach(file => formData.append("pdf", file));

          const result = await processpdfFile(formData);
          setfileuploaing(false);

          if (result.success) {
            finalContent = result.content; // Use extracted PDF content
            setSuccessMessage(result.message);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return; // Stop if PDF processing failed
          }
        }
      }

      const getFileType = (file: File) => {
          if (file.type === "application/pdf") return "pdf";
          if (file.type.startsWith("image/")) return "image";
          if (file.type.startsWith("video/")) return "video";
          
          if (
            file.type === "application/vnd.ms-excel" ||
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
            return "excel";

          if (
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          )
            return "word";

          return "unknown";
        };

      // Send message with the correct finalContent (either PDF content or user input)
      await sendMessage({
        content: finalContent || `About this ${getFileType(selectedFiles[0])}..`,
        data: {
          model: selectedModel,
          attachments: attachments
        },
      });

      // Clear inputs after successful send
      setInputMessage("");
      setSelectedFiles([]);

    } catch (err) {
      console.error("Error sending message:", err);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className={`flex flex-col h-[calc(100vh-4.5rem)] transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-linear-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 w-full items-center mx-auto">

        {/* Error Notification */}
        {showError && (
          <div className="w-full flex flex-row justify-center">
            <div className="fixed top-22 z-50 animate-fade-in bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error?.message || 'An error occurred'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {showSuccess && (
          <div className="w-full flex flex-row justify-center">
            <div className="fixed top-22 z-50 animate-fade-in bg-green-500/20 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage || "Upload successful"}</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message: any) => (
          <div key={message.id} className={`flex items-start space-x-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shadow-md transition-transform hover:scale-110 ${message.role === 'user' ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white' : 'bg-linear-to-r from-purple-500 to-pink-500 text-white'}`}>
              {message.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Content */}
            <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-5 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${message.role === 'user' ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none' : isDarkMode ? 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                
                {/* Display attachments */}
                {getMessageAttachments(message).map((att: any) => (
                  <AttachmentPreview 
                    key={att.imgId} 
                    attachments={[att]} 
                    isUser={message.role === 'user'} 
                    isDarkMode={isDarkMode} 
                  />
                ))}
                
                <Codeblock text={getMessageText(message)} isDarkMode={isDarkMode} />
                
                {(status === 'streaming' && message.role === 'assistant' && message.id === messages[messages.length - 1]?.id) && <Loader />}
              </div>
              <div className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} ${message.role === 'user' ? 'text-right' : ''}`}>
                {formatTime(new Date(message.createdAt || Date.now()))}
              </div>
            </div>
          </div>
        ))}

        {fileuploaing && (
          <p className={`leading-6 text-sm whitespace-pre-wrap font-mono text-right ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            <Loader /> File Uploading...
          </p>
        )}
        
        {/* Loading Indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
              🤖
            </div>
            <div className={`rounded-2xl rounded-bl-none px-5 py-4 shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex space-x-1.5">
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] px-4">
            <div className="relative mb-8">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'bg-linear-to-br from-blue-600 to-purple-700 shadow-blue-500/20' : 'bg-linear-to-br from-blue-500 to-purple-600 shadow-blue-500/30'}`}>
                <div className="text-3xl">🤖</div>
              </div>
              <div className={`absolute inset-0 rounded-2xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-400/20'} animate-ping`}></div>
            </div>

            <div className="text-center mb-12">
              <h1 className={`text-4xl font-bold mb-4 bg-linear-to-r ${isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>RAG Search Assistant</h1>
              <p className={`text-lg max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Search through your documents using RAG (Retrieval Augmented Generation)</p>
            </div>

            <div className="fixed top-1/4 left-1/4 opacity-10">
              <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} animate-bounce`}></div>
            </div>
            <div className="fixed bottom-1/3 right-1/4 opacity-10">
              <div className={`w-6 h-6 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-500'} animate-bounce`} style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}  
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Inputarea 
        isDarkMode={isDarkMode} 
        setInputMessage={setInputMessage} 
        inputMessage={inputMessage} 
        selectedFiles={selectedFiles} 
        setSelectedFiles={setSelectedFiles}
        handleKeyPress={handleKeyPress} 
        handleSendMessage={handleSendMessage} 
        status={status} 
        stop={stop}  
        isLoading={isLoading} 
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        fileuploaing={fileuploaing}
      />
    </div>
  );
}