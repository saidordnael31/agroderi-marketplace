"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterOptions } from "@/types/marketplace"

interface MobileFilterProps {
  filters: FilterOptions
  onFilterChange: (name: string, value: string) => void
}

export function MobileFilter({ filters, onFilterChange }: MobileFilterProps) {
  return (
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
            <Select onValueChange={(value) => onFilterChange("type", value)} value={filters.type}>
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
            <Select onValueChange={(value) => onFilterChange("location", value)} value={filters.location}>
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
                onChange={(e) => onFilterChange("minPrice", e.target.value)}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
