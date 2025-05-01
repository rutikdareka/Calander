import React, { useContext, useMemo } from 'react';
import { MyContext } from '../context/Context';
import MinimalCalendarHeader from './minimalcalanderheader';

const Header = () => {
  const { viewDate, selectedView } = useContext(MyContext);

  // Days configuration
  const days = ["Rutik","Rahul","Imam","Rose","Ali","Heayoun","D.Cal"];

  // Determine the days to display based on selectedView
  const displayedDays = useMemo(() => {
    if (selectedView === 'Day') {
      const currentDay = new Date(viewDate).getDay();
      return [days[currentDay]]; // Only the current day
    } 
    else if (selectedView === 'Work Week') {
      return days.slice(1, 6); // Monday to Friday
    } else if (selectedView === 'Week') {
      return days; // Sunday to Saturday
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
      <div className={`grid-header ${gridClass}`}>
        {selectedView === 'Month' ? (
          <div className="month-range">{getMonthRange}</div>
        ) : (
          <>
            {/* <div className="month-range">{getMonthRange}</div> */}
            <div className="time-header"></div>
            {displayedDays.map((day, index) => (
              <div key={index} className="day-header">
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