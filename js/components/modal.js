// Pack&Play - モーダルコンポーネント

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// モーダルの外側クリックで閉じる
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

// 閉じるボタンの処理
document.addEventListener('click', function(e) {
  const closeBtn = e.target.closest('[data-close-modal]');
  if (closeBtn) {
    const modalId = closeBtn.getAttribute('data-close-modal');
    closeModal(modalId);
  }
});
