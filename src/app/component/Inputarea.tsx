import { Paperclip, Send, StopCircle, X } from 'lucide-react';
import React, { useRef, useState } from 'react'
import TextareaAutosize from "react-textarea-autosize";

type QuickActionType = 'ideas' | 'summarize' | 'explain';

const Inputarea = ({ isDarkMode, setInputMessage, inputMessage, handleKeyPress, handleSendMessage, status, isLoading, stop, setSelectedFiles, selectedFiles}: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickAction = (action: QuickActionType) => {
    const quickMessages: Record<QuickActionType, string> = {
      ideas: "Can you suggest some creative ideas for my project?",
      summarize: "Please summarize the key points from our conversation.",
      explain: "Can you explain how this AI assistant works?"
    };
    
    setInputMessage(quickMessages[action]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev:any) => [...prev, ...newFiles]);
    }
    // Reset input to allow selecting same file again
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'application':
        if (file.type.includes('pdf')) return '📄';
        if (file.type.includes('word') || file.type.includes('document')) return '📝';
        if (file.type.includes('sheet') || file.type.includes('excel')) return '📊';
        return '📎';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`border-t px-4 py-4 backdrop-blur-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
      
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file: File, index: number) => (
              <div key={index} className={`flex items-center px-3 py-2 rounded-lg border ${isDarkMode ? "bg-gray-600 border-gray-500 text-gray-200" : "bg-white border-gray-300 text-gray-700"}`}>
                {isLoading ? (<div className="loader-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />):(<span>{getFileIcon(file)}</span>)}
                <div className="flex flex-col ml-2">
                  <span className="text-xs font-medium truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                </div>
                <button className="ml-2 p-1 rounded hover:bg-red-500/30" onClick={() => handleRemoveFile(index)}>
                  <X size={15} color='red' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => handleQuickAction('ideas')} className={`px-4 py-2 text-xs font-medium rounded-full transition-all hover:scale-105 shadow-sm ${ isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' : 'bg-linear-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-gray-700 border border-gray-300'}`} >
          💡 Suggest ideas
        </button>
        <button onClick={() => handleQuickAction('summarize')} className={`px-4 py-2 text-xs font-medium rounded-full transition-all hover:scale-105 shadow-sm ${ isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'  : 'bg-linear-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-gray-700 border border-gray-300' }`} >
          📝 Summarize
        </button>
        <button onClick={() => handleQuickAction('explain')} className={`px-4 py-2 text-xs font-medium rounded-full transition-all hover:scale-105 shadow-sm ${ isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' : 'bg-linear-to-r from-pink-100 to-orange-100 hover:from-pink-200 hover:to-orange-200 text-gray-700 border border-gray-300'}`}>
          🔍 Explain
        </button>
      </div>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx" className="hidden" />

      {/* Input Area */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
            <TextareaAutosize value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyPress} placeholder="Type your message..." disabled={status === "submitted" || isLoading}
            minRows={1} maxRows={5}
                className={` w-full px-5 py-3 pr-12 resize-none rounded-2xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode 
                    ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'  : 'bg-white border border-gray-300 text-gray-800 placeholder-gray-500'}`}
            />

            <button type="button" onClick={handlePaperclipClick} className={` absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}>
                <Paperclip className="w-5 h-5" />
            </button>
        </div>
        {status === "streaming" || status === "submitted" ? (
            <button onClick={stop} className="w-14 h-14 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100" >
                <StopCircle className="w-5 h-5" />
            </button>
        ) : (
            <button onClick={handleSendMessage} disabled={status === "submitted" || isLoading} className="w-14 h-14 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100" >
                {isLoading ? (
                  <div className="loader-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
            </button>
        )}
      </div>
      
      {/* Footer Note */}
      <div className="text-center mt-3">
        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          AI assistant may produce inaccurate information
        </p>
      </div>
    </div>
  )
}

export default Inputarea