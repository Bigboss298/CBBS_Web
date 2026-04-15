import { useState } from 'react'

type LoginPageProps = {
	isLoading: boolean
	errorMessage: string | null
	onLogin: (payload: { identifier: string; password: string }) => Promise<boolean>
}

export default function Login({ isLoading, errorMessage, onLogin }: LoginPageProps) {
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		await onLogin({
			identifier,
			password,
		})
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-blue-50 to-blue-100 px-4">
			<div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
				<h1 className="text-2xl font-bold text-blue-900">Persista Login</h1>
				<p className="mt-1 text-sm text-slate-500">Sign in with your email or matric number and password.</p>

				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					<label className="block space-y-2">
						<span className="text-sm font-semibold text-blue-900">Email or Matric Number</span>
						<input
							type="text"
							value={identifier}
							onChange={(event) => setIdentifier(event.target.value)}
							placeholder="e.g. admin@persista.local or ADMIN001"
							className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
							required
						/>
					</label>

					<label className="block space-y-2">
						<span className="text-sm font-semibold text-blue-900">Password</span>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
							required
						/>
					</label>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
					>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				{errorMessage ? (
					<p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p>
				) : null}
			</div>
		</div>
	)
}
