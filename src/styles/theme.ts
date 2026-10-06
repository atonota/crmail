import { createTheme } from "@mantine/core";
import { brandPalette } from "./tokens";
export const theme = createTheme({
  primaryColor: "atonota",
  colors: { atonota: [...brandPalette] },
  fontFamily: "var(--font)",
  primaryShade: 7,
  defaultRadius: "sm",
  radius: { sm: "var(--radius-control)" },
  fontSizes: {
    xs: "var(--font-small)",
    sm: "var(--font-control)",
    md: "var(--font-body)",
    lg: "var(--font-lead)",
    xl: "var(--font-modal-title)",
  },
  spacing: {
    xs: "var(--space-xs)",
    sm: "var(--space-sm)",
    md: "var(--space-md)",
    lg: "var(--space-lg)",
    xl: "var(--space-xl)",
  },
});
