"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL, logout } from "@/assess_server/api"

type AdditionalInfo = {
	birthdate?: string
	university?: string
	phoneNumber?: string
}

type AssessmentRecord = {
	id: number
	user_id: number
	created_at: string
	raw_primary_concern: string
	raw_distress: string
	raw_functioning: string
	raw_urgency: string
	raw_safety: string
	raw_constraints: string
	latitude: number | null
	longitude: number | null
	issue_type: string
	urgency: string
	severity_score: number
	needs_immediate_resources: boolean
	confidence: number
	reasoning: string
	personalized_note: string
	full_plan_json: Record<string, unknown>
}

type AssessmentsResponse = {
	email: string
	history: AssessmentRecord[]
}

export default function ProfilePage() {
	const router = useRouter()
	const [email, setEmail] = useState<string>("")
	const [history, setHistory] = useState<AssessmentRecord[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selected, setSelected] = useState<AssessmentRecord | null>(null)
	const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({})
	const [isEditingInfo, setIsEditingInfo] = useState(false)

	useEffect(() => {
		const token = localStorage.getItem("auth_token")
		if (!token) {
			router.push("/login")
			return
		}

		// Load profile data from backend
		const loadProfile = async () => {
			try {
				const response = await fetch(`${API_URL}/api/me/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (response.ok) {
					const data = await response.json()
					setAdditionalInfo(data)
				}
			} catch (err) {
				console.error("Failed to load profile:", err)
			}
		}

		const load = async () => {
			try {
				const response = await fetch(`${API_URL}/api/me/assessments`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (response.status === 401) {
					logout()
					router.push("/login")
					return
				}

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`)
				}

				const data = (await response.json()) as AssessmentsResponse
				setEmail(data.email)
				setHistory(data.history || [])
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load profile"
				setError(message)
			} finally {
				setIsLoading(false)
			}
		}

		loadProfile()
		load()
	}, [router])

	const sortedHistory = useMemo(() => {
		return [...history].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
	}, [history])

	const handleLogout = () => {
		logout()
		router.push("/login")
	}

	const handleSaveAdditionalInfo = async () => {
		const token = localStorage.getItem("auth_token")
		try {
			const response = await fetch(`${API_URL}/api/me/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					birthdate: additionalInfo.birthdate,
					university: additionalInfo.university,
					phoneNumber: additionalInfo.phoneNumber,
				}),
			})

			if (response.ok) {
				setIsEditingInfo(false)
			} else {
				console.error("Failed to save profile")
			}
		} catch (error) {
			console.error("Failed to save profile:", error)
		}
	}

	return (
		<>
			<div className="app-background" />
			<div className="chat-view min-h-screen flex flex-col">
				<div className="flex-1 p-6 pb-16">
					<div className="max-w-5xl mx-auto">
						<div className="text-center py-8 mb-6">
							<img
								src="/CareRouterLogo.png"
								alt="CareRouter Logo"
								className="h-16 w-auto mx-auto mb-4"
							/>
							<h1 className="welcome-text text-queens-navy mb-2">Your Profile</h1>
							<p className="text-sm text-text-secondary font-medium">
								{email ? `Signed in as ${email}` : "Loading account..."}
							</p>
							<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
								<button
									onClick={() => router.push("/assessment")}
									className="px-6 py-3 rounded-full bg-queens-navy text-white font-semibold shadow-md hover:shadow-lg transition"
								>
									Take another assessment
								</button>
								<button
									onClick={() => router.push("/results")}
									className="px-6 py-3 rounded-full bg-queens-gold text-queens-navy font-semibold shadow-md hover:shadow-lg transition"
								>
									Back to results
								</button>
								<button
									onClick={handleLogout}
									className="px-6 py-3 rounded-full bg-white text-queens-navy font-semibold shadow-md hover:shadow-lg transition border border-queens-navy"
								>
									Log out
								</button>
							</div>
						</div>

						<div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-queens-navy">Additional Information</h2>
								<button
									type="button"
									onClick={() => setIsEditingInfo(!isEditingInfo)}
									className="text-sm px-4 py-2 rounded-lg bg-queens-navy text-white hover:bg-queens-navy/90 transition"
								>
									{isEditingInfo ? "Cancel" : "Edit"}
								</button>
							</div>

							{isEditingInfo ? (
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-2">
											Birthdate (optional)
										</label>
										<input
											type="date"
											value={additionalInfo.birthdate || ""}
											onChange={(e) =>
												setAdditionalInfo({
													...additionalInfo,
													birthdate: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-queens-navy"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-text-primary mb-2">
											University (optional)
										</label>
										<input
											type="text"
											placeholder="e.g., University of Toronto"
											value={additionalInfo.university || ""}
											onChange={(e) =>
												setAdditionalInfo({
													...additionalInfo,
													university: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-queens-navy"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-text-primary mb-2">
											Phone Number (optional)
										</label>
										<input
											type="tel"
											placeholder="e.g., (416) 555-0123"
											value={additionalInfo.phoneNumber || ""}
											onChange={(e) =>
												setAdditionalInfo({
													...additionalInfo,
													phoneNumber: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-queens-navy"
										/>
									</div>

									<button
										type="button"
										onClick={handleSaveAdditionalInfo}
										className="w-full px-4 py-2 rounded-lg bg-queens-gold text-queens-navy font-semibold hover:bg-queens-gold/90 transition"
									>
										Save Information
									</button>
								</div>
							) : (
								<div className="space-y-3 text-sm">
									<div className="flex items-start gap-3">
										<span className="font-medium text-text-secondary w-32">Birthdate:</span>
										<span className="text-text-primary">
											{additionalInfo.birthdate
												? new Date(additionalInfo.birthdate).toLocaleDateString()
												: "Not provided"}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="font-medium text-text-secondary w-32">University:</span>
										<span className="text-text-primary">
											{additionalInfo.university || "Not provided"}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<span className="font-medium text-text-secondary w-32">Phone Number:</span>
										<span className="text-text-primary">
											{additionalInfo.phoneNumber || "Not provided"}
										</span>
									</div>
								</div>
							)}
						</div>

						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-2xl font-semibold text-queens-navy">Your past conversations</h2>
							<span className="text-sm text-text-secondary">{sortedHistory.length} total</span>
						</div>

						{isLoading && (
							<div className="action-card text-center">Loading your history...</div>
						)}

						{!isLoading && error && (
							<div className="action-card text-center text-red-600">{error}</div>
						)}

						{!isLoading && !error && sortedHistory.length === 0 && (
							<div className="action-card text-center">
								No assessments yet. Take one to see it here.
							</div>
						)}

						{!isLoading && !error && sortedHistory.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								{sortedHistory.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => setSelected(item)}
										className="action-card text-left"
									>
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold text-queens-navy">
												{new Date(item.created_at).toLocaleDateString()}
											</h3>
											<span className="text-xs px-2 py-1 rounded-full bg-queens-gold text-queens-navy font-semibold">
												Severity {item.severity_score}/4
											</span>
										</div>
										<p className="mt-2 text-sm text-text-secondary">
											Issue: {item.issue_type} · Urgency: {item.urgency}
										</p>
										<p className="mt-3 text-sm text-text-primary line-clamp-2">
											{item.raw_primary_concern}
										</p>
										<p className="mt-4 text-xs text-queens-navy font-semibold">View full details</p>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{selected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="text-2xl font-semibold text-queens-navy">
									Assessment from {new Date(selected.created_at).toLocaleString()}
								</h3>
								<p className="text-sm text-text-secondary mt-1">
									Issue: {selected.issue_type} · Urgency: {selected.urgency}
								</p>
							</div>
							<button
								onClick={() => setSelected(null)}
								className="px-3 py-1.5 rounded-full bg-queens-navy text-white text-sm"
							>
								Close
							</button>
						</div>

						<div className="mt-6 grid gap-4">
							<div className="action-card">
								<h4 className="text-lg font-semibold text-queens-navy mb-2">Summary</h4>
								<p className="text-sm text-text-primary">{selected.personalized_note}</p>
								<p className="text-xs text-text-secondary mt-2">Confidence: {selected.confidence}</p>
							</div>

							<div className="action-card">
								<h4 className="text-lg font-semibold text-queens-navy mb-3">Your responses</h4>
								<div className="grid gap-3 text-sm text-text-primary">
									<div><strong>Primary concern:</strong> {selected.raw_primary_concern}</div>
									<div><strong>Distress:</strong> {selected.raw_distress}</div>
									<div><strong>Functioning:</strong> {selected.raw_functioning}</div>
									<div><strong>Urgency:</strong> {selected.raw_urgency}</div>
									<div><strong>Safety:</strong> {selected.raw_safety}</div>
									<div><strong>Constraints:</strong> {selected.raw_constraints}</div>
								</div>
							</div>

							<div className="action-card">
								<h4 className="text-lg font-semibold text-queens-navy mb-2">Full plan JSON</h4>
								<pre className="text-xs bg-gray-50 rounded-xl p-4 overflow-x-auto">
{JSON.stringify(selected.full_plan_json, null, 2)}
								</pre>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
