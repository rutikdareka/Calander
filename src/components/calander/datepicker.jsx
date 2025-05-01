import React, { useContext, useMemo, useEffect } from 'react';
import '../styles/datepicker.css';
import { MyContext } from '../context/Context';

const TIMEZONES = [
  'Africa/Abidjan', 'Africa/Accra', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
  'America/Chicago', 'America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo', 'America/Toronto',
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Melbourne', 'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Europe/Moscow', 'Europe/Paris',
  'Pacific/Auckland', 'Pacific/Honolulu', 'UTC',
];

export default function DatePicker(showtimedate=true) {
  const {
    currentDate,
    setCurrentDate,
    viewDate,
    setViewDate,
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
    showMeetingScheduler
  } = useContext(MyContext);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, [setCurrentDate]);

  const monthYearHeader = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const daysArray = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayIndex = firstDay.getDay();
    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    for (let i = 1; i <= 42 - days.length; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [viewDate]);

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isInFiveDayRange = (date) => {
    const startDate = new Date(viewDate);
    startDate.setHours(0, 0, 0, 0); // Normalize to midnight
    const endDate = new Date(viewDate);
    endDate.setDate(viewDate.getDate() + 4);
    endDate.setHours(23, 59, 59, 999); // End of the fifth day

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0); // Normalize to midnight

    return checkDate >= startDate && checkDate <= endDate;
  };

  const formattedTime = useMemo(() => {
    try {
      const time = new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const date = new Date().toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      return `${time} · ${date}`;
    } catch (e) {
      return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  }, [timezone, currentDate]);

  const filteredTimezones = useMemo(() => {
    return TIMEZONES.filter((tz) => tz.toLowerCase().includes(timezoneSearch.toLowerCase()));
  }, [timezoneSearch]);

  return (
    <div className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => handleYearChange(-1)} className="nav-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
  <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
</svg></button>
          <button onClick={() => navigateMonth(-1)} className="nav-button"> <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                />
              </svg></button>
          <div className="header-title">{monthYearHeader}</div>
          <button onClick={() => navigateMonth(1)} className="nav-button">  <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-right"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                />
              </svg></button>
          <button onClick={() => handleYearChange(1)} className="nav-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
  <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
</svg></button>
        </div>

        <div className="calendar-grid">
          <div className="weekday-headers">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day,i) => (
              <div key={i} className="weekday-header">{day}</div>
            ))}
          </div>
          <div className="days-grid">
  {daysArray.map((dayObj, index) => (
    <div
      key={index}
      className={`day-cell 
        ${!dayObj.isCurrentMonth ? 'other-month' : ''} 
        ${isToday(dayObj.date) ? 'today' : ''} 
        ${isSelected(dayObj.date) ? 'selected' : ''} 
        ${isInFiveDayRange(dayObj.date) ? 'five-day-range' : ''}`}
      onClick={() => setSelectedDate(new Date(dayObj.date))}
    >
      {dayObj.date.getDate()}
    </div>
  ))}
</div>
        </div>
        {
            showMeetingScheduler == false ?
        <div className="timezone-section">
          {showTimezonePanel && (
            <div className="timezone-panel">
              <input
                type="text"
                value={timezoneSearch}
                onChange={(e) => setTimezoneSearch(e.target.value)}
                placeholder="Search timezone..."
                className="search-input"
              />
              <div className="timezone-list">
                {filteredTimezones.map((tz) => (
                  <div
                    key={tz}
                    className={`timezone-item ${timezone === tz ? 'selected' : ''}`}
                    onClick={() => {
                      setTimezone(tz);
                      setShowTimezonePanel(false);
                      setTimezoneSearch('');
                    }}
                  >
                    <span className="timezone-city">{tz.split('/').pop().replace('_', ' ')}</span>
                    <span className="timezone-region">{tz.split('/')[0]}</span>
                    {timezone === tz && <span className="checkmark-icon">✔</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
            <div className="timezone-header">
            <div className="time-display">{formattedTime}</div>
            <button
              onClick={() => setShowTimezonePanel((prev) => !prev)}
              className="timezone-button"
            >
              🌐 {timezone.split('/').pop().replace('_', ' ')}
            </button>
          </div>
         
         
        </div>
 : ""}
      </div>
    </div>
  );
}