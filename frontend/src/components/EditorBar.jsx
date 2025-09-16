import React, { useState, useEffect } from "react";
import { getEditorToken, setEditorToken, clearEditorToken } from "../services/auth";

export default function EditorBar({ className = "" }) {
  const [tokenInput, setTokenInput] = useState("");
  const [active, setActive] = useState(!!getEditorToken());

  useEffect(() => {
    const handler = () => setActive(!!getEditorToken());
    window.addEventListener("editor-token-changed", handler);
    return () => window.removeEventListener("editor-token-changed", handler);
  }, []);

  const enter = () => {
    setEditorToken(tokenInput);
    setTokenInput("");
  };

  const exit = () => {
    clearEditorToken();
  };

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <span className="text-muted small text-uppercase fw-semibold">Modo editor</span>
      {active ? (
        <>
          <span className="badge bg-success-subtle text-success border border-success-subtle">Ativo</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={exit}>
            Sair
          </button>
        </>
      ) : (
        <form
          className="d-flex align-items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (tokenInput.trim()) {
              enter();
            }
          }}
        >
          <input
            type="password"
            placeholder="Token do editor"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
          />
          <button className="btn btn-sm btn-primary" type="submit" disabled={!tokenInput.trim()}>
            Entrar
          </button>
        </form>
      )}
    </div>
  );
}
