import React, { useState, useEffect } from 'react';
import { getEditorToken, setEditorToken, clearEditorToken } from '../services/auth';

export default function EditorBar() {
  const [tokenInput, setTokenInput] = useState('');
  const [active, setActive] = useState(!!getEditorToken());

  useEffect(() => {
    const handler = () => setActive(!!getEditorToken());
    window.addEventListener('editor-token-changed', handler);
    return () => window.removeEventListener('editor-token-changed', handler);
  }, []);

  const enter = () => {
    setEditorToken(tokenInput);
    setTokenInput('');
  };

  const exit = () => {
    clearEditorToken();
  };

  return (
    <div className="bg-light border-bottom py-2">
      <div className="container d-flex align-items-center justify-content-between">
        <div className="small text-muted">Modo Editor</div>
        {active ? (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success">Editor ativo</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={exit}>Sair</button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <input
              type="password"
              placeholder="Token do editor"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="form-control form-control-sm"
              style={{ maxWidth: 240 }}
            />
            <button className="btn btn-sm btn-primary" onClick={enter} disabled={!tokenInput.trim()}>
              Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

