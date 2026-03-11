import React, { useMemo, useState } from 'react'
import AdminPanel from '../components/AdminPanel'
import '../components/AdminPanel.css'

const AdminApp: React.FC = () => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authHeader = useMemo(() => {
    const token = btoa(`${username}:${password}`)
    return { Authorization: `Basic ${token}` }
  }, [username, password])

  const tryLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/health', { headers: { ...authHeader } })
      if (!res.ok) throw new Error('Невірні дані або доступ заборонено')
      setAuthed(true)
    } catch (err: any) {
      setError(err?.message || 'Помилка авторизації')
    }
  }

  if (!authed) {
    return (
      <div className="admin-panel__backdrop" style={{ inset: 0, position: 'fixed' }}>
        <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
          <div className="admin-panel__header">
            <h3>Admin Login</h3>
          </div>
          <form className="admin-panel__auth" onSubmit={tryLogin}>
            <input type="text" placeholder="Користувач" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="admin-btn" type="submit">Увійти</button>
          </form>
          {error && <div className="admin-panel__error">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <AdminPanel isOpen={true} onClose={() => setAuthed(false)} />
  )
}

export default AdminApp


