import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, address, coin, amount, network } = body

    console.log("🪙 Dados recebidos para resgate crypto:", { cpf, address, coin, amount, network })

    // Validar campos obrigatórios
    if (!cpf || !address || !coin || !amount || !network) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos os campos são obrigatórios",
          details: "CPF, endereço, moeda, valor e rede são necessários",
        },
        { status: 400 },
      )
    }

    // URL da API externa
    const externalApiUrl = "https://api.agroderivative.tech/api/send-crypto-withdraw/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
      "User-Agent": "AgroDeri-Frontend/1.0",
    }

    const data = {
      cpf: cpf,
      address: address,
      coin: coin,
      amount: Number.parseFloat(amount),
      network: network,
    }

    console.log("📋 Dados enviados:", data)
    console.log("📋 Headers:", headers)

    // Fazer a requisição para o servidor externo com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

    try {
      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📊 Status da resposta externa:", response.status)
      console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

      const responseData = await response.json()
      console.log("📦 Dados da resposta externa completos:", JSON.stringify(responseData, null, 2))

      if (response.ok) {
        console.log("✅ Resgate crypto solicitado com sucesso!")

        return NextResponse.json(
          {
            success: true,
            message: "Resgate de criptomoeda solicitado com sucesso!",
            data: responseData,
          },
          { status: 200 },
        )
      } else if (response.status === 404) {
        console.error("❌ Usuário não encontrado na API externa")
        return NextResponse.json(
          {
            success: false,
            error: "Usuário não encontrado",
            details: "CPF não encontrado no sistema",
            type: "user_not_found",
          },
          { status: 404 },
        )
      } else {
        console.error("❌ Erro na API externa:", responseData)
        return NextResponse.json(
          {
            success: false,
            error: responseData.error || responseData.message || "Erro ao solicitar resgate crypto",
            details: responseData,
            type: "external_api_error",
          },
          { status: response.status },
        )
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("❌ Timeout na requisição para API externa")
        return NextResponse.json(
          {
            success: false,
            error: "Timeout na requisição",
            details: "A API externa não respondeu em tempo hábil",
            type: "timeout_error",
          },
          { status: 408 },
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error("❌ Erro no proxy de resgate crypto:", error)

    // Retornar erro detalhado
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "crypto_withdraw_request_error",
      },
      { status: 500 },
    )
  }
}
