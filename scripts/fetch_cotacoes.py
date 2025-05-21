import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime

# URL base
URL = "https://www.agrolink.com.br/cotacoes/"

# User-Agent para simular navegador
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def fetch_agrolink_quotes():
    response = requests.get(URL, headers=HEADERS)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Localiza a tabela de cotações (ajustável conforme mudanças no HTML)
    tables = soup.find_all('table')
    
    if not tables:
        print("⚠️ Nenhuma tabela encontrada.")
        return

    dataframes = []
    for table in tables:
        df = pd.read_html(str(table), decimal=",", thousands=".")[0]
        dataframes.append(df)

    # Junta todas as tabelas em um só DataFrame (se necessário)
    final_df = pd.concat(dataframes, ignore_index=True)

    # Adiciona a data de coleta
    final_df['Data Coleta'] = datetime.now().strftime("%Y-%m-%d")

    # Salva localmente (pode ser substituído por upload em banco)
    final_df.to_csv("cotacoes_agrolink.csv", index=False)
    print("✅ Cotações salvas com sucesso!")

    return final_df

# Executa
if __name__ == "__main__":
    df = fetch_agrolink_quotes()
    print(df.head())
