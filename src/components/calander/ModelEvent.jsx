import React, { useContext, useState, useEffect, useRef } from 'react';
import { MyContext } from '../context/Context';
import DatePicker from './datePicker';
import '../styles/model.css';

const MeetingScheduler = () => {
  const {
    timezone,
    setTimezone,
    showTimezonePanel,
    setShowTimezonePanel,
    timezoneSearch,
    setTimezoneSearch,
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
    meetingTitle,
    setMeetingTitle,
    participants,
    setParticipants,
    repeatOption,
    setRepeatOption,
    location,
    setLocation,
    description,
    setDescription,
    resetMeetingStates,
    showMeetingScheduler,
    setShowMeetingScheduler,
    selectedBlocks,
    setSelectedBlocks,
    timeSlots,
    viewDate,
    days,
    events,
    setEvents,
  } = useContext(MyContext);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [conference, setConference] = useState(''); // New state for conferencing
  const [calendar, setCalendar] = useState('rutikdarekar7'); // Default calendar
  
  // New states for participant management
  const [participantsList, setParticipantsList] = useState([]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const modalRef = useRef(null);
  const timezoneRef = useRef(null);
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);
  const emailInputRef = useRef(null);

  const TIMEZONES = [
    'Africa/Abidjan', 'Africa/Accra', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
    'America/Chicago', 'America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo', 'America/Toronto',
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo',
    'Australia/Melbourne', 'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Europe/Moscow', 'Europe/Paris',
    'Pacific/Auckland', 'Pacific/Honolulu', 'UTC',
  ];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  });

  const durationOptions = ['15m', '30m', '45m', '1h', '1h 30m', '2h'];
  const repeatOptions = ['Does not repeat', 'Daily', 'Weekly', 'Monthly'];
  const filteredTimezones = TIMEZONES.filter((tz) =>
    tz.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const handleEndDateChange = (date) => {
    if (date >= startDate) setEndDate(date);
    else setEndDate(startDate);
    setShowEndDatePicker(false);
  };

  // Adjust end date if end time is earlier than start time
  const adjustEndDateTime = (newStartTime, newEndTime) => {
    const [startHour, startMin, startPeriod] = newStartTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
    const [endHour, endMin, endPeriod] = newEndTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];

    let startHour24 = startPeriod === 'PM' && startHour !== '12' ? +startHour + 12 : +startHour;
    if (startPeriod === 'AM' && startHour === '12') startHour24 = 0;
    let endHour24 = endPeriod === 'PM' && endHour !== '12' ? +endHour + 12 : +endHour;
    if (endPeriod === 'AM' && endHour === '12') endHour24 = 0;

    const startTotalMins = startHour24 * 60 + +startMin;
    const endTotalMins = endHour24 * 60 + +endMin;

    if (startTotalMins > endTotalMins) {
      const newEndDate = new Date(endDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setEndDate(newEndDate);
    } else if (startTotalMins <= endTotalMins && endDate > startDate) {
      setEndDate(new Date(startDate));
    }
  };

  // Add participant validation and handling functions
  const handleAddParticipant = () => {
    if (!participantEmail) {
      setFormErrors({...formErrors, participantEmail: 'Email is required'});
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participantEmail)) {
      setFormErrors({...formErrors, participantEmail: 'Please enter a valid email'});
      return;
    }
    
    setParticipantsList([...participantsList, participantEmail]);
    setParticipantEmail('');
    setFormErrors({...formErrors, participants: null, participantEmail: null});
  };

  const removeParticipant = (email) => {
    setParticipantsList(participantsList.filter(p => p !== email));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!meetingTitle.trim()) {
      errors.meetingTitle = 'Meeting title is required';
    }
    
    if (participantsList.length === 0) {
      errors.participants = 'At least one participant is required';
    }
    
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (showMeetingScheduler && selectedBlocks.length > 0) {
      const sortedBlocks = selectedBlocks.sort((a, b) => a.slotIndex - b.slotIndex);
      const firstBlock = sortedBlocks[0];
      const lastBlock = sortedBlocks[sortedBlocks.length - 1];
      const day = firstBlock.day;
      const startSlotIndex = firstBlock.slotIndex;
      const endSlotIndex = lastBlock.slotIndex;

      const baseDate = new Date(viewDate);
      const dayIndex = days.indexOf(day);
      baseDate.setDate(viewDate.getDate() - viewDate.getDay() + dayIndex);

      const startSlot = timeSlots[startSlotIndex];
      const startDateTime = new Date(baseDate);
      startDateTime.setHours(startSlot.hour, startSlot.min, 0, 0);
      setStartDate(new Date(startDateTime));
      const newStartTime = `${startSlot.hour % 12 || 12}:${startSlot.min === 0 ? '00' : '30'} ${startSlot.hour >= 12 ? 'PM' : 'AM'}`;
      setStartTime(newStartTime);

      const endSlot = timeSlots[endSlotIndex];
      const endDateTime = new Date(baseDate);
      let endHour = endSlot.hour;
      let endMin = endSlot.min + 30;
      if (endMin >= 60) {
        endHour += 1;
        endMin = 0;
        if (endHour >= 24) {
          endHour -= 24;
          endDateTime.setDate(endDateTime.getDate() + 1);
        }
      }
      endDateTime.setHours(endHour, endMin, 0, 0);
      setEndDate(new Date(endDateTime));
      const newEndTime = `${endHour % 12 || 12}:${endMin === 0 ? '00' : '30'} ${endHour >= 12 ? 'PM' : 'AM'}`;
      setEndTime(newEndTime);

      const durationMinutes = (endSlotIndex - startSlotIndex + 1) * 30;
      setDuration(durationMinutes >= 60 ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : `${durationMinutes}m`);

      setMeetingTitle('');
      setParticipantsList([]);
      setParticipantEmail('');
      setRepeatOption('Does not repeat');
      setLocation('');
      setDescription('');
      setConference('');
      setCalendar('rutikdarekar7');
      setTimezone('Asia/Kolkata');
    } else if (showMeetingScheduler && selectedBlocks.length === 0 && events.length > 0) {
      const eventToEdit = events.find((event) => {
        const start = new Date(event.startDate);
        const [startHour, startMin, startPeriod] = event.startTime.match(/(\d+):(\d+)\s*([AP]M)/i)?.slice(1) || [];
        if (startHour && startMin && startPeriod) {
          start.setHours(startPeriod === 'PM' && startHour !== '12' ? +startHour + 12 : +startHour, +startMin, 0, 0);
          return Math.abs(start - viewDate) < 24 * 60 * 60 * 1000;
        }
        return false;
      });
      if (eventToEdit) {
        setEditingEventIndex(events.indexOf(eventToEdit));
        setMeetingTitle(eventToEdit.meetingTitle);
        // Convert participants string to array if needed
        setParticipantsList(Array.isArray(eventToEdit.participants) ? 
                         eventToEdit.participants : 
                         (eventToEdit.participants ? [eventToEdit.participants] : []));
        setStartDate(new Date(eventToEdit.startDate));
        setStartTime(eventToEdit.startTime);
        setEndDate(new Date(eventToEdit.endDate));
        setEndTime(eventToEdit.endTime);
        setDuration(eventToEdit.duration);
        setIsAllDay(eventToEdit.isAllDay);
        setRepeatOption(eventToEdit.repeatOption);
        setLocation(eventToEdit.location || '');
        setDescription(eventToEdit.description || '');
        setTimezone(eventToEdit.timezone);
        setConference(eventToEdit.conference || '');
        setCalendar(eventToEdit.calendar || 'rutikdarekar7');
      }
    }
  }, [showMeetingScheduler, selectedBlocks, timeSlots, days, viewDate, events]);

  const handleSave = () => {
    if (validateForm()) {
      const newEvent = {
        meetingTitle,
        participants: participantsList,
        startDate: new Date(startDate),
        startTime,
        endDate: new Date(endDate),
        endTime,
        duration,
        isAllDay,
        repeatOption,
        location,
        description,
        timezone,
        conference,
        calendar,
      };
      
      setEvents((prev) => {
        const updated = [...prev];
        if (editingEventIndex !== null) updated[editingEventIndex] = newEvent;
        else updated.push(newEvent);
        return updated;
      });
      
      setEditingEventIndex(null);
      resetMeetingStates();
      setShowMeetingScheduler(false);
      setSelectedBlocks([]);
    }
  };

  const handleClose = () => {
    resetMeetingStates();
    setShowMeetingScheduler(false);
    setSelectedBlocks([]);
    setEditingEventIndex(null);
    setFormErrors({});
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && showMeetingScheduler && handleClose();
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) handleClose();
      if (timezoneRef.current && !timezoneRef.current.contains(e.target) && showTimezonePanel) setShowTimezonePanel(false);
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(e.target) && showStartDatePicker) setShowStartDatePicker(false);
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(e.target) && showEndDatePicker) setShowEndDatePicker(false);
    };
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMeetingScheduler, showTimezonePanel, showStartDatePicker, showEndDatePicker]);

  return (
    <>
      {showMeetingScheduler && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="input-group">
              <input
                value={meetingTitle}
                onChange={(e) => {
                  setMeetingTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setFormErrors({...formErrors, meetingTitle: null});
                  }
                }}
                placeholder="Add title"
                className={`meeting-title ${formErrors.meetingTitle ? 'error-input' : ''}`}
              />
              {formErrors.meetingTitle && (
                <p className="error-message">{formErrors.meetingTitle}</p>
              )}
            </div>
            
            <div className="date-time-section">
              <div className="date-time-row">
                <div className="date-picker-wrapper">
                  <button onClick={() => setShowStartDatePicker(true)} className="date-button">
                    {startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </button>
                  {showStartDatePicker && (
                    <div className="date-picker-modal" ref={startDatePickerRef}>
                      <DatePicker
                        onDateSelect={(date) => {
                          setStartDate(date);
                          setShowStartDatePicker(false);
                          if (date > endDate) setEndDate(date);
                        }}
                      />
                    </div>
                  )}
                </div>
                <select
                  value={startTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    setStartTime(newStartTime);
                    adjustEndDateTime(newStartTime, endTime);
                  }}
                  className="time-select"
                  disabled={isAllDay}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span>→</span>
                <div className="date-picker-wrapper">
                  <button onClick={() => setShowEndDatePicker(true)} className="date-button">
                    {endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </button>
                  {showEndDatePicker && (
                    <div className="date-picker-modal" ref={endDatePickerRef}>
                      <DatePicker onDateSelect={handleEndDateChange} minDate={startDate} />
                    </div>
                  )}
                </div>
                <select
                  value={endTime}
                  onChange={(e) => {
                    const newEndTime = e.target.value;
                    setEndTime(newEndTime);
                    adjustEndDateTime(startTime, newEndTime);
                  }}
                  className="time-select"
                  disabled={isAllDay}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <label className="all-day-toggle">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  All day
                </label>
              </div>
            </div>
            
            {/* Updated participants section with email validation */}
            <div className="input-group">
              <div className={`participants-container ${formErrors.participants ? 'error-container' : ''}`}>
                <div className="email-input-row">
                  <input
                    ref={emailInputRef}
                    value={participantEmail}
                    onChange={(e) => {
                      setParticipantEmail(e.target.value);
                      if (formErrors.participantEmail) {
                        setFormErrors({...formErrors, participantEmail: null});
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddParticipant();
                      }
                    }}
                    placeholder="Add participants (email required)"
                    className="participants"
                  />
                  <button 
                    onClick={handleAddParticipant}
                    className="add-participant-btn"
                  >
                    Add
                  </button>
                </div>
                
                {formErrors.participantEmail && (
                  <p className="error-message">{formErrors.participantEmail}</p>
                )}
                
                {formErrors.participants && (
                  <p className="error-message">{formErrors.participants}</p>
                )}
                {
                    participantsList.length > 0 ?   <div className="participants-list">
                    {participantsList.map((email, index) => (
                      <div 
                        key={index} 
                        className="participant-tag"
                      >
                        <span>{email}</span>
                        <button 
                          onClick={() => removeParticipant(email)}
                          className="remove-participant-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  : ""
                }
              
              </div>
            </div>
            
            <div className="input-group">
              <input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (e.target.value.trim()) {
                    setFormErrors({...formErrors, location: null});
                  }
                }}
                placeholder="Event location"
                className={`location ${formErrors.location ? 'error-input' : ''}`}
              />
              {formErrors.location && (
                <p className="error-message">{formErrors.location}</p>
              )}
            </div>
            
            {/* <div className="input-group">
              <select
                value={conference}
                onChange={(e) => setConference(e.target.value)}
                className="conference-select"
              >
                <option value="">Add conferencing</option>
                <option value="google-meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
              </select>
            </div> */}
            
            <div className="input-group">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Type details" 
                className="description" 
              />
            </div>
            
            <div className="action-buttons">
              <button onClick={handleSave} className="save-button">Save</button>
              <button onClick={handleClose} className="close-button">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingScheduler;