import React from "react";
import { View, Text, ScrollView } from "react-native";

interface AvailabilitySlot {
  day: string;
  date: string;
  status: "free" | "booked";
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
}

/**
 * AvailabilityCalendar
 * Horizontal 7-day strip showing open/booked availability.
 * Pure presentational — no logic, no side effects.
 *
 * Props:
 *   slots → array of { day, date, status: 'free' | 'booked' }
 *
 * Design:
 *   - Booked: #1E293B circle (tab bar bg), white text
 *   - Open: white circle (borderless), black text
 */
function AvailabilityCalendar({ slots }: AvailabilityCalendarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {slots.map((slot, idx) => {
        const isFree = slot.status === "free";
        return (
          <View key={idx} className="items-center mr-3" style={{ width: 48 }}>
            <Text className="font-outfit-medium text-[10px] text-slate-400 uppercase mb-1.5">
              {slot.day}
            </Text>
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: isFree ? "#FFFFFF" : "#1E293B" }}
            >
              <Text
                className={`font-outfit-bold text-sm ${isFree ? "text-black" : "text-white"}`}
              >
                {slot.date}
              </Text>
            </View>
            <Text
              className={`font-outfit text-[9px] mt-1 ${
                isFree ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {isFree ? "Open" : "Busy"}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default React.memo(AvailabilityCalendar);
