/**
 * Shared left-side decorative panel used on Login, Register, and ChangePassword pages.
 * Only visible on md+ screens.
 */
export default function AuthLeftPane() {
	return (
		<section className="relative hidden h-full w-full max-w-[760px] justify-self-start overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-2xl md:block">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage:
						'linear-gradient(180deg, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.45) 52%, rgba(2,6,23,0.9) 100%), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80")',
				}}
			/>
			<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.08),transparent_45%,rgba(59,130,246,0.12))]" />
			<div className="relative flex h-full min-h-[760px] flex-col justify-between p-8 text-white">
				<div className="flex items-center justify-between gap-4">
					<div className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
						CBBS Portal
					</div>
					<div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
						Secure academic access
					</div>
				</div>

				<div className="max-w-xl space-y-4">
					<p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200/90">CBBS Portal</p>
					<h1 className="max-w-lg text-5xl font-black leading-[0.95] tracking-tight text-balance xl:text-6xl">
						Academic records, handled in one place.
					</h1>
					<p className="max-w-md text-sm leading-7 text-white/78 xl:text-base">
						Sign in to continue to your role-based workspace for student documents, and administrative records.
					</p>
				</div>

				<div className="grid gap-3 sm:max-w-xl sm:grid-cols-3">
					<div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.18em] text-white/55">Students</p>
						<p className="mt-2 text-sm font-semibold text-white">View and manage your document set.</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.18em] text-white/55">Level Advisers</p>
						<p className="mt-2 text-sm font-semibold text-white">Review submissions by level.</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.18em] text-white/55">HOD</p>
						<p className="mt-2 text-sm font-semibold text-white">Track documents by Department.</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.18em] text-white/55">DEAN / FO</p>
						<p className="mt-2 text-sm font-semibold text-white">Track documents by Faculty.</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
						<p className="text-xs uppercase tracking-[0.18em] text-white/55">Admins</p>
						<p className="mt-2 text-sm font-semibold text-white">Track the full academic hierarchy.</p>
					</div>
				</div>

				<div className="flex items-end justify-between gap-4 border-t border-white/12 pt-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Access flow</p>
						<p className="mt-2 max-w-md text-sm leading-6 text-white/70">
							Fast sign-in, role-aware routing, and document browsing that matches the rest of the application.
						</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm">
						CBBS v1
					</div>
				</div>
			</div>
		</section>
	)
}
