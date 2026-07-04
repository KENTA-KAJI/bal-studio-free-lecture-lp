# BAL STUDIO 無料講義LP

「なぜ、解剖学を学んでも現場で使えないのか」をテーマにした、トレーナー・施術者向け無料講義のランディングページです。

## ファイル構成

- `index.html` — ページ本体
- `style.css` — スタイル
- `script.js` — LINE登録URLの反映、FAQアコーディオン、フェードインなどの挙動

## 使い方

`index.html` をブラウザで開くだけで表示できます。

## LINE登録URLの変更

すべてのCTAボタンの遷移先は `script.js` 冒頭の `CONFIG.LINE_URL` で一括管理されています。実際のURLに差し替える場合はここを書き換えてください。

```js
const CONFIG = {
  LINE_URL: "https://example.com/line"
};
```

## OGP画像の設定

`index.html` 内の `og:image` はプレースホルダーです。公開前に実画像（推奨 1200×630px）のURLに差し替えてください。
