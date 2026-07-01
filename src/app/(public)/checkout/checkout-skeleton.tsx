// src/app/(public)/checkout/checkout-skeleton.tsx

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5">
            <div className="h-5 w-44 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-64 rounded-md bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel skeleton */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
              <div className="h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Right panel skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
