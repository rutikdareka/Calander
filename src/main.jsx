import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MyProvider } from './components/context/Provider';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MyProvider>

    <App />
    </MyProvider>
  </StrictMode>,
)
