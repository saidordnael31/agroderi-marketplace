"use client"

import { useState } from "react"
import type { Product } from "@/types/marketplace"

const mockProducts: Product[] = [
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
    image: "/field-of-ripe-corn.png",
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
    image: "/pile-of-coffee-beans.png",
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
    image: "/placeholder-2kkze.png",
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

export function useProducts() {
  const [products] = useState<Product[]>(mockProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return {
    products,
    selectedProduct,
    setSelectedProduct,
  }
}
