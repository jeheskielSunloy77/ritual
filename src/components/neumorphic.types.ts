import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type NeumorphicVariant =
  | "extruded"
  | "inset"
  | "button-extruded"
  | "button-inset"
  | "inset-deep"
  | "floating"
  | "sheet";

export interface NeumorphicProps {
  children?: React.ReactNode;
  variant?: NeumorphicVariant;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  backgroundColor?: string;
}
