import React from "react";
import { Text } from "react-native";
import { Controller, Control } from "react-hook-form";
import { Input } from "@components/Input";
import type { PhoneInputProps } from "@/types/auth";

/**
 * PhoneInput — reusable Indian mobile number field with +91 prefix.
 * Pure display component (no side effects, no store access).
 * Validates for exactly 10 digits via form-level rules.
 */
function PhoneInputBase({ control, disabled }: PhoneInputProps) {
  return (
    <Controller
      control={control}
      name="mobile"
      rules={{
        required: "Mobile number is required",
        pattern: {
          value: /^\d{10}$/,
          message: "Enter a valid 10-digit mobile number",
        },
        minLength: { value: 10, message: "Mobile number must be 10 digits" },
        maxLength: { value: 10, message: "Mobile number must be 10 digits" },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          label="Mobile Number"
          placeholder="000 000 0000"
          keyboardType="phone-pad"
          maxLength={10}
          value={value || ""}
          onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
          editable={!disabled}
          error={error?.message}
          startIcon={
            <Text className="text-white/60 font-outfit text-base">+91</Text>
          }
        />
      )}
    />
  );
}

export const PhoneInput = React.memo(PhoneInputBase);
