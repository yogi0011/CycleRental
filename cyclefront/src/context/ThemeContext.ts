import { createContext, useContext } from "react";
interface ThemeCtx { theme: string; setTheme: (t: string) => void; accentColor: string; setAccentColor: (c: string) => void; }
export const ThemeContext = createContext<ThemeCtx>({ theme:"light", setTheme:()=>{}, accentColor:"#e85d26", setAccentColor:()=>{} });
export const useTheme = () => useContext(ThemeContext);
