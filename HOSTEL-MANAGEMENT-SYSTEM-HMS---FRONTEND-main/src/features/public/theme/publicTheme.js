export const publicColors = Object.freeze({
  cream: '#F9F5EE',
  creamDark: '#F0EAD9',
  creamDeep: '#E4D9C4',
  bark: '#2C1F0E',
  barkLight: '#5C3D1E',
  mossDark: '#2A4420',
  moss: '#3B5E2B',
  mossLight: '#5A8048',
  sage: '#8AAF79',
  sagePale: '#C8DCBC',
  sageFaint: '#EAF3E1',
  sand: '#C9A96E',
  sandPale: '#EDD9A3',
  sandFaint: '#FAF2DC',
  terra: '#B5532A',
  terraFaint: '#F5E0D5',
  stone: '#7A7268',
  stoneLight: '#A8A099',
  stoneFaint: '#EDE8DE',
  white: '#FFFFFF',
  offWhite: '#FDFAF5',
  borderDefault: '#E8E2D6',
  borderHover: '#8AAF79',
});

export const publicFonts = Object.freeze({
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
});

export const publicTypography = Object.freeze({
  heroTitle: {
    fontFamily: publicFonts.display,
    fontSize: 'clamp(40px, 6.5vw, 76px)',
    lineHeight: '0.98',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  sectionTitle: {
    fontFamily: publicFonts.display,
    fontSize: 'clamp(26px, 4vw, 44px)',
    lineHeight: '1.08',
    fontWeight: 700,
  },
  cardTitle: {
    fontFamily: publicFonts.display,
    fontSize: '24px',
    lineHeight: '1.16',
    fontWeight: 700,
  },
  bodyLarge: {
    fontFamily: publicFonts.body,
    fontSize: 'clamp(15px, 2vw, 18px)',
    lineHeight: '1.75',
    fontWeight: 400,
  },
  bodyRegular: {
    fontFamily: publicFonts.body,
    fontSize: '14px',
    lineHeight: '1.65',
    fontWeight: 400,
  },
  caption: {
    fontFamily: publicFonts.body,
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  price: {
    fontFamily: publicFonts.body,
    fontSize: '20px',
    lineHeight: '1.25',
    fontWeight: 700,
  },
  label: {
    fontFamily: publicFonts.body,
    fontSize: '13px',
    lineHeight: '1.4',
    fontWeight: 700,
  },
});

export const publicSpacing = Object.freeze({
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
  section: '80px',
  containerMax: '1280px',
  containerPadding: '5%',
  navbarHeight: '68px',
  cardGridGap: '24px',
  cardMinWidth: '310px',
  heroTextMax: '680px',
  searchMax: '580px',
  ctaMax: '860px',
});

export const publicRadii = Object.freeze({
  sm: '8px',
  md: '12px',
  lg: '16px',
  card: '20px',
  modal: '24px',
  cta: '32px',
  pill: '30px',
  full: '9999px',
});

export const publicShadows = Object.freeze({
  search: '0 8px 40px rgba(44,31,14,0.13)',
  cardHover: '0 20px 44px rgba(44,31,14,0.13)',
  modal: '0 32px 80px rgba(44,31,14,0.28)',
  soft: '0 12px 30px rgba(44,31,14,0.08)',
});

export const publicTransitions = Object.freeze({
  fast: 'all 0.2s ease',
  base: 'all 0.3s ease',
  image: 'transform 0.5s ease',
  card: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
});

export const publicTheme = Object.freeze({
  colors: publicColors,
  fonts: publicFonts,
  typography: publicTypography,
  spacing: publicSpacing,
  radii: publicRadii,
  shadows: publicShadows,
  transitions: publicTransitions,
});

export default publicTheme;
