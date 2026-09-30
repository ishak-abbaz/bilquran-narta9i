"use client";

import { useEffect } from "react";

import { useTheme } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};


export function ThemeProvider({
  children,
}: ThemeProviderProps) {

  const {
    theme,
    systemTheme,
  } = useTheme();


  useEffect(() => {
    const root =
      document.documentElement;

    const currentTheme =
      theme === "system"
        ? systemTheme
        : theme;


    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

  }, [theme, systemTheme]);


  return children;
}