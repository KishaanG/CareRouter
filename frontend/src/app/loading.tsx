export default function Loading() {
  return (
    <>
      <div className="app-background" />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-queens-navy border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-queens-navy">Loading CareRouter...</p>
      </div>
    </>
  )
}
