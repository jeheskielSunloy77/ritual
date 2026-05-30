import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';

interface NeumorphicProps {
  children?: React.ReactNode;
  variant?: 'extruded' | 'inset' | 'button-extruded' | 'button-inset' | 'inset-deep';
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  backgroundColor?: string;
}

export function Neumorphic({
  children,
  variant = 'extruded',
  style,
  borderRadius = 16,
  backgroundColor = '#fef8f3',
}: NeumorphicProps) {
  // Web specific box-shadows using inline style support
  if (Platform.OS === 'web') {
    let shadowStyle = {};
    if (variant === 'extruded') {
      shadowStyle = {
        boxShadow: '10px 10px 20px #e6e2dd, -10px -10px 20px #ffffff',
      };
    } else if (variant === 'inset') {
      shadowStyle = {
        boxShadow: 'inset 4px 4px 8px #e6e2dd, inset -4px -4px 8px #ffffff',
      };
    } else if (variant === 'inset-deep') {
      shadowStyle = {
        boxShadow: 'inset 8px 8px 16px #e6e2dd, inset -8px -8px 16px #ffffff',
      };
    } else if (variant === 'button-extruded') {
      shadowStyle = {
        boxShadow: '5px 5px 10px #e6e2dd, -5px -5px 10px #ffffff',
      };
    } else if (variant === 'button-inset') {
      shadowStyle = {
        boxShadow: 'inset 3px 3px 6px #e6e2dd, inset -3px -3px 6px #ffffff',
      };
    }

    return (
      <View
        style={[
          {
            borderRadius,
            backgroundColor,
          },
          shadowStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // iOS multi-shadow implementation using layered shadows
  if (Platform.OS === 'ios') {
    if (variant === 'extruded' || variant === 'button-extruded') {
      const isButton = variant === 'button-extruded';
      const offset = isButton ? 5 : 10;
      const radius = isButton ? 8 : 15;

      return (
        <View style={[{ borderRadius, position: 'relative' }, style]}>
          {/* Light Shadow (top-left) */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                backgroundColor,
                shadowColor: '#ffffff',
                shadowOffset: { width: -offset, height: -offset },
                shadowOpacity: 1,
                shadowRadius: radius,
              },
            ]}
          />
          {/* Dark Shadow (bottom-right) */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                backgroundColor,
                shadowColor: '#e6e2dd',
                shadowOffset: { width: offset, height: offset },
                shadowOpacity: 1,
                shadowRadius: radius,
              },
            ]}
          />
          {/* Content Layer */}
          <View style={{ borderRadius, backgroundColor, overflow: 'hidden' }}>
            {children}
          </View>
        </View>
      );
    }

    // iOS Inset / Sunken look (use slightly darker background and fine borders)
    const isDeep = variant === 'inset-deep';
    const insetBg = isDeep ? '#ece7e2' : '#f2ede8';
    return (
      <View
        style={[
          {
            borderRadius,
            backgroundColor: insetBg,
            borderWidth: 1.5,
            borderColor: '#e6e2dd',
            shadowColor: '#000000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android implementation (clean borders and elevations)
  if (variant === 'extruded' || variant === 'button-extruded') {
    const isButton = variant === 'button-extruded';
    return (
      <View
        style={[
          {
            borderRadius,
            backgroundColor,
            elevation: isButton ? 2 : 4,
            borderWidth: 1,
            borderColor: '#e6e2dd',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android Inset implementation (looks pressed in)
  const isDeep = variant === 'inset-deep';
  const insetBg = isDeep ? '#ece7e2' : '#f2ede8';
  return (
    <View
      style={[
        {
          borderRadius,
          backgroundColor: insetBg,
          borderWidth: 1.5,
          borderColor: '#ded9d4',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
