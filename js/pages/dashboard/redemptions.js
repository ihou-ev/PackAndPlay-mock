// 配信者ロールチェック
requireCreatorRole();

// 承認待ちデータ（ローカルストレージから取得）
let redemptions = loadFromStorage('redemptions', redeemQueue);

let currentFilter = 'pending';
let rejectingId = null;

function renderRedemptions(redemptionsToRender) {
  const list = document.getElementById('redemptionsList');
  const emptyState = document.getElementById('emptyState');

  if (redemptionsToRender.length === 0) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  list.innerHTML = redemptionsToRender.map(redemption => {
    const stateClass = redemption.state === 'approved' ? 'approved' : redemption.state === 'rejected' ? 'rejected' : '';
    const timeAgo = formatTimeAgo(redemption.createdAt);

    return `
      <div class="redemption-card ${stateClass} fade-in">
        <div class="flex-between mb-3">
          <div class="flex gap-2" style="align-items: center;">
            <div style="font-size: 2rem;">🎴</div>
            <div>
              <div style="font-size: 1.125rem; font-weight: 700;">${redemption.cardName}</div>
              <div style="color: var(--text-light); font-size: 0.875rem;">
                ${redemption.viewerName} • ${timeAgo}
              </div>
            </div>
          </div>
          <span class="badge badge-rarity-${redemption.cardRarity.toLowerCase()}">${redemption.cardRarity}</span>
        </div>

        ${redemption.viewerMessage ? `
          <div style="background: #f9fafb; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border-left: 4px solid var(--primary);">
            <div style="color: var(--text-light); font-size: 0.875rem; margin-bottom: 0.25rem;">メッセージ:</div>
            <div>${redemption.viewerMessage}</div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          ${redemption.state === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="approveRedemption(${redemption.id})">
              ✅ 承認
            </button>
            <button class="btn btn-danger btn-sm" onclick="openRejectModal(${redemption.id})">
              ❌ 却下
            </button>
          ` : `
            <span class="status status-${redemption.state}">
              ${redemption.state === 'approved' ? '承認済み' : '却下'}
            </span>
          `}
        </div>
      </div>
    `;
  }).join('');

  updatePendingCount();
}

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

function filterRedemptions(filter) {
  currentFilter = filter;

  let filtered = redemptions;

  if (filter === 'pending') {
    filtered = filtered.filter(r => r.state === 'pending');
  } else if (filter === 'approved') {
    filtered = filtered.filter(r => r.state === 'approved');
  } else if (filter === 'rejected') {
    filtered = filtered.filter(r => r.state === 'rejected');
  }

  renderRedemptions(filtered);
}

function approveRedemption(redemptionId) {
  const index = redemptions.findIndex(r => r.id === redemptionId);
  if (index === -1) return;

  showLoading();

  setTimeout(() => {
    redemptions[index].state = 'approved';
    saveToStorage('redemptions', redemptions);

    hideLoading();
    showToast('カード使用を承認しました。オーバーレイに表示されます。', 'success');

    filterRedemptions(currentFilter);
  }, 800);
}

function openRejectModal(redemptionId) {
  rejectingId = redemptionId;
  openModal('rejectModal');
}

function submitReject() {
  const reason = document.getElementById('rejectReason').value;
  const index = redemptions.findIndex(r => r.id === rejectingId);

  if (index === -1) return;

  showLoading();

  setTimeout(() => {
    redemptions[index].state = 'rejected';
    redemptions[index].rejectReason = reason;
    saveToStorage('redemptions', redemptions);

    hideLoading();
    closeModal('rejectModal');
    showToast('カード使用を却下しました', 'info');

    filterRedemptions(currentFilter);

    // フォームリセット
    document.getElementById('rejectReason').value = '';
  }, 800);
}

function updatePendingCount() {
  const pendingCount = redemptions.filter(r => r.state === 'pending').length;
  document.getElementById('pendingCount').textContent = pendingCount;
}

// 初期表示
filterRedemptions('pending');

// リアルタイム更新をシミュレート（デモ用）
setInterval(() => {
  // 新しい承認待ちを時々追加（デモ用）
  if (Math.random() > 0.95) {
    const newRedemption = {
      id: Date.now(),
      cardName: 'サンプルカード',
      cardRarity: 'N',
      viewerName: '視聴者' + Math.floor(Math.random() * 100),
      viewerMessage: Math.random() > 0.5 ? 'いつも見てます！' : null,
      state: 'pending',
      createdAt: new Date().toISOString()
    };

    redemptions.push(newRedemption);
    saveToStorage('redemptions', redemptions);

    if (currentFilter === 'pending' || currentFilter === 'all') {
      filterRedemptions(currentFilter);
    } else {
      updatePendingCount();
    }
  }
}, 10000); // 10秒ごと
  </script>
