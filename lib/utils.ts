import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Wheat, Coffee, FuelIcon as Oil, DiamondPlusIcon as Gold } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCommodityIcon(type: string) {
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
      return <Gold className="h-4 w-4 text-yellow-400" />
    default:
      return <Wheat className="h-4 w-4 text-amber-600" />
  }
}
