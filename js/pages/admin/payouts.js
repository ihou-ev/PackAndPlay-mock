/**
 * 売上精算管理ページ
 * mockPayoutsはmock-data.jsで定義
 * renderAdminSidebarNavはmain.jsで定義
 */

let filteredPayouts = [...mockPayouts];
let currentPayoutId = null;
let currentTab = 'pending';

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 統計サマリーを更新
  updateStatsSummary();

  // 精算一覧を表示
  applyFilters();
});

/**
 * 統計サマリーを更新
 */
function updateStatsSummary() {
  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending');
  const unpaidTotal = pendingPayouts.reduce((sum, p) => sum + p.netAmount, 0);

  const completedThisMonth = mockPayouts.filter(p =>
    p.status === 'completed' && p.paidAt && p.paidAt.startsWith('2025-03')
  );
  const monthlyPaid = completedThisMonth.reduce((sum, p) => sum + p.netAmount, 0);

  document.getElementById('unpaidTotal').textContent = `¥${unpaidTotal.toLocaleString()}`;
  document.getElementById('monthlyPaid').textContent = `¥${monthlyPaid.toLocaleString()}`;
  document.getElementById('pendingCount').textContent = `${pendingPayouts.length}件`;
  document.getElementById('nextPayoutDate').textContent = '3月15日';
}

/**
 * タブを切り替え
 */
function switchTab(tab) {
  currentTab = tab;

  // タブのアクティブ状態を更新
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  applyFilters();
}

/**
 * フィルターを適用
 */
function applyFilters() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const periodFilter = document.getElementById('periodFilter')?.value || '';
  const sortFilter = document.getElementById('sortFilter')?.value || 'amount-desc';

  // フィルタリング
  filteredPayouts = mockPayouts.filter(payout => {
    // 検索フィルタ
    const matchesSearch = !searchQuery ||
      payout.creatorName.toLowerCase().includes(searchQuery) ||
      payout.creatorSlug.toLowerCase().includes(searchQuery);

    // 期間フィルタ
    const matchesPeriod = !periodFilter || payout.period === periodFilter;

    // タブフィルタ
    let matchesTab = true;
    if (currentTab === 'pending') {
      matchesTab = payout.status === 'pending';
    } else if (currentTab === 'processing') {
      matchesTab = payout.status === 'processing';
    } else if (currentTab === 'completed') {
      matchesTab = payout.status === 'completed';
    }

    return matchesSearch && matchesPeriod && matchesTab;
  });

  // ソート
  switch (sortFilter) {
    case 'amount-desc':
      filteredPayouts.sort((a, b) => b.netAmount - a.netAmount);
      break;
    case 'amount-asc':
      filteredPayouts.sort((a, b) => a.netAmount - b.netAmount);
      break;
    case 'name':
      filteredPayouts.sort((a, b) => a.creatorName.localeCompare(b.creatorName, 'ja'));
      break;
  }

  renderPayoutList();
}

/**
 * 精算リストを表示
 */
function renderPayoutList() {
  const container = document.getElementById('payoutList');
  const emptyState = document.getElementById('emptyState');

  if (!container) return;

  if (filteredPayouts.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  container.innerHTML = filteredPayouts.map(payout => `
    <div class="payout-card" onclick="openPayoutModal(${payout.id})">
      <div class="payout-card-main">
        <div class="payout-avatar">
          ${payout.avatarUrl
            ? `<img src="${payout.avatarUrl}" alt="${payout.creatorName}">`
            : payout.creatorName.charAt(0)
          }
        </div>
        <div class="payout-card-info">
          <div class="payout-card-name">${payout.creatorName}</div>
          <div class="payout-card-period">${formatPeriod(payout.period)}</div>
        </div>
        <div class="payout-card-right">
          <div class="payout-card-amount">¥${payout.netAmount.toLocaleString()}</div>
          <span class="badge badge-status-${payout.status}">${getStatusLabel(payout.status)}</span>
        </div>
      </div>
      <div class="payout-card-details">
        <div class="payout-card-detail">
          <span class="payout-card-detail-label">総売上</span>
          <span>¥${payout.grossSales.toLocaleString()}</span>
        </div>
        <div class="payout-card-detail">
          <span class="payout-card-detail-label">手数料</span>
          <span>-¥${payout.platformFee.toLocaleString()}</span>
        </div>
        ${payout.paidAt ? `
          <div class="payout-card-detail">
            <span class="payout-card-detail-label">振込日</span>
            <span>${formatDate(payout.paidAt)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * 期間をフォーマット
 */
function formatPeriod(period) {
  const [year, month] = period.split('-');
  return `${year}年${parseInt(month)}月分`;
}

/**
 * ステータスラベルを取得
 */
function getStatusLabel(status) {
  const labels = {
    pending: '振込待ち',
    processing: '処理中',
    completed: '振込完了'
  };
  return labels[status] || status;
}

/**
 * 精算モーダルを開く
 */
function openPayoutModal(payoutId) {
  const payout = mockPayouts.find(p => p.id === payoutId);
  if (!payout) return;

  currentPayoutId = payoutId;

  // アバター
  const avatarEl = document.getElementById('modalCreatorAvatar');
  if (payout.avatarUrl) {
    avatarEl.innerHTML = `<img src="${payout.avatarUrl}" alt="${payout.creatorName}">`;
  } else {
    avatarEl.innerHTML = payout.creatorName.charAt(0);
  }

  // 基本情報
  document.getElementById('modalCreatorName').textContent = payout.creatorName;
  document.getElementById('modalCreatorChannel').textContent = `@${payout.creatorSlug}`;

  // ステータスバッジ
  const statusBadge = document.getElementById('modalPayoutStatus');
  statusBadge.textContent = getStatusLabel(payout.status);
  statusBadge.className = `badge badge-status-${payout.status}`;

  // 精算期間
  document.getElementById('modalPayoutPeriod').textContent =
    `${formatDate(payout.periodStart)} 〜 ${formatDate(payout.periodEnd)}`;

  // 売上明細
  document.getElementById('modalGrossSales').textContent = `¥${payout.grossSales.toLocaleString()}`;
  document.getElementById('modalPlatformFee').textContent = `-¥${payout.platformFee.toLocaleString()}`;
  document.getElementById('modalNetAmount').textContent = `¥${payout.netAmount.toLocaleString()}`;

  // 振込先情報
  const bank = payout.bankInfo;
  document.getElementById('modalBankName').textContent = bank.bankName;
  document.getElementById('modalBranchName').textContent = bank.branchName;
  document.getElementById('modalAccountType').textContent = bank.accountType;
  document.getElementById('modalAccountNumber').textContent = bank.accountNumber;
  document.getElementById('modalAccountHolder').textContent = bank.accountHolder;

  // 処理履歴
  const historyContainer = document.getElementById('modalHistory');
  historyContainer.innerHTML = payout.history.map(h => `
    <div class="payout-history-item">
      <div class="payout-history-date">${formatDate(h.date)}</div>
      <div class="payout-history-action">${h.action}</div>
      <div class="payout-history-note">${h.note}</div>
    </div>
  `).join('');

  // 振込ボタンの表示/非表示
  const processBtn = document.getElementById('modalProcessBtn');
  if (payout.status === 'pending') {
    processBtn.style.display = 'block';
    processBtn.textContent = '振込処理';
    processBtn.className = 'button button-primary';
  } else if (payout.status === 'processing') {
    processBtn.style.display = 'block';
    processBtn.textContent = '振込完了にする';
    processBtn.className = 'button button-success';
  } else {
    processBtn.style.display = 'none';
  }

  // モーダル表示
  document.getElementById('payoutModal').classList.add('active');
}

/**
 * 精算モーダルを閉じる
 */
function closePayoutModal() {
  document.getElementById('payoutModal').classList.remove('active');
  currentPayoutId = null;
}

/**
 * 振込処理を実行
 */
function processPayout() {
  if (!currentPayoutId) return;

  const payout = mockPayouts.find(p => p.id === currentPayoutId);
  if (!payout) return;

  if (payout.status === 'pending') {
    // 処理中に変更
    payout.status = 'processing';
    payout.history.push({
      date: new Date().toISOString().split('T')[0],
      action: '振込処理開始',
      note: '銀行処理中'
    });
    showToast(`${payout.creatorName}への振込処理を開始しました`, 'success');
  } else if (payout.status === 'processing') {
    // 完了に変更
    payout.status = 'completed';
    payout.paidAt = new Date().toISOString().split('T')[0];
    payout.history.push({
      date: payout.paidAt,
      action: '振込完了',
      note: `振込ID: TRF-${payout.paidAt.replace(/-/g, '')}-${String(payout.id).padStart(3, '0')}`
    });
    showToast(`${payout.creatorName}への振込が完了しました`, 'success');
  }

  updateStatsSummary();
  applyFilters();
  closePayoutModal();
}

/**
 * 一括振込モーダルを開く
 */
function openBatchPayoutModal() {
  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending');
  const totalAmount = pendingPayouts.reduce((sum, p) => sum + p.netAmount, 0);

  document.getElementById('batchCreatorCount').textContent = `${pendingPayouts.length}名`;
  document.getElementById('batchTotalAmount').textContent = `¥${totalAmount.toLocaleString()}`;

  document.getElementById('batchPayoutModal').classList.add('active');
}

/**
 * 一括振込モーダルを閉じる
 */
function closeBatchPayoutModal() {
  document.getElementById('batchPayoutModal').classList.remove('active');
}

/**
 * 一括振込を実行
 */
function executeBatchPayout() {
  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending');

  if (pendingPayouts.length === 0) {
    showToast('振込待ちの精算がありません', 'error');
    closeBatchPayoutModal();
    return;
  }

  // すべてを処理中に変更
  const today = new Date().toISOString().split('T')[0];
  pendingPayouts.forEach(payout => {
    payout.status = 'processing';
    payout.history.push({
      date: today,
      action: '振込処理開始',
      note: '一括振込処理'
    });
  });

  updateStatsSummary();
  applyFilters();
  closeBatchPayoutModal();
  showToast(`${pendingPayouts.length}件の振込処理を開始しました`, 'success');
}

/**
 * 確認モーダルを表示
 */
function showConfirmModal(icon, title, message, onConfirm) {
  document.getElementById('confirmIcon').textContent = icon;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;

  const confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.onclick = () => {
    onConfirm();
    closeConfirmModal();
  };

  document.getElementById('confirmModal').classList.add('active');
}

/**
 * 確認モーダルを閉じる
 */
function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
}
