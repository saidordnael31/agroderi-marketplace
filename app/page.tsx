"use client"
import { Wheat, Coffee, FuelIcon as Oil, DiamondIcon as GoldIcon } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { FilterSidebar } from "@/components/marketplace/filter-sidebar"
import { MobileFilter } from "@/components/marketplace/mobile-filter"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { NegotiationModal } from "@/components/marketplace/negotiation-modal"
import { useProducts } from "@/hooks/use-products"
import { useFilter } from "@/hooks/use-filter"

interface Product {
  id: number
  name: string
  image: string
  quantity: string
  price: number
  location: string
  seller: string
  type: string
  country: string
}

export default function Marketplace() {
  const { products, selectedProduct, setSelectedProduct } = useProducts()
  const { filters, handleFilterChange, filteredProducts } = useFilter(products)

  const getCommodityIcon = (type: string) => {
    switch (type) {
      case "Soja":
        return <Wheat className="h-4 w-4 text-amber-600" />
      case "Milho":
        return <Wheat className="h-4 w-4 text-yellow-500" />
      case "Café":
        return <Coffee className="h-4 w-4 text-amber-800" />
      case "Petróleo":
        return <Oil className="h-4 w-4 text-gray-800" />
      case "Ouro":
        return <GoldIcon className="h-4 w-4 text-yellow-400" />
      default:
        return <Wheat className="h-4 w-4 text-amber-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="📦 AgroDeri Marketplace" />

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Mobile Filter Button */}
        <MobileFilter filters={filters} onFilterChange={handleFilterChange} />

        {/* Desktop Sidebar */}
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

        {/* Main Content */}
        <div className="flex-1">
          <ProductGrid products={filteredProducts} onSelectProduct={setSelectedProduct} />
        </div>
      </div>

      {/* Negotiation Modal */}
      <Dialog>
        <NegotiationModal product={selectedProduct} />
      </Dialog>
    </div>
  )
}
