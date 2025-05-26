import { Skeleton } from "@/components/ui/skeleton"

export default function BookingDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        <Skeleton className="h-9 w-64" />
      </h1>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
