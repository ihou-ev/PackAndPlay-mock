// Pack&Play - ユーティリティ関数

// URLパラメータ取得
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 相対パス計算
function getRelativePath(targetPath) {
  const currentPath = window.location.pathname;
  const depth = (currentPath.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  return prefix + targetPath;
}

// デバウンス
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// フィルタリング
function filterItems(items, query, fields) {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    fields.some(field => 
      String(item[field]).toLowerCase().includes(lowerQuery)
    )
  );
}

// ソート
function sortItems(items, field, order = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

// ページネーション
function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    items: items.slice(start, end),
    total: items.length,
    page: page,
    perPage: perPage,
    totalPages: Math.ceil(items.length / perPage)
  };
}

// クリップボードコピー
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('コピーしました', 'success'))
      .catch(() => showToast('コピーに失敗しました', 'error'));
  } else {
    // フォールバック
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('コピーしました', 'success');
    } catch (err) {
      showToast('コピーに失敗しました', 'error');
    }
    document.body.removeChild(textarea);
  }
}

// フォームバリデーション
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const inputs = form.querySelectorAll('[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });
  
  return isValid;
}

// 確認ダイアログ
function confirmAction(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}
