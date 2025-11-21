"use client";

import { Moon, Sun, Trash2, Sparkles } from "lucide-react";
import { SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut,} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const Navigation = () => {
  const { isDarkMode, setIsDarkMode, handleClearChat } = useApp();

  return (
    <div className={`border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm transition-colors duration-300 ${isDarkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/80 border-gray-200" }`}>
      <Link href="/">
      <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-11 h-11 bg-linear-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

        <h2 className={`${isDarkMode ? "text-white" : "text-gray-800"} text-lg font-bold`}>
          AI Assistant
        </h2>
      </div>
        </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg ${
            isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-100 text-gray-700"
          }`}
        >
          {isDarkMode ? <Sun /> : <Moon />}
        </button>

        <button
          onClick={handleClearChat}
          className={`p-2 rounded-lg ${
            isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
          }`}
        >
          <Trash2 />
        </button>

        <div className="flex items-center gap-2">
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
  );
};

export default Navigation;
