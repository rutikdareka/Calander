import './App.css'
import Calander from './pages/calander'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/Crediantials';

function App() {

  return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<Calander />} />
        <Route path="/authantication" element={<LoginPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
