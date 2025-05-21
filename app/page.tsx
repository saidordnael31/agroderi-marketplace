"use client"

import { Dialog } from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { FilterSidebar } from "@/components/marketplace/filter-sidebar"
import { MobileFilter } from "@/components/marketplace/mobile-filter"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { NegotiationModal } from "@/components/marketplace/negotiation-modal"
import { CotacoesWidget } from "@/components/marketplace/cotacoes-widget"
import { useProducts } from "@/hooks/use-products"
import { useFilter } from "@/hooks/use-filter"

export default function Marketplace() {
  const { products, selectedProduct, setSelectedProduct } = useProducts()
  const { filters, handleFilterChange, filteredProducts } = useFilter(products)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header title="📦 AgroDeri Marketplace" />

      <div className="container mx-auto px-4 py-6">
        {/* Cotações Widget - Visível apenas em desktop */}
        <div className="hidden md:block mb-6">
          <CotacoesWidget />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Filter Button */}
          <MobileFilter filters={filters} onFilterChange={handleFilterChange} />

          {/* Desktop Sidebar */}
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Cotações Widget - Visível apenas em mobile */}
            <div className="md:hidden mb-6">
              <CotacoesWidget />
            </div>

            <ProductGrid products={filteredProducts} onSelectProduct={setSelectedProduct} />
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      <Dialog>
        <NegotiationModal product={selectedProduct} />
      </Dialog>
    </div>
  )
}
