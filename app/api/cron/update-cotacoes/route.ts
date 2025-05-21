import { NextResponse } from "next/server"

// Esta rota pode ser chamada por um serviço de cron como Vercel Cron
// Configuração no vercel.json:
// {
//   "crons": [
//     {
//       "path": "/api/cron/update-cotacoes",
//       "schedule": "0 8 * * *"
//     }
//   ]
// }

export async function GET() {
  try {
    // Chama a API de cotações para atualizar os dados
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cotacoes`, {
      method: "GET",
      headers: {
        // Adicione uma chave de API para segurança
        "x-api-key": process.env.CRON_API_KEY || "",
      },
    })

    if (!response.ok) {
      throw new Error(`Falha ao atualizar cotações: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Cotações atualizadas com sucesso via cron",
      data,
    })
  } catch (error) {
    console.error("Erro no job de atualização de cotações:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar cotações", error: error.message },
      { status: 500 },
    )
  }
}
