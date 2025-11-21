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
    nicolive: 'ニコニコ生放送のURL（例: https://live.nicovideo.jp/watch/lvxxxxx）※配信者が外部プレイヤーを許可している場合のみ再生可能'
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
          player: `<iframe width="100%" height="100%"
                   src="https://live.nicovideo.jp/embed/${info.liveId}"
                   scrolling="no"
                   frameborder="0"
                   loading="lazy"
                   allowfullscreen
                   allow="autoplay; encrypted-media"></iframe>`,
          chat: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;background:#1a1a1a;gap:1rem;padding:1.5rem;text-align:center;">
                   <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                   </svg>
                   <p style="margin:0;font-size:0.875rem;line-height:1.6;">コメント表示には<br>配信者の外部プレイヤー許可と<br>プレミアム会員登録が必要です</p>
                   <a href="https://live.nicovideo.jp/watch/${info.liveId}" target="_blank" rel="noopener noreferrer"
                      style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.625rem 1rem;background:#667eea;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:0.875rem;margin-top:0.5rem;">
                     <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                     </svg>
                     ニコニコ生放送で視聴
                   </a>
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
