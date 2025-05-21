"use client"

import Image from "next/image"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { getCommodityIcon } from "@/lib/utils"
import type { Product } from "@/types/marketplace"

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
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
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onSelect(product)}>
              Negociar
            </Button>
          </DialogTrigger>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
