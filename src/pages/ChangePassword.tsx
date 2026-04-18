import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'

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
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validate form
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
        setForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        
        // Call the callback to clear isFirstLogin flag
        onPasswordChanged()
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message ?? 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-blue-900">Change Password</h1>
          <p className="text-sm text-blue-600">
            You are logging in for the first time. Please create a new password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Current Password</span>
            <input
              type="password"
              name="current-password"
              value={form.currentPassword}
              onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
            <p className="text-xs text-blue-500">Hint: Your original password is your surname from full name</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">New Password</span>
            <input
              type="password"
              name="new-password"
              value={form.newPassword}
              onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Enter your new password"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Confirm New Password</span>
            <input
              type="password"
              name="confirm-password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Confirm your new password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
