// dashboard/index.html専用スクリプト

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
  renderSidebarNav('dashboard');

  // セッション情報を取得
  const session = getCurrentSession();
  const creatorSlug = session?.creatorSlug || 'tanaka';

  // 統計情報を更新
  function updateStats() {
    // 配信者情報を取得
    const creator = getCreatorBySlug(creatorSlug);

    if (creator) {
      // 総売上
      const totalSales = creator.totalSales || 0;
      document.getElementById('totalSales').textContent = `¥${totalSales.toLocaleString()}`;

      // フォロワー数
      const followerCount = creator.followerCount || 0;
      document.getElementById('followerCount').textContent = followerCount.toLocaleString();
    }

    // カード数を計算
    const creatorCards = cards.filter(card => {
      // 実際の実装ではcreatorIdで判定するが、デモでは全カードを表示
      return true;
    });
    document.getElementById('cardCount').textContent = creatorCards.length;
  }

  // 最近のアクティビティを表示
  function renderActivity() {
    const activityList = document.getElementById('activityList');
    const activityEmpty = document.getElementById('activityEmpty');

    // デモ用のアクティビティデータ
    const activities = [
      {
        title: 'Alt+F4が使用されました',
        description: '視聴者: デモユーザー',
        time: '5分前'
      },
      {
        title: '新しいカードが作成されました',
        description: 'カード名: 延長５分コール',
        time: '1時間前'
      },
      {
        title: 'パックが購入されました',
        description: 'パック: 田中太郎スターターパック',
        time: '2時間前'
      }
    ];

    if (activities.length === 0) {
      activityList.innerHTML = '';
      activityEmpty.classList.remove('hidden');
      return;
    }

    activityEmpty.classList.add('hidden');

    activityList.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-info">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
        </div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `).join('');
  }

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

  // 初期表示
  updateStats();
  renderActivity();
});
