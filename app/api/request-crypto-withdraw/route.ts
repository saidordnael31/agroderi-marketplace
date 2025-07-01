import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🪙 Dados recebidos no proxy de resgate crypto:", body)

    // Validar campos obrigatórios
    const { cpf, address, coin, amount, network } = body

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório", field: "cpf" }, { status: 400 })
    }

    if (!address) {
      return NextResponse.json({ error: "Endereço da carteira é obrigatório", field: "address" }, { status: 400 })
    }

    if (!coin) {
      return NextResponse.json({ error: "Criptomoeda é obrigatória", field: "coin" }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor deve ser maior que zero", field: "amount" }, { status: 400 })
    }

    if (!network) {
      return NextResponse.json({ error: "Rede é obrigatória", field: "network" }, { status: 400 })
    }

    // URL do servidor externo
    const externalApiUrl = "https://api.agroderivative.tech/api/send-crypto-withdraw/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)
    console.log("📦 Dados enviados:", {
      cpf,
      address: address.substring(0, 10) + "...", // Log parcial por segurança
      coin,
      amount,
      network,
    })

    // Fazer a requisição para o servidor externo com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

    try {
      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "AgroDeri-Frontend/1.0",
        },
        body: JSON.stringify({
          cpf,
          address,
          coin,
          amount,
          network,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📊 Status da resposta externa:", response.status)

      // Tratar resposta 404 especificamente
      if (response.status === 404) {
        console.log("❌ Endpoint não encontrado (404)")
        return NextResponse.json(
          {
            error: "Serviço de resgate crypto temporariamente indisponível",
            details: "Endpoint não encontrado",
            type: "service_unavailable",
          },
          { status: 503 },
        )
      }

      const data = await response.json()
      console.log("📦 Dados da resposta externa:", data)

      // Verificar se a resposta indica sucesso
      if (response.ok) {
        console.log("✅ Resgate crypto solicitado com sucesso!")

        return NextResponse.json(
          {
            success: true,
            message: "Solicitação de resgate enviada com sucesso",
            data: data,
            details: {
              coin,
              amount,
              network,
              address: address.substring(0, 10) + "...", // Retornar endereço parcial por segurança
            },
          },
          { status: 200 },
        )
      } else {
        console.log("❌ Erro na resposta da API externa:", data)

        return NextResponse.json(
          {
            success: false,
            error: data.error || data.message || "Erro ao processar resgate",
            details: data,
            type: "api_error",
          },
          { status: response.status },
        )
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.log("⏰ Timeout na requisição de resgate crypto")
        return NextResponse.json(
          {
            error: "Timeout na solicitação de resgate",
            details: "A requisição demorou mais que 10 segundos",
            type: "timeout_error",
          },
          { status: 408 },
        )
      }

      throw fetchError
    }
  } catch (error: any) {
    console.error("❌ Erro no proxy de resgate crypto:", error)

    // Retornar erro detalhado para debugging
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        type: "proxy_error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
