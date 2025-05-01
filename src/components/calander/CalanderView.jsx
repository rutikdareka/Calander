import React, { useEffect, useContext, useMemo, useRef, useState } from 'react'; // Added useState
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
    events, // Ensure events is destructured
  } = useContext(MyContext);

  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const slotHeightRef = useRef(100);
  const [hoverEvent, setHoverEvent] = useState(null); // Added hoverEvent state

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

// Function to check if a slot overlaps with an event (fixing the gap and over-expansion issue)
const isEventBlock = (day, slotIndex) => {
  if (!events) return false; // Safeguard if events is undefined
  const slotStartHour = timeSlots[slotIndex]?.hour;
  const slotStartMin = timeSlots[slotIndex]?.min;
  if (slotStartHour === undefined || slotStartMin === undefined) return false; // Safeguard if timeSlots is incomplete

  const dayIndex = days.indexOf(day);
  const slotStart = new Date(viewDate);
  slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
  slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30); // Each slot is 30 minutes

  return events.some((event) => {
    const eventStart = new Date(event.startDate);
    const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    if (!startHour || !startMin || !startPeriod) return false; // Safeguard for malformed time
    eventStart.setHours(
      startPeriod.toUpperCase() === 'PM' && startHour !== '12' ? parseInt(startHour) + 12 : parseInt(startHour),
      parseInt(startMin),
      0,
      0
    );

    const eventEnd = new Date(event.endDate);
    const [endHour, endMin, endPeriod] = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    if (!endHour || !endMin || !endPeriod) return false; // Safeguard for malformed time
    eventEnd.setHours(
      endPeriod.toUpperCase() === 'PM' && endHour !== '12' ? parseInt(endHour) + 12 : parseInt(endHour),
      parseInt(endMin),
      0,
      0
    );

    // Compare dates first
    const slotDate = slotStart.toDateString();
    const eventStartDate = eventStart.toDateString();
    const eventEndDate = eventEnd.toDateString();

    if (slotDate !== eventStartDate || slotDate !== eventEndDate) {
      if (new Date(slotDate) < new Date(eventStartDate) || new Date(slotDate) > new Date(eventEndDate)) {
        return false;
      }
    }

    // Check if the slot's range is fully within or exactly matches the event range
    const slotStartTime = slotStart.getTime();
    const slotEndTime = slotEnd.getTime();
    const eventStartTime = eventStart.getTime();
    const eventEndTime = eventEnd.getTime();

    // Slot is part of the event if its start time is >= event start and end time is <= event end
    // OR if the slot exactly matches the event start or end (for single-block events)
    const isWithinRange = slotStartTime >= eventStartTime && slotEndTime <= eventEndTime;
    const isStartSlot = slotStartTime === eventStartTime && slotEndTime <= eventEndTime;
    const isEndSlot = slotEndTime === eventEndTime && slotStartTime >= eventStartTime;

    return isWithinRange || isStartSlot || isEndSlot;
  });
};

// Function to get the event for a specific slot (for hover panel)
const getEventForSlot = (day, slotIndex) => {
  if (!events) return null; // Safeguard if events is undefined
  const slotStartHour = timeSlots[slotIndex]?.hour;
  const slotStartMin = timeSlots[slotIndex]?.min;
  if (slotStartHour === undefined || slotStartMin === undefined) return null; // Safeguard if timeSlots is incomplete

  const dayIndex = days.indexOf(day);
  const slotStart = new Date(viewDate);
  slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
  slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30); // Each slot is 30 minutes

  return events.find((event) => {
    const eventStart = new Date(event.startDate);
    const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    if (!startHour || !startMin || !startPeriod) return false; // Safeguard for malformed time
    eventStart.setHours(
      startPeriod.toUpperCase() === 'PM' && startHour !== '12' ? parseInt(startHour) + 12 : parseInt(startHour),
      parseInt(startMin),
      0,
      0
    );

    const eventEnd = new Date(event.endDate);
    const [endHour, endMin, endPeriod] = event.endTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    if (!endHour || !endMin || !endPeriod) return false; // Safeguard for malformed time
    eventEnd.setHours(
      endPeriod.toUpperCase() === 'PM' && endHour !== '12' ? parseInt(endHour) + 12 : parseInt(endHour),
      parseInt(endMin),
      0,
      0
    );

    // Compare dates first
    const slotDate = slotStart.toDateString();
    const eventStartDate = eventStart.toDateString();
    const eventEndDate = eventEnd.toDateString();

    if (slotDate !== eventStartDate || slotDate !== eventEndDate) {
      if (new Date(slotDate) < new Date(eventStartDate) || new Date(slotDate) > new Date(eventEndDate)) {
        return false;
      }
    }

    // Check if the slot's range is fully within or exactly matches the event range
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

  const handleToggleClick = (day, index, e, currentDate) => {
    e.preventDefault();

    const currentDateString = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log(`Selected ${day} at slot ${index}, date: ${currentDateString}`, currentDate);

    const event = getEventForSlot(day, index);
    if (event) {
      // If the slot is part of an event, open the modal for editing
      setSelectedBlocks([]);
      setShowMeetingScheduler(true);
    } else {
      const isAlreadySelected = isBlockSelected(day, index);
      if (!isAlreadySelected) {
        setSelectedDay(day);
        setSelectedBlocks([{ day, slotIndex: index }]);
        refIndex.current = index;
      } else {
        if (refIndex.current === index) {
          setSelectedDay(null);
          setSelectedBlocks([]);
          refIndex.current = null;
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
              pointerEvents: 'none',
            }}
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
              left: '70px',
              zIndex: 101,
              pointerEvents: 'none',
            }}
          ></div>

          {timeSlots.map((slot, index) => (
            <div key={`${slot.hour}-${slot.min}`} className={`time-row ${timeRowClass}`} style={{ position: 'relative' }}>
              <div className="time-label">{formatTimeSlot(slot.hour, slot.min)}</div>
              {selectedView !== 'Month' &&
                days.map((day, dayIndex) => {
                  const isSelected = isBlockSelected(day, index);
                  const isPreviewed = isBlockPreviewed(day, index);
                  const isEvent = isEventBlock(day, index);
                  const event = isEvent ? getEventForSlot(day, index) : null;
                  return (
                    <div
                      key={`${day}-${index}`}
                      className={`time-cell ${isSelected ? 'selected' : ''} ${isPreviewed ? 'previewed' : ''} ${isEvent ? 'event' : ''}`}
                      style={{
                        position: 'relative',
                        minHeight: '40px',
                        borderTop: '1px solid #444',
                        borderLeft: '1px solid #444',
                        borderRight: '1px solid #444',
                        borderBottom: index === timeSlots.length - 1 ? '1px solid #444' : 'none',
                        backgroundColor: isSelected
                          ? 'rgba(0, 123, 255, 0.5)'
                          : isEvent
                          ? 'rgba(255, 165, 0, 0.5)'
                          : isPreviewed
                          ? 'rgba(0, 255, 0, 0.2)'
                          : 'transparent',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(day, index);
                      }}
                      onMouseOver={() => handleMouseOver(day, index)}
                      onMouseEnter={() => event && setHoverEvent({ day, slotIndex: index, event })}
                      onMouseLeave={() => setHoverEvent(null)}
                      onMouseUp={() => handleMouseUp(handleSelectionComplete)}
                      onClick={(e) => handleToggleClick(day, index, e, new Date())}
                    >
                      {(isSelected || isEvent) && (
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
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
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
                  onClick={(e) => handleToggleClick(days[0], index, e, new Date())}
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
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
          ))}
          {hoverEvent && (
            <div
              className="hover-panel"
              style={{
                position: 'absolute',
                top: hoverEvent.slotIndex * slotHeightRef.current + (document.querySelector('.header')?.offsetHeight || 0),
                left: days.indexOf(hoverEvent.day) * 100 + 80,
                width: 200,
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: 5,
                borderRadius: 4,
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              <strong>{hoverEvent.event.meetingTitle || 'Untitled Event'}</strong>
              <br />
              {new Date(hoverEvent.event.startDate).toLocaleString()} - {new Date(hoverEvent.event.endDate).toLocaleString()}
              <br />
              Location: {hoverEvent.event.location || 'N/A'}
              <br />
              Participants: {hoverEvent.event.participants || 'N/A'}
            </div>
          )}
        </div>
      </div>
      {showMeetingScheduler && <MeetingScheduler />}
    </div>
  );
};

export default CalendarView;  