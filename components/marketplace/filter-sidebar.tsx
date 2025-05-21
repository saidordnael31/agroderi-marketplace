"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterOptions } from "@/types/marketplace"

interface FilterSidebarProps {
  filters: FilterOptions
  onFilterChange: (name: string, value: string) => void
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  return (
    <div className="hidden md:block w-64 shrink-0">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-green-800">Filtros</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Commodity</Label>
            <Select onValueChange={(value) => onFilterChange("type", value)} value={filters.type}>
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
            <Select onValueChange={(value) => onFilterChange("location", value)} value={filters.location}>
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
      </div>
    </div>
  )
}
