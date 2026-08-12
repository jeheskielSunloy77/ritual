import type { NeumorphicVariant } from "@/components/neumorphic.types";

export const SurfaceColors = {
  page: "#fef8f3",
  pageWarm: "#ffe4d6",
  surface: "#fef8f3",
  inset: "#f2ede8",
  insetDeep: "#ece7e2",
  highlight: "#ffffff",
  shadow: "#e6e2dd",
  shadowStrong: "#d8d1ca",
  overlayShadow: "rgba(29, 27, 25, 0.24)",
  accent: "#ff9f67",
  accentText: "#773402",
  text: "#54433a",
  textMuted: "#877369",
} as const;

export interface SurfaceShadow {
  dx: number;
  dy: number;
  blur: number;
  spread?: number;
  color: string;
  inner?: boolean;
}

export interface SurfacePreset {
  fill?: string;
  bleed: number;
  shadows: readonly SurfaceShadow[];
}

export const SurfacePresets: Record<NeumorphicVariant, SurfacePreset> = {
  extruded: {
    bleed: 30,
    shadows: [
      { dx: 10, dy: 10, blur: 20, color: SurfaceColors.shadow },
      { dx: -10, dy: -10, blur: 20, color: SurfaceColors.highlight },
    ],
  },
  "button-extruded": {
    bleed: 16,
    shadows: [
      { dx: 5, dy: 5, blur: 10, color: SurfaceColors.shadow },
      { dx: -5, dy: -5, blur: 10, color: SurfaceColors.highlight },
    ],
  },
  inset: {
    fill: SurfaceColors.inset,
    bleed: 0,
    shadows: [
      {
        dx: 4,
        dy: 4,
        blur: 8,
        color: SurfaceColors.shadowStrong,
        inner: true,
      },
      {
        dx: -4,
        dy: -4,
        blur: 8,
        color: SurfaceColors.highlight,
        inner: true,
      },
    ],
  },
  "button-inset": {
    fill: SurfaceColors.inset,
    bleed: 0,
    shadows: [
      {
        dx: 3,
        dy: 3,
        blur: 6,
        color: SurfaceColors.shadowStrong,
        inner: true,
      },
      {
        dx: -3,
        dy: -3,
        blur: 6,
        color: SurfaceColors.highlight,
        inner: true,
      },
    ],
  },
  "inset-deep": {
    fill: SurfaceColors.insetDeep,
    bleed: 0,
    shadows: [
      {
        dx: 8,
        dy: 8,
        blur: 16,
        color: SurfaceColors.shadowStrong,
        inner: true,
      },
      {
        dx: -8,
        dy: -8,
        blur: 16,
        color: SurfaceColors.highlight,
        inner: true,
      },
    ],
  },
  floating: {
    bleed: 24,
    shadows: [
      { dx: 0, dy: 7, blur: 14, color: SurfaceColors.overlayShadow },
      { dx: -3, dy: -3, blur: 8, color: SurfaceColors.highlight },
    ],
  },
  sheet: {
    bleed: 28,
    shadows: [
      { dx: 0, dy: -6, blur: 18, color: SurfaceColors.overlayShadow },
      { dx: 0, dy: 2, blur: 8, color: SurfaceColors.highlight },
    ],
  },
};
