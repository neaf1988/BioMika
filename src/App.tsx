import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { EntryPage } from './pages/EntryPage'
import { ProfilePage } from './pages/ProfilePage'
import { HistoryPage } from './pages/HistoryPage'
import { TrendsPage } from './pages/TrendsPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="registro" element={<EntryPage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="tendencias" element={<TrendsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
