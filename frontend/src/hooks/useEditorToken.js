import { useEffect, useState } from 'react';
import { getEditorToken } from '../services/auth';

export default function useEditorToken() {
  const [token, setToken] = useState(() => getEditorToken());

  useEffect(() => {
    const handler = () => setToken(getEditorToken());
    window.addEventListener('editor-token-changed', handler);
    return () => window.removeEventListener('editor-token-changed', handler);
  }, []);

  return token;
}

