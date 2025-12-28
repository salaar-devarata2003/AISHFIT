export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* JNV Logo Badge - White with blue border */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl shadow-lg border-2 border-white/20">
          <span className="text-white font-bold text-sm tracking-tight">JNV</span>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
          AISHFIT
        </h1>
        <p className="text-xs text-blue-300/70 leading-tight">Workout Progress Tracker</p>
      </div>
    </div>
  )
}
