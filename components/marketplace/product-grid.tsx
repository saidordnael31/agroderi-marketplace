"use client"

import type { Product } from "@/types/marketplace"
import { ProductCard } from "@/components/marketplace/product-card"
import { Wheat } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-amber-100 p-3 mb-4">
          <Wheat className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
        <p className="text-gray-500 mt-1">Tente ajustar seus filtros para ver mais resultados.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
      ))}
    </div>
  )
}
