import "../styles/leftside.css"
import DatePicker from "./datepicker"


const LeftSide = () => {
    return <>
        <div className="calander_left_side">
            <div className="wrapped_left_side">
                <div className="logo">
                    <span className="name_of">Calendar</span>
                </div>
                <DatePicker/>
            </div>
        </div>
    </>
}

export default LeftSide