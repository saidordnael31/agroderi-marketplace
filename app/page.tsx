"use client"

import { useState } from "react"
import Image from "next/image"
import { Filter, LogIn, Plus, MapPin, Wheat, Coffee, FuelIcon as Oil, DiamondIcon as GoldIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState({
    type: "all",
    location: "all",
    minPrice: "",
    maxPrice: "",
  })

  const products: Product[] = [
    {
      id: 1,
      name: "Soja Premium",
      image: "/soybean-field.png",
      quantity: "10.000 sacas",
      price: 25.5,
      location: "Sorriso - MT",
      seller: "Fazenda Boa Esperança",
      type: "Soja",
      country: "Brasil",
    },
    {
      id: 2,
      name: "Milho - 60kg",
      image: "/placeholder.svg?height=200&width=200&query=corn",
      quantity: "5.000 sacas",
      price: 15.0,
      location: "Chapadão do Sul - MS",
      seller: "Agro Futuro",
      type: "Milho",
      country: "Brasil",
    },
    {
      id: 3,
      name: "Café Arábica",
      image: "/placeholder.svg?height=200&width=200&query=coffee+beans",
      quantity: "2.500 sacas",
      price: 32.75,
      location: "Patrocínio - MG",
      seller: "Cafés Especiais do Brasil",
      type: "Café",
      country: "Brasil",
    },
    {
      id: 4,
      name: "Petróleo Bruto",
      image: "/placeholder.svg?height=200&width=200&query=crude+oil",
      quantity: "5.000 barris",
      price: 75.2,
      location: "Lagos",
      seller: "Nigerian Oil Co.",
      type: "Petróleo",
      country: "Nigéria",
    },
    {
      id: 5,
      name: "Ouro 24k",
      image: "/placeholder.svg?height=200&width=200&query=gold+bars",
      quantity: "100 kg",
      price: 1850.0,
      location: "Accra",
      seller: "Ghana Gold Miners",
      type: "Ouro",
      country: "Gana",
    },
    {
      id: 6,
      name: "Soja Orgânica",
      image: "/placeholder.svg?height=200&width=200&query=organic+soybean",
      quantity: "3.000 sacas",
      price: 35.8,
      location: "Iowa",
      seller: "Organic Farms USA",
      type: "Soja",
      country: "EUA",
    },
  ]

  const filteredProducts = products.filter((product) => {
    if (filters.type !== "all" && product.type !== filters.type) return false
    if (filters.location !== "all" && product.country !== filters.location) return false
    if (filters.minPrice && product.price < Number.parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && product.price > Number.parseFloat(filters.maxPrice)) return false
    return true
  })

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
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">📦 AgroDeri Marketplace</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Cadastrar Produto</span>
              <span className="sm:hidden">Cadastrar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Refine sua busca por commodities</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-type">Tipo de Commodity</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, type: value })} value={filters.type}>
                  <SelectTrigger id="mobile-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Soja">Soja</SelectItem>
                    <SelectItem value="Milho">Milho</SelectItem>
                    <SelectItem value="Café">Café</SelectItem>
                    <SelectItem value="Petróleo">Petróleo</SelectItem>
                    <SelectItem value="Ouro">Ouro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-location">Localização</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, location: value })} value={filters.location}>
                  <SelectTrigger id="mobile-location">
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Nigéria">Nigéria</SelectItem>
                    <SelectItem value="EUA">EUA</SelectItem>
                    <SelectItem value="Gana">Gana</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faixa de Preço (USDT)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-green-800">Filtros</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Commodity</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, type: value })} value={filters.type}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Soja">Soja</SelectItem>
                    <SelectItem value="Milho">Milho</SelectItem>
                    <SelectItem value="Café">Café</SelectItem>
                    <SelectItem value="Petróleo">Petróleo</SelectItem>
                    <SelectItem value="Ouro">Ouro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, location: value })} value={filters.location}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Nigéria">Nigéria</SelectItem>
                    <SelectItem value="EUA">EUA</SelectItem>
                    <SelectItem value="Gana">Gana</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faixa de Preço (USDT)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                    {getCommodityIcon(product.type)}
                    {product.type}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-green-800">{product.name}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600">
                      Quantidade: <span className="font-medium">{product.quantity}</span>
                    </p>
                    <p className="text-green-700 font-bold text-lg">${product.price.toFixed(2)} USDT</p>
                    <p className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3.5 w-3.5" />
                      {product.location}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Negociar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-green-800">Negociar Commodity</DialogTitle>
                        <DialogDescription>Envie uma proposta para o vendedor desta commodity.</DialogDescription>
                      </DialogHeader>
                      {selectedProduct && (
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 relative rounded overflow-hidden">
                              <Image
                                src={selectedProduct.image || "/placeholder.svg"}
                                alt={selectedProduct.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{selectedProduct.name}</h3>
                              <p className="text-sm text-gray-600">{selectedProduct.location}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
                            <div>
                              <p className="text-sm text-gray-500">Vendedor</p>
                              <p className="font-medium">{selectedProduct.seller}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Volume Total</p>
                              <p className="font-medium">{selectedProduct.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Preço por Unidade</p>
                              <p className="font-medium text-green-700">${selectedProduct.price.toFixed(2)} USDT</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Valor Total Estimado</p>
                              <p className="font-medium text-green-700">
                                $
                                {(
                                  selectedProduct.price * Number.parseInt(selectedProduct.quantity.replace(/\D/g, ""))
                                ).toLocaleString()}{" "}
                                USDT
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade Desejada</Label>
                            <Input id="quantity" type="number" placeholder="Informe a quantidade" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Mensagem (opcional)</Label>
                            <textarea
                              id="message"
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Detalhes adicionais para sua proposta..."
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                        <Button type="button" className="bg-green-700 hover:bg-green-800 text-white">
                          Enviar Proposta
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-amber-100 p-3 mb-4">
                  <Wheat className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mt-1">Tente ajustar seus filtros para ver mais resultados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
