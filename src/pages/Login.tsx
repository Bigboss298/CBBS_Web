import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLeftPane from '../components/AuthLeftPane'

type LoginPageProps = {
	isLoading: boolean
	errorMessage: string | null
	onLogin: (payload: { email: string; password: string }) => Promise<boolean>
}

type FieldShellProps = {
	id: string
	label: string
	value: string
	type?: string
	placeholder: string
	autoComplete?: string
	icon: React.ReactNode
	error?: string | null
	onChange: (value: string) => void
	onBlur: () => void
}

function UserIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="M20 21a8 8 0 0 0-16 0" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}

function LockIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<rect x="4" y="11" width="16" height="10" rx="2" />
			<path d="M8 11V7a4 4 0 0 1 8 0v4" />
		</svg>
	)
}

function EyeIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function EyeOffIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="m3 3 18 18" />
			<path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" />
			<path d="M7.5 7.9C4.7 9.7 3 12 3 12s3.5 7 9 7c1.4 0 2.7-.3 3.8-.8" />
			<path d="M10.1 5.3A8.7 8.7 0 0 1 12 5c5.5 0 9 7 9 7a19 19 0 0 1-3.1 4.2" />
		</svg>
	)
}

function FieldShell({ id, label, value, type = 'text', placeholder, autoComplete, icon, error, onChange, onBlur }: FieldShellProps) {
	const hasValue = value.trim().length > 0
	const hasError = Boolean(error)

	return (
		<div className="space-y-1.5">
			<div className="group relative">
				<span
					aria-hidden="true"
					className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-2 py-2 text-slate-400 transition ${hasError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 bg-white group-focus-within:border-blue-200 group-focus-within:text-blue-700'}`}
				>
					{icon}
				</span>
				<input
					id={id}
					type={type}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onBlur={onBlur}
					placeholder=" "
					autoComplete={autoComplete}
					spellCheck={false}
					className={`peer w-full rounded-2xl border bg-white px-4 pb-3.5 pt-6 pl-12 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition placeholder:text-transparent focus:-translate-y-0.5 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
				/>
				<label
					htmlFor={id}
					className={`absolute left-12 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-700 ${hasValue ? 'top-3 translate-y-0 text-xs font-semibold text-slate-500' : 'text-slate-500'}`}
				>
					{label}
				</label>
			</div>
			{error ? <p className="px-1 text-xs font-medium text-red-600">{error}</p> : <p className="px-1 text-xs text-slate-500">{placeholder}</p>}
		</div>
	)
}

export default function Login({ isLoading, errorMessage, onLogin }: LoginPageProps) {
	const emailId = useId()
	const passwordId = useId()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [rememberMe, setRememberMe] = useState(true)
	const [showPassword, setShowPassword] = useState(false)
	const [emailTouched, setEmailTouched] = useState(false)
	const [passwordTouched, setPasswordTouched] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	const emailError = (submitted || emailTouched) && email.trim().length === 0 ? 'Enter your email address or matric number.' : null
	const passwordError = (submitted || passwordTouched) && password.trim().length === 0 ? 'Enter your password to continue.' : null
	const canToggleVisibility = password.length > 0

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitted(true)

		if (email.trim().length === 0 || password.trim().length === 0) {
			return
		}

		await onLogin({
			email,
			password,
		})
	}

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900">
			<div className="grid min-h-screen w-full items-center gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[0.84fr_1.16fr] lg:px-6 lg:py-6">
				<AuthLeftPane />

				<section className="w-full">
					<div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-8">
						<div className="mb-8 space-y-4">
							<div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
								Welcome back
							</div>
							<div>
								<h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Sign in to CBBS</h2>
								<p className="mt-2 text-sm leading-6 text-slate-500">Use your email address or matric number to continue.</p>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5" noValidate>
							<FieldShell
								id={emailId}
								label="Email or Matric Number"
								value={email}
								placeholder="Enter your email or matric number"
								autoComplete="username"
								icon={<UserIcon />}
								error={emailError}
								onChange={setEmail}
								onBlur={() => setEmailTouched(true)}
							/>

							<div className="space-y-1.5">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<label htmlFor={passwordId} className="text-sm font-semibold text-slate-800">
										Password
									</label>
									<a href="mailto:admin@cbbs.local?subject=CBBS%20Password%20Reset" className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
										Forgot password?
									</a>
								</div>
								<div className="group relative">
									<span
										aria-hidden="true"
										className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-2 py-2 text-slate-400 transition ${passwordError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 bg-white group-focus-within:border-blue-200 group-focus-within:text-blue-700'}`}
									>
										<LockIcon />
									</span>
									<input
										id={passwordId}
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										onBlur={() => setPasswordTouched(true)}
										placeholder=" "
										autoComplete="current-password"
										className={`peer w-full rounded-2xl border bg-white px-4 pb-3.5 pt-6 pl-12 pr-12 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition placeholder:text-transparent focus:-translate-y-0.5 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${passwordError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
									/>
									<label
										htmlFor={passwordId}
										className={`absolute left-12 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-700 ${password.length > 0 ? 'top-3 translate-y-0 text-xs font-semibold text-slate-500' : 'text-slate-500'}`}
									>
										Password
									</label>
									<button
										type="button"
										onClick={() => setShowPassword((current) => !current)}
										className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-transparent p-2 text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										disabled={!canToggleVisibility}
									>
										{showPassword ? <EyeOffIcon /> : <EyeIcon />}
									</button>
								</div>
								{passwordError ? <p className="px-1 text-xs font-medium text-red-600">{passwordError}</p> : <p className="px-1 text-xs text-slate-500">Use a private password on a trusted device.</p>}
							</div>

							<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
								<label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
									<input
										type="checkbox"
										checked={rememberMe}
										onChange={(event) => setRememberMe(event.target.checked)}
										className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-4 focus:ring-blue-100"
									/>
									Remember me
								</label>
								<p className="text-xs text-slate-500">Keeps you signed in on this device.</p>
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
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</button>

							{errorMessage ? (
								<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
									{errorMessage}
								</div>
							) : null}

							<p className="text-center text-sm text-slate-500">
								Don&apos;t have an account?{' '}
								<Link to="/register" className="font-semibold text-blue-700 transition hover:text-blue-800">
									Register here
								</Link>
							</p>
						</form>
					</div>
				</section>
			</div>
		</div>
	)
}
