// TransacoesIncompletas.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/http";
import LancamentosTable from "./LancamentosTable";
import ModalEdicao from "./ModalEdicao";
import ModalLote from "./ModalLote";
import useEditorToken from "../../hooks/useEditorToken";

function TransacoesIncompletas() {
  const { id } = useParams();
  const [lancamentos, setLancamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [editandoLancamento, setEditandoLancamento] = useState(null);
  const [formEdicao, setFormEdicao] = useState({});
  const [textoLote, setTextoLote] = useState('');
  const editorToken = useEditorToken();
  const canEdit = !!editorToken;

  useEffect(() => {
    fetchLancamentosIncompletos();
    fetchCategoriasEImoveis();
  }, [id]);

  const fetchLancamentosIncompletos = async () => {
    try {
      const { data } = await api.get(`/dashboard/lancamentos/incompletos/${id}`);
      setLancamentos(data);
    } catch (error) {
      console.error("Erro ao buscar lançamentos incompletos", error);
    }
  };

  const fetchCategoriasEImoveis = async () => {
    try {
      const [resCategorias, resImoveis] = await Promise.all([
        api.get(`/categorias`),
        api.get(`/imoveis`),
      ]);
      setCategorias(resCategorias.data);
      setImoveis(resImoveis.data);
    } catch (error) {
      console.error("Erro ao buscar categorias/imóveis", error);
    }
  };

  const handleExcluir = async (lancamentoId) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

    try {
      await api.delete(`/dashboard/lancamentos/${lancamentoId}`);
      fetchLancamentosIncompletos();
    } catch (error) {
      console.error("Erro ao excluir lançamento", error);
    }
  };

  const iniciarEdicao = (lancamento) => {
    setEditandoLancamento(lancamento.id_lancamento);
    setFormEdicao({
      data: lancamento.data,
      descricao: lancamento.descricao,
      valor: lancamento.valor.toFixed(2).replace('.', ','),
      id_categoria: lancamento.id_categoria || 0,
      id_imovel: lancamento.id_imovel,
      id_situacao: lancamento.id_situacao
    });
    const modal = new bootstrap.Modal(document.getElementById('modalEdicao'));
    modal.show();
  };

  const salvarEdicao = async () => {
    if (!editandoLancamento) {
      alert("Nenhum lançamento selecionado para edição.");
      return;
    }

    try {
      const payload = {
        data: formEdicao.data,
        descricao: formEdicao.descricao,
        valor: tratarValor(formEdicao.valor),
        id_categoria: parseInt(formEdicao.id_categoria),
        id_imovel: parseInt(formEdicao.id_imovel),
        id_situacao: parseInt(formEdicao.id_situacao)
      };

      await api.patch(`/dashboard/lancamentos/${editandoLancamento}`, payload);
      fetchLancamentosIncompletos();
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEdicao'));
      modal.hide();
      setEditandoLancamento(null);
    } catch (error) {
      console.error("Erro ao atualizar lançamento", error);
      alert("Erro ao salvar a edição.");
    }
  };

  const tratarValor = (valorStr) => {
    if (!valorStr) return 0;
    const valorLimpo = valorStr.trim().replace(/\./g, "").replace(",", ".");
    const valorNumerico = parseFloat(valorLimpo);
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  };

  const abrirModalLote = () => {
    const modal = new bootstrap.Modal(document.getElementById('modalLote'));
    modal.show();
  };

  const enviarLote = async () => {
    try {
      if (!textoLote.trim()) {
        alert("Cole os dados do Excel antes de enviar.");
        return;
      }

      const linhas = textoLote.trim().split("\n");

      const novosLancamentos = linhas.map((linha, index) => {
        const partes = linha.includes("\t") ? linha.split("\t") : linha.split(";");

        if (partes.length < 3) {
          throw new Error(`Linha ${index + 1} inválida: "${linha}".`);
        }

        const [data, descricao, valor] = partes;

        return {
          data: data.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor.replace(",", ".").trim()),
          id_imovel: parseInt(id),
          id_categoria: 0,
          id_situacao: 1,
          ativo: 1
        };
      });

      await api.post('/dashboard/lancamentos/lote', novosLancamentos);

      alert('Lançamentos adicionados com sucesso!');
      fetchLancamentosIncompletos();
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalLote'));
      modal.hide();
      setTextoLote('');
    } catch (error) {
      console.error('Erro ao adicionar lançamentos em lote:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="col-md-6">
      <div className="card p-3 shadow-sm position-relative h-100">
        <h2 className="fs-6 fw-bold d-flex justify-content-between align-items-center">
          Transações Incompletas
          {canEdit && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={abrirModalLote}
              title="Adicionar em Lote"
            >
              📥
            </button>
          )}
        </h2>

        <LancamentosTable
          lancamentos={lancamentos}
          onEdit={iniciarEdicao}
          onDelete={handleExcluir}
          editable={canEdit}
        />
      </div>

      <ModalEdicao
        formEdicao={formEdicao}
        setFormEdicao={setFormEdicao}
        salvarEdicao={salvarEdicao}
        categorias={categorias}
        imoveis={imoveis}
      />

      <ModalLote
        textoLote={textoLote}
        setTextoLote={setTextoLote}
        enviarLote={enviarLote}
      />
    </div>
  );
}

export default TransacoesIncompletas;
