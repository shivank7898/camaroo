import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

export interface DateMarker {
  dateString: string; // YYYY-MM-DD
  status: "occupied" | "open";
}

interface CustomCalendarProps {
  markedDates: Record<string, DateMarker>;
  onDayPress: (dateString: string) => void;
  selectedDate: string | null;
  isLoading?: boolean;
  onMonthChange?: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CustomCalendar({ markedDates, onDayPress, selectedDate, isLoading, onMonthChange }: CustomCalendarProps) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading]);

  const [currentDate, setCurrentDate] = useState(() => {
    // Start with the current month/year or the selectedDate month/year
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });

  const [showPicker, setShowPicker] = useState<"month" | "year" | null>(null);
  const [yearOffset, setYearOffset] = useState(0);

  useEffect(() => {
    onMonthChange?.(currentDate.month + 1, currentDate.year);
  }, [currentDate.month, currentDate.year]);

  const calendarDays = useMemo(() => {
    const days = [];
    const { month, year } = currentDate;
    
    // Day of week of the 1st of the month (0 = Sun, 6 = Sat)
    const firstDay = new Date(year, month, 1).getDay();
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill blank cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Fill actual days
    for (let d = 1; d <= daysInMonth; d++) {
      // Create YYYY-MM-DD string safely pad-starting with 0
      const dStr = String(d).padStart(2, '0');
      const mStr = String(month + 1).padStart(2, '0');
      days.push(`${year}-${mStr}-${dStr}`);
    }
    return days;
  }, [currentDate]);

  const handlePrev = () => {
    if (showPicker === 'year') {
      setYearOffset(prev => prev - 12);
    } else if (showPicker === 'month') {
      setCurrentDate(prev => ({ ...prev, year: prev.year - 1 }));
    } else {
      setCurrentDate(prev => {
        if (prev.month === 0) return { month: 11, year: prev.year - 1 };
        return { ...prev, month: prev.month - 1 };
      });
    }
  };

  const handleNext = () => {
    if (showPicker === 'year') {
      setYearOffset(prev => prev + 12);
    } else if (showPicker === 'month') {
      setCurrentDate(prev => ({ ...prev, year: prev.year + 1 }));
    } else {
      setCurrentDate(prev => {
        if (prev.month === 11) return { month: 0, year: prev.year + 1 };
        return { ...prev, month: prev.month + 1 };
      });
    }
  };

  return (
    <View className="w-full pb-4">
      {/* Calendar Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => setShowPicker(prev => prev === 'month' ? null : 'month')} 
            className="flex-row items-center mr-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100"
          >
            <Text className="font-outfit-bold text-lg text-[#1E293B]">{MONTH_NAMES[currentDate.month]}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              if (showPicker !== 'year') setYearOffset(0);
              setShowPicker(prev => prev === 'year' ? null : 'year');
            }}
            className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100"
          >
            <Text className="font-outfit-bold text-lg text-[#1E293B]">{currentDate.year}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={handlePrev} className="px-2 py-1">
            <ChevronLeft size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} className="px-2 py-1">
            <ChevronRight size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pickers View */}
      {showPicker === 'month' && (
        <View className="flex-row flex-wrap px-3 py-2">
          {MONTH_NAMES.map((m, idx) => (
            <TouchableOpacity 
              key={m} 
              className={`w-1/3 p-3 mb-2 items-center rounded-xl ${currentDate.month === idx ? 'bg-[#1E293B]' : 'bg-transparent'}`}
              onPress={() => {
                setCurrentDate(prev => ({ ...prev, month: idx }));
                setShowPicker(null);
              }}
            >
              <Text className={`font-outfit-medium text-sm ${currentDate.month === idx ? 'text-white' : 'text-[#64748B]'}`}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showPicker === 'year' && (
        <View className="flex-row flex-wrap px-3 py-2">
          {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + yearOffset - 2 + i).map(y => (
            <TouchableOpacity 
              key={y} 
              className={`w-1/3 p-3 mb-2 items-center rounded-xl ${currentDate.year === y ? 'bg-[#1E293B]' : 'bg-transparent'}`}
              onPress={() => {
                setCurrentDate(prev => ({ ...prev, year: y }));
                setShowPicker(null);
                setYearOffset(0);
              }}
            >
              <Text className={`font-outfit-medium text-sm ${currentDate.year === y ? 'text-white' : 'text-[#64748B]'}`}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Normal Calendar View */}
      {!showPicker && (
        <>
          {/* WeekDays Header */}
          <View className="flex-row mx-3 mb-2">
            {WEEKDAYS.map((day, idx) => (
              <View key={`wd-${idx}`} className="flex-1 items-center justify-center">
                <Text className="font-outfit-medium text-xs text-slate-400">{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid Skeleton while loading */}
          {isLoading ? (
            <Animated.View style={{ opacity: pulseAnim }} className="flex-row flex-wrap mx-3">
              {Array.from({ length: 35 }).map((_, index) => (
                <View key={`skel-${index}`} style={{ width: '14.28%', height: 44 }} className="items-center justify-center">
                  <View className="w-9 h-9 rounded-full bg-slate-200" />
                </View>
              ))}
            </Animated.View>
          ) : (
            <View className="flex-row flex-wrap mx-3">
              {calendarDays.map((dateStr, index) => {
                if (!dateStr) {
                  return <View key={`blank-${index}`} style={{ width: '14.28%', height: 44 }} />;
                }

                const dayNumber = parseInt(dateStr.split('-')[2], 10);
                const isSelected = selectedDate === dateStr;
                const markInfo = markedDates[dateStr];

                // Default styling
                let containerClass = "items-center justify-center w-9 h-9 rounded-full";
                let textClass = "font-outfit-medium text-sm text-[#1E293B]";
                let dotColor = "transparent";
                
                const isOccupied = markInfo?.status === "occupied";

                // Apply Marks
                if (isOccupied) {
                  containerClass += " bg-[#1E293B]";
                  textClass = "font-outfit-bold text-white";
                }

                // Apply Selection
                if (isSelected) {
                  if (isOccupied) {
                    // Make it stand out if it's both occupied AND selected (e.g., turn blue)
                    containerClass = containerClass.replace("bg-[#1E293B]", "bg-[#0EA5E9]");
                  } else {
                    containerClass += " bg-[#F1F5F9]";
                    textClass = "font-outfit-bold text-black";
                  }
                }

                return (
                  <View key={dateStr} style={{ width: '14.28%', height: 44 }} className="items-center justify-center">
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => onDayPress(dateStr)}
                      className={containerClass}
                    >
                      <Text className={textClass}>{dayNumber}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}
