'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/reviews', label: 'Reviews' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-6 mb-8 border-b border-[var(--ind-color-divider)] pb-3">
      <h1 className="uppercase text-2xl m-0">Admin</h1>
      <nav className="flex gap-4 text-sm">
        {TABS.map((tab) => {
          const active = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={active ? 'font-semibold' : 'opacity-60 hover:opacity-100 transition'}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
