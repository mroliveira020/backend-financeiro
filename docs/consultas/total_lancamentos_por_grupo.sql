-- Total de lançamentos confirmados por grupo para um imóvel específico.
-- Parâmetros esperados:
--   :id_imovel → ID do imóvel desejado
-- Ajuste a lista do NOT IN conforme for necessário excluir categorias específicas (ex.: créditos/ressarcimentos).

SELECT g.grupo,
       SUM(l.valor) AS total
FROM lancamentos l
JOIN categorias c ON c.id = l.id_categoria
JOIN grupos g ON g.id = c.id_grupo
WHERE l.id_imovel = :id_imovel
  AND l.id_situacao = 1
  AND (l.ativo IS DISTINCT FROM FALSE)
  AND (l.id_categoria IS NULL OR c.id NOT IN (4, 8, 15, 18))
GROUP BY g.grupo
ORDER BY g.grupo;
