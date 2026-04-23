'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'

const GLOBAL_MIN_PRICE = 200000
const GLOBAL_MAX_PRICE = 7000000

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true')

  const [sliderMin, setSliderMin] = useState(() => {
    const urlMin = searchParams.get('minPrice')
    return urlMin ? parseInt(urlMin) : GLOBAL_MIN_PRICE
  })
  const [sliderMax, setSliderMax] = useState(() => {
    const urlMax = searchParams.get('maxPrice')
    return urlMax ? parseInt(urlMax) : GLOBAL_MAX_PRICE
  })

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') params.delete(key)
      else params.set(key, value)
    })
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => updateFilters({ search: value || null }), 300)
  }

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (val > sliderMax) val = sliderMax
    setSliderMin(val)
  }
  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (val < sliderMin) val = sliderMin
    setSliderMax(val)
  }
  const applyPriceRange = () => {
    setMinPrice(sliderMin.toString())
    setMaxPrice(sliderMax.toString())
    updateFilters({ minPrice: sliderMin.toString(), maxPrice: sliderMax.toString() })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value)
    updateFilters({ sort: e.target.value })
  }

  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setInStockOnly(checked)
    updateFilters({ inStock: checked ? 'true' : null })
  }

  const clearFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setSliderMin(GLOBAL_MIN_PRICE)
    setSliderMax(GLOBAL_MAX_PRICE)
    setSort('newest')
    setInStockOnly(false)
    router.push('/')
  }

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [])

  const formatCurrency = (value: number) => `₦${value.toLocaleString()}`

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="e.g., velvet sofa"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={handleInStockChange}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-luxury-gold focus:ring-luxury-gold dark:bg-gray-800"
            />
            In Stock Only
          </label>
        </div>
        <div className="flex justify-end items-end">
          <button onClick={clearFilters} className="text-sm text-luxury-gold hover:text-luxury-charcoal dark:hover:text-luxury-gold transition">Clear all filters</button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range (₦)</label>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatCurrency(sliderMin)}</span>
            <span>{formatCurrency(sliderMax)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">₦{GLOBAL_MIN_PRICE.toLocaleString()}</span>
            <input
              type="range"
              min={GLOBAL_MIN_PRICE}
              max={GLOBAL_MAX_PRICE}
              step={50000}
              value={sliderMin}
              onChange={handleMinSliderChange}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">₦{GLOBAL_MAX_PRICE.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">₦{GLOBAL_MIN_PRICE.toLocaleString()}</span>
            <input
              type="range"
              min={GLOBAL_MIN_PRICE}
              max={GLOBAL_MAX_PRICE}
              step={50000}
              value={sliderMax}
              onChange={handleMaxSliderChange}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">₦{GLOBAL_MAX_PRICE.toLocaleString()}</span>
          </div>
          <button
            onClick={applyPriceRange}
            className="mt-2 text-xs bg-luxury-charcoal dark:bg-gray-700 text-white px-4 py-1.5 rounded hover:bg-luxury-gold hover:text-luxury-charcoal transition w-fit"
          >
            Apply Price Range
          </button>
        </div>
      </div>
    </div>
  )
}