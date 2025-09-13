import os
import sys

def gerar_relatorio_pasta(pasta_raiz, nome_arquivo_saida="contexto.txt",
                          dirs_to_exclude=None, file_contents_to_exclude=None):
    """
    Gera um arquivo de texto com a estrutura de uma pasta e o conteúdo
    dos arquivos nela contidos, excluindo certas subpastas da caminhada
    e o conteúdo de certos arquivos por nome.
    O arquivo de saída é criado dentro da pasta_raiz.

    Args:
        pasta_raiz (str): O caminho completo para a pasta a ser analisada.
        nome_arquivo_saida (str): O nome do arquivo .txt a ser gerado dentro da pasta_raiz.
                                  Padrão é 'contexto.txt'.
        dirs_to_exclude (set or list, optional): Conjunto ou lista de nomes
                                                 de diretórios a serem totalmente
                                                 excluídos da análise (não aparecem
                                                 nem na estrutura, nem no conteúdo).
                                                 Padrão: {'node_modules', 'public', 'venv'}.
        file_contents_to_exclude (set or list, optional): Conjunto ou lista de nomes
                                                          de arquivos cujo CONTEÚDO
                                                          deve ser omitido (o arquivo
                                                          ainda aparecerá na estrutura).
                                                          Padrão: {'.env'}.
    """

    # Define os conjuntos de exclusão, usando padrões se não forem fornecidos
    diretorios_a_excluir_set = set(dirs_to_exclude) if dirs_to_exclude is not None else {'node_modules', 'public', 'venv'}
    arquivos_conteudo_a_excluir_set = set(file_contents_to_exclude) if file_contents_to_exclude is not None else {'.env'} # Adiciona .env por padrão

    # Define o caminho completo do arquivo de saída
    caminho_completo_arquivo_saida = os.path.join(pasta_raiz, nome_arquivo_saida)

    # Verifica se a pasta existe
    if not os.path.isdir(pasta_raiz):
        print(f"Erro: O caminho '{pasta_raiz}' não é um diretório válido ou não existe.")
        return

    try:
        # Abre o arquivo de saída para escrita
        with open(caminho_completo_arquivo_saida, 'w', encoding='utf-8') as f_out:
            f_out.write(f"Relatório da Estrutura e Conteúdo da Pasta: {pasta_raiz}\n")
            f_out.write("=" * 70 + "\n\n")

            # --- Parte 1: Gerar a Estrutura da Pasta ---
            f_out.write("ESTRUTURA DE PASTAS E ARQUIVOS:\n")
            f_out.write("-" * 70 + "\n")

            # Lista para armazenar a estrutura e os caminhos dos arquivos para conteúdo
            estrutura_linhas = []
            arquivos_para_conteudo = [] # Lista de caminhos completos dos arquivos cujo conteúdo será *considerado* para leitura

            # topdown=True garante que diretórios são visitados antes de seus conteúdos.
            # Modificar 'dirs' in-place impede os.walk de entrar nesses diretórios.
            for root, dirs, files in os.walk(pasta_raiz, topdown=True):

                # --- EXCLUIR DIRETÓRIOS NÃO DESEJADOS ---
                # Modifica a lista 'dirs' in-place para pular os diretórios especificados
                # Isso impede que os.walk() entre neles e, consequentemente,
                # impede que seus conteúdos (subdiretórios e arquivos) sejam processados
                dirs[:] = [d for d in dirs if d not in diretorios_a_excluir_set]
                # --------------------------------------

                # Calcula o nível de profundidade para indentação
                # Se for a pasta raiz, o nível é 0
                if root == pasta_raiz:
                    level = 0
                    # Pega apenas o nome base da pasta raiz para exibição
                    # Usa o caminho completo se basename for vazio (ex: para '/')
                    nome_pasta_atual = os.path.basename(pasta_raiz) or pasta_raiz
                else:
                    # Calcula a profundidade baseada no caminho relativo
                    caminho_relativo = os.path.relpath(root, pasta_raiz)
                    level = caminho_relativo.count(os.sep) + 1
                    nome_pasta_atual = os.path.basename(root) # Nome da subpasta

                indent = "    " * level
                estrutura_linhas.append(f"{indent}[{nome_pasta_atual}/]\n") # Marca diretórios

                sub_indent = "    " * (level + 1)

                # Ordena arquivos para uma saída consistente (opcional, mas bom para legibilidade)
                files.sort()

                for nome_arquivo in files:
                    caminho_completo_arquivo = os.path.join(root, nome_arquivo)
                    estrutura_linhas.append(f"{sub_indent}{nome_arquivo}\n")
                    # Adiciona para processar conteúdo APENAS se o arquivo não estiver dentro de um diretório excluído.
                    # Como modificamos 'dirs[:]', os.walk NÃO visitará os diretórios excluídos,
                    # então os arquivos dentro deles NUNCA chegarão a este ponto de 'files'.
                    # Portanto, a lista 'arquivos_para_conteudo' já exclui arquivos em diretórios excluídos.
                    # A exclusão do CONTEÚDO pelo nome do arquivo (.env) será feita na próxima seção.
                    arquivos_para_conteudo.append(caminho_completo_arquivo) # Adiciona todos os arquivos encontrados (que não estão em diretórios excluídos)

            # Escreve a estrutura coletada no arquivo
            for linha in estrutura_linhas:
                f_out.write(linha)

            # --- Parte 2: Adicionar Conteúdo dos Arquivos ---
            f_out.write("\n\n")
            f_out.write("CONTEÚDO DOS ARQUIVOS:\n")
            f_out.write("=" * 70 + "\n\n")

            # Processa os arquivos coletados
            for caminho_arquivo in arquivos_para_conteudo:
                # Cria um cabeçalho usando o caminho relativo para clareza
                caminho_relativo_arquivo = os.path.relpath(caminho_arquivo, pasta_raiz)
                nome_base_arquivo = os.path.basename(caminho_arquivo) # Pega o nome do arquivo para verificar exclusão de conteúdo

                # --- VERIFICAÇÃO DE ARQUIVOS PARA EXCLUIR CONTEÚDO ---
                if nome_base_arquivo in arquivos_conteudo_a_excluir_set:
                    f_out.write(f"--- CONTEÚDO DE: {caminho_relativo_arquivo} ---\n")
                    f_out.write("-" * (len(f"--- CONTEÚDO DE: {caminho_relativo_arquivo} ---")) + "\n")
                    f_out.write(f"[CONTEÚDO OMITIDO: Arquivo '{nome_base_arquivo}' excluído por configuração]\n")
                    f_out.write(f"\n--- FIM DO CONTEÚDO DE: {caminho_relativo_arquivo} ---\n\n")
                    continue # Pula para o próximo arquivo na lista (não lê o conteúdo)
                # -----------------------------------------------------

                # Se não foi excluído pelo nome, tenta ler o conteúdo
                f_out.write(f"--- CONTEÚDO DE: {caminho_relativo_arquivo} ---\n")
                f_out.write("-" * (len(f"--- CONTEÚDO DE: {caminho_relativo_arquivo} ---")) + "\n") # Linha separadora

                try:
                    # Tenta ler como texto UTF-8 (mais comum)
                    with open(caminho_arquivo, 'r', encoding='utf-8') as f_in:
                        conteudo = f_in.read()
                        f_out.write(conteudo)

                except UnicodeDecodeError:
                    # Se falhar, tenta como Latin-1 (comum em alguns sistemas/arquivos legados)
                    try:
                        with open(caminho_arquivo, 'r', encoding='latin-1') as f_in:
                            conteudo = f_in.read()
                            f_out.write(conteudo)
                        f_out.write("\n[AVISO: LIDO COM ENCODING LATIN-1 POIS UTF-8 FALHOU]\n")
                    except Exception as e_inner:
                         f_out.write(f"\n[ERRO AO LER ARQUIVO: Não foi possível decodificar como UTF-8 ou Latin-1. Pode ser binário. Erro: {e_inner}]\n")
                except PermissionError:
                     f_out.write(f"\n[ERRO AO LER ARQUIVO: Permissão negada]\n")
                except FileNotFoundError:
                    # Improvável acontecer aqui, pois o caminho foi coletado pelo os.walk
                     f_out.write(f"\n[ERRO: Arquivo não encontrado (inesperado): {caminho_relativo_arquivo}]\n")
                except Exception as e:
                    # Captura outros erros de leitura (ex: arquivo muito grande, etc.)
                    f_out.write(f"\n[ERRO AO LER ARQUIVO: {e}]\n")

                f_out.write(f"\n--- FIM DO CONTEÚDO DE: {caminho_relativo_arquivo} ---\n\n") # Finaliza o bloco de conteúdo

        print(f"Relatório gerado com sucesso em '{caminho_completo_arquivo_saida}'")

    except IOError as e:
        print(f"Erro ao escrever no arquivo de saída '{caminho_completo_arquivo_saida}': {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")


# --- Bloco Principal para Execução ---
if __name__ == "__main__":
    # Define a pasta alvo explicitamente
    # Exemplo: pasta_alvo = "/caminho/para/sua/pasta/projeto"
    # Você pode definir um caminho fixo ou usar o diretório atual do script
    pasta_alvo = os.path.dirname(os.path.abspath(__file__)) # Usa o diretório onde o script está

    # Define o nome do arquivo de saída
    nome_arquivo_saida = "contexto.txt" # O arquivo será criado dentro de pasta_alvo

    # Define as listas de exclusão (agora passadas como argumentos)
    # Você pode modificar essas listas aqui conforme necessário
    diretorios_excluidos = {'node_modules', 'public', 'venv'}
    arquivos_conteudo_excluidos = {'.env'} # Adicionamos .env explicitamente para exclusão de conteúdo

    print("--- Gerador de Relatório de Estrutura e Conteúdo de Pasta ---")
    print(f"Analisando a pasta: {pasta_alvo}")
    print(f"Excluindo subpastas (totalmente): {' ,'.join(diretorios_excluidos)}")
    print(f"Excluindo conteúdo dos arquivos com os nomes: {' ,'.join(arquivos_conteudo_excluidos)}")
    print(f"O relatório será salvo como: {nome_arquivo_saida} DENTRO desta pasta.")
    print("-" * 70)

    # Verifica se a pasta alvo existe antes de tentar processar
    if not os.path.isdir(pasta_alvo):
        print(f"Erro fatal: A pasta especificada '{pasta_alvo}' não foi encontrada ou não é um diretório válido.")
        sys.exit(1) # Sai do script com código de erro

    # Chama a função principal com os caminhos e listas de exclusão definidas
    gerar_relatorio_pasta(pasta_alvo, nome_arquivo_saida,
                          dirs_to_exclude=diretorios_excluidos,
                          file_contents_to_exclude=arquivos_conteudo_excluidos)

    print("-" * 70)
    print("Processo concluído.")