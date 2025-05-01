import { useState, useEffect, useCallback } from 'react';
import { MyContext } from './Context';

export function MyProvider({ children }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('Week');
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [previewBlocks, setPreviewBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState(false);
  const [isNewEventHovered, setIsNewEventHovered] = useState(false);
  const [isTodayHovered, setIsTodayHovered] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimezonePanel, setShowTimezonePanel] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [user, setUser] = useState('Rutu');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState('12:00 AM');
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState('12:30 AM');
  const [duration, setDuration] = useState('30m');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatOption, setRepeatOption] = useState('Does not repeat');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [events, setEvents] = useState([]); // New state to store events

  const navigateFiveDays = useCallback((direction) => {
    setViewDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + direction * 7);
      return newDate;
    });
  }, []);

  const navigateMonth = useCallback((direction) => {
    setViewDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  }, []);

  const handleYearChange = useCallback((direction) => {
    setViewDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(prevDate.getFullYear() + direction);
      return newDate;
    });
  }, []);

  const resetMeetingStates = useCallback(() => {
    setMeetingTitle('');
    setParticipants('');
    setStartDate(new Date());
    setStartTime('12:00 AM');
    setEndDate(new Date());
    setEndTime('12:30 AM');
    setDuration('30m');
    setIsAllDay(false);
    setRepeatOption('Does not repeat');
    setLocation('');
    setDescription('');
  }, []);

  const formatTimeSlot = (hour, min) => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const startTime = `${displayHour}:${min === 0 ? '00' : '30'} ${period}`;
    let nextHour = hour;
    let nextMin = min + 30;
    if (nextMin >= 60) {
      nextHour += 1;
      nextMin = 0;
    }
    const nextPeriod = nextHour < 12 ? 'AM' : 'PM';
    const nextDisplayHour = nextHour % 12 === 0 ? 12 : nextHour % 12;
    const endTime = `${nextDisplayHour}:${nextMin === 0 ? '00' : '30'} ${nextPeriod}`;
    return `${startTime} to ${endTime}`;
  };

  const isBlockSelected = (day, slotIndex) => {
    if (!selectedDay || day !== selectedDay) return false;
    return selectedBlocks.some(
      (block) => block.day === day && block.slotIndex === slotIndex
    );
  };

  const isBlockPreviewed = (day, slotIndex) => {
    if (!selectedDay || day !== selectedDay) return false;
    return previewBlocks.some(
      (block) => block.day === day && block.slotIndex === slotIndex
    );
  };

  const handleMouseDown = (day, slotIndex) => {
    setIsSelecting(true);
    setSelectionStart({ day, slotIndex });
    setSelectedDay(day);
    setPreviewBlocks([{ day, slotIndex }]);
    setSelectedBlocks([]);
  };

  const handleMouseOver = (day, slotIndex) => {
    if (isSelecting && selectionStart && day === selectionStart.day) {
      const newPreviewBlocks = [];
      const startIndex = Math.min(selectionStart.slotIndex, slotIndex);
      const endIndex = Math.max(selectionStart.slotIndex, slotIndex);
      for (let i = startIndex; i <= endIndex; i++) {
        newPreviewBlocks.push({ day, slotIndex: i });
      }
      setPreviewBlocks(newPreviewBlocks);
    }
  };

  const handleMouseUp = (onSelectionComplete) => {
    if (isSelecting && previewBlocks.length > 0) {
      setIsSelecting(false);
      setSelectedBlocks(previewBlocks);
      setPreviewBlocks([]);

      const selectedDay = previewBlocks[0].day;
      const slotIndices = previewBlocks
        .map((block) => block.slotIndex)
        .sort((a, b) => a - b);
      const startSlotIndex = slotIndices[0];
      const endSlotIndex = slotIndices[slotIndices.length - 1];
      const selectedSlots = timeSlots
        .slice(startSlotIndex, endSlotIndex + 1)
        .map((slot, index) => ({
          ...slot,
          formatted: formatTimeSlot(slot.hour, slot.min),
          slotIndex: startSlotIndex + index,
        }));
      const totalDuration = (endSlotIndex - startSlotIndex + 1) * 30;
      const selectedDate = new Date(viewDate);
      const dayIndex = days.indexOf(selectedDay);
      selectedDate.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);

      onSelectionComplete({
        date: selectedDate,
        timeSlots: selectedSlots,
        totalDuration,
      });
    }
  };

  const handleCellClick = (day, slotIndex) => {
    setSelectedDay(day);
    setSelectedBlocks([{ day, slotIndex }]);
    setPreviewBlocks([]);
    setIsSelecting(false);
    setShowMeetingScheduler(true);
  };

  const contextValue = {
    viewDate,
    setViewDate,
    navigateFiveDays,
    selectedView,
    setSelectedView,
    isWeekMenuOpen,
    setIsWeekMenuOpen,
    isNewEventHovered,
    setIsNewEventHovered,
    isTodayHovered,
    setIsTodayHovered,
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    showTimezonePanel,
    setShowTimezonePanel,
    timezone,
    setTimezone,
    timezoneSearch,
    setTimezoneSearch,
    navigateMonth,
    handleYearChange,
    user,
    setUser,
    meetingTitle,
    setMeetingTitle,
    participants,
    setParticipants,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    duration,
    setDuration,
    isAllDay,
    setIsAllDay,
    repeatOption,
    setRepeatOption,
    location,
    setLocation,
    description,
    setDescription,
    resetMeetingStates,
    showMeetingScheduler,
    setShowMeetingScheduler,
    days,
    setDays,
    timeSlots,
    setTimeSlots,
    selectedBlocks,
    setSelectedBlocks,
    isSelecting,
    setIsSelecting,
    selectionStart,
    setSelectionStart,
    selectedDay,
    setSelectedDay,
    showPrintPreview,
    setShowPrintPreview,
    modalData,
    setModalData,
    currentTimeOffset,
    setCurrentTimeOffset,
    formatTimeSlot,
    handleMouseDown,
    handleMouseOver,
    handleMouseUp,
    handleCellClick,
    isBlockSelected,
    isBlockPreviewed,
    events, // Add events to context
    setEvents,
  };

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}