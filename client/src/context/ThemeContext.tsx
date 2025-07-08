import { createContext, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

type Mode = "light" | "dark";

const ThemeContext = createContext<{ toggle: () => void }>({ toggle: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("light");

  const toggle = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }
            : {}),
        },
        typography: {
          fontFamily: `"Poppins", "Roboto", "Helvetica", "Arial", sans-serif`,
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
