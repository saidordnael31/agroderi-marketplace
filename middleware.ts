import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lista de rotas válidas do funil
  const validFunnelRoutes = ["/cadastro", "/pagamento", "/contrato"]

  // Se for uma rota do funil, permitir
  if (validFunnelRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para outras rotas, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
