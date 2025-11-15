// ログインチェック
if (!requireLogin()) {
  // ログインが必要な場合、requireLogin関数内でリダイレクトされる
}

// セッション情報を取得
const session = getCurrentSession();

// モックデータ - 統合した履歴
const allHistory = [
  // チャージ履歴
  {
    type: 'charge',
    date: '2025-11-10T14:30:00Z',
    amount: 5000,
    method: 'クレジットカード'
  },
  {
    type: 'charge',
    date: '2025-11-08T10:15:00Z',
    amount: 3000,
    method: 'コンビニ決済'
  },
  {
    type: 'charge',
    date: '2025-11-05T16:45:00Z',
    amount: 10000,
    method: 'クレジットカード'
  },
  {
    type: 'charge',
    date: '2025-11-01T09:20:00Z',
    amount: 2000,
    method: 'PayPay'
  },
  // 購入履歴
  {
    type: 'purchase',
    date: '2025-11-10T15:00:00Z',
    packName: '初心者応援パック',
    creatorName: '田中太郎',
    price: 500,
    cardReceived: 'きらきら (SR)'
  },
  {
    type: 'purchase',
    date: '2025-11-09T18:30:00Z',
    packName: 'アリスの魔法パック',
    creatorName: 'アリスちゃんねる',
    price: 800,
    cardReceived: 'ハート (N)'
  },
  {
    type: 'purchase',
    date: '2025-11-09T12:15:00Z',
    packName: 'レアカード限定パック',
    creatorName: '田中太郎',
    price: 1000,
    cardReceived: '花火 (SR)'
  },
  {
    type: 'purchase',
    date: '2025-11-08T20:45:00Z',
    packName: '初心者応援パック',
    creatorName: '田中太郎',
    price: 500,
    cardReceived: 'いいね！ (R)'
  },
  {
    type: 'purchase',
    date: '2025-11-07T14:20:00Z',
    packName: 'アリスの魔法パック',
    creatorName: 'アリスちゃんねる',
    price: 800,
    cardReceived: 'ユニコーン (SR)'
  },
  // 使用履歴
  {
    type: 'usage',
    date: '2025-11-10T16:30:00Z',
    cardName: 'きらきら',
    rarity: 'SR',
    creatorName: '田中太郎',
    status: 'approved'
  },
  {
    type: 'usage',
    date: '2025-11-09T19:00:00Z',
    cardName: 'ハート',
    rarity: 'N',
    creatorName: 'アリスちゃんねる',
    status: 'approved'
  },
  {
    type: 'usage',
    date: '2025-11-09T13:45:00Z',
    cardName: '花火',
    rarity: 'SR',
    creatorName: '田中太郎',
    status: 'pending'
  },
  {
    type: 'usage',
    date: '2025-11-08T21:15:00Z',
    cardName: 'いいね！',
    rarity: 'R',
    creatorName: '田中太郎',
    status: 'approved'
  },
  // スプラッシュ履歴
  {
    type: 'splash',
    date: '2025-11-10T17:45:00Z',
    creatorName: '田中太郎',
    amount: 1000,
    message: 'いつも楽しい配信ありがとうございます！'
  },
  {
    type: 'splash',
    date: '2025-11-09T20:30:00Z',
    creatorName: 'アリスちゃんねる',
    amount: 500,
    message: '応援してます！'
  },
  {
    type: 'splash',
    date: '2025-11-08T15:20:00Z',
    creatorName: '田中太郎',
    amount: 2000,
    message: '次回の配信も楽しみにしています'
  },
  {
    type: 'splash',
    date: '2025-11-07T19:15:00Z',
    creatorName: 'ゲームマスター',
    amount: 300,
    message: ''
  }
];

// 日付でソート（新しい順）
allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

// フィルター適用
function applyFilters() {
  const filterValue = document.getElementById('filterSelect').value;

  // フィルタリングされた履歴
  let filteredHistory = allHistory;

  if (filterValue !== 'all') {
    filteredHistory = allHistory.filter(item => item.type === filterValue);
  }

  renderHistory(filteredHistory);
}

// 履歴を表示
function renderHistory(historyData) {
  const container = document.getElementById('historyItems');

  if (historyData.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">📋</div>
        <div class="history-empty-text">履歴がありません</div>
        <div class="history-empty-subtext">選択した種別の履歴が表示されます</div>
      </div>
    `;
    return;
  }

  container.innerHTML = historyData.map(item => {
    const date = new Date(item.date);
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    let typeLabel = '';
    let typeClass = '';
    let creator = '-';
    let amount = '-';
    let details = '';

    if (item.type === 'charge') {
      typeLabel = 'チャージ';
      typeClass = 'charge';
      amount = `+${item.amount.toLocaleString()}`;
      details = item.method;
    } else if (item.type === 'purchase') {
      typeLabel = '購入';
      typeClass = 'purchase';
      creator = item.creatorName;
      amount = `-${item.price.toLocaleString()}`;
      details = `${item.packName} | 獲得: ${item.cardReceived}`;
    } else if (item.type === 'usage') {
      typeLabel = '使用';
      typeClass = 'usage';
      creator = item.creatorName;
      amount = '-';
      details = `${item.cardName} (${item.rarity})`;
    } else if (item.type === 'splash') {
      typeLabel = 'スプラッシュ';
      typeClass = 'splash';
      creator = item.creatorName;
      amount = `-${item.amount.toLocaleString()}`;
      details = item.message || '(メッセージなし)';
    }

    return `
      <div class="history-item">
        <div class="history-item-date">${formattedDate}</div>
        <div class="history-item-type ${typeClass}">${typeLabel}</div>
        <div class="history-item-creator">${creator}</div>
        <div class="history-item-amount">${amount}</div>
        <div class="history-item-details">${details}</div>
      </div>
    `;
  }).join('');
}


// モバイルメニュー関数はjs/main.jsで定義

// 初期表示
renderSidebarNav('history'); // main.jsの共通関数を使用
applyFilters();
