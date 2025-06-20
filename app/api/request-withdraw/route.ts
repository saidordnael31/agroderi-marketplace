import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, value, pixKey } = body

 //   console.log("💰 Dados recebidos para resgate:", { cpf, value, pixKey })

    // URL da API externa
    const externalApiUrl = "https://api.agroderivative.tech/api/new-fiat-withdraw/"

//    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    const data = {
      cpf: cpf,
      value: Number.parseFloat(value),
      pixKey: pixKey,
    }

 //   console.log("📋 Dados enviados:", data)
 //   console.log("📋 Headers:", headers)

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })

 //   console.log("📊 Status da resposta externa:", response.status)
 //   console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    const responseData = await response.json()
 //   console.log("📦 Dados da resposta externa completos:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
  //    console.log("✅ Resgate solicitado com sucesso!")

      return NextResponse.json(
        {
          success: true,
          message: "Resgate solicitado com sucesso!",
          data: responseData,
        },
        { status: 200 },
      )
    } else {
    //  console.error("❌ Erro na API externa:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.error || responseData.message || "Erro ao solicitar resgate",
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
 //   console.error("❌ Erro no proxy de resgate:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "withdraw_request_error",
      },
      { status: 500 },
    )
  }
}
