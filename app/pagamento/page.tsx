"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AgroDeriLanding from "../page"

export default function PagamentoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página principal com parâmetro para abrir o checkout no step 2
    router.replace("/?step=pagamento")
  }, [router])

  return <AgroDeriLanding />
}
