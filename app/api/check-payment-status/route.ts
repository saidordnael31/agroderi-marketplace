import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    console.log("🔍 Verificando status do pagamento para CPF:", cpf)

    // URL da API externa - GET endpoint
    const externalApiUrl = `https://api.agroderivative.tech/api/get-deposit-status/?cpf=${cpf}`

    console.log("🔗 Fazendo requisição GET para:", externalApiUrl)

    const headers = {
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    console.log("📋 Headers enviados:", headers)

    // Fazer a requisição GET para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: headers,
    })

    console.log("📊 Status da resposta externa:", response.status)
    console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    let responseData
    try {
      responseData = await response.json()
      console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse da resposta:", parseError)
      const textResponse = await response.text()
      console.log("📄 Resposta como texto:", textResponse)

      return NextResponse.json(
        {
          success: true,
          confirmed: false,
          error: "Erro ao processar resposta da API",
          details:"ssss" +textResponse,
        },
        { status: 200 },
      )
    }

    // Verificar diferentes cenários de resposta
    if (response.status === 200) {
    
        console.log("✅ Pagamento confirmado!")
        return NextResponse.json(
          {
            success: true,
            confirmed: true,
            message: "Pagamento confirmado",
            data: responseData,
          },
          { status: 200 },
        )
      
    } else if (response.status === 404) {
      console.log("🔍 Depósito não encontrado (ainda não foi feito)")
      return NextResponse.json(
        {
          success: true,
          confirmed: false,
          message: "Depósito não encontrado",
          data: responseData,
        },
        { status: 200 },
      )
    } else {
      console.log("❌ Erro na API externa:", response.status, responseData)
      return NextResponse.json(
        {
          success: true,
          confirmed: false,
          error: `Erro na API externa: ${response.status}`,
          data: responseData,
        },
        { status: 200 }, // Retornar 200 para não quebrar o polling
      )
    }
  } catch (error) {
    console.error("❌ Erro ao verificar status do pagamento:", error)

    // Retornar erro mas com status 200 para não quebrar o polling
    return NextResponse.json(
      {
        success: true,
        confirmed: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "payment_status_error",
      },
      { status: 200 },
    )
  }
}
