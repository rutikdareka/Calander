import React, { useContext, useState, useEffect, useRef } from 'react';
import { MyContext } from '../context/Context';
import DatePicker from './datePicker';
import '../styles/model.css';

const MeetingScheduler = ({ isEventBlock, getEventForSlot, selectedBlocks, setSelectedBlocks, setEvents }) => {
    const {
        timezone, setTimezone,
        showTimezonePanel, setShowTimezonePanel,
        timezoneSearch, setTimezoneSearch,
        startDate, setStartDate,
        startTime, setStartTime,
        endDate, setEndDate,
        endTime, setEndTime,
        duration, setDuration,
        isAllDay, setIsAllDay,
        meetingTitle, setMeetingTitle,
        participants, setParticipants,
        repeatOption, setRepeatOption,
        location, setLocation,
        description, setDescription,
        resetMeetingStates,
        showMeetingScheduler, setShowMeetingScheduler,
        timeSlots, viewDate, days, events,
    } = useContext(MyContext);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [editingEventIndex, setEditingEventIndex] = useState(null);
    const [conference, setConference] = useState('');
    const [calendar, setCalendar] = useState('rutikdarekar7');
    const [participantsList, setParticipantsList] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [participantInput, setParticipantInput] = useState('');
    const modalRef = useRef(null);
    const timezoneRef = useRef(null);
    const startDatePickerRef = useRef(null);
    const endDatePickerRef = useRef(null);
    const emailInputRef = useRef(null);

    const [participantNameInput, setParticipantNameInput] = useState('');
    const [availableParticipants] = useState([
        "Rutik", "Rahul", "Imam", "Rose", "Ali", "Heayoun", "D.Cal",
        "JHop", "KIM", "JISO", "Junkoog", "Ronaldo", "Mark", "Sajang-youn"
    ]);

    const suggestions = availableParticipants.filter(
        (participant) =>
            participant.toLowerCase().includes(participantNameInput.toLowerCase()) &&
            !participantsList.includes(participant)
    );

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

    const handleAddParticipant = (inputValue = participantInput) => {
        if (!inputValue) {
            setFormErrors({ ...formErrors, participantInput: 'Participant is required' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(inputValue);

        const isName = availableParticipants.some(
            (participant) => participant.toLowerCase() === inputValue.toLowerCase()
        );

        if (!isEmail && !isName) {
            const matchingSuggestion = suggestions.find(
                (suggestion) => suggestion.toLowerCase() === inputValue.toLowerCase()
            );
            if (matchingSuggestion) {
                if (!participantsList.includes(matchingSuggestion)) {
                    setParticipantsList([...participantsList, matchingSuggestion]);
                    setParticipantInput('');
                    setParticipantNameInput('');
                    setFormErrors({ ...formErrors, participants: null, participantInput: null });
                }
                return;
            }

            if (inputValue.includes('@')) {
                setFormErrors({ ...formErrors, participantInput: 'Please enter a valid email' });
                return;
            } else {
                setFormErrors({ ...formErrors, participantInput: 'Participant not found' });
                return;
            }
        }

        if (!participantsList.includes(inputValue)) {
            const updatedList = [...participantsList, inputValue];
            setParticipantsList(updatedList);
            setParticipantInput('');
            setParticipantNameInput('');
            setFormErrors({ ...formErrors, participants: null, participantInput: null });
        }
    };

    const Settheblockevent = (participants) => {
        if (participants.length === 0) return;
    
        const [startHour, startMinute, startPeriod] = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
        let startHour24 = startPeriod === 'PM' && startHour !== '12' ? +startHour + 12 : +startHour;
        if (startPeriod === 'AM' && startHour === '12') startHour24 = 0;
        const startMin = parseInt(startMinute);
    
        const startSlotIndex = timeSlots.findIndex(
            (slot) => slot.hour === startHour24 && slot.min === startMin
        );
    
        if (startSlotIndex === -1) {
            console.error(`Slot not found for startTime: ${startTime}`);
            return;
        }
    
        const durationMatch = duration.match(/(\d+)(h)?\s*(\d*)(m)?/);
        let durationMinutes = 0;
        if (durationMatch) {
            const hours = parseInt(durationMatch[1]) || 0;
            const minutes = parseInt(durationMatch[3]) || 0;
            durationMinutes = hours * 60 + minutes;
        }
        const slotDuration = 30;
        const numSlots = Math.ceil(durationMinutes / slotDuration);
    
        const newBlocks = new Map();
    
        participants.forEach((participant) => {
            // Find the exact day column that matches this participant
            // This ensures we're adding the event to the correct participant's column
            const participantDay = days.find((day) => day === participant);
            
            console.log(participantDay)

            if (!participantDay) {
                console.warn(`No column found for participant "${participant}"`);
                return;
            }
    
            for (let i = 0; i < numSlots; i++) {
                const slotIndex = startSlotIndex + i;
    
                if (slotIndex >= timeSlots.length) {
                    console.warn(`Slot index ${slotIndex} exceeds timeSlots length for participant ${participant}`);
                    break;
                }
    
                const blockKey = `${participantDay}-${slotIndex}`;
    
                if (!newBlocks.has(blockKey)) {
                    const blockExists = isEventBlock(participantDay, slotIndex);
                    const existingEvent = blockExists ? getEventForSlot(participantDay, slotIndex) : null;
                   
                    if (!existingEvent) {
                        console.log(blockExists)
                        newBlocks.set(blockKey, {
                            day: participantDay,
                            slotIndex,
                        });
                       
                    } else {
                        console.log(`Slot already occupied for ${participant} at slot ${slotIndex}:`, existingEvent);
                    }
                }
            }
        });
        setSelectedBlocks((prevBlocks) => {
            const existingBlockSet = new Set(prevBlocks.map((b) => `${b.day}-${b.slotIndex}`));
            const combinedBlocks = [
                ...prevBlocks,
                ...Array.from(newBlocks.values()).filter((b) => !existingBlockSet.has(`${b.day}-${b.slotIndex}`)),
            ];
            return combinedBlocks;
        });
    };

    const removeParticipant = (participant) => {
        setParticipantsList(participantsList.filter(p => p !== participant));
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

    const resetAllStates = () => {
        // Reset all form states
        resetMeetingStates();
        setParticipantsList([]);
        setParticipantInput('');
        setParticipantNameInput('');
        setFormErrors({});
        setConference('');
        setCalendar('rutikdarekar7');
        setEditingEventIndex(null);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
    };

    useEffect(() => {
        if (showMeetingScheduler) {
            if (selectedBlocks.length > 0) {
                const sortedBlocks = [...selectedBlocks].sort((a, b) => a.slotIndex - b.slotIndex);
                const firstBlock = sortedBlocks[0];
                const lastBlock = sortedBlocks[sortedBlocks.length - 1];
                const day = firstBlock.day;
    
                const allSameDay = sortedBlocks.every(block => block.day === day);
                if (!allSameDay) {
                    console.error("Selected blocks are on different days:", sortedBlocks);
                    setSelectedBlocks([firstBlock]);
                    return;
                }
    
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
                setParticipantsList([]); // Reset participants properly
                setParticipantInput('');
                setParticipantNameInput('');
                setRepeatOption('Does not repeat');
                setLocation('');
                setDescription('');
                setConference('');
                setCalendar('rutikdarekar7');
                setTimezone('Asia/Kolkata');
            } else if (events.length > 0) {
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
                    setParticipantsList(Array.isArray(eventToEdit.participants) ? eventToEdit.participants : (eventToEdit.participants ? [eventToEdit.participants] : []));
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
        }
    }, [showMeetingScheduler, selectedBlocks, timeSlots, days, viewDate, events]);

    const handleSave = (e) => {
        const normalizeTime = (time) => {
            const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return time;
            const [_, hours, minutes, period] = match;
            const adjustedHours = parseInt(hours, 10) === 0 ? 12 : parseInt(hours, 10);
            return `${adjustedHours}:${minutes.padStart(2, '0')} ${period.toUpperCase()}`;
        };
    
        const normalizedStartTime = normalizeTime(startTime);
        const normalizedEndTime = normalizeTime(endTime);
    
        if (validateForm()) {
            let participantsToUse = participantsList;
            if (participantsList.length === 0) {
                console.warn('No participants provided; defaulting to first column in days:', days[0]);
                participantsToUse = [days[0]]; // Default to "Rutik"
            }
    
            const newEvents = participantsToUse.map((participant) => {
                const participantDay = days.find((day) => day.toLowerCase() === participant.toLowerCase());
                if (!participantDay) {
                    console.error(`Invalid participant "${participant}". Available days: ${days.join(', ')}`);
                    return null;
                }
                const event = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    meetingTitle,
                    participants: [participant],
                    startDate: new Date(startDate),
                    startTime: normalizedStartTime,
                    endTime: normalizedEndTime,
                    endDate: new Date(endDate),
                    duration,
                    isAllDay,
                    repeatOption,
                    location,
                    description,
                    timezone,
                    conference,
                    calendar: participant, // Ensure calendar is always set to participant's name
                };
                console.log('Created event:', event);
                return event;
            }).filter(event => event !== null);
    
            if (newEvents.length === 0) {
                console.error('No valid events created; aborting save.');
                return;
            }
    
            setEvents((prevEvents) => {
                const updatedEvents = [...prevEvents, ...newEvents];
                console.log('Saved events:', updatedEvents);
                return updatedEvents;
            });
            Settheblockevent(participantsToUse);
            setEditingEventIndex(null);
            resetMeetingStates();
            setParticipantsList([]);
            setParticipantInput('');
            setFormErrors({});
            setShowMeetingScheduler(false);
            setSelectedBlocks([]);
        }
    };

    const handleClose = () => {
        // Completely reset all states when closing
        resetAllStates();
        setShowMeetingScheduler(false);
        setSelectedBlocks([]);
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

    // Reset participant inputs when modal is opened/closed
    useEffect(() => {
        if (!showMeetingScheduler) {
            setParticipantInput('');
            setParticipantNameInput('');
            setParticipantsList([]);
        }
    }, [showMeetingScheduler]);

    return (
        <>
            {showMeetingScheduler && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content" ref={modalRef}>
                        <div className="input-group">
                            <input
                                value={meetingTitle}
                                onChange={(e) => {
                                    setMeetingTitle(e.target.value);
                                    if (e.target.value.trim()) {
                                        setFormErrors({ ...formErrors, meetingTitle: null });
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

                        <div className="input-group">
                            <div className={`participants-container ${formErrors.participants ? 'error-container' : ''}`}>
                                <div className="email-input-row">
                                    <input
                                        ref={emailInputRef}
                                        value={participantInput}
                                        onChange={(e) => {
                                            setParticipantInput(e.target.value);
                                            setParticipantNameInput(e.target.value);
                                            setFormErrors({ ...formErrors, participantInput: null });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddParticipant();
                                            }
                                        }}
                                        placeholder="Add participants (name or email)"
                                        className="participants"
                                    />
                                    <button
                                        onClick={() => handleAddParticipant()}
                                        className="add-participant-btn"
                                    >
                                        Add
                                    </button>
                                </div>

                                {participantInput && suggestions.length > 0 && (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #ccc', borderRadius: "20px", maxHeight: '150px', overflowY: 'auto' }}>
                                        {suggestions.map((participant) => (
                                            <li
                                                key={participant}
                                                onClick={() => handleAddParticipant(participant)}
                                                style={{
                                                    padding: '5px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #ddd',
                                                    paddingBlock: "10px",
                                                    paddingLeft: "10px"
                                                }}
                                            >
                                                {participant}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {formErrors.participantInput && (
                                    <p className="error-message">{formErrors.participantInput}</p>
                                )}
                                {formErrors.participants && (
                                    <p className="error-message">{formErrors.participants}</p>
                                )}
                                {participantsList.length > 0 && (
                                    <div className="participants-list">
                                        {participantsList.map((participant, index) => (
                                            <div
                                                key={index}
                                                className="participant-tag"
                                            >
                                                <span>{participant}</span>
                                                <button
                                                    onClick={() => removeParticipant(participant)}
                                                    className="remove-participant-btn"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <input
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    if (e.target.value.trim()) {
                                        setFormErrors({ ...formErrors, location: null });
                                    }
                                }}
                                placeholder="Event location"
                                className={`location ${formErrors.location ? 'error-input' : ''}`}
                            />
                            {formErrors.location && (
                                <p className="error-message">{formErrors.location}</p>
                            )}
                        </div>

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