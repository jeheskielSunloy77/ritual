import React, { memo, useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import {
  Box,
  BoxShadow,
  Canvas,
  rect,
  rrect,
} from "@shopify/react-native-skia";

import {
  SurfaceColors,
  SurfacePresets,
} from "@/constants/surfaces";
import type { NeumorphicProps } from "./neumorphic.types";

interface SurfaceSize {
  width: number;
  height: number;
}

export const Neumorphic = memo(function Neumorphic({
  children,
  variant = "extruded",
  style,
  borderRadius = 16,
  backgroundColor,
}: NeumorphicProps) {
  const [size, setSize] = useState<SurfaceSize>({ width: 0, height: 0 });
  const preset = SurfacePresets[variant];
  const flattenedStyle = useMemo(
    () => StyleSheet.flatten(style) ?? {},
    [style],
  );
  const styleBackground =
    typeof flattenedStyle.backgroundColor === "string"
      ? flattenedStyle.backgroundColor
      : undefined;
  const fill =
    backgroundColor ??
    styleBackground ??
    preset.fill ??
    SurfaceColors.surface;

  const containerStyle = useMemo<ViewStyle>(() => {
    const nextStyle = { ...flattenedStyle };
    delete nextStyle.backgroundColor;
    delete nextStyle.shadowColor;
    delete nextStyle.shadowOffset;
    delete nextStyle.shadowOpacity;
    delete nextStyle.shadowRadius;
    delete nextStyle.elevation;

    return {
      ...nextStyle,
      backgroundColor: fill,
      borderRadius: nextStyle.borderRadius ?? borderRadius,
      position: nextStyle.position ?? "relative",
    };
  }, [borderRadius, fill, flattenedStyle]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const bleed = preset.bleed;
  const hasSize = size.width > 0 && size.height > 0;
  const box = useMemo(
    () =>
      rrect(
        rect(bleed, bleed, size.width, size.height),
        borderRadius,
        borderRadius,
      ),
    [bleed, borderRadius, size.height, size.width],
  );

  return (
    <View pointerEvents="box-none" onLayout={onLayout} style={containerStyle}>
      {hasSize && (
        <Canvas
          pointerEvents="none"
          style={[
            styles.canvas,
            {
              left: -bleed,
              top: -bleed,
              width: size.width + bleed * 2,
              height: size.height + bleed * 2,
            },
          ]}
        >
          <Box box={box} color={fill}>
            {preset.shadows.map((shadow, index) => (
              <BoxShadow key={index} {...shadow} />
            ))}
          </Box>
        </Canvas>
      )}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
