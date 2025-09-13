const KEY = 'EDITOR_TOKEN';

export function getEditorToken() {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch (_) {
    return '';
  }
}

export function setEditorToken(token) {
  try {
    if (token && token.trim()) {
      sessionStorage.setItem(KEY, token.trim());
    } else {
      sessionStorage.removeItem(KEY);
    }
    window.dispatchEvent(new CustomEvent('editor-token-changed'));
  } catch (_) {
    // ignore storage errors
  }
}

export function clearEditorToken() {
  setEditorToken('');
}

export function hasEditorToken() {
  return !!getEditorToken();
}

