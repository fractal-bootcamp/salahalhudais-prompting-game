"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="theme-toggle relative h-10 w-10 border-2 transition-all duration-300 hover:scale-110"
        >
          <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] rounded-md p-1">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
        >
          <Sun className="h-4 w-4 text-yellow-500" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
        >
          <Moon className="h-4 w-4 text-blue-400" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
        >
          <span className="h-4 w-4 flex items-center justify-center">💻</span>
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
