// "use client";

// import { useTheme } from "next-themes";
// import { Sun, Moon } from "lucide-react";
// import { useEffect, useState } from "react";

// export default function ThemeToggle() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   if (!mounted) return null;

//   return (
//     <button
//       onClick={() =>
//         setTheme(theme === "dark" ? "light" : "dark")
//       }
//       className="
//         p-2
//         rounded-xl
//         border
//         border-white/10
//         hover:bg-white/10
//         transition
//       "
//     >
//       {theme === "dark" ? (
//         <Sun size={18} />
//       ) : (
//         <Moon size={18} />
//       )}
//     </button>
//   );
// }



// "use client";

// import { useTheme } from "next-themes";
// import { Sun, Moon } from "lucide-react";
// import { useEffect, useState } from "react";

// export default function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   const isDark = resolvedTheme === "dark";

//   return (
//     <button
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       aria-label="Toggle theme"
//       className="
//         p-2
//         rounded-xl
//         border
//         border-white/10
//         hover:bg-white/10
//         transition
//       "
//     >
//       {isDark ? <Sun size={18} /> : <Moon size={18} />}
//     </button>
//   );
// }




"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Debug log to check current theme
    console.log("Current theme:", theme);
    console.log("Resolved theme:", resolvedTheme);
  }, [theme, resolvedTheme]);

  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Toggling to:", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-xl
        border border-black/10 dark:border-white/10
        hover:bg-black/5 dark:hover:bg-white/10
        transition
      "
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}