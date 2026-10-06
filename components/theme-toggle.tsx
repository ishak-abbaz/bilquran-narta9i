"use client";

import {
  Moon,
  Sun,
} from "lucide-react";
import {
  useTheme,
} from "next-themes";

import {
  Button,
} from "@/components/ui/button";

export default function ThemeToggle() {
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  function toggleTheme() {
    setTheme(
      resolvedTheme ===
        "dark"
        ? "light"
        : "dark",
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={
        toggleTheme
      }
      aria-label="تبديل المظهر"
    >
      <Sun
        className="hidden size-4 dark:block"
        aria-hidden="true"
      />

      <Moon
        className="size-4 dark:hidden"
        aria-hidden="true"
      />
    </Button>
  );
}