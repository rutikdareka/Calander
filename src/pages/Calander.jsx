import CalendarView from "../components/calander/CalanderView"
import LeftSide from "../components/calander/leftside"
import "../components/styles/viewcalander.css"


function Calander() {
    return (
        <div className="calendar-container">
            <div className="sub_container">
                <LeftSide />
                <CalendarView />
            </div>
        </div>
    )

}

export default Calander