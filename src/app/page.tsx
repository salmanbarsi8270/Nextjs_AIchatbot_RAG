"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function HomePage() {
  const { isDarkMode } = useApp();
  const [isloading, setisloading] = useState(false)
  const router = useRouter();

  function handleNavigation (){
      setisloading(true)
    try {
      router.push("/chat")
    } catch (error) {
      console.error("Navigation error", error)
    }
    finally{
      setisloading(false)
    }
  }

  return (
    <div className={`min-h-[92vh] flex flex-col items-center justify-center px-6 py-20 transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"}`}>
      {/* Animated BG circles */}
      <div className="flex flex-col items-center justify-center h-[50vh] px-4">
                <div className="relative mb-8">
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'bg-linear-to-br from-blue-600 to-purple-700 shadow-blue-500/20' : 'bg-linear-to-br from-blue-500 to-purple-600 shadow-blue-500/30'}`}>
                        <div className="text-3xl">🤖</div>
                    </div>
                    <div className={`absolute inset-0 rounded-2xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-400/20'} animate-ping`}></div>
                </div>

                <div className="text-center mb-12">
                    <h1 className={`text-4xl font-bold mb-4 bg-linear-to-r ${isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>Welcome to AI Assistant</h1>
                    <p className={`text-lg max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your intelligent companion for answers, ideas, and creative solutions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full mb-12">
                
                    <div className={`p-6 rounded-2xl select-none border backdrop-blur-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' : 'bg-white/50 border-gray-200 hover:border-blue-400'}`}>
                        <div className="text-2xl mb-3">💡</div>
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Brainstorm Ideas </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get creative suggestions and innovative solutions for your projects</p>
                    </div>

                    <div className={`p-6 rounded-2xl select-none border backdrop-blur-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500' : 'bg-white/50 border-gray-200 hover:border-purple-400'}`}>
                        <div className="text-2xl mb-3">📝</div>
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Write & Edit</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Craft compelling content, refine your writing, and improve your text</p>
                    </div>

                    <div className={`p-6 rounded-2xl select-none border backdrop-blur-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' : 'bg-white/50 border-gray-200 hover:border-green-400'}`}>
                        <div className="text-2xl mb-3">🔍</div>
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Learn & Explore</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get detailed explanations and explore complex topics with ease</p>
                    </div>
                </div>

                <div className="fixed top-1/4 left-1/4 opacity-10">
                    <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} animate-bounce`}></div>
                </div>
                <div className="fixed bottom-1/3 right-1/4 opacity-10">
                    <div className={`w-6 h-6 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-500'} animate-bounce`} style={{ animationDelay: '0.5s' }}></div>
                </div>
            </div>

      {/* CTA Button */}
        <button onClick={handleNavigation} disabled={isloading} className={`px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all ${isDarkMode ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-500/40" : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-purple-500/50"} hover:scale-105`} >
          {isloading?"Starting...":"Start Chatting 🚀"}
        </button>
    </div>
  );
}
