// URLパラメータからパックIDを取得
const packId = getUrlParam('id') || 1;
const pack = getPackById(parseInt(packId));

if (!pack) {
  window.location.href = '../tanaka.html';
}

// パック情報を表示
document.getElementById('packName').textContent = pack.name;
document.getElementById('packDescription').textContent = pack.description;
document.getElementById('packPrice').textContent = formatPrice(pack.price);

// 排出率テーブルを表示
const dropRatesTable = document.getElementById('dropRatesTable');
dropRatesTable.innerHTML = pack.cards.map(card => `
  <tr>
    <td>${card.name}</td>
    <td>
      <span class="badge badge-rarity-${card.rarity.toLowerCase()}">${card.rarity}</span>
    </td>
    <td style="text-align: right; font-weight: 600;">${card.dropRate}%</td>
  </tr>
`).join('');

function purchasePack() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    showToast('購入が完了しました！', 'success');
    setTimeout(() => {
      window.location.href = `pack-open.html?id=${packId}`;
    }, 1500);
  }, 1500);
}
  </script>
