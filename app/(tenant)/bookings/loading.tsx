import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        <Skeleton className="h-9 w-40" />
      </h1>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
