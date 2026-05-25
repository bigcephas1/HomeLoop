"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  type = "text",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={className}>
      {label && (
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={inputType}
          {...props}
          className="
            w-full
            px-4 py-4
            rounded-2xl
            border
            border-black/10
            dark:border-white/10
            bg-white
            dark:bg-white/5
            text-black
            dark:text-white
            placeholder:text-gray-400
            focus:outline-none
            focus:border-black/30
            dark:focus:border-white/30
            transition
            pr-12
          "
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-gray-500 dark:text-gray-400
              hover:text-black dark:hover:text-white
              transition
            "
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}