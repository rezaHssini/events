import type { CSSProperties, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Skeleton({
  className = '',
  rounded = 'md',
  style,
}: {
  className?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  style?: CSSProperties
}) {
  const radii = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-[14px]',
    lg: 'rounded-[18px]',
    xl: 'rounded-[22px]',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cx('animate-pulse bg-surface-2', radii[rounded], className)}
      style={style}
      aria-hidden
    />
  )
}

export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  const widths = ['w-full', 'w-5/6', 'w-2/3', 'w-1/2']
  return (
    <div className={cx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cx('h-3', widths[i % widths.length])} rounded="full" />
      ))}
    </div>
  )
}

export function StoryStripSkeleton() {
  return (
    <div className="mb-4 flex gap-3 overflow-hidden px-1 py-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex shrink-0 flex-col items-center gap-2">
          <Skeleton className="h-[68px] w-[68px]" rounded="full" />
          <Skeleton className="h-2 w-12" rounded="full" />
        </div>
      ))}
    </div>
  )
}

export function FeedPostSkeleton() {
  return (
    <div className="feed-card mb-5 overflow-hidden p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" rounded="full" />
          <Skeleton className="h-2.5 w-20" rounded="full" />
        </div>
      </div>
      <Skeleton className="mt-4 aspect-[4/5] w-full" rounded="xl" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-4 w-10" rounded="full" />
        <Skeleton className="h-4 w-10" rounded="full" />
        <Skeleton className="h-4 w-10" rounded="full" />
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="feed-card mb-4 overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" rounded="none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" rounded="full" />
        <Skeleton className="h-3 w-1/2" rounded="full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-6 w-14" rounded="full" />
        </div>
      </div>
    </div>
  )
}

export function ListRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl liquid-glass-subtle p-3">
          <Skeleton className="h-20 w-20 shrink-0" rounded="xl" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-4/5" rounded="full" />
            <Skeleton className="h-3 w-3/5" rounded="full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-14" rounded="full" />
              <Skeleton className="h-5 w-12" rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function UserRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-12 w-12 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" rounded="full" />
            <Skeleton className="h-2.5 w-24" rounded="full" />
          </div>
          <Skeleton className="h-8 w-20" rounded="full" />
        </div>
      ))}
    </div>
  )
}

export function NotificationRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-[18px] liquid-glass-subtle p-4">
          <Skeleton className="h-10 w-10 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-full" rounded="full" />
            <Skeleton className="h-3 w-4/5" rounded="full" />
            <Skeleton className="h-2.5 w-16" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ConversationRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-12 w-12 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36" rounded="full" />
            <Skeleton className="h-3 w-full" rounded="full" />
          </div>
          <Skeleton className="h-2.5 w-8" rounded="full" />
        </div>
      ))}
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" rounded="xl" />
      <div className="flex items-end gap-4 px-1">
        <Skeleton className="h-20 w-20 shrink-0" rounded="2xl" />
        <div className="flex-1 space-y-2 pb-1">
          <Skeleton className="h-5 w-40" rounded="full" />
          <Skeleton className="h-3 w-28" rounded="full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14" rounded="lg" />
        ))}
      </div>
    </div>
  )
}

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen pb-24">
      <Skeleton className="h-72 w-full" rounded="none" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-4/5" rounded="full" />
        <Skeleton className="h-4 w-3/5" rounded="full" />
        <Skeleton className="h-4 w-2/3" rounded="full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1" rounded="xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" rounded="xl" />
        <SkeletonText lines={4} />
      </div>
    </div>
  )
}

export function MapBlockSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height }} rounded="xl" />
}

export function CarouselSkeleton({ title }: { title?: ReactNode }) {
  return (
    <section className="feed-card mb-5 overflow-hidden p-4">
      {title ?? <Skeleton className="mb-4 h-4 w-32" rounded="full" />}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-24 shrink-0" rounded="xl" />
        ))}
      </div>
    </section>
  )
}

export function PageLoadingOverlay() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" className="text-[#0a84ff]" />
    </div>
  )
}
