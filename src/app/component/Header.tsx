import { Moon, Sparkles, Sun, Trash2 } from 'lucide-react'
import React from 'react'
import { SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut,} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const Header = ({isDarkMode, setIsDarkMode, handleClearChat}:any) => {
  return (
    <div className={`border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-linear-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              AI Assistant
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Online
              </span>
            </div>
          </div>
        </div>

        
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`} title="Toggle theme">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={handleClearChat} className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700' }`} title="Clear chat">
            <Trash2 className="w-5 h-5" />
          </button>
        <div className="flex gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant={isDarkMode ? "secondary" : "ghost"} className="px-4">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="px-4 bg-gray-800">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <SignOutButton>
              <Button variant={isDarkMode ? "secondary" : "outline"} className="px-4 hover:bg-gray-500">Sign Out</Button>
            </SignOutButton>
          </SignedIn>
        </div>
        </div>
      </div>
  )
}

export default Header
