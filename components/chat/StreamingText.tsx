/**
 * StreamingText
 *
 * Renders streamed AI text so that each newly-arrived word fades in
 * from the left — giving a smooth ChatGPT-like "typewriter" feel.
 *
 * Strategy:
 *  • Split the full accumulated text into word tokens (preserving spaces).
 *  • Words up to `committedCount` are static (already animated in).
 *  • Words beyond that are new; each one mounts a tiny Reanimated fade+slide.
 *  • `committedCount` advances after each render so we never re-animate.
 */

import React, { useEffect, useRef } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// ─── Animated word token ──────────────────────────────────────────────────────

interface WordTokenProps {
  token: string;
  /** delay in ms before this word starts fading in */
  delay: number;
  textClass: string;
}

function WordToken({ token, delay, textClass }: WordTokenProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-6);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 180 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 180 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.Text style={[animStyle]} className={textClass}>
      {token}
    </Animated.Text>
  );
}

// ─── StreamingText ────────────────────────────────────────────────────────────

interface StreamingTextProps {
  /** The full accumulated text so far (grows as chunks arrive) */
  text: string;
  /** Whether the stream is still in progress */
  isStreaming: boolean;
  /** Text style forwarded to each word */
  textClass: string;
}

export function StreamingText({
  text,
  isStreaming,
  textClass,
}: StreamingTextProps) {
  // Split text so that spaces are kept as separate tokens between words.
  // e.g. "Hello world" → ["Hello", " ", "world"]
  const tokens = text.split(/(\s+)/);

  // Track how many tokens were already rendered in the previous pass.
  // Tokens below this index are rendered as plain Text (no animation overhead).
  const committedRef = useRef(0);

  // How many tokens existed on the *previous* render
  const prevCountRef = useRef(0);

  // Tokens that are freshly added this render cycle
  const newStartIndex = prevCountRef.current;

  // After rendering, advance committedRef so these tokens become "static"
  // on the next render pass.
  useEffect(() => {
    committedRef.current = tokens.length;
    prevCountRef.current = tokens.length;
  });

  // Pre-built static portion (already-animated tokens rendered as plain text)
  const staticText = tokens.slice(0, committedRef.current).join("");

  // New tokens that need animation
  const newTokens = tokens.slice(committedRef.current);

  // If not streaming (final render after done), just show static plain text
  if (!isStreaming) {
    return <Text className={textClass}>{text}</Text>;
  }

  return (
    <Text className={textClass}>
      {/* Already-committed words: plain Text — zero Reanimated overhead */}
      {staticText}

      {/* Newly arrived words: each gets a staggered fade+slide */}
      {newTokens.map((token, i) => {
        // Skip pure newlines / empty strings from the split
        if (token === "") return null;
        return (
          <WordToken
            key={`${newStartIndex}-${i}`}
            token={token}
            delay={i * 20} // 20 ms stagger between consecutive words
            textClass={textClass}
          />
        );
      })}
    </Text>
  );
}
