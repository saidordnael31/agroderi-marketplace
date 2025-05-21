import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Wheat, Coffee, FuelIcon as Oil, DiamondPlusIcon as Gold, Beef } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCommodityIcon(type: string) {
  const lowerType = type.toLowerCase()

  if (lowerType.includes("soja")) {
    return <Wheat className="h-4 w-4 text-amber-600" />
  }
  if (lowerType.includes("milho")) {
    return <Wheat className="h-4 w-4 text-yellow-500" />
  }
  if (lowerType.includes("café") || lowerType.includes("cafe")) {
    return <Coffee className="h-4 w-4 text-amber-800" />
  }
  if (lowerType.includes("petróleo") || lowerType.includes("petroleo")) {
    return <Oil className="h-4 w-4 text-gray-800" />
  }
  if (lowerType.includes("ouro")) {
    return <Gold className="h-4 w-4 text-yellow-400" />
  }
  if (lowerType.includes("boi") || lowerType.includes("carne")) {
    return <Beef className="h-4 w-4 text-red-700" />
  }
  if (lowerType.includes("trigo")) {
    return <Wheat className="h-4 w-4 text-amber-400" />
  }

  // Ícone padrão
  return <Wheat className="h-4 w-4 text-amber-600" />
}
