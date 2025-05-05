import React, { useContext, useMemo } from 'react';
import { MyContext } from '../context/Context';
import MinimalCalendarHeader from './minimalcalanderheader';

const Header = () => {
  const { viewDate, selectedView } = useContext(MyContext);

  // Days configuration
  const days = ["Rutik", "Rahul", "Imam", "Rose", "Ali", "Heayoun", "D.Cal", "JHop", "KIM", "JISO", "Junkoog", "Ronaldo", "Mark", "Sajang-youn"];

  // Determine the days to display based on selectedView
  const displayedDays = useMemo(() => {
    if (selectedView === 'Day') {
      const currentDay = new Date(viewDate).getDay();
      return [days[currentDay]]; // Only the current day
    } else if (selectedView === 'Work Week') {
      return days.slice(1, 6); // Monday to Friday
    } else if (selectedView === 'Week') {
      return days; // All days
    } else if (selectedView === 'Month') {
      return []; // For Month view, we won't show day names in this section
    }
    return days;
  }, [selectedView, viewDate]);

  // Determine month range for display
  const getMonthRange = useMemo(() => {
    const startDate = new Date(viewDate);
    let endDate = new Date(viewDate);

    if (selectedView === 'Week') {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      endDate.setDate(startDate.getDate() + 6);
    } else if (selectedView === 'Work Week') {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - ((dayOfWeek + 6) % 7));
      endDate.setDate(startDate.getDate() + 4);
    } else if (selectedView === 'Month') {
      startDate.setDate(1);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
    }

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
  }, [viewDate, selectedView]);

  // Determine the CSS class for the grid based on selectedView
  const gridClass = useMemo(() => {
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

  return (
    <div className="manage_header">
      <MinimalCalendarHeader />
      <div
        className={`grid-header ${gridClass}`}
        style={{
          display: 'flex',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        <style>
          {`
            .grid-header::-webkit-scrollbar {
              display: none; /* Hide scrollbar for Chrome, Safari */
            }
          `}
        </style>
        {selectedView === 'Month' ? (
          <div className="month-range">{getMonthRange}</div>
        ) : (
          <>
            <div
              className="time-header"
              style={{
                width: '80px',
                flexShrink: 0,
                padding: '10px',
                boxSizing: 'border-box',
              }}
            ></div>
            {displayedDays.map((day, index) => (
              <div
                key={index}
                className="day-header"
                style={{
                  width: '120px',
                  flexShrink: 0,
                  textAlign: 'center',
                  padding: '10px 0',
                  fontWeight: 'bold',
                  borderRight: '1px solid #444',
                  boxSizing: 'border-box',
                }}
              >
                {day}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;