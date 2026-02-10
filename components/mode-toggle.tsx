"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Membungkus perubahan tema dengan kelas 'theming' supaya smooth */
function startThemeTransition(apply: () => void, ms = 320) {
  const root = document.documentElement;
  root.classList.add("theming");
  // Eksekusi di frame berikut agar CSS menangkap perubahan
  requestAnimationFrame(() => {
    apply();
    window.setTimeout(() => root.classList.remove("theming"), ms);
  });
}

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const setWithTransition = (next: "light" | "dark" | "system") => {
    startThemeTransition(() => setTheme(next));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setWithTransition("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setWithTransition("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setWithTransition("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
