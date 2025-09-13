import React, { useState, useEffect } from "react";
import api from "../../services/http";

function ModalEditarImovel({ imovel, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    vendido: false,
    endereco: "",
    nome_ocupante: "",
    cpf_ocupante: "",
    latitude: "",
    longitude: "",
    corretagem: "",
    ganho_capital: "",
    valor_venda: ""
  });

  useEffect(() => {
    if (imovel) {
      setForm({
        nome: imovel.nome || "",
        vendido: imovel.vendido || false,
        endereco: imovel.endereco || "",
        nome_ocupante: imovel.nome_ocupante || "",
        cpf_ocupante: imovel.cpf_ocupante || "",
        latitude: imovel.latitude !== null ? imovel.latitude : "",
        longitude: imovel.longitude !== null ? imovel.longitude : "",
        corretagem: formatarPercentual(imovel.corretagem),
        ganho_capital: formatarPercentual(imovel.ganho_capital),
        valor_venda: formatarMoeda(imovel.valor_venda)
      });
    }
  }, [imovel]);

  const formatarPercentual = (valor) => {
    if (valor === null || valor === undefined || isNaN(valor)) return "";
    return (parseFloat(valor) * 100).toFixed(2).replace(".", ",");
  };

  const desformatarPercentual = (valor) => {
    if (!valor) return null;
    return parseFloat(valor.replace(",", ".")) / 100;
  };

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || isNaN(parseFloat(valor))) return "";
    return parseFloat(valor).toFixed(2).replace(".", ",");
  };

  const desformatarMoeda = (valor) => {
    if (!valor) return null;
    return parseFloat(valor.replace(".", "").replace(",", "."));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        nome: form.nome,
        vendido: form.vendido,
        endereco: form.endereco,
        nome_ocupante: form.nome_ocupante,
        cpf_ocupante: form.cpf_ocupante,
        latitude: form.latitude !== "" ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== "" ? parseFloat(form.longitude) : null,
        corretagem: desformatarPercentual(form.corretagem),
        ganho_capital: desformatarPercentual(form.ganho_capital),
        valor_venda: desformatarMoeda(form.valor_venda)
      };

      await api.patch(`/imoveis/${imovel.id}`, payload);

      alert("Imóvel atualizado com sucesso!");
      onSave(); // Atualiza o card e fecha o modal
    } catch (error) {
      console.error("Erro ao atualizar imóvel", error);
      alert("Erro ao salvar alterações.");
    }
  };

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Editar Imóvel</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Nome</label>
              <input
                type="text"
                name="nome"
                className="form-control"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-check mb-2">
              <input
                type="checkbox"
                name="vendido"
                className="form-check-input"
                checked={form.vendido}
                onChange={handleChange}
              />
              <label className="form-check-label">Vendido</label>
            </div>

            <div className="mb-2">
              <label className="form-label">Endereço</label>
              <input
                type="text"
                name="endereco"
                className="form-control"
                value={form.endereco}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Nome Ocupante</label>
              <input
                type="text"
                name="nome_ocupante"
                className="form-control"
                value={form.nome_ocupante}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">CPF Ocupante</label>
              <input
                type="text"
                name="cpf_ocupante"
                className="form-control"
                value={form.cpf_ocupante}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Latitude</label>
              <input
                type="text"
                name="latitude"
                className="form-control"
                value={form.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Longitude</label>
              <input
                type="text"
                name="longitude"
                className="form-control"
                value={form.longitude}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Corretagem (%)</label>
              <input
                type="text"
                name="corretagem"
                className="form-control"
                value={form.corretagem}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Ganho Capital (%)</label>
              <input
                type="text"
                name="ganho_capital"
                className="form-control"
                value={form.ganho_capital}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Valor Venda (R$)</label>
              <input
                type="text"
                name="valor_venda"
                className="form-control"
                value={form.valor_venda}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
            <button className="btn btn-success btn-sm" onClick={handleSubmit}>Salvar</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ModalEditarImovel;
