/**
 * システム設定ページ
 * renderAdminSidebarNavはmain.jsで定義
 */

// デフォルト設定値
const defaultSettings = {
  siteName: 'Pack&Play',
  maintenanceMode: false,
  allowRegistration: true,
  platformFee: 10,
  minWithdrawal: 1000,
  minPackPrice: 100,
  maxPackPrice: 10000,
  maxCardsPerPack: 10,
  cooldownN: 1,
  cooldownR: 5,
  cooldownSR: 10,
  cooldownUR: 30,
  adminEmailNotify: true,
  adminEmail: 'admin@packandplay.com'
};

document.addEventListener('DOMContentLoaded', () => {
  // ログイン・管理者権限チェック
  if (!requireLogin()) return;
  if (!requireAdminRole()) return;

  // サイドバーナビゲーションを生成
  renderAdminSidebarNav();

  // 設定を読み込み
  loadSettings();
});

/**
 * 設定を読み込み
 */
function loadSettings() {
  const savedSettings = loadFromStorage('adminSettings', defaultSettings);

  // テキスト・数値入力
  setInputValue('siteName', savedSettings.siteName);
  setInputValue('platformFee', savedSettings.platformFee);
  setInputValue('minWithdrawal', savedSettings.minWithdrawal);
  setInputValue('minPackPrice', savedSettings.minPackPrice);
  setInputValue('maxPackPrice', savedSettings.maxPackPrice);
  setInputValue('maxCardsPerPack', savedSettings.maxCardsPerPack);
  setInputValue('cooldownN', savedSettings.cooldownN);
  setInputValue('cooldownR', savedSettings.cooldownR);
  setInputValue('cooldownSR', savedSettings.cooldownSR);
  setInputValue('cooldownUR', savedSettings.cooldownUR);
  setInputValue('adminEmail', savedSettings.adminEmail);

  // トグルスイッチ
  setCheckboxValue('maintenanceMode', savedSettings.maintenanceMode);
  setCheckboxValue('allowRegistration', savedSettings.allowRegistration);
  setCheckboxValue('adminEmailNotify', savedSettings.adminEmailNotify);
}

/**
 * 入力値を設定
 */
function setInputValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

/**
 * チェックボックス値を設定
 */
function setCheckboxValue(id, checked) {
  const element = document.getElementById(id);
  if (element) {
    element.checked = checked;
  }
}

/**
 * 入力値を取得
 */
function getInputValue(id, defaultValue = '') {
  const element = document.getElementById(id);
  return element ? element.value : defaultValue;
}

/**
 * 数値入力値を取得
 */
function getNumberValue(id, defaultValue = 0) {
  const element = document.getElementById(id);
  return element ? parseInt(element.value, 10) || defaultValue : defaultValue;
}

/**
 * チェックボックス値を取得
 */
function getCheckboxValue(id) {
  const element = document.getElementById(id);
  return element ? element.checked : false;
}

/**
 * 設定を保存
 */
function saveSettings() {
  // バリデーション
  const platformFee = getNumberValue('platformFee', 10);
  if (platformFee < 0 || platformFee > 50) {
    showToast('プラットフォーム手数料は0〜50%の範囲で入力してください', 'error');
    return;
  }

  const minPackPrice = getNumberValue('minPackPrice', 100);
  const maxPackPrice = getNumberValue('maxPackPrice', 10000);
  if (minPackPrice >= maxPackPrice) {
    showToast('最低パック価格は最高パック価格より低く設定してください', 'error');
    return;
  }

  const adminEmail = getInputValue('adminEmail', '');
  if (getCheckboxValue('adminEmailNotify') && !adminEmail.includes('@')) {
    showToast('有効なメールアドレスを入力してください', 'error');
    return;
  }

  // 設定を収集
  const settings = {
    siteName: getInputValue('siteName', 'Pack&Play'),
    maintenanceMode: getCheckboxValue('maintenanceMode'),
    allowRegistration: getCheckboxValue('allowRegistration'),
    platformFee: platformFee,
    minWithdrawal: getNumberValue('minWithdrawal', 1000),
    minPackPrice: minPackPrice,
    maxPackPrice: maxPackPrice,
    maxCardsPerPack: getNumberValue('maxCardsPerPack', 10),
    cooldownN: getNumberValue('cooldownN', 1),
    cooldownR: getNumberValue('cooldownR', 5),
    cooldownSR: getNumberValue('cooldownSR', 10),
    cooldownUR: getNumberValue('cooldownUR', 30),
    adminEmailNotify: getCheckboxValue('adminEmailNotify'),
    adminEmail: adminEmail
  };

  // localStorageに保存
  saveToStorage('adminSettings', settings);

  showToast('設定を保存しました', 'success');
}

/**
 * 設定をリセット
 */
function resetSettings() {
  if (!confirm('すべての設定をデフォルトに戻しますか？')) {
    return;
  }

  // デフォルト設定を適用
  saveToStorage('adminSettings', defaultSettings);
  loadSettings();

  showToast('設定をリセットしました', 'success');
}
