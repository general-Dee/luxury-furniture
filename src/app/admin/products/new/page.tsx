import ProductForm from '../ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h2 className="ind-scope uppercase text-xl mb-6">New product</h2>
      <ProductForm mode="create" />
    </div>
  )
}
