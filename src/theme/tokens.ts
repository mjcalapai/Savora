export const theme = {
  colors: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    text: '#172A35',
    muted: '#52636D',
    accent: '#17654D',
    onAccent: '#FFFFFF',
    border: '#DCE3E7',
    danger: '#A32A2A',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radii: { sm: 8, md: 16 },
  typography: {
    title: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
    heading: { fontSize: 21, lineHeight: 29, fontWeight: '600' },
    body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
    label: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  },
} as const;
