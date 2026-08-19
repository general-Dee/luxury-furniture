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
    <div className="ind-scope ind-plate mb-8">
      <i className="ind-corner ind-plate-corner tl" />
      <i className="ind-corner ind-plate-corner tr" />
      <i className="ind-corner ind-plate-corner bl" />
      <i className="ind-corner ind-plate-corner br" />

      <header className="flex flex-wrap border-b border-[var(--ind-color-divider)]">
        <span className="flex-1 min-w-[16ch] px-6 py-2 text-[13px] tracking-[0.08em] uppercase font-semibold">
          Filter the catalog
        </span>
        <span className="border-l border-[var(--ind-color-divider)] px-6 py-2 text-[13px] tracking-[0.08em] uppercase font-semibold opacity-70">
          DOC HF-100
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1fr] gap-6 p-6">
        <div className="ind-field">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="e.g., velvet sofa"
            className="ind-input"
          />
        </div>
        <div className="ind-field">
          <label>Sort by</label>
          <select value={sort} onChange={handleSortChange} className="ind-input">
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <label className="ind-radio">
            <input type="checkbox" checked={inStockOnly} onChange={handleInStockChange} />
            <span className="ind-dot" />
            In stock only
          </label>
        </div>
      </div>

      <div className="border-t border-[var(--ind-color-divider)] px-6 py-4 flex flex-wrap items-center gap-6">
        <span className="text-xs opacity-70 whitespace-nowrap">Price range</span>
        <span style={{ fontFamily: 'var(--ind-font-heading)' }} className="text-base">
          {formatCurrency(sliderMin)}
        </span>
        <input
          type="range"
          min={GLOBAL_MIN_PRICE}
          max={GLOBAL_MAX_PRICE}
          step={50000}
          value={sliderMin}
          onChange={handleMinSliderChange}
          className="flex-1 accent-[var(--ind-color-accent)]"
        />
        <input
          type="range"
          min={GLOBAL_MIN_PRICE}
          max={GLOBAL_MAX_PRICE}
          step={50000}
          value={sliderMax}
          onChange={handleMaxSliderChange}
          className="flex-1 accent-[var(--ind-color-accent)]"
        />
        <span style={{ fontFamily: 'var(--ind-font-heading)' }} className="text-base">
          {formatCurrency(sliderMax)}
        </span>
        <button onClick={applyPriceRange} className="ind-btn ind-btn-secondary">
          Apply price range
        </button>
        <button onClick={clearFilters} className="ind-btn ind-btn-ghost">
          Clear filters
        </button>
      </div>
    </div>
  )
}
