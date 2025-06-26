"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AgroDeriLanding from "../page"

export default function ContratoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página principal com parâmetro para abrir o checkout no step 3
    router.replace("/?step=contrato")
  }, [router])

  return <AgroDeriLanding />
}
