import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface BottomControlsProps {
  onReset: () => void;
  onSubmit: () => void;
  isLastStep?: boolean;
}

export default function BottomControls({
  onReset,
  onSubmit,
  isLastStep = false,
}: BottomControlsProps) {
  return (
    <View
      className="flex-row items-center justify-center gap-4 bg-core-white border-t border-grey-100 pt-3 pb-6"
      style={{ width: "100%" }}
    >
      {/* Reset button */}
      <TouchableOpacity
        onPress={onReset}
        className="bg-grey-100 rounded-sm p-2 items-center justify-center"
        activeOpacity={0.7}
      >
        <Ionicons name="close-outline" size={16} color="#000" />
      </TouchableOpacity>

      {/* Central mic / submit button */}
      <TouchableOpacity
        onPress={onSubmit}
        activeOpacity={0.85}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 2,
          borderColor: "#008080",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#008080",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isLastStep ? "checkmark" : "mic"}
            size={20}
            color="#fff"
          />
        </View>
      </TouchableOpacity>

      {/* Submit / next step button */}
      <TouchableOpacity
        onPress={onSubmit}
        className="bg-grey-100 rounded-sm p-2 items-center justify-center"
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-outline" size={16} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
