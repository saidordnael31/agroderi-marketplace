"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AgroDeriLanding from "../page"

export default function CadastroPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página principal com parâmetro para abrir o checkout no step 1
    router.replace("/?step=cadastro")
  }, [router])

  return <AgroDeriLanding />
}
