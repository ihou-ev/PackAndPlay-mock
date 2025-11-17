// dashboard/packs.html専用スクリプト

// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  // ログインチェック
  if (!requireLogin()) {
    return;
  }

  // 配信者権限チェック
  if (!requireCreatorRole()) {
    return;
  }

  // サイドバーのナビゲーションを生成
  renderSidebarNav('dashboard-packs');

  let editingPackId = null;

  // 統計情報を更新
  function updateStats() {
    const totalPacks = packs.length;
    const totalSales = packs.reduce((sum, pack) => sum + (pack.sales || 0), 0);
    const averagePrice = totalPacks > 0
      ? Math.round(packs.reduce((sum, pack) => sum + pack.price, 0) / totalPacks)
      : 0;

    document.getElementById('totalPacks').textContent = totalPacks;
    document.getElementById('totalSales').textContent = `¥${totalSales.toLocaleString()}`;
    document.getElementById('averagePrice').textContent = `¥${averagePrice.toLocaleString()}`;
  }

  // パック表示
  function renderPacks() {
    const packList = document.getElementById('packList');
    const emptyState = document.getElementById('emptyState');

    if (packs.length === 0) {
      packList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    packList.innerHTML = packs.map(pack => {
      const imageUrl = pack.imageUrl || '';
      const description = pack.description || 'パックの説明がありません';
      const cardCount = pack.cards?.length || 0;
      const sales = pack.sales || 0;

      return `
        <div class="pack-item" data-pack-id="${pack.id}">
          <div class="pack-image" style="${imageUrl ? `background-image: url('${imageUrl}'); background-size: cover;` : ''}"></div>
          <div class="pack-info">
            <div class="pack-header">
              <h3 class="pack-name">${pack.name}</h3>
              <div class="pack-price">¥${pack.price.toLocaleString()}</div>
            </div>
            <p class="pack-description">${description}</p>
            <div class="pack-meta">
              <span class="pack-meta-item">📇 ${cardCount}種類のカード</span>
              <span class="pack-meta-item">💰 ${sales.toLocaleString()}円の売上</span>
            </div>
            <div class="pack-actions">
              <button class="pack-action-button" onclick="editPack(${pack.id})">編集</button>
              <button class="pack-action-button delete" onclick="deletePack(${pack.id})">削除</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // パック作成モーダルを開く
  window.openCreateModal = function() {
    editingPackId = null;
    document.getElementById('modalTitle').textContent = '新規パック作成';
    document.getElementById('packForm').reset();
    openPackModal();
  };

  // パック編集
  window.editPack = function(packId) {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    editingPackId = packId;
    document.getElementById('modalTitle').textContent = 'パック編集';
    document.getElementById('packName').value = pack.name;
    document.getElementById('packDescription').value = pack.description || '';
    document.getElementById('packPrice').value = pack.price;
    document.getElementById('packCardCount').value = pack.cards?.length || 1;
    document.getElementById('packImage').value = pack.imageUrl || '';

    openPackModal();
  };

  // パック削除
  window.deletePack = function(packId) {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;

    if (confirm(`「${pack.name}」を削除してもよろしいですか？`)) {
      const index = packs.findIndex(p => p.id === packId);
      if (index !== -1) {
        packs.splice(index, 1);
        showToast('パックを削除しました', 'success');
        updateStats();
        renderPacks();
      }
    }
  };

  // モーダルを開く
  function openPackModal() {
    const modal = document.getElementById('packModal');
    modal.style.display = '';
    modal.classList.add('active');
  }

  // モーダルを閉じる
  window.closePackModal = function() {
    const modal = document.getElementById('packModal');
    modal.classList.remove('active');
    editingPackId = null;
  };

  // フォーム送信
  document.getElementById('packForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const packData = {
      name: document.getElementById('packName').value,
      description: document.getElementById('packDescription').value,
      price: parseInt(document.getElementById('packPrice').value),
      imageUrl: document.getElementById('packImage').value,
      cards: [] // 実際にはカード選択UIで設定
    };

    if (editingPackId) {
      // 編集
      const pack = packs.find(p => p.id === editingPackId);
      if (pack) {
        Object.assign(pack, packData);
        showToast('パックを更新しました', 'success');
      }
    } else {
      // 新規作成
      const newPack = {
        id: Math.max(...packs.map(p => p.id), 0) + 1,
        ...packData,
        sales: 0,
        createdAt: new Date().toISOString()
      };
      packs.push(newPack);
      showToast('パックを作成しました', 'success');
    }

    closePackModal();
    updateStats();
    renderPacks();
  });

  // モバイルメニュー
  window.toggleMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileMenuOverlay');
    sidebar.classList.toggle('mobile-active');
    overlay.classList.toggle('active');
  };

  window.closeMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileMenuOverlay');
    sidebar.classList.remove('mobile-active');
    overlay.classList.remove('active');
  };

  // モーダル外クリックで閉じる
  const packModal = document.getElementById('packModal');
  if (packModal) {
    const modalContent = packModal.querySelector('.modal');
    if (modalContent) {
      modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    packModal.addEventListener('click', function(e) {
      closePackModal();
    });
  }

  // 初期表示
  updateStats();
  renderPacks();
});
