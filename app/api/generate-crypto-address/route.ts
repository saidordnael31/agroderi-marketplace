import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coin } = body

    console.log("🪙 Gerando endereço crypto para:", coin)

    // URL da API externa
    const externalApiUrl = "https://api.agroderivative.tech/api/generate-crypto-address/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    const data = {
      coin: coin,
    }

    console.log("📋 Dados enviados:", data)
    console.log("📋 Headers:", headers)

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })

    console.log("📊 Status da resposta externa:", response.status)
    console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa completos:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Endereço crypto gerado com sucesso!")

      // Verificar se os campos necessários estão presentes
      console.log("🔍 Verificando campos da resposta:")
      console.log("- address_info:", responseData.address_info ? "✅ Presente" : "❌ Ausente")

      if (responseData.address_info) {
        console.log("- address:", responseData.address_info.address ? "✅ Presente" : "❌ Ausente")
        console.log("- coin:", responseData.address_info.coin ? "✅ Presente" : "❌ Ausente")
        console.log("- network:", responseData.address_info.network ? "✅ Presente" : "❌ Ausente")
        console.log("- networkName:", responseData.address_info.networkName ? "✅ Presente" : "❌ Ausente")
      }

      // Retornar resposta padronizada
      return NextResponse.json(
        {
          success: true,
          message: responseData.message || "Endereço gerado com sucesso",
          address_info: responseData.address_info,
          source: responseData.source || "Brasil Bitcoin API",
          originalData: responseData,
        },
        { status: 200 },
      )
    } else {
      console.error("❌ Erro na API externa:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || responseData.error || "Erro ao gerar endereço crypto",
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("❌ Erro no proxy de geração de endereço crypto:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "crypto_address_generation_error",
      },
      { status: 500 },
    )
  }
}
