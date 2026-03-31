'use client'

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

export const TIME_RANGE_OPTIONS: { label: string; value: TimeRange; minutes: number }[] = [
    { label: '1H', value: '1h', minutes: 60 },
    { label: '6H', value: '6h', minutes: 360 },
    { label: '24H', value: '24h', minutes: 1440 },
    { label: '7D', value: '7d', minutes: 10080 },
    { label: '30D', value: '30d', minutes: 43200 },
]

export function getTimeRangeStart(range: TimeRange): string {
    const opt = TIME_RANGE_OPTIONS.find(o => o.value === range)!
    return new Date(Date.now() - opt.minutes * 60 * 1000).toISOString()
}

export function TimeRangeSelector({
    value,
    onChange,
}: {
    value: TimeRange
    onChange: (r: TimeRange) => void
}) {
    return (
        <div className="flex items-center gap-1 bg-[#0a0f1e] border border-gray-800 rounded-lg p-1">
            {TIME_RANGE_OPTIONS.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${value === opt.value
                        ? 'bg-[#2E86DE] text-white shadow'
                        : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}