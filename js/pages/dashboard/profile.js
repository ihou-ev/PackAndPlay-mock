// dashboard/profile.html専用スクリプト

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
  renderSidebarNav('dashboard-profile');

  // セッション情報を取得
  const session = getCurrentSession();
  const creatorSlug = session?.creatorSlug || 'tanaka';

  // プロフィールデータをlocalStorageから読み込み
  let profileData = loadFromStorage('creatorProfile', {
    name: '田中太郎',
    bio: '配信を盛り上げるカードパックを販売しています！よろしくお願いします。',
    avatarUrl: '../image/tanaka_avatar.png',
    bannerUrl: '../image/tanaka_banner.png',
    profileDetail: '<h3>おすすめ動画</h3>\n<p><a href="https://youtube.com/watch?v=example1">初めての配信アーカイブ</a></p>\n<p><a href="https://youtube.com/watch?v=example2">人気のゲーム実況</a></p>\n\n<h3>配信スケジュール</h3>\n<p>毎週月・水・金 20:00〜</p>',
    blocks: [
      { id: 1, type: 'heading', level: 'h3', content: 'おすすめ動画' },
      { id: 2, type: 'text', content: '<a href="https://youtube.com/watch?v=example1">初めての配信アーカイブ</a>' },
      { id: 3, type: 'text', content: '<a href="https://youtube.com/watch?v=example2">人気のゲーム実況</a>' },
      { id: 4, type: 'heading', level: 'h3', content: '配信スケジュール' },
      { id: 5, type: 'text', content: '毎週月・水・金 20:00〜' }
    ],
    social: {
      youtube: 'https://youtube.com/@tanaka_taro',
      twitch: 'https://twitch.tv/tanaka_taro',
      twitter: 'https://x.com/tanaka_taro'
    },
    otherLinks: [
      {
        id: 1,
        name: 'BOOTH（グッズ販売）',
        url: 'https://tanaka-taro.booth.pm/'
      }
    ]
  });

  // 初期表示を更新
  function initProfile() {
    // バナー画像
    const bannerElement = document.getElementById('profileBanner');
    if (profileData.bannerUrl) {
      bannerElement.style.backgroundImage = `url('${profileData.bannerUrl}')`;
      bannerElement.style.backgroundSize = 'cover';
      bannerElement.style.backgroundPosition = 'center 35%';
    }

    // アバター画像
    const avatarElement = document.getElementById('profileAvatar');
    const avatarText = document.getElementById('avatarText');
    if (profileData.avatarUrl) {
      const img = document.createElement('img');
      img.src = profileData.avatarUrl;
      avatarElement.innerHTML = '';
      avatarElement.appendChild(img);
    } else {
      avatarText.textContent = profileData.name ? profileData.name.charAt(0) : '?';
    }

    // 名前
    document.getElementById('nameDisplay').textContent = profileData.name || '配信者名';

    // ユーザーID
    document.getElementById('profileUserId').textContent = '@' + creatorSlug;

    // Bio
    document.getElementById('bioDisplay').textContent = profileData.bio || '自己紹介をクリックして編集';

    // SNS
    document.getElementById('youtubeUrl').value = profileData.social?.youtube || '';
    document.getElementById('twitchUrl').value = profileData.social?.twitch || '';
    document.getElementById('twitterUrl').value = profileData.social?.twitter || '';

    // その他のリンク
    renderOtherLinksList();

    // ブロックエディター
    renderBlockList();

    // プロフィール詳細エディター
    document.getElementById('profileDetailEditor').value = profileData.profileDetail || '';
    syncHTMLFromBlocks();
    updatePreview();
  }

  // バナーを編集
  window.editBanner = function() {
    document.getElementById('bannerFileInput').click();
  };

  // バナー画像をアップロード
  window.handleBannerUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      showToast('画像サイズは5MB以下にしてください', 'error');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      showToast('画像ファイルを選択してください', 'error');
      return;
    }

    showLoading();

    // FileReaderで画像を読み込み
    const reader = new FileReader();
    reader.onload = function(e) {
      profileData.bannerUrl = e.target.result;
      const bannerElement = document.getElementById('profileBanner');

      bannerElement.style.backgroundImage = `url('${profileData.bannerUrl}')`;
      bannerElement.style.backgroundSize = 'cover';
      bannerElement.style.backgroundPosition = 'center 35%';

      hideLoading();
      showToast('バナー画像を更新しました', 'success');
    };
    reader.readAsDataURL(file);
  };

  // アバターを編集
  window.editAvatar = function() {
    document.getElementById('avatarFileInput').click();
  };

  // アバター画像をアップロード
  window.handleAvatarUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      showToast('画像サイズは5MB以下にしてください', 'error');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      showToast('画像ファイルを選択してください', 'error');
      return;
    }

    showLoading();

    // FileReaderで画像を読み込み
    const reader = new FileReader();
    reader.onload = function(e) {
      profileData.avatarUrl = e.target.result;
      const avatarElement = document.getElementById('profileAvatar');

      const img = document.createElement('img');
      img.src = profileData.avatarUrl;
      avatarElement.innerHTML = '';
      avatarElement.appendChild(img);

      hideLoading();
      showToast('アバター画像を更新しました', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 名前をインライン編集
  window.editName = function() {
    const nameEdit = document.querySelector('.profile-name-edit');
    const nameInput = document.getElementById('nameInput');

    // 現在の名前を入力フィールドにセット
    nameInput.value = profileData.name || '';

    // 表示を切り替え
    nameEdit.style.display = 'none';
    nameInput.style.display = 'block';
    nameInput.focus();
    nameInput.select();
  };

  // 名前を保存
  window.saveName = function() {
    const nameEdit = document.querySelector('.profile-name-edit');
    const nameInput = document.getElementById('nameInput');
    const nameDisplay = document.getElementById('nameDisplay');
    const newName = nameInput.value.trim();

    if (!newName) {
      // 空の場合は元の名前に戻す
      nameInput.value = profileData.name || '配信者名';
      nameEdit.style.display = 'inline-flex';
      nameInput.style.display = 'none';
      return;
    }

    if (newName !== profileData.name) {
      // 名前が変更された場合
      profileData.name = newName;
      nameDisplay.textContent = newName;

      // アバターの頭文字も更新（画像がない場合）
      if (!profileData.avatarUrl) {
        const avatarText = document.getElementById('avatarText');
        if (avatarText) {
          avatarText.textContent = newName.charAt(0);
        }
      }
    }

    // 表示を切り替え
    nameEdit.style.display = 'inline-flex';
    nameInput.style.display = 'none';
  };

  // キーボードイベントハンドリング（名前）
  window.handleNameKeydown = function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      const nameEdit = document.querySelector('.profile-name-edit');
      const nameInput = document.getElementById('nameInput');

      // キャンセル：元の表示に戻す
      nameInput.value = profileData.name || '';
      nameEdit.style.display = 'inline-flex';
      nameInput.style.display = 'none';
    }
  };

  // Bioをインライン編集
  window.editBio = function() {
    const bioEdit = document.querySelector('.profile-bio-edit');
    const bioInput = document.getElementById('bioInput');

    // 現在のbioをテキストエリアにセット
    bioInput.value = profileData.bio || '';

    // 表示を切り替え
    bioEdit.style.display = 'none';
    bioInput.style.display = 'block';
    bioInput.focus();
  };

  // Bioを保存
  window.saveBio = function() {
    const bioEdit = document.querySelector('.profile-bio-edit');
    const bioInput = document.getElementById('bioInput');
    const bioDisplay = document.getElementById('bioDisplay');
    const newBio = bioInput.value.trim();

    // 最大文字数チェック（500文字）
    if (newBio.length > 500) {
      showToast('自己紹介は500文字以内で入力してください', 'error');
      return;
    }

    if (newBio !== (profileData.bio || '')) {
      // Bioが変更された場合
      profileData.bio = newBio;
      bioDisplay.textContent = newBio || '自己紹介をクリックして編集';
    }

    // 表示を切り替え
    bioEdit.style.display = 'inline-flex';
    bioInput.style.display = 'none';
  };

  // キーボードイベントハンドリング（Bio）
  window.handleBioKeydown = function(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      const bioEdit = document.querySelector('.profile-bio-edit');
      const bioInput = document.getElementById('bioInput');

      // キャンセル：元の表示に戻す
      bioInput.value = profileData.bio || '';
      bioEdit.style.display = 'inline-flex';
      bioInput.style.display = 'none';
    }
  };

  // その他のリンクリストを表示
  function renderOtherLinksList() {
    const otherLinksList = document.getElementById('otherLinksList');

    if (!profileData.otherLinks || profileData.otherLinks.length === 0) {
      otherLinksList.innerHTML = '';
      return;
    }

    otherLinksList.innerHTML = profileData.otherLinks.map((link, index) => `
      <div class="other-link-item">
        <div class="other-link-content">
          <div class="form-group" style="margin-bottom: 0.5rem;">
            <label class="form-label">サービス名</label>
            <input type="text" class="form-input" value="${link.name}" onchange="updateOtherLink(${index}, 'name', this.value)" placeholder="Discord, Instagram など">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">URL</label>
            <input type="url" class="form-input" value="${link.url}" onchange="updateOtherLink(${index}, 'url', this.value)" placeholder="https://">
          </div>
        </div>
        <div class="other-link-actions">
          <button class="link-remove-button" onclick="removeOtherLink(${index})">削除</button>
        </div>
      </div>
    `).join('');
  }

  // その他のリンクを追加
  window.addOtherLink = function() {
    if (!profileData.otherLinks) {
      profileData.otherLinks = [];
    }

    profileData.otherLinks.push({
      id: Date.now(),
      name: '',
      url: ''
    });

    renderOtherLinksList();
  };

  // その他のリンクを更新
  window.updateOtherLink = function(index, field, value) {
    if (profileData.otherLinks && profileData.otherLinks[index]) {
      profileData.otherLinks[index][field] = value;
    }
  };

  // その他のリンクを削除
  window.removeOtherLink = function(index) {
    showDeleteModal('このリンクを削除しますか？', function() {
      profileData.otherLinks.splice(index, 1);
      renderOtherLinksList();
    });
  };

  // ブロックリストを表示
  function renderBlockList() {
    const blockList = document.getElementById('blockList');

    if (!profileData.blocks || profileData.blocks.length === 0) {
      blockList.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 2rem;">ブロックを追加してコンテンツを作成しましょう</p>';
      return;
    }

    blockList.innerHTML = profileData.blocks.map((block, index) => {
      return renderBlock(block, index);
    }).join('');
  }

  // フォーマットツールバーを表示
  function renderFormatToolbar(index) {
    return `
      <div class="format-toolbar">
        <button class="format-button" onclick="applyFormat(${index}, 'bold')" title="太字 (Ctrl+B)" type="button">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        <div class="color-picker-wrapper">
          <button class="color-picker-button" onclick="document.getElementById('color-picker-${index}').click()" title="文字色" type="button">
            <div class="color-preview" id="color-preview-${index}" style="background: #111827;"></div>
            <span>色</span>
          </button>
          <input type="color" id="color-picker-${index}" class="color-picker-input" onchange="applyColor(${index}, this.value)">
        </div>
      </div>
    `;
  }

  // contenteditable から内容を更新
  window.updateBlockFromEditable = function(index, field, value) {
    if (profileData.blocks && profileData.blocks[index]) {
      profileData.blocks[index][field] = value;
      syncHTMLFromBlocks();
    }
  };

  // contenteditable でのキーボードショートカット
  window.handleEditableKeydown = function(event, index) {
    // Ctrl+B or Cmd+B で太字
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      applyFormat(index, 'bold');
    }
  };

  // フォーマットを適用（太字）
  window.applyFormat = function(index, format) {
    const editable = document.getElementById(`block-${index}-content`);
    if (!editable) return;

    editable.focus();

    if (format === 'bold') {
      document.execCommand('bold', false, null);
    }

    // 内容を保存
    updateBlockFromEditable(index, 'content', editable.innerHTML);
  };

  // 文字色を適用
  window.applyColor = function(index, color) {
    const editable = document.getElementById(`block-${index}-content`);
    const preview = document.getElementById(`color-preview-${index}`);

    if (!editable) return;

    // プレビューを更新
    if (preview) {
      preview.style.background = color;
    }

    editable.focus();

    // 選択範囲がない場合は何もしない
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      showToast('文字を選択してから色を変更してください', 'info');
      return;
    }

    // 選択テキストを色付きspanで囲む
    document.execCommand('foreColor', false, color);

    // 内容を保存
    updateBlockFromEditable(index, 'content', editable.innerHTML);
  };

  // ブロックをHTMLとして表示
  function renderBlock(block, index) {
    const typeLabels = {
      heading: '見出し',
      text: 'テキスト',
      image: '画像',
      link: 'リンク',
      divider: '区切り線'
    };

    let contentHTML = '';

    if (block.type === 'heading') {
      contentHTML = `
        <select class="block-select" onchange="updateBlock(${index}, 'level', this.value)">
          <option value="h2" ${block.level === 'h2' ? 'selected' : ''}>大見出し (H2)</option>
          <option value="h3" ${block.level === 'h3' ? 'selected' : ''}>中見出し (H3)</option>
          <option value="h4" ${block.level === 'h4' ? 'selected' : ''}>小見出し (H4)</option>
        </select>
        ${renderFormatToolbar(index)}
        <div class="block-editable"
             id="block-${index}-content"
             contenteditable="true"
             data-placeholder="見出しを入力"
             onblur="updateBlockFromEditable(${index}, 'content', this.innerHTML)"
             onkeydown="handleEditableKeydown(event, ${index})">${block.content || ''}</div>
      `;
    } else if (block.type === 'text') {
      contentHTML = `
        ${renderFormatToolbar(index)}
        <div class="block-editable block-editable-multiline"
             id="block-${index}-content"
             contenteditable="true"
             data-placeholder="テキストを入力"
             onblur="updateBlockFromEditable(${index}, 'content', this.innerHTML)"
             onkeydown="handleEditableKeydown(event, ${index})">${block.content || ''}</div>
      `;
    } else if (block.type === 'image') {
      const imagePreview = block.url ? `<img src="${block.url}" alt="${block.alt || ''}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 0.5rem;">` : '';
      contentHTML = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <input type="text" class="block-input" value="${block.url || ''}" onchange="updateBlock(${index}, 'url', this.value)" placeholder="画像URL" style="flex: 1;">
          <button class="format-button" onclick="document.getElementById('image-upload-${index}').click()" title="画像をアップロード" type="button">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
          </button>
        </div>
        <input type="file" id="image-upload-${index}" accept="image/*" style="display: none;" onchange="handleImageUpload(${index}, event)">
        <input type="text" class="block-input" value="${block.alt || ''}" onchange="updateBlock(${index}, 'alt', this.value)" placeholder="代替テキスト (alt)">
        <div id="image-preview-${index}">${imagePreview}</div>
      `;
    } else if (block.type === 'link') {
      contentHTML = `
        <input type="text" class="block-input" value="${block.text || ''}" onchange="updateBlock(${index}, 'text', this.value)" placeholder="リンクテキスト">
        <input type="url" class="block-input" value="${block.url || ''}" onchange="updateBlock(${index}, 'url', this.value)" placeholder="URL">
      `;
    } else if (block.type === 'divider') {
      contentHTML = '<div style="height: 2px; background: #e5e7eb; border-radius: 2px;"></div>';
    }

    return `
      <div class="block-item">
        <div class="block-header">
          <span class="block-type-label">${typeLabels[block.type] || block.type}</span>
          <div class="block-actions">
            <button class="block-action-button" onclick="moveBlockUp(${index})" ${index === 0 ? 'disabled' : ''} title="上に移動">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l5-5 5 5H7z"/>
              </svg>
            </button>
            <button class="block-action-button" onclick="moveBlockDown(${index})" ${index === profileData.blocks.length - 1 ? 'disabled' : ''} title="下に移動">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5H7z"/>
              </svg>
            </button>
            <button class="block-action-button" onclick="removeBlock(${index})" title="削除">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="block-content">
          ${contentHTML}
        </div>
      </div>
    `;
  }

  // ブロックを追加
  window.addBlock = function(type) {
    if (!profileData.blocks) {
      profileData.blocks = [];
    }

    const newBlock = {
      id: Date.now(),
      type: type
    };

    if (type === 'heading') {
      newBlock.level = 'h3';
      newBlock.content = '';
    } else if (type === 'text') {
      newBlock.content = '';
    } else if (type === 'image') {
      newBlock.url = '';
      newBlock.alt = '';
    } else if (type === 'link') {
      newBlock.text = '';
      newBlock.url = '';
    }

    profileData.blocks.push(newBlock);
    renderBlockList();
    syncHTMLFromBlocks();
  };

  // 画像アップロード処理
  window.handleImageUpload = function(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      showToast('画像サイズは5MB以下にしてください', 'error');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      showToast('画像ファイルを選択してください', 'error');
      return;
    }

    showLoading();

    // FileReaderで画像を読み込み
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageUrl = e.target.result;

      // ブロックデータを更新
      if (profileData.blocks && profileData.blocks[index]) {
        profileData.blocks[index].url = imageUrl;

        // プレビューを更新
        const preview = document.getElementById(`image-preview-${index}`);
        if (preview) {
          preview.innerHTML = `<img src="${imageUrl}" alt="${profileData.blocks[index].alt || ''}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 0.5rem;">`;
        }

        // URL入力フィールドも更新
        const urlInput = document.querySelector(`#block-${index} input[placeholder="画像URL"]`);
        if (urlInput) {
          urlInput.value = imageUrl;
        }

        syncHTMLFromBlocks();
      }

      hideLoading();
      showToast('画像をアップロードしました', 'success');
    };

    reader.onerror = function() {
      hideLoading();
      showToast('画像の読み込みに失敗しました', 'error');
    };

    reader.readAsDataURL(file);
  };

  // ブロックを更新
  window.updateBlock = function(index, field, value) {
    if (profileData.blocks && profileData.blocks[index]) {
      profileData.blocks[index][field] = value;

      // 画像ブロックのURL変更時はプレビューも更新
      if (profileData.blocks[index].type === 'image' && field === 'url') {
        const preview = document.getElementById(`image-preview-${index}`);
        if (preview) {
          if (value) {
            preview.innerHTML = `<img src="${value}" alt="${profileData.blocks[index].alt || ''}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 0.5rem;">`;
          } else {
            preview.innerHTML = '';
          }
        }
      }

      syncHTMLFromBlocks();
    }
  };

  // ブロックを削除
  window.removeBlock = function(index) {
    showDeleteModal('このブロックを削除しますか？', function() {
      profileData.blocks.splice(index, 1);
      renderBlockList();
      syncHTMLFromBlocks();
    });
  };

  // ブロックを上に移動
  window.moveBlockUp = function(index) {
    if (index > 0) {
      const temp = profileData.blocks[index];
      profileData.blocks[index] = profileData.blocks[index - 1];
      profileData.blocks[index - 1] = temp;
      renderBlockList();
      syncHTMLFromBlocks();
    }
  };

  // ブロックを下に移動
  window.moveBlockDown = function(index) {
    if (index < profileData.blocks.length - 1) {
      const temp = profileData.blocks[index];
      profileData.blocks[index] = profileData.blocks[index + 1];
      profileData.blocks[index + 1] = temp;
      renderBlockList();
      syncHTMLFromBlocks();
    }
  };


  // ブロックからHTMLを生成
  function syncHTMLFromBlocks() {
    let html = '';

    profileData.blocks.forEach(block => {
      if (block.type === 'heading') {
        // HTMLタグを保持（太字や色などのフォーマット）
        const content = block.content || '';
        html += `<${block.level}>${content}</${block.level}>\n`;
      } else if (block.type === 'text') {
        // HTMLタグを保持（太字や色などのフォーマット）
        const content = block.content || '';
        html += `<p>${content}</p>\n`;
      } else if (block.type === 'image' && block.url) {
        html += `<img src="${block.url}" alt="${block.alt || ''}" style="max-width: 100%; height: auto; border-radius: 0.5rem;">\n`;
      } else if (block.type === 'link') {
        html += `<p><a href="${block.url || '#'}">${block.text || ''}</a></p>\n`;
      } else if (block.type === 'divider') {
        html += '<hr>\n';
      }
    });

    profileData.profileDetail = html;
    document.getElementById('profileDetailEditor').value = html;
  }

  // エディタータブを切り替え
  window.switchEditorTab = function(tab) {
    const tabs = document.querySelectorAll('.editor-tab');
    const contents = document.querySelectorAll('.editor-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'block') {
      tabs[0].classList.add('active');
      document.getElementById('blockTab').classList.add('active');
    } else if (tab === 'html') {
      tabs[1].classList.add('active');
      document.getElementById('htmlTab').classList.add('active');
    } else if (tab === 'preview') {
      tabs[2].classList.add('active');
      document.getElementById('previewTab').classList.add('active');
      updatePreview();
    }
  };

  // プレビューを更新
  function updatePreview() {
    const editor = document.getElementById('profileDetailEditor');
    const preview = document.getElementById('profileDetailPreview');
    preview.innerHTML = editor.value || '';
  }

  // HTMLエディターの変更を監視
  document.getElementById('profileDetailEditor').addEventListener('input', function() {
    profileData.profileDetail = this.value;
  });

  // 削除モーダルを表示
  function showDeleteModal(message, onConfirm) {
    const modal = document.getElementById('deleteConfirmModal');
    const messageEl = document.getElementById('deleteModalMessage');
    const confirmButton = document.getElementById('deleteConfirmButton');

    messageEl.textContent = message;

    // 古いイベントリスナーを削除
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

    // 新しいイベントリスナーを追加
    newConfirmButton.onclick = function() {
      onConfirm();
      closeDeleteModal();
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // 削除モーダルを閉じる
  window.closeDeleteModal = function() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  // モーダル外クリックで閉じる
  document.getElementById('deleteConfirmModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeDeleteModal();
    }
  });

  // プロフィールを保存
  window.saveProfile = function() {
    profileData.social = {
      youtube: document.getElementById('youtubeUrl').value,
      twitch: document.getElementById('twitchUrl').value,
      twitter: document.getElementById('twitterUrl').value
    };

    // プロフィール詳細
    profileData.profileDetail = document.getElementById('profileDetailEditor').value;

    // その他のリンクはすでにprofileDataに格納されている

    saveToStorage('creatorProfile', profileData);
    showToast('プロフィールを保存しました', 'success');
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

  // 初期化
  initProfile();
});
