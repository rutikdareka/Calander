import { useContext, useRef, useEffect } from 'react';
import { MyContext } from '../context/Context';

const MinimalCalendarHeader = () => {
  const {
    viewDate,
    navigateFiveDays,
    selectedView,
    setSelectedView,
    isWeekMenuOpen,
    setIsWeekMenuOpen,
    isNewEventHovered,
    setIsNewEventHovered,
    isTodayHovered,
    setIsTodayHovered,
    showMeetingScheduler,
    setShowMeetingScheduler,
    setViewDate,
  } = useContext(MyContext);

  const viewOptions = ['Day', 'Work Week', 'Week'];
  const dropdownRef = useRef(null);

  const getMonthYearHeader = () => {
    const startDate = new Date(viewDate);
    let endDate = new Date(viewDate);

    if (selectedView === 'Week') {
      const dayOfWeek = startDate.getDay();
      const daysToSunday = dayOfWeek;
      startDate.setDate(startDate.getDate() - daysToSunday);
      endDate.setDate(startDate.getDate() + 6);
    } else if (selectedView === 'Work Week') {
      const dayOfWeek = startDate.getDay();
      const daysToMonday = (dayOfWeek + 6) % 7; // Adjust to start on Monday
      startDate.setDate(startDate.getDate() - daysToMonday);
      endDate.setDate(startDate.getDate() + 4); // 5 days (Monday to Friday)
    } else if (selectedView === 'Month') {
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0); // Last day of the month
    } else if (selectedView === 'Day') {
      endDate = new Date(startDate); // Same as startDate for Day view
    }

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'long' });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (selectedView === 'Day') {
      return startDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWeekMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsWeekMenuOpen]);

  const handleViewSelect = (view) => {
    setSelectedView(view);
    setIsWeekMenuOpen(false);
    if (view === 'Day') {
      setViewDate(new Date()); // Reset to current day
    } else if (view === 'Work Week') {
      const newDate = new Date(viewDate);
      const dayOfWeek = newDate.getDay();
      const daysToMonday = (dayOfWeek + 6) % 7;
      newDate.setDate(newDate.getDate() - daysToMonday);
      setViewDate(newDate);
    } else if (view === 'Week') {
      const newDate = new Date(viewDate);
      const dayOfWeek = newDate.getDay();
      const daysToSunday = dayOfWeek;
      newDate.setDate(newDate.getDate() - daysToSunday);
      setViewDate(newDate);
    } else if (view === 'Month') {
      const newDate = new Date(viewDate);
      newDate.setDate(1);
      setViewDate(newDate);
    }
  };

  return (
    <div className="calendarM-header">
      <div className="header-container">
        <div className="mixup_switching">
          <button
            className={`today-button ${isTodayHovered ? 'today-button-hover' : ''}`}
            onMouseEnter={() => setIsTodayHovered(true)}
            onMouseLeave={() => setIsTodayHovered(false)}
            onClick={() => setViewDate(new Date())}
          >
            Today
          </button>
          <div className="switching_btns">
            <button onClick={() => navigateFiveDays(-1)}>
              <svg
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
              </svg>
            </button>
            <button onClick={() => navigateFiveDays(1)}>
              <svg
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
              </svg>
            </button>
          </div>
          {/* <div className="month-year-header">{getMonthYearHeader()}</div> */}
          <div className="month-year-header">{viewDate.toLocaleDateString("en-US", {
              year: "numeric",   // 2025
              month: "long",     // May
              day:  "numeric",    // 1
              weekday: "long",   // Thursday
  })}</div>
        </div>

        <div className="right-controls">
          <button
            className={`new-event-button ${isNewEventHovered ? 'new-event-button-hover' : ''}`}
            onMouseEnter={() => setIsNewEventHovered(true)}
            onMouseLeave={() => setIsNewEventHovered(false)}
            onClick={() => setShowMeetingScheduler(true)}
          >
            <svg
              className={`plus-icon ${isNewEventHovered ? 'plus-icon-rotate' : ''}`}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>New Event</span>
          </button>

          <div className="dropdown-container" ref={dropdownRef}>
            <button
              className={`view-selector-button ${isWeekMenuOpen ? 'view-selector-active' : ''}`}
              onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            >
              <span>{selectedView}</span>
              <svg
                className={`chevron-icon ${isWeekMenuOpen ? 'chevron-rotate' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isWeekMenuOpen && (
              <div className="dropdown-menu">
                {viewOptions.map((option) => (
                  <div
                    key={option}
                    className={`dropdown-item ${selectedView === option ? 'dropdown-item-selected' : ''}`}
                    onClick={() => handleViewSelect(option)}
                  >
                    <svg
                      className="calendar-icon"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 2v4M8 2v4M3 10h18"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalCalendarHeader;