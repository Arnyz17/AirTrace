export default function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 animate-pulse">
      <div className="h-[420px] bg-haze-line/60 rounded-lg" />
      <div className="space-y-5">
        <div className="h-32 bg-haze-line/60 rounded-lg" />
        <div className="h-52 bg-haze-line/60 rounded-lg" />
        <div className="h-52 bg-haze-line/60 rounded-lg" />
      </div>
    </div>
  )
}
