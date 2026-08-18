import ProductForm from '../ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h2 className="text-xl font-serif mb-6">New Product</h2>
      <ProductForm mode="create" />
    </div>
  )
}
