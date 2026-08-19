type StarRatingProps = {
  rating: number
  size?: number
  interactive?: boolean
  onRate?: (value: number) => void
}

export default function StarRating({ rating, size = 18, interactive = false, onRate }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating)
        const icon = (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'var(--ind-color-accent)' : 'none'}
            stroke={filled ? 'var(--ind-color-accent)' : 'var(--ind-color-divider)'}
            strokeWidth={1.5}
          >
            <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.7 7.1-.6L12 2.5z" />
          </svg>
        )
        if (!interactive) {
          return <span key={star}>{icon}</span>
        }
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            className="focus:outline-none"
            aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}
