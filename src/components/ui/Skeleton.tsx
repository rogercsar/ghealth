type SkeletonProps = {
  width?: number | string
  height?: number
  rounded?: string
  className?: string
}

export default function Skeleton({ width = '100%', height = 16, rounded = 'rounded-lg', className = '' }: SkeletonProps) {
  return (
    <div
      className={[`bg-[var(--bg-muted)] animate-pulse`, rounded, className].join(' ')}
      style={{ width, height }}
    />
  )
}