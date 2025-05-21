import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Configuração do Supabase não encontrada")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Dados de exemplo para popular a tabela
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    const cotacoesData = [
      // Cotações de hoje
      {
        produto: "Soja (60kg)",
        local: "Sorriso - MT",
        preco: 125.5,
        data_coleta: today,
      },
      {
        produto: "Milho (60kg)",
        local: "Chapadão do Sul - MS",
        preco: 65.3,
        data_coleta: today,
      },
      {
        produto: "Café Arábica (60kg)",
        local: "Patrocínio - MG",
        preco: 1250.75,
        data_coleta: today,
      },
      {
        produto: "Boi Gordo (@)",
        local: "São Paulo - SP",
        preco: 285.2,
        data_coleta: today,
      },
      {
        produto: "Trigo (60kg)",
        local: "Cascavel - PR",
        preco: 78.45,
        data_coleta: today,
      },

      // Cotações de ontem (com valores ligeiramente diferentes)
      {
        produto: "Soja (60kg)",
        local: "Sorriso - MT",
        preco: 124.8,
        data_coleta: yesterday,
      },
      {
        produto: "Milho (60kg)",
        local: "Chapadão do Sul - MS",
        preco: 64.9,
        data_coleta: yesterday,
      },
      {
        produto: "Café Arábica (60kg)",
        local: "Patrocínio - MG",
        preco: 1245.5,
        data_coleta: yesterday,
      },
      {
        produto: "Boi Gordo (@)",
        local: "São Paulo - SP",
        preco: 283.75,
        data_coleta: yesterday,
      },
      {
        produto: "Trigo (60kg)",
        local: "Cascavel - PR",
        preco: 77.9,
        data_coleta: yesterday,
      },
    ]

    // Inserir dados na tabela
    const { data, error } = await supabase
      .from("cotacoes")
      .upsert(cotacoesData, { onConflict: "produto,local,data_coleta" })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Dados de exemplo inseridos com sucesso",
      count: cotacoesData.length,
    })
  } catch (error) {
    console.error("Erro ao inserir dados de exemplo:", error)
    return NextResponse.json(
      { success: false, message: `Erro ao inserir dados de exemplo: ${error.message}` },
      { status: 500 },
    )
  }
}
