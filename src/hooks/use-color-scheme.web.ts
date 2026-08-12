import type { ColorSchemeName } from 'react-native';

/**
 * Ritual currently ships the light theme only. Keep this platform hook as the
 * future extension point for re-enabling system theme detection.
 */
export function useColorScheme(): ColorSchemeName {
  return "light";
}
