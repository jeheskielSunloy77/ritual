import React, { memo } from "react";
import { View } from "react-native";

import { SurfaceColors } from "@/constants/surfaces";
import type {
  NeumorphicProps,
  NeumorphicVariant,
} from "./neumorphic.types";

const boxShadows: Record<NeumorphicVariant, string> = {
  extruded: "10px 10px 20px #e6e2dd, -10px -10px 20px #ffffff",
  inset: "inset 4px 4px 8px #e6e2dd, inset -4px -4px 8px #ffffff",
  "inset-deep":
    "inset 8px 8px 16px #e6e2dd, inset -8px -8px 16px #ffffff",
  "button-extruded":
    "5px 5px 10px #e6e2dd, -5px -5px 10px #ffffff",
  "button-inset":
    "inset 3px 3px 6px #e6e2dd, inset -3px -3px 6px #ffffff",
  floating: "0 7px 14px rgba(29, 27, 25, 0.24), -3px -3px 8px #ffffff",
  sheet: "0 -6px 18px rgba(29, 27, 25, 0.24), 0 2px 8px #ffffff",
};

const insetFills: Partial<Record<NeumorphicVariant, string>> = {
  inset: SurfaceColors.inset,
  "button-inset": SurfaceColors.inset,
  "inset-deep": SurfaceColors.insetDeep,
};

export const Neumorphic = memo(function Neumorphic({
  children,
  variant = "extruded",
  style,
  borderRadius = 16,
  backgroundColor,
}: NeumorphicProps) {
  return (
    <View
      style={[
        {
          borderRadius,
          backgroundColor:
            backgroundColor ?? insetFills[variant] ?? SurfaceColors.surface,
          boxShadow: boxShadows[variant],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});
