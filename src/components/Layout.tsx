import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-700 text-white'
      : 'text-teal-900 hover:bg-teal-100'
  }`

export function Layout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col">
      <header className="sticky top-0 z-10 border-b border-teal-200/80 bg-teal-50/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-teal-900">
            BioMika
          </h1>
          <span className="text-xs text-teal-700/80">Local · sin nube</span>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/registro" className={linkClass}>
            Registro
          </NavLink>
          <NavLink to="/historial" className={linkClass}>
            Historial
          </NavLink>
          <NavLink to="/perfil" className={linkClass}>
            Perfil
          </NavLink>
          <NavLink to="/tendencias" className={linkClass}>
            Tendencias
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 px-4 py-5">
        <Outlet />
      </main>
    </div>
  )
}
