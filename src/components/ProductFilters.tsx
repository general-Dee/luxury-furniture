'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'

// Luxury price range: ₦200,000 – ₦7,000,000
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
  
  // Slider state
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
      if (value === null || value === '' || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateFilters({ search: value || null })
    }, 300)
  }

  // Price slider handlers
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

  // Sort handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSort(value)
    updateFilters({ sort: value })
  }

  // Stock filter
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

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString()}`
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="e.g., velvet sofa"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-luxury-gold focus:border-luxury-gold"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Stock filter */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={handleInStockChange}
              className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
            />
            In Stock Only
          </label>
        </div>

        {/* Clear button */}
        <div className="flex justify-end items-end">
          <button
            onClick={clearFilters}
            className="text-sm text-luxury-gold hover:text-luxury-charcoal transition"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Price range slider */}
      <div className="border-t pt-4 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">Price Range (₦)</label>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(sliderMin)}</span>
            <span>{formatCurrency(sliderMax)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs">₦{GLOBAL_MIN_PRICE.toLocaleString()}</span>
            <input
              type="range"
              min={GLOBAL_MIN_PRICE}
              max={GLOBAL_MAX_PRICE}
              step={50000}
              value={sliderMin}
              onChange={handleMinSliderChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
            />
            <span className="text-xs">₦{GLOBAL_MAX_PRICE.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs">₦{GLOBAL_MIN_PRICE.toLocaleString()}</span>
            <input
              type="range"
              min={GLOBAL_MIN_PRICE}
              max={GLOBAL_MAX_PRICE}
              step={50000}
              value={sliderMax}
              onChange={handleMaxSliderChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
            />
            <span className="text-xs">₦{GLOBAL_MAX_PRICE.toLocaleString()}</span>
          </div>
          <button
            onClick={applyPriceRange}
            className="mt-2 text-xs bg-luxury-charcoal text-white px-4 py-1.5 rounded hover:bg-luxury-gold hover:text-luxury-charcoal transition w-fit"
          >
            Apply Price Range
          </button>
        </div>
      </div>
    </div>
  )
}