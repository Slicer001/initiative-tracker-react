import { createRoot } from 'react-dom/client'
import './fonts.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookLoader from './pages/BookLoader.jsx'
import StatBlockRenderer from './pages/StatBlockRenderer.jsx'
import InitiativeTracker from './pages/InitiativeTracker.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/book-loader" element={<BookLoader />} />

      <Route path="/creature/:name" element={<StatBlockRenderer />} />

      <Route path="/initiative-tracker" element={<InitiativeTracker />} />
    </Routes>
  </BrowserRouter>
)
