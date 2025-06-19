import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get("cpf")

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    console.log("🔍 Buscando perfil para CPF:", cpf)

    const response = await fetch(`https://api.agroderivative.tech/api/users/profile-by-cpf/?cpf=${cpf}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
      },
    })

    console.log("📊 Status da resposta da API externa:", response.status)

    if (response.ok) {
      const profileData = await response.json()
      console.log("✅ Dados do perfil obtidos com sucesso")

      return NextResponse.json(profileData)
    } else {
      const errorData = await response.text()
      console.error("❌ Erro na API externa:", errorData)

      return NextResponse.json({ error: "Usuário não encontrado ou erro na API" }, { status: response.status })
    }
  } catch (error) {
    console.error("❌ Erro interno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
