import React, { useEffect, useContext, useMemo, useRef, useState } from 'react';
import '../styles/viewcalander.css';
import Header from './header';
import '../styles/popup.css';
import { MyContext } from '../context/Context';
import MeetingScheduler from './ModelEvent';

const CalendarView = () => {
  const {
    days,
    timeSlots,
    selectedBlocks,
    isSelecting,
    selectionStart,
    currentTimeOffset,
    setCurrentTimeOffset,
    formatTimeSlot,
    handleMouseDown,
    handleMouseOver,
    handleMouseUp,
    handleCellClick,
    isBlockSelected,
    isBlockPreviewed,
    selectedView,
    setDays,
    setTimeSlots,
    viewDate,
    setSelectedDay,
    setSelectedBlocks,
    showMeetingScheduler,
    setShowMeetingScheduler,
    events,
  } = useContext(MyContext);

  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const slotHeightRef = useRef(100);
  const [hoverEvent, setHoverEvent] = useState(null);

  const handleSelectionComplete = (selectionData) => {
    console.log('Selection Complete:', selectionData);
    const { date, timeSlots } = selectionData;
    const day = days[new Date(date).getDay()];
    const newSelectedBlocks = timeSlots.map((slot) => ({
      day,
      slotIndex: slot.slotIndex,
    }));
    setSelectedBlocks(newSelectedBlocks);
    setShowMeetingScheduler(true);
  };

  const isEventBlock = (day, slotIndex) => {
    if (!events) return false;
    const slotStartHour = timeSlots[slotIndex]?.hour;
    const slotStartMin = timeSlots[slotIndex]?.min;
    if (slotStartHour === undefined || slotStartMin === undefined) return false;

    const dayIndex = days.indexOf(day);
    const slotStart = new Date(viewDate);
    slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
    slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return events.some((event) => {
      const eventStart = new Date(event.startDate);
      const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
      if (!startHour || !startMin || !startPeriod) return false;

      let startHour24 = parseInt(startHour);
      const period = startPeriod.toUpperCase();
      if (period === 'PM' && startHour !== '12') {
        startHour24 += 12;
      } else if (period === 'AM' && startHour === '12') {
        startHour24 = 0;
      }
      eventStart.setHours(startHour24, parseInt(startMin), 0, 0);

      const eventEnd = new Date(event.endDate);
      const [endHour, endMin, endPeriod] = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
      if (!endHour || !endMin || !endPeriod) return false;

      let endHour24 = parseInt(endHour);
      const endPeriodUpper = endPeriod.toUpperCase();
      if (endPeriodUpper === 'PM' && endHour !== '12') {
        endHour24 += 12;
      } else if (endPeriodUpper === 'AM' && endHour === '12') {
        endHour24 = 0;
      }
      eventEnd.setHours(endHour24, parseInt(endMin), 0, 0);

      const slotDate = slotStart.toDateString();
      const eventStartDate = eventStart.toDateString();
      const eventEndDate = eventEnd.toDateString();

      if (slotDate !== eventStartDate || slotDate !== eventEndDate) {
        if (new Date(slotDate) < new Date(eventStartDate) || new Date(slotDate) > new Date(eventEndDate)) {
          return false;
        }
      }

      const slotStartTime = slotStart.getTime();
      const slotEndTime = slotEnd.getTime();
      const eventStartTime = eventStart.getTime();
      const eventEndTime = eventEnd.getTime();

      const isWithinRange = slotStartTime >= eventStartTime && slotEndTime <= eventEndTime;
      const isStartSlot = slotStartTime === eventStartTime && slotEndTime <= eventEndTime;
      const isEndSlot = slotEndTime === eventEndTime && slotStartTime >= eventStartTime;

      return isWithinRange || isStartSlot || isEndSlot;
    });
  };

  const getEventForSlot = (day, slotIndex) => {
    if (!events) return null;
    const slotStartHour = timeSlots[slotIndex]?.hour;
    const slotStartMin = timeSlots[slotIndex]?.min;
    if (slotStartHour === undefined || slotStartMin === undefined) return null;

    const dayIndex = days.indexOf(day);
    const slotStart = new Date(viewDate);
    slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
    slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return events.find((event) => {
      const eventStart = new Date(event.startDate);
      const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
      if (!startHour || !startMin || !startPeriod) return false;

      let startHour24 = parseInt(startHour);
      const period = startPeriod.toUpperCase();
      if (period === 'PM' && startHour !== '12') {
        startHour24 += 12;
      } else if (period === 'AM' && startHour === '12') {
        startHour24 = 0;
      }
      eventStart.setHours(startHour24, parseInt(startMin), 0, 0);

      const eventEnd = new Date(event.endDate);
      const [endHour, endMin, endPeriod] = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
      if (!endHour || !endMin || !endPeriod) return false;

      let endHour24 = parseInt(endHour);
      const endPeriodUpper = endPeriod.toUpperCase();
      if (endPeriodUpper === 'PM' && endHour !== '12') {
        endHour24 += 12;
      } else if (endPeriodUpper === 'AM' && endHour === '12') {
        endHour24 = 0;
      }
      eventEnd.setHours(endHour24, parseInt(endMin), 0, 0);

      const slotDate = slotStart.toDateString();
      const eventStartDate = eventStart.toDateString();
      const eventEndDate = eventEnd.toDateString();

      if (slotDate !== eventStartDate && slotDate !== eventEndDate) {
        if (new Date(slotDate) < new Date(eventStartDate) || new Date(slotDate) > new Date(eventEndDate)) {
          return false;
        }
      }

      const slotStartTime = slotStart.getTime();
      const slotEndTime = slotEnd.getTime();
      const eventStartTime = eventStart.getTime();
      const eventEndTime = eventEnd.getTime();

      const overlaps = slotStartTime < eventEndTime && slotEndTime > eventStartTime;
      const startsWithin = slotStartTime >= eventStartTime && slotStartTime <= eventEndTime;
      const endsWithin = slotEndTime >= eventStartTime && slotEndTime <= eventEndTime;

      return overlaps || startsWithin || endsWithin;
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    const updateDaysAndSlots = () => {
      if (!setTimeSlots || !setDays) {
        console.error('setTimeSlots or setDays is undefined in CalendarView');
        return;
      }

      const today = new Date(viewDate);
      const newDays = [];

      if (selectedView === 'Day') {
        newDays.push('Rutik');
        setTimeSlots(
          Array.from({ length: 48 }, (_, i) => ({
            hour: Math.floor(i / 2),
            min: i % 2 === 0 ? 0 : 30,
          }))
        );
      } else if (selectedView === 'Work Week') {
        newDays.push('Rutik', 'Rahul', 'Imam', 'Rose', 'Ali');
        setTimeSlots(
          Array.from({ length: 48 }, (_, i) => ({
            hour: Math.floor(i / 2),
            min: i % 2 === 0 ? 0 : 30,
          }))
        );
      } else if (selectedView === 'Week') {
        newDays.push('Rutik', 'Rahul', 'Imam', 'Rose', 'Ali', 'Heyoun', 'D.Cal');
        setTimeSlots(
          Array.from({ length: 48 }, (_, i) => ({
            hour: Math.floor(i / 2),
            min: i % 2 === 0 ? 0 : 30,
          }))
        );
      } else if (selectedView === 'Month') {
        today.setDate(1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 0; i < lastDay; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          newDays.push(date.toLocaleDateString('en-US', { weekday: 'long' }));
        }
        setTimeSlots(
          Array.from({ length: 24 }, (_, i) => ({
            hour: Math.floor(i / 1),
            min: 0,
          }))
        );
      }
      setDays(newDays);
    };

    updateDaysAndSlots();
  }, [selectedView, setDays, setTimeSlots, viewDate]);

  useEffect(() => {
    let animationFrameId;

    const updateTimeOffset = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const slotIndex = hours * 2 + (minutes >= 30 ? 1 : 0);
      const minutesInSlot = minutes % 30;
      const progressWithinSlot = (minutesInSlot * 60 + seconds) / (30 * 60);

      const timeRow = document.querySelector('.time-row');
      const slotHeight = timeRow ? timeRow.offsetHeight : 40;
      slotHeightRef.current = slotHeight;

      const header = document.querySelector('.header');
      const headerOffset = header ? header.offsetHeight : 0;

      const position = slotIndex * slotHeight + progressWithinSlot * slotHeight + headerOffset;

      setCurrentTimeOffset(position);

      animationFrameId = requestAnimationFrame(updateTimeOffset);
    };

    updateTimeOffset();
    return () => cancelAnimationFrame(animationFrameId);
  }, [setCurrentTimeOffset]);

  const hasAutoScrolled = useRef(false);

  useEffect(() => {
    if (!hasAutoScrolled.current && currentTimeOffset > 0) {
      const container = containerRef.current;
      if (container) {
        const containerHeight = container.clientHeight;
        const scrollOffset = currentTimeOffset - containerHeight / 2 + 200;
        container.scrollTo({
          top: Math.max(0, scrollOffset),
          behavior: 'smooth',
        });
        hasAutoScrolled.current = true;
      }
    }
  }, [currentTimeOffset]);

  const handleMouseMove = (e) => {
    if (!isSelecting || !containerRef.current || !selectionStart) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseY = e.clientY;

    const scrollThreshold = 120;
    const minScrollSpeed = 100;
    const maxScrollSpeed = 400;
    const accelerationFactor = 2;
    const scrollInterval = 16;

    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;

    const updateSelection = () => {
      const slotIndex = Math.floor(
        (container.scrollTop + (mouseY - containerRect.top)) / slotHeightRef.current
      );
      const boundedSlotIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
      handleMouseOver(selectionStart.day, boundedSlotIndex);
    };

    if (mouseY > containerRect.bottom - scrollThreshold) {
      const distanceToBottom = mouseY - (containerRect.bottom - scrollThreshold);
      const scrollSpeed = Math.min(maxScrollSpeed, minScrollSpeed + distanceToBottom * accelerationFactor);

      const scrollDown = () => {
        container.scrollTop += scrollSpeed / (1000 / scrollInterval);
        updateSelection();
        scrollIntervalRef.current = requestAnimationFrame(scrollDown);
      };

      scrollDown();
    } else if (mouseY < containerRect.top + scrollThreshold) {
      const distanceToTop = (containerRect.top + scrollThreshold) - mouseY;
      const scrollSpeed = Math.min(maxScrollSpeed, minScrollSpeed + distanceToTop * accelerationFactor);

      const scrollUp = () => {
        container.scrollTop -= scrollSpeed / (1000 / scrollInterval);
        updateSelection();
        scrollIntervalRef.current = requestAnimationFrame(scrollUp);
      };

      scrollUp();
    }
  };

  useEffect(() => {
    const stopAutoScroll = () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopAutoScroll);
      window.addEventListener('mouseleave', stopAutoScroll);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopAutoScroll);
      window.removeEventListener('mouseleave', stopAutoScroll);
      stopAutoScroll();
    };
  }, [isSelecting, selectionStart, handleMouseOver]);

  const timeRowClass = useMemo(() => {
    switch (selectedView) {
      case 'Day':
        return 'day-view';
      case 'Work Week':
        return 'work-week-view';
      case 'Week':
        return 'week-view';
      case 'Month':
        return 'month-view';
      default:
        return 'week-view';
    }
  }, [selectedView]);

  const refIndex = useRef(null);

  const calculateEventSpan = (event, timeSlots) => {
    const startMatch = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i);
    const endMatch = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i);

    if (!startMatch || !endMatch) return 1;

    let startHour = parseInt(startMatch[1]);
    const startMin = parseInt(startMatch[2]);
    const startPeriod = startMatch[3].toUpperCase();
    if (startPeriod === 'PM' && startMatch[1] !== '12') {
      startHour += 12;
    } else if (startPeriod === 'AM' && startMatch[1] === '12') {
      startHour = 0;
    }

    let endHour = parseInt(endMatch[1]);
    const endMin = parseInt(endMatch[2]);
    const endPeriod = endMatch[3].toUpperCase();
    if (endPeriod === 'PM' && endMatch[1] !== '12') {
      endHour += 12;
    } else if (endPeriod === 'AM' && endMatch[1] === '12') {
      endHour = 0;
    }

    let startSlotIndex = -1;
    let endSlotIndex = -1;

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      if (slot.hour === startHour && slot.min === startMin) {
        startSlotIndex = i;
      }
      if ((slot.hour > endHour) || (slot.hour === endHour && slot.min >= endMin)) {
        endSlotIndex = i;
        break;
      }
    }

    if (endSlotIndex === -1) {
      endSlotIndex = timeSlots.length;
    }

    return endSlotIndex - startSlotIndex;
  };

  const isPartOfMultiSlotEvent = (day, slotIndex) => {
    const event = getEventForSlot(day, slotIndex);
    if (!event) return false;
    return calculateEventSpan(event, timeSlots) > 1;
  };

  const isFirstSlotOfEvent = (day, slotIndex) => {
    const event = getEventForSlot(day, slotIndex);
    if (!event) return false;

    const dayIndex = days.indexOf(day);
    const slotStart = new Date(viewDate);
    slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
    slotStart.setHours(timeSlots[slotIndex].hour, timeSlots[slotIndex].min, 0, 0);

    const eventStart = new Date(event.startDate);
    const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    if (!startHour || !startMin || !startPeriod) return false;

    let startHour24 = parseInt(startHour);
    const period = startPeriod.toUpperCase();
    if (period === 'PM' && startHour !== '12') {
      startHour24 += 12;
    } else if (period === 'AM' && startHour === '12') {
      startHour24 = 0;
    }
    eventStart.setHours(startHour24, parseInt(startMin), 0, 0);

    return slotStart.getTime() === eventStart.getTime();
  };

  const handleToggleClick = (day, index, e) => {
    e.preventDefault();

    const event = getEventForSlot(day, index);

    if (event) {
      setHoverEvent((prev) => {
        const isSameEvent = prev && prev.day === day && prev.event?.id === event.id;
        if (isSameEvent) {
          return null;
        } else {
          return { day, slotIndex: index, event };
        }
      });

      setSelectedDay(null);
      setSelectedBlocks([]);
      setShowMeetingScheduler(false);
      refIndex.current = null;
    } else {
      const isAlreadySelected = isBlockSelected(day, index);

      setHoverEvent(null);

      if (!isAlreadySelected) {
        setSelectedDay(day);
        setSelectedBlocks([{ day, slotIndex: index }]);
        refIndex.current = index;
        setShowMeetingScheduler(true);
      } else {
        if (refIndex.current === index) {
          setSelectedDay(null);
          setSelectedBlocks([]);
          refIndex.current = null;
          setShowMeetingScheduler(false);
        }
      }
    }
  };

  return (
    <div className="calendar-view">
      <div className="sub_view">
        <Header />
        <div
          className="time-slots-container"
          ref={containerRef}
          style={{ position: 'relative', overflowY: 'auto' }}
        >
          <div
            className="live-time-line"
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              height: '2px',
              backgroundColor: '#ff5733',
              top: `${currentTimeOffset}px`,
              zIndex: 100,
              pointerEvents: 'auto',
            }}
            title={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          ></div>

          <div
            className="live-dot"
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ff5733',
              top: `${currentTimeOffset - 5}px`,
              zIndex: 101,
              pointerEvents: 'auto',
            }}
            title={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          />

          {timeSlots.map((slot, index) => {
            const slotStartHour = timeSlots[index]?.hour;
            const slotStartMin = timeSlots[index]?.min;
            const slotStart = new Date(viewDate);

            return (
              <div key={`${slot.hour}-${slot.min}`} className={`time-row ${timeRowClass}`} style={{ position: 'relative' }}>
                <div className="time-label">{formatTimeSlot(slot.hour, slot.min)}</div>
                {selectedView !== 'Month' &&
                  days.map((day, dayIndex) => {
                    const isSelected = isBlockSelected(day, index);
                    const isPreviewed = isBlockPreviewed(day, index);
                    const isEvent = isEventBlock(day, index);
                    const event = isEvent ? getEventForSlot(day, index) : null;

                    let isEventStartSlot = false;
                    let isEventEndSlot = false;
                    let eventDurationSlots = 0;
                    let isEventContinuation = false;

                    if (event) {
                      const dayIndex = days.indexOf(day);
                      slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
                      slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

                      const eventStart = new Date(event.startDate);
                      const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
                      if (startHour && startMin && startPeriod) {
                        let startHour24 = parseInt(startHour);
                        const period = startPeriod.toUpperCase();
                        if (period === 'PM' && startHour !== '12') {
                          startHour24 += 12;
                        } else if (period === 'AM' && startHour === '12') {
                          startHour24 = 0;
                        }
                        eventStart.setHours(startHour24, parseInt(startMin), 0, 0);
                      }

                      const eventEnd = new Date(event.endDate);
                      const [endHour, endMin, endPeriod] = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
                      if (endHour && endMin && endPeriod) {
                        let endHour24 = parseInt(endHour)

                        const endPeriodUpper = endPeriod.toUpperCase();
                        if (endPeriodUpper === 'PM' && endHour !== '12') {
                          endHour24 += 12;
                        } else if (endPeriodUpper === 'AM' && endHour === '12') {
                          endHour24 = 0;
                        }
                        eventEnd.setHours(endHour24, parseInt(endMin), 0, 0);
                      }

                      isEventStartSlot = slotStart.getTime() === eventStart.getTime();
                      isEventEndSlot = slotStart.getTime() + (30 * 60 * 1000) > eventEnd.getTime();
                      isEventContinuation = !isEventStartSlot && !isEventEndSlot && isEvent;

                      const durationMs = eventEnd.getTime() - eventStart.getTime();
                      const slotDurationMs = 30 * 60 * 1000;
                      eventDurationSlots = Math.ceil(durationMs / slotDurationMs);
                    }

                    return (
                      <div
                        key={`${day}-${index}`}
                        className={`time-cell ${isSelected ? 'selected' : ''} ${isPreviewed ? 'previewed' : ''} ${isEvent ? 'event' : ''}`}
                        style={{
                          position: 'relative',
                          minHeight: '40px',
                          borderTop: isEvent ? 'none' : '1px solid #444',
                          borderLeft: isEvent ? 'none' : '1px solid #444',
                          borderRight: isEvent ? 'none' : '1px solid #444',
                          borderBottom: isEvent ? 'none' : (index === timeSlots.length - 1 ? '1px solid #444' : 'none'),
                          outline: isEvent ? (
                            isEventStartSlot && isEventEndSlot ? '1px solid #444' :
                            isEventStartSlot ? '1px solid #444 1px solid #444 0 1px solid #444' :
                            isEventEndSlot ? '0 1px solid #444 1px solid #444 1px solid #444' :
                            dayIndex === 0 ? '0 0 0 1px solid #444' :
                            dayIndex === days.length - 1 ? '0 1px solid #444 0 0' :
                            '0'
                          ) : 'none',
                          backgroundColor: isSelected
                            ? 'rgba(0, 123, 255, 0.5)'
                            : isEvent
                            ? 'rgba(65, 105, 225, 0.7)'
                            : isPreviewed
                            ? 'rgba(0, 255, 0, 0.2)'
                            : 'transparent',
                          boxSizing: 'border-box',
                          overflow: 'visible', // Changed to visible to prevent text clipping
                          marginBottom: isEvent && !isEventEndSlot ? '-1px' : '0',
                          marginTop: isEvent && !isEventStartSlot ? '-1px' : '0',
                          zIndex: isEvent ? 2 : 1,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMouseDown(day, index);
                        }}
                        onMouseOver={() => handleMouseOver(day, index)}
                        onMouseUp={() => handleMouseUp(handleSelectionComplete)}
                        onClick={(e) => handleToggleClick(day, index, e)}
                      >
                        {isEvent && (
                          <div
                            style={{
                              padding: '4px',
                              fontSize: '12px',
                              color: 'white',
                              overflow: 'visible', // Prevent text clipping
                              textOverflow: 'ellipsis',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-start',
                              position: 'relative',
                            }}
                          >
                            {/* Display title in all event slots, with time in first slot */}
                            <div
                              style={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word',
                                maxHeight: '50%',
                              }}
                            >
                              {event?.meetingTitle || 'Untitled Event'}
                            </div>

                            {isEventStartSlot && (
                              <div
                                style={{
                                  fontSize: '10px',
                                  color: 'white',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  marginTop: '2px',
                                }}
                              >
                                {event.startTime} - {event.endTime}
                              </div>
                            )}

                            {isEventStartSlot && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  fontSize: '12px',
                                  color: 'white',
                                }}
                              >
                                ✅
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {selectedView === 'Month' && days.length > 0 && (
                  <div
                    key={`${days[0]}-${index}`}
                    className={`time-cell month-cell ${isBlockSelected(days[0], index) ? 'selected' : ''} ${
                      isBlockPreviewed(days[0], index) ? 'previewed' : ''
                    }`}
                    style={{
                      gridColumn: 'span 7',
                      borderTop: '1px solid #444',
                      borderLeft: '1px solid #444',
                      borderRight: '1px solid #444',
                      borderBottom: index === timeSlots.length - 1 ? '1px solid #444' : 'none',
                      backgroundColor: isBlockSelected(days[0], index)
                        ? 'rgba(0, 123, 255, 0.5)'
                        : isBlockPreviewed(days[0], index)
                        ? 'rgba(0, 255, 0, 0.2)'
                        : 'transparent',
                      position: 'relative',
                      boxSizing: 'border-box',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(days[0], index);
                    }}
                    onMouseOver={() => handleMouseOver(days[0], index)}
                    onMouseUp={() => handleMouseUp(handleSelectionComplete)}
                    onClick={(e) => handleToggleClick(days[0], index, e)}
                  >
                    {isBlockSelected(days[0], index) && (
                      <div
                        className="time-display"
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          fontSize: '10px',
                          color: 'white',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          padding: '1px 3px',
                          borderRadius: '2px',
                          pointerEvents: 'none',
                        }}
                      >
                        {formatDate(new Date())}
                      </div>
                    )}
                  </div>
                )}

                {index < timeSlots.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: '1px',
                      backgroundColor: '#444',
                      zIndex: 1,
                    }}
                  />
                )}
              </div>
            );
          })}

          {hoverEvent && (
            <div
              className="click-panel"
              style={{
                position: 'absolute',
                top: hoverEvent.slotIndex * slotHeightRef.current + (document.querySelector('.header')?.offsetHeight || 0),
                left: days.indexOf(hoverEvent.day) * 150 + 80,
                width: 300,
                background: '#ffffff',
                color: '#333',
                padding: '15px',
                borderRadius: 10,
                zIndex: 1000,
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                overflow: 'visible', // Ensure content is not clipped
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div
                  style={{
                    borderRadius: '4px',
                    background: '#4169e1',
                  }}
                ></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ cursor: 'pointer', fontSize: '14px' }}>✏️</span>
                  <span style={{ cursor: 'pointer', fontSize: '14px' }} onClick={() => setHoverEvent(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                    </svg>
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#222',
                  whiteSpace: 'normal', // Allow wrapping
                  overflow: 'visible',
                }}
              >
                {hoverEvent.event.meetingTitle || 'Untitled Event'}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    textAlign: 'center',
                    marginRight: '10px',
                    color: '#888',
                  }}
                >
                  🕒
                </span>
                <span>
                  {formatDate(new Date(hoverEvent.event.startDate))},{' '}
                  {hoverEvent.event.startTime} - {hoverEvent.event.endTime}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    textAlign: 'center',
                    marginRight: '10px',
                    color: '#888',
                  }}
                >
                  📍
                </span>
                <span
                  style={{
                    whiteSpace: 'normal',
                    overflow: 'visible',
                  }}
                >
                  {hoverEvent.event.timezone || 'No location'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    textAlign: 'center',
                    marginRight: '10px',
                    color: '#888',
                  }}
                >
                  👥
                </span>
                <span
                  style={{
                    whiteSpace: 'normal',
                    overflow: 'visible',
                  }}
                >
                  {hoverEvent.event.participants || 'No participants'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    textAlign: 'center',
                    marginRight: '10px',
                    color: '#888',
                  }}
                >
                  📅
                </span>
                <span
                  style={{
                    whiteSpace: 'normal',
                    overflow: 'visible',
                  }}
                >
                  {hoverEvent.event.calendar || 'My Calendar'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginTop: '10px',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    textAlign: 'center',
                    marginRight: '10px',
                    color: '#888',
                  }}
                >
                  📝
                </span>
                <span
                  style={{
                    overflow: 'visible',
                    display: 'block',
                    whiteSpace: 'normal',
                  }}
                >
                  {hoverEvent.event.description || 'No description'}
                </span>
              </div>
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#e6f0fa',
                  color: '#4169e1',
                  borderRadius: '20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#d0e0f8')}
                onMouseLeave={(e) => (e.target.style.background = '#e6f0fa')}
              >
                Mark completed
              </div>
            </div>
          )}
        </div>
      </div>
      {showMeetingScheduler && <MeetingScheduler />}
    </div>
  );
};

export default CalendarView;