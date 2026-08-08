import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import AuthLeftPane from '../components/AuthLeftPane'

type ChangePasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type ChangePasswordPageProps = {
  onPasswordChanged: () => void
}

export default function ChangePassword({ onPasswordChanged }: ChangePasswordPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<ChangePasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading]       = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setErrorMessage('All fields are required.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage('New password and confirm password do not match.')
      return
    }
    if (form.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('api/Auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      if (response.status === 200) {
        setSuccessMessage('Password changed successfully. Redirecting...')
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        onPasswordChanged()
        setTimeout(() => { navigate('/dashboard') }, 1500)
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      setErrorMessage(err.response?.data?.message ?? 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen w-full items-center gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[0.84fr_1.16fr] lg:px-6 lg:py-6">
        <AuthLeftPane />

        <section className="w-full">
          <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                First Login
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Set your password</h2>
              <p className="text-sm leading-6 text-slate-500">
                You are logging in for the first time. Create a new password to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {errorMessage}
                </div>
              ) : null}
              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                  {successMessage}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="current-password" className="text-sm font-semibold text-slate-800">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  name="current-password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  className={inputCls}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  required
                />
                <p className="px-1 text-xs text-slate-500">Hint: your default password is your surname.</p>
              </div>

              {/* New + Confirm side-by-side on lg */}
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-sm font-semibold text-slate-800">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    name="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    className={inputCls}
                    placeholder="New password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-800">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirm-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    className={inputCls}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-600 hover:via-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Changing password...
                  </>
                ) : 'Change Password'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
