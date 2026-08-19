export default function Footer() {
  return (
    <footer className="ind-scope border-t border-[var(--ind-color-divider)] bg-[var(--ind-color-bg)] py-6">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-[13px] text-[var(--ind-color-text)] opacity-60">
          &copy; {new Date().getFullYear()} Luxury Furniture Nigeria. Timeless elegance for your home.
        </p>
      </div>
    </footer>
  )
}
