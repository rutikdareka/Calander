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
      isSelecting,
      selectionStart,
      currentTimeOffset,
      setCurrentTimeOffset,
      formatTimeSlot,
      handleMouseDown,
      handleMouseOver,
      handleMouseUp,
      isBlockSelected,
      isBlockPreviewed,
      selectedView,
      setDays,
      setTimeSlots,
      viewDate,
      setSelectedDay,
      setSelectedBlocks,
      selectedBlocks,
      showMeetingScheduler,
      setShowMeetingScheduler,
      events,
      setEvents,
    } = useContext(MyContext);

    const containerRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const slotHeightRef = useRef(100);
    const [hoverEvent, setHoverEvent] = useState(null);

    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const [completedEvents, setCompletedEvents] = useState(() => new Set());

    useEffect(() => {
      const headerContainer = document.querySelector('.grid-header');
      const timeSlotsContainer = containerRef.current;
    
      const syncScroll = () => {
        if (headerContainer && timeSlotsContainer) {
          headerContainer.scrollLeft = timeSlotsContainer.scrollLeft;
        }
      };
    
      if (timeSlotsContainer) {
        timeSlotsContainer.addEventListener('scroll', syncScroll);
      }
    
      return () => {
        if (timeSlotsContainer) {
          timeSlotsContainer.removeEventListener('scroll', syncScroll);
        }
      };
    }, []);

    useEffect(() => {
      const timeSlotsContainer = containerRef.current;

      const handleScroll = () => {
        if (timeSlotsContainer) {
          const { scrollLeft, scrollWidth, clientWidth } = timeSlotsContainer;
          setShowLeftButton(scrollLeft > 0);
          setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
        }
      };

      // Initial check after a slight delay to ensure DOM is rendered
      const initialCheck = setTimeout(() => {
        if (timeSlotsContainer) {
          const { scrollLeft, scrollWidth, clientWidth } = timeSlotsContainer;
          setShowLeftButton(scrollLeft > 0);
          setShowRightButton(scrollWidth > clientWidth); // Check if content overflows
        }
      }, 100);

      if (timeSlotsContainer) {
        timeSlotsContainer.addEventListener('scroll', handleScroll);
      }

      return () => {
        if (timeSlotsContainer) {
          timeSlotsContainer.removeEventListener('scroll', handleScroll);
        }
        clearTimeout(initialCheck);
      };
    }, []);

    // Function to handle scrolling
    const scrollContainer = (direction) => {
      const timeSlotsContainer = containerRef.current;
      if (timeSlotsContainer) {
        const scrollAmount = 120 * 3; // Scroll by 3 columns (120px each)
        timeSlotsContainer.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    };


    const handleSelectionComplete = (selectionData) => {
      console.log('Selection Complete:', selectionData);
      const { date, timeSlots } = selectionData;


      console.log(date,timeSlots,new Date(viewDate))
    
      // Find the day in the days array
      
      const dayIndex = days.findIndex((d) => {
        const dayDate = new Date(viewDate);
        dayDate.setDate(viewDate.getDate() - viewDate.getDay() + days.indexOf(d)); // Calculate date for this day
        console.log(dayDate.toDateString())
        return dayDate.toDateString() === new Date(date).toDateString(); // Match by date
      });
    
      if (dayIndex < 0) {
        console.error("Day mapping failed:", date);
        return;
      }

      const newSelectedBlocks = timeSlots.map((slot) => ({
        day: days[dayIndex],
        slotIndex: slot.slotIndex,
        date: days[dayIndex].date // Store the actual date
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

      const slotEnd = new Date(slotStart.presentDay);
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
          newDays.push("Rutik", "Rahul", "Imam", "Rose", "Ali", "Heayoun", "D.Cal", "JHop", "KIM", "JISO", "Junkoog", "Ronaldo", "Mark", "Sajang-youn");
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


    const handleToggleClick = (day, index, e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling to document
      
    console.log(day, index)

      const event = getEventForSlot(day, index); // Retrieve the event for the clicked block
      console.log('Clicked block:', { day, index, event });
    
      if (event) {
        // Validate event data before opening the hover panel
        const hasValidData = event.startDate && event.startTime && event.endDate && event.endTime;
        if (hasValidData) {
          // If the event has valid data, open the hover panel
          setHoverEvent((prev) => {
            const isSameEvent = prev && prev.day === day && prev.event?.id === event.id;
            return isSameEvent ? null : { day, slotIndex: index, event };
          });
    
          // Clear the selection and close the MeetingScheduler
          setSelectedDay(null);
          setSelectedBlocks([]);
          setShowMeetingScheduler(false);
          refIndex.current = null;
        } else {
          // Log invalid event data for debugging
          console.warn('Invalid event data:', event);
        }
      } else {
        // If no event exists, handle block selection and open the MeetingScheduler
        const isAlreadySelected = isBlockSelected(day, index);
    
        setHoverEvent(null); // Ensure the hover panel is closed
    
        if (!isAlreadySelected) {
          // Select the block and open the MeetingScheduler
          setSelectedDay(day);
          setSelectedBlocks([{ day, slotIndex: index }]);
          refIndex.current = index;
          setShowMeetingScheduler(true);
        } else if (refIndex.current === index) {
          // Deselect the block and close the MeetingScheduler
          setSelectedDay(null);
          setSelectedBlocks([]);
          refIndex.current = null;
          setShowMeetingScheduler(false);
        }
      }
    };

    // // Add this useEffect somewhere in your component
    // useEffect(() => {
    //   // Handle clicks outside of the hover panel
    //   const handleDocumentClick = (e) => {
    //     if (hoverEvent && !e.target.closest('.click-panel')) {
    //       setHoverEvent(null);
    //     }
    //   };

    //   // Only add the listener when the hover panel is open
    //   if (hoverEvent) {
    //     document.addEventListener('click', handleDocumentClick);
    //   }

    //   // Clean up the listener when the component unmounts or the hover panel closes
    //   return () => {
    //     document.removeEventListener('click', handleDocumentClick);
    //   };
    // }, [hoverEvent, setHoverEvent]);

    useEffect(() => {
      setCompletedEvents((prev) => {
        // If prev is not a Set, initialize it
        const currentCompletedEvents = prev instanceof Set ? prev : new Set();
        const existingEventIds = new Set(events.map((event) => event.id));
        // Filter out IDs that don't exist in the current events
        const updatedCompletedEvents = new Set(
          Array.from(currentCompletedEvents).filter((eventId) => existingEventIds.has(eventId))
        );
        return updatedCompletedEvents;
      });
    }, [events]);

    useEffect(() => {
      const timeSlotsContainer = containerRef.current;
      if (hoverEvent) {
        document.body.style.overflow = 'hidden';
        if (timeSlotsContainer) {
          timeSlotsContainer.style.overflow = 'hidden';
        }
      } else {
        document.body.style.overflow = '';
        if (timeSlotsContainer) {
          timeSlotsContainer.style.overflow = 'auto';
        }
      }
      return () => {
        document.body.style.overflow = '';
        if (timeSlotsContainer) {
          timeSlotsContainer.style.overflow = 'auto';
        }
      };
    }, [hoverEvent]);


    return (
      <div className="calendar-view">
        <div className="sub_view">
          <Header />
          <div
            className="time-slots-container"
            ref={containerRef}
            style={{
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
              flex: 1, // Take remaining space
            }}
          >
            <div
            style={
              {
                position: 'sticky',
                left: "0",
                zIndex: 1000
              }
            }
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
                zIndex: 111,
                pointerEvents: 'auto',
              }}
              title={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            ></div>

            <div
              className="live-dot"
              style={{
                position: 'absolute',
                left: '0',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ff5733',
                top: `${currentTimeOffset - 5}px`,
                zIndex: 111,
                pointerEvents: 'auto',
              }}
              title={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            />
            </div>

            {timeSlots.map((slot, index) => {
      const slotStartHour = timeSlots[index]?.hour;
      const slotStartMin = timeSlots[index]?.min;
      const slotStart = new Date(viewDate);

      return (
          <div key={`${slot.hour}-${slot.min}`} className={`time-row ${timeRowClass}`} style={{ position: 'relative' }}>
              <div
                  className="time-label"
                  style={{
                      color: "white",
                      textOverflow: 'ellipsis',
                  }}
              >
                  {formatTimeSlot(slot.hour, slot.min)}
              </div>
              {selectedView !== 'Month' &&
                  days.map((day, dayIndex) => {
                      const isSelected = isBlockSelected(day, index);
                      const isPreviewed = isBlockPreviewed(day, index);
                      const isEvent = isEventBlock(day, index);
                      const event = isEvent ? getEventForSlot(day, index) : null;
                      let isEventStartSlot;
                      let isEventEndSlot;
                      let eventDurationSlots;
                      let isEventContinuation;


                      if (event) {
                          const dayIndex = days.indexOf(day);
                          slotStart.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);
                          slotStart.setHours(slotStartHour, slotStartMin, 0, 0);

                          const eventStart = new Date(event.startDate);
                          const [startHour, startMin, startPeriod] = event.startTime?.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
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
                          const [endHour, endMin, endPeriod] = event.endTime?.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
                          if (endHour && endMin && endPeriod) {
                              let endHour24 = parseInt(endHour);
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
                                  width: '120px',
                                  flexShrink: 0,
                                  borderTop: isEvent ? (completedEvents && completedEvents.has(event?.id) ? '1px solid #00f' : 'none') : '1px solid #444',
                                  borderLeft: isEvent ? (completedEvents && completedEvents.has(event?.id) ? '1px solid #00f' : 'none') : '1px solid #444',
                                  borderRight: isEvent ? (completedEvents && completedEvents.has(event?.id) ? '1px solid #00f' : 'none') : '1px solid #444',
                                  borderBottom: isEvent
                                      ? (completedEvents && completedEvents.has(event?.id) ? '1px solid #00f' : 'none')
                                      : (index === timeSlots.length - 1 ? '1px solid #444' : 'none'),
                                  outline: isEvent && (!completedEvents || !completedEvents.has(event?.id)) ? (
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
                                          ? (completedEvents && completedEvents.has(event?.id) ? 'rgb(66, 133, 244)' : 'rgb(66, 133, 244)')
                                          : isPreviewed
                                              ? 'rgba(0, 255, 0, 0.2)'
                                              : 'transparent',
                                  boxSizing: 'border-box',
                                  overflow: 'visible',
                                  marginBottom: isEvent && !isEventEndSlot ? '-1px' : '0',
                                  marginTop: isEvent && !isEventStartSlot ? '-1px' : '0',
                                  zIndex: isEvent ? (isEventStartSlot ? 3 : 2) : 1,
                              }}
                              onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleMouseDown(day, index, containerRef, e);
                              }}
                              onMouseOver={() => handleMouseOver(day, index)}
                              onMouseUp={() => handleMouseUp(handleSelectionComplete)}
                              onClick={(e) => handleToggleClick(day, index, e)}
                          >
                              {isEventStartSlot && event && (
                                  <div
                                      style={{
                                          padding: '4px',
                                          fontSize: '12px',
                                          color: completedEvents && completedEvents.has(event.id) ? 'white' : 'white',
                                          overflow: 'visible',
                                          textOverflow: 'ellipsis',
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'flex-start',
                                          position: 'relative',
                                          textDecoration: completedEvents && completedEvents.has(event.id) ? 'line-through' : '',
                                      }}
                                  >
                                      <>
                                          <div
                                              style={{
                                                  fontWeight: 'bold',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  wordBreak: 'break-word',
                                                  maxHeight: '50%',
                                              }}
                                          >
                                              {event.meetingTitle || 'Untitled Event'}
                                          </div>
                                          <div
                                              style={{
                                                  fontSize: '10px',
                                                  color: completedEvents && completedEvents.has(event.id) ? 'white' : 'white',
                                                  whiteSpace: 'nowrap',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  marginTop: '2px',
                                              }}
                                          >
                                              {event.startTime} - {event.endTime}
                                          </div>
                                          {(!completedEvents || !completedEvents.has(event.id)) && (
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
                                      </>
                                  </div>
                              )}
                          </div>
                      );
                  })}

              {selectedView === 'Month' && days.length > 0 && (
                  <div
                      key={`${days[0]}-${index}`}
                      className={`time-cell month-cell ${isBlockSelected(days[0], index) ? 'selected' : ''} ${isBlockPreviewed(days[0], index) ? 'previewed' : ''}`}
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

            {showLeftButton && (
              <button
                onClick={() => scrollContainer('left')}
                style={{
                  position: 'fixed', // Fixed position to prevent scrolling
                  top: '60px', // Adjust based on header height
                  bottom: '0',
                  height: 'calc(100vh - 60px)', // Match container height
                  width: '40px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
              >
                <span style={{ fontSize: '24px', color: '#fff' }}>◄</span>
              </button>
            )}

            {/* Right Scroll Button */}
            {showRightButton && (
              <button
                onClick={() => scrollContainer('right')}
                style={{
                  position: 'fixed', // Fixed position to prevent scrolling
                  right: '0',
                  top: '60px', // Adjust based on header height
                  bottom: '0',
                  height: 'calc(100vh - 60px)', // Match container height
                  width: '40px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 300,
                }}
              >
                <span style={{ fontSize: '24px', color: '#fff' }}>►</span>
              </button>
            )}

{hoverEvent && (
  <>
    {/* Overlay to block background and handle outside clicks */}
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 999,
        pointerEvents: 'auto', // Allow scroll events to pass through
      }}
      onClick={() => setHoverEvent(null)}
    />
    <div
      className="click-panel"
      style={{
        position: 'absolute',
        top: hoverEvent.slotIndex * slotHeightRef.current + (document.querySelector('.header')?.offsetHeight || 0),
        left: days.indexOf(hoverEvent.day) > days.length / 2
          ? days.indexOf(hoverEvent.day) * 120 + 40 - 320 // Position left if event is on right
          : days.indexOf(hoverEvent.day) * 120 + 160, // Position right if event is on left
        width: 320,
        background: '#ffffff',
        color: '#333',
        padding: '18px',
        borderRadius: 12,
        zIndex: 1000,
        boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
        border: '1px solid #e0e0e0',
        overflow: 'visible',
        
        pointerEvents: 'auto', // Ensure panel is interactive
      }}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.preventDefault()} // Prevent scrolling
      onTouchMove={(e) => e.preventDefault()} // Prevent touch scrolling
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div
          style={{
            borderRadius: '4px',
            background: '#4169e1',
            width: '16px',
            height: '16px'
          }}
        ></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ cursor: 'pointer', fontSize: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
            </svg>
          </span>
          <span style={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => setHoverEvent(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#222',
          whiteSpace: 'normal',
          overflow: 'visible',
        }}
      >
        {hoverEvent.event.meetingTitle || 'Untitled Event'}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
          </svg>
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
          marginBottom: '8px',
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
          </svg>
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
          alignItems: 'flex-start',
          marginBottom: '8px',
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
            marginTop: '3px',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
          </svg>
        </span>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            whiteSpace: 'normal',
            overflow: 'visible',
          }}
        >
          {hoverEvent.event.participants ? (
            Array.isArray(hoverEvent.event.participants) ?
              hoverEvent.event.participants.map((participant, index) => (
                <span key={index} style={{ marginBottom: '4px' }}>{participant}</span>
              )) :
              <span>{hoverEvent.event.participants}</span>
          ) : (
            'No participants'
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
          </svg>
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
      {hoverEvent.event.description && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: '12px',
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
              marginTop: '2px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
              <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
            </svg>
          </span>
          <span
            style={{
              overflow: 'visible',
              display: 'block',
              whiteSpace: 'normal',
            }}
          >
            {hoverEvent.event.description}
          </span>
        </div>
      )}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 18px',
          background: completedEvents.has(hoverEvent.event.id) ? '#ff4444' : '#4169e1',
          color: 'white',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.background = completedEvents.has(hoverEvent.event.id) ? '#cc0000' : '#3a5ecc')}
        onMouseLeave={(e) => (e.target.style.background = completedEvents.has(hoverEvent.event.id) ? '#ff4444' : '#4169e1')}
        onClick={() => {
          if (completedEvents.has(hoverEvent.event.id)) {
            const updatedEvents = events.filter((event) => event.id !== hoverEvent.event.id);
            setEvents(updatedEvents);
            setHoverEvent(null);
          } else {
            setCompletedEvents((prev) => new Set(prev).add(hoverEvent.event.id));
          }
        }}
      >
        {completedEvents.has(hoverEvent.event.id) ? 'Delete Event' : 'Mark completed'}
      </div>
    </div>
  </>
)}
          </div>
        </div>
        {showMeetingScheduler &&  
          <MeetingScheduler
          isEventBlock={isEventBlock}
          getEventForSlot={getEventForSlot}
          selectedBlocks={selectedBlocks} // Pass the selected blocks
          setSelectedBlocks={setSelectedBlocks}
          setEvents={setEvents}
        />
        }
      </div>
    );
  };

  export default CalendarView;