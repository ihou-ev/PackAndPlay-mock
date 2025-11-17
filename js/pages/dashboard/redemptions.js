// dashboard/redemptions.html専用スクリプト

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
  renderSidebarNav('dashboard-redemptions');

  let selectedRedemption = null;

  // デモ用の承認待ちデータ
  const redemptions = [
    {
      id: 1,
      cardName: 'Alt+F4',
      cardRarity: 'UR',
      viewerName: 'デモユーザー1',
      requestTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      flavor: '「そのボタン、押すなって言ったのに！」',
      description: '配信中のゲームを強制終了してください。泣いても止められません。'
    },
    {
      id: 2,
      cardName: 'サイレントタイム',
      cardRarity: 'R',
      viewerName: 'デモユーザー2',
      requestTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      flavor: '「今のうちに全部コメント読めるかな？」',
      description: 'マイクを15秒間ミュートしてください。リアクション禁止！'
    },
    {
      id: 3,
      cardName: '延長５分コール',
      cardRarity: 'SR',
      viewerName: 'デモユーザー3',
      requestTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      flavor: '「まだ終わらせないからな？」',
      description: 'このカードが使われたら、配信時間を５分延長してください。'
    }
  ];

  // 統計情報を更新
  function updateStats() {
    const pending = redemptions.length;
    const approvedToday = 5; // デモ用
    const rejectedToday = 2; // デモ用

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedToday').textContent = approvedToday;
    document.getElementById('rejectedToday').textContent = rejectedToday;
  }

  // 承認待ちリストを表示
  function renderPendingList() {
    const pendingList = document.getElementById('pendingList');
    const pendingEmpty = document.getElementById('pendingEmpty');

    if (redemptions.length === 0) {
      pendingList.innerHTML = '';
      pendingEmpty.classList.remove('hidden');
      return;
    }

    pendingEmpty.classList.add('hidden');

    pendingList.innerHTML = redemptions.map(redemption => {
      const timeAgo = formatTimeAgo(redemption.requestTime);
      const rarityClass = `badge-${redemption.cardRarity}`;

      return `
        <div class="redemption-item" data-redemption-id="${redemption.id}">
          <div class="redemption-info">
            <div class="redemption-header">
              <h3 class="redemption-card-name">${redemption.cardName}</h3>
              <span class="redemption-badge ${rarityClass}">${redemption.cardRarity}</span>
            </div>
            <div class="redemption-meta">
              <span class="redemption-meta-item">👤 ${redemption.viewerName}</span>
              <span class="redemption-meta-item">🕐 ${timeAgo}</span>
            </div>
          </div>
          <div class="redemption-actions">
            <button class="redemption-button redemption-button-detail" onclick="showDetail(${redemption.id})">詳細</button>
            <button class="redemption-button redemption-button-reject" onclick="rejectRedemption(${redemption.id})">拒否</button>
            <button class="redemption-button redemption-button-approve" onclick="approveRedemption(${redemption.id})">承認</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 時間経過表示
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

  // カード詳細を表示
  window.showDetail = function(redemptionId) {
    const redemption = redemptions.find(r => r.id === redemptionId);
    if (!redemption) return;

    selectedRedemption = redemption;

    document.getElementById('modalCardName').textContent = redemption.cardName;
    document.getElementById('modalCardFlavor').textContent = redemption.flavor || '';
    document.getElementById('modalCardDescription').textContent = redemption.description;
    document.getElementById('modalViewerName').textContent = redemption.viewerName;
    document.getElementById('modalCardRarity').textContent = redemption.cardRarity;
    document.getElementById('modalRequestTime').textContent = formatTimeAgo(redemption.requestTime);

    openCardDetailModal();
  };

  // 承認
  window.approveRedemption = function(redemptionId) {
    const index = redemptions.findIndex(r => r.id === redemptionId);
    if (index === -1) return;

    if (confirm(`「${redemptions[index].cardName}」を承認しますか？`)) {
      // オーバーレイに送信するデータ
      const overlayData = {
        cardName: redemptions[index].cardName,
        cardRarity: redemptions[index].cardRarity,
        viewerName: redemptions[index].viewerName,
        timestamp: Date.now()
      };

      // localStorageのoverlayEventに書き込み
      saveToStorage('overlayEvent', overlayData);

      redemptions.splice(index, 1);
      showToast(`カードを承認しました。オーバーレイに表示されます。`, 'success');
      updateStats();
      renderPendingList();
    }
  };

  // 拒否
  window.rejectRedemption = function(redemptionId) {
    const index = redemptions.findIndex(r => r.id === redemptionId);
    if (index === -1) return;

    if (confirm(`「${redemptions[index].cardName}」を拒否しますか？`)) {
      redemptions.splice(index, 1);
      showToast('カード使用リクエストを拒否しました', 'info');
      updateStats();
      renderPendingList();
    }
  };

  // モーダルから承認
  window.approveFromModal = function() {
    if (!selectedRedemption) return;
    closeCardDetailModal();
    approveRedemption(selectedRedemption.id);
  };

  // モーダルから拒否
  window.rejectFromModal = function() {
    if (!selectedRedemption) return;
    closeCardDetailModal();
    rejectRedemption(selectedRedemption.id);
  };

  // カード詳細モーダルを開く
  function openCardDetailModal() {
    const modal = document.getElementById('cardDetailModal');
    modal.style.display = '';
    modal.classList.add('active');
  }

  // カード詳細モーダルを閉じる
  window.closeCardDetailModal = function() {
    const modal = document.getElementById('cardDetailModal');
    modal.classList.remove('active');
    selectedRedemption = null;
  };

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
  const cardDetailModal = document.getElementById('cardDetailModal');
  if (cardDetailModal) {
    const modalContent = cardDetailModal.querySelector('.modal');
    if (modalContent) {
      modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    cardDetailModal.addEventListener('click', function(e) {
      closeCardDetailModal();
    });
  }

  // 初期表示
  updateStats();
  renderPendingList();
});
