import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Product } from "@/types/marketplace"

interface NegotiationModalProps {
  product: Product | null
}

export function NegotiationModal({ product }: NegotiationModalProps) {
  if (!product) return null

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-green-800">Negociar Commodity</DialogTitle>
        <DialogDescription>Envie uma proposta para o vendedor desta commodity.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 relative rounded overflow-hidden">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
          <div>
            <p className="text-sm text-gray-500">Vendedor</p>
            <p className="font-medium">{product.seller}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Volume Total</p>
            <p className="font-medium">{product.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preço por Unidade</p>
            <p className="font-medium text-green-700">${product.price.toFixed(2)} USDT</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valor Total Estimado</p>
            <p className="font-medium text-green-700">
              ${(product.price * Number.parseInt(product.quantity.replace(/\D/g, ""))).toLocaleString()} USDT
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
      <DialogFooter>
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="button" className="bg-green-700 hover:bg-green-800 text-white">
          Enviar Proposta
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
