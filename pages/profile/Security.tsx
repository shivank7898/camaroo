import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react-native";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import TopGradientFade from "@components/ui/TopGradientFade";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { changePasswordSchema } from "@/validations/profileValidation";
import type { ChangePasswordLocalForm } from "@/validations/profileValidation";
import { changePasswordMutation } from "@/services/mutations";

export default function SecuritySettings() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordLocalForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const { mutate: changePassword, isPending: isSaving } = useMutation({ mutationFn: changePasswordMutation });

  const onSubmit = (data: ChangePasswordLocalForm) => {
    setApiError("");
    setSuccessMessage("");
    changePassword(
      { oldPassword: data.oldPassword, newPassword: data.newPassword }, 
      {
        onSuccess: () => {
          setSuccessMessage("Your password has been changed securely.");
          setTimeout(() => router.back(), 2000);
        },
        onError: (err: any) => {
          let msg = "Failed to update password.";
          try {
            msg = JSON.parse(err.message)?.message || err.message;
          } catch {
            msg = err.message || msg;
          }
          setApiError(msg);
        }
      }
    );
  };

  return (
    <View className="flex-1 bg-white">
      <TopGradientFade />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-black/5">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-11 h-11 items-center justify-center mr-1"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="font-outfit-bold text-xl text-black">Security</Text>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-5 pt-6 pb-6" showsVerticalScrollIndicator={false}>
            <View className="flex-1">
              <View className="items-start mb-8">
                <Text className="font-outfit-bold text-2xl text-black mb-2">
                  Change Password
                </Text>
                <Text className="font-outfit text-slate-500">
                  Ensure your account stays secure by using a strong password.
                </Text>
              </View>

              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Current Password</Text>
                <Controller
                  control={control}
                  name="oldPassword"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Input 
                        variant="light"
                        placeholder="Enter current password" 
                        value={value} 
                        onChangeText={onChange}
                        secureTextEntry={!showOldPassword}
                        endIcon={
                          <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} hitSlop={10}>
                            {showOldPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                          </TouchableOpacity>
                        }
                      />
                      {errors.oldPassword && <Text className="text-red-500 text-xs ml-1 mt-1 font-outfit">{errors.oldPassword.message}</Text>}
                    </View>
                  )}
                />
              </View>

              <View className="mb-4">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">New Password</Text>
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Input 
                        variant="light"
                        placeholder="Enter new password" 
                        value={value} 
                        onChangeText={onChange}
                        secureTextEntry={!showNewPassword}
                        endIcon={
                          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={10}>
                            {showNewPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                          </TouchableOpacity>
                        }
                      />
                      {errors.newPassword && <Text className="text-red-500 text-xs ml-1 mt-1 font-outfit">{errors.newPassword.message}</Text>}
                    </View>
                  )}
                />
              </View>

              <View className="mb-10">
                <Text className="font-outfit-medium text-sm text-slate-500 mb-1.5 ml-1">Confirm New Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Input 
                        variant="light"
                        placeholder="Confirm new password" 
                        value={value} 
                        onChangeText={onChange}
                        secureTextEntry={!showConfirmPassword}
                        endIcon={
                          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
                            {showConfirmPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                          </TouchableOpacity>
                        }
                      />
                      {errors.confirmPassword && <Text className="text-red-500 text-xs ml-1 mt-1 font-outfit">{errors.confirmPassword.message}</Text>}
                    </View>
                  )}
                />
              </View>
            </View>

            <View className="pb-8 pt-4">
              {(apiError || successMessage) ? (
                <View className="mb-4">
                  <Text className={`${apiError ? "text-red-500" : "text-green-500"} font-outfit-medium text-left`}>
                    {apiError || successMessage}
                  </Text>
                </View>
              ) : null}

              <Button 
                title="Update Password" 
                loading={isSaving}
                onPress={handleSubmit(onSubmit)} 
                disabled={isSaving} 
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
