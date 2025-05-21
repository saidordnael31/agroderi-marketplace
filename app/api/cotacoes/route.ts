import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Função para executar o script Python
async function executePythonScript() {
  return new Promise((resolve, reject) => {
    exec("python scripts/fetch_cotacoes.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o script: ${error.message}`)
        return reject(error)
      }
      if (stderr) {
        console.error(`Erro no script: ${stderr}`)
        return reject(new Error(stderr))
      }
      resolve(stdout)
    })
  })
}

export async function GET() {
  try {
    // Em produção, você pode querer usar um serviço como Vercel Cron para agendar esta execução
    // Esta rota pode ser chamada manualmente ou agendada
    await executePythonScript()

    // Ler o arquivo CSV gerado
    const csvPath = path.join(process.cwd(), "cotacoes_agrolink.csv")
    const csvData = await fs.readFile(csvPath, "utf8")

    // Processar o CSV (exemplo simples)
    const rows = csvData.split("\n")
    const headers = rows[0].split(",")

    const cotacoes = rows
      .slice(1)
      .map((row) => {
        const values = row.split(",")
        const cotacao = {}

        headers.forEach((header, index) => {
          cotacao[header.trim()] = values[index]?.trim()
        })

        return cotacao
      })
      .filter((cotacao) => cotacao.Produto) // Filtrar linhas vazias

    // Opcional: Armazenar no Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("cotacoes").upsert(
        cotacoes.map((cotacao) => ({
          produto: cotacao.Produto,
          local: cotacao.Local,
          preco: Number.parseFloat(cotacao.Preço?.replace("R$", "").trim() || "0"),
          data_coleta: cotacao["Data Coleta"],
        })),
        { onConflict: "produto,local,data_coleta" },
      )

      if (error) {
        console.error("Erro ao inserir no Supabase:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cotações atualizadas com sucesso",
      count: cotacoes.length,
      cotacoes: cotacoes.slice(0, 10), // Retornar apenas as primeiras 10 para preview
    })
  } catch (error) {
    console.error("Erro ao processar cotações:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao processar cotações", error: error.message },
      { status: 500 },
    )
  }
}
