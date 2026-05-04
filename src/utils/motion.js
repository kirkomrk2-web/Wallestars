// Shared Framer Motion presets for common animation patterns used across the
// app. Keep this module small and focused on patterns that already repeat in
// several places.

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

// Spring used for the active-tab pill indicator (matches Sidebar's existing
// transition so all tab selectors feel the same).
export const tabSpring = { type: 'spring', bounce: 0.2, duration: 0.6 };

// Standard interactive button feedback used throughout the app.
export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};
