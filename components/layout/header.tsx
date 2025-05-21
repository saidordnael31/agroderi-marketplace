import Link from "next/link"
import { LogIn, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  showActions?: boolean
}

export function Header({ title, showActions = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-800">{title}</h1>
        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white flex items-center gap-2" asChild>
              <Link href="/fornecedor">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Cadastrar Produto</span>
                <span className="sm:hidden">Cadastrar</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
