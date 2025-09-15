import api from './http';

// ✅ Buscar lista de imóveis
export async function fetchImoveis() {
  const { data } = await api.get('/imoveis');
  return data;
}

// ✅ Excluir um imóvel
export async function deleteImovel(id) {
  const { data } = await api.delete(`/imoveis/${id}`);
  return data;
}

// ✅ Atualizar um imóvel (NÃO EXISTIA, ENTÃO ADICIONAMOS)
export async function updateImovel(id, payload) {
  const { data } = await api.patch(`/imoveis/${id}`, payload);
  return data;
}

export const addImovel = async (novoImovel) => {
  const { data } = await api.post('/imoveis', novoImovel);
  return data;
};

// Rodapé: Data de atualização (último confirmado <= hoje)
export async function fetchUltimaAtualizacao() {
  const { data } = await api.get('/dashboard/ultima_atualizacao');
  return data; // { data: 'DD/MM/AAAA' | null }
}

// Rodapé: Últimos lançamentos confirmados (globais)
export async function fetchUltimosLancamentos(limit = 10) {
  const { data } = await api.get(`/dashboard/ultimos_lancamentos?limit=${limit}`);
  return data; // [{ data, descricao, valor, imovel, categoria }]
}
