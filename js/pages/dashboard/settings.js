// dashboard/settings.html専用スクリプト

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
  renderSidebarNav('dashboard-settings');

  // オーバーレイURLを生成
  function generateOverlayUrl() {
    const session = getCurrentSession();
    if (!session || !session.creatorSlug) {
      return window.location.origin + '/overlay/index.html';
    }

    // クリエイター固有のオーバーレイURL
    return window.location.origin + '/overlay/index.html?creator=' + session.creatorSlug;
  }

  // オーバーレイURLを表示
  const overlayUrlElement = document.getElementById('overlayUrl');
  if (overlayUrlElement) {
    overlayUrlElement.textContent = generateOverlayUrl();
  }

  // オーバーレイURLをコピー
  window.copyOverlayUrl = function() {
    const url = generateOverlayUrl();

    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('URLをコピーしました', 'success');
      }).catch(err => {
        fallbackCopyToClipboard(url);
      });
    } else {
      fallbackCopyToClipboard(url);
    }
  };

  // フォールバック用のコピー関数
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      showToast('URLをコピーしました', 'success');
    } catch (err) {
      showToast('コピーに失敗しました', 'error');
    }

    document.body.removeChild(textArea);
  }

  // プラットフォーム別のヘルプテキスト
  const platformHelp = {
    youtube: 'YouTube Live配信のURL（例: https://www.youtube.com/watch?v=xxxxx）',
    twitch: 'Twitch配信のURL（例: https://www.twitch.tv/channelname）',
    twitcasting: 'ツイキャス配信のURL（例: https://twitcasting.tv/userid）',
    nicolive: 'ニコニコ生放送のURL（例: https://live.nicovideo.jp/watch/lvxxxxx）※外部プレイヤー許可が必要。Cookie制限で再生されない場合は「ログイン補助」を使用してください'
  };

  // プラットフォーム選択時のヘルプ更新
  window.updatePlatformHelp = function() {
    const platform = document.getElementById('platformSelect').value;
    const helpElement = document.getElementById('platformHelp');

    if (platform && platformHelp[platform]) {
      helpElement.textContent = platformHelp[platform];
    } else {
      helpElement.textContent = 'プラットフォームを選択してください';
    }
  };

  // URLからプラットフォーム固有の情報を抽出
  function extractPlatformInfo(platform, url) {
    try {
      const urlObj = new URL(url);

      switch(platform) {
        case 'youtube':
          // YouTube: watch?v=VIDEO_ID または /live/VIDEO_ID
          const videoId = urlObj.searchParams.get('v') ||
                         urlObj.pathname.split('/').pop();
          return { videoId };

        case 'twitch':
          // Twitch: /channelname
          const channel = urlObj.pathname.split('/').filter(s => s)[0];
          return { channel };

        case 'twitcasting':
          // TwitCasting: /userid
          const userId = urlObj.pathname.split('/').filter(s => s)[0];
          return { userId };

        case 'nicolive':
          // ニコ生: /watch/lvXXXXX
          const liveId = urlObj.pathname.split('/').pop();
          return { liveId };

        default:
          return null;
      }
    } catch (e) {
      return null;
    }
  }

  // iframe埋め込みコードを生成
  function generateEmbedCode(platform, info) {
    const host = window.location.hostname;

    switch(platform) {
      case 'youtube':
        return {
          player: `<iframe src="https://www.youtube.com/embed/${info.videoId}?autoplay=1&mute=0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowfullscreen></iframe>`,
          chat: `<iframe src="https://www.youtube.com/live_chat?v=${info.videoId}&embed_domain=${host}"></iframe>`
        };

      case 'twitch':
        return {
          player: `<iframe src="https://player.twitch.tv/?channel=${info.channel}&parent=${host}&autoplay=true"
                   allowfullscreen></iframe>`,
          chat: `<iframe src="https://www.twitch.tv/embed/${info.channel}/chat?parent=${host}&darkpopout"></iframe>`
        };

      case 'twitcasting':
        return {
          player: `<iframe src="https://twitcasting.tv/${info.userId}/embeddedplayer/"
                   allowfullscreen></iframe>`,
          chat: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;background:#1a1a1a;gap:1rem;padding:1rem;">
                   <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                   </svg>
                   <p style="text-align:center;margin:0;">ツイキャスは<br>チャット埋め込みに<br>対応していません</p>
                   <a href="https://twitcasting.tv/${info.userId}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1rem;background:#667eea;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:0.875rem;">
                     <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                     </svg>
                     ツイキャスで視聴
                   </a>
                 </div>`
        };

      case 'nicolive':
        return {
          player: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;background:#1a1a1a;gap:1.5rem;padding:2rem;text-align:center;">
                     <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="opacity:0.5;">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                     </svg>
                     <div>
                       <h3 style="margin:0 0 0.75rem 0;font-size:1.125rem;font-weight:700;color:#fff;">ニコニコ生放送</h3>
                       <p style="margin:0 0 0.5rem 0;font-size:0.9375rem;line-height:1.6;color:#d1d5db;">
                         PWA内での埋め込み再生は<br>
                         技術的制限により対応していません
                       </p>
                       <p style="margin:0;font-size:0.8125rem;line-height:1.5;color:#9ca3af;">
                         ※ iframe内の「視聴する」ボタンが<br>
                         公式サイトにリダイレクトされる仕様のため
                       </p>
                     </div>
                     <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;max-width:300px;">
                       <a href="https://live.nicovideo.jp/" target="_blank" rel="noopener noreferrer"
                          style="display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.875rem 1.5rem;background:#667eea;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:0.9375rem;transition:all 0.2s;">
                         <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                         </svg>
                         まずログイン
                       </a>
                       <a href="https://live.nicovideo.jp/watch/${info.liveId}" target="_blank" rel="noopener noreferrer"
                          style="display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.875rem 1.5rem;background:#dc2626;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:0.9375rem;transition:all 0.2s;">
                         <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                         </svg>
                         番組を視聴
                       </a>
                     </div>
                     <p style="margin:0;font-size:0.75rem;color:#6b7280;line-height:1.4;">
                       別タブで開きますので、<br>
                       ログイン後に番組ページで視聴してください
                     </p>
                   </div>`,
          chat: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;background:#1a1a1a;gap:1rem;padding:1.5rem;text-align:center;">
                   <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                   </svg>
                   <p style="margin:0;font-size:0.8125rem;line-height:1.6;color:#d1d5db;">コメント表示には<br>プレミアム会員登録が必要です</p>
                 </div>`
        };

      default:
        return { player: '', chat: '' };
    }
  }

  // 配信設定フォーム送信
  document.getElementById('streamForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const platform = document.getElementById('platformSelect').value;
    const url = document.getElementById('streamUrl').value;

    if (!platform) {
      showToast('プラットフォームを選択してください', 'error');
      return;
    }

    if (!url) {
      showToast('配信URLを入力してください', 'error');
      return;
    }

    // URLから必要な情報を抽出
    const info = extractPlatformInfo(platform, url);

    if (!info) {
      showToast('正しい配信URLを入力してください', 'error');
      return;
    }

    // iframe埋め込みコードを生成
    const embedCode = generateEmbedCode(platform, info);

    // プレビューに表示
    document.getElementById('playerFrame').innerHTML = embedCode.player;
    document.getElementById('chatFrame').innerHTML = embedCode.chat;
    document.getElementById('embedPreview').classList.remove('hidden');

    // localStorageに保存
    const streamSettings = {
      platform,
      url,
      info,
      embedCode,
      savedAt: new Date().toISOString()
    };

    saveToStorage('streamSettings', streamSettings);

    showToast('配信設定を保存しました', 'success');
  });

  // 設定クリア
  window.clearStreamSettings = function() {
    if (confirm('配信設定をクリアしますか？')) {
      document.getElementById('platformSelect').value = '';
      document.getElementById('streamUrl').value = '';
      document.getElementById('platformHelp').textContent = 'プラットフォームを選択してください';
      document.getElementById('embedPreview').classList.add('hidden');
      document.getElementById('playerFrame').innerHTML = '';
      document.getElementById('chatFrame').innerHTML = '';

      localStorage.removeItem('streamSettings');

      showToast('配信設定をクリアしました', 'success');
    }
  };

  // 保存済み設定を復元
  function restoreStreamSettings() {
    const settings = loadFromStorage('streamSettings', null);

    if (settings) {
      document.getElementById('platformSelect').value = settings.platform;
      document.getElementById('streamUrl').value = settings.url;
      updatePlatformHelp();

      // プレビュー復元
      if (settings.embedCode) {
        document.getElementById('playerFrame').innerHTML = settings.embedCode.player;
        document.getElementById('chatFrame').innerHTML = settings.embedCode.chat;
        document.getElementById('embedPreview').classList.remove('hidden');
      }
    }
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
    overlay.classList.remove('mobile-active');
  };

  // 初期表示
  restoreStreamSettings();
});
