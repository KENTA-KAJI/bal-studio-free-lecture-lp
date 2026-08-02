# BAL STUDIO 無料講義LP

トレーナー・施術者向け無料講義「TOP10%のトレーナーになるための実践解剖学」のランディングページです。

## セットアップ（Windows PowerShell）

```powershell
git clone https://github.com/KENTA-KAJI/bal-studio-free-lecture-lp.git
cd bal-studio-free-lecture-lp
npm install
npm run dev
```

既にclone済みの場合は、次の手順で更新できます。

```powershell
git pull
npm install
npm run dev
```

Node.js 22.xを使用します。本番用ファイルは `npm run build` で `dist` フォルダに生成されます。

## 環境変数

環境変数やSecretは不要です。LINE URLとGA4測定IDは既存値を引き継いでいます。

## Vercel

既存のVercelプロジェクトがGitHubの `main` ブランチに接続されています。`main` へのpush後、自動で本番へ反映されます。

- 本番URL: https://bal-studio-free-lecture-lp.vercel.app/
- Build command: `npm run build`
- Output directory: `dist`

## 計測イベント

セクション到達: `lp_view_hero`, `lp_view_pain`, `lp_view_steps_flow`, `lp_view_lecture_content`, `lp_view_shoulder_example`, `lp_view_instructor`, `lp_view_about_bal`, `lp_view_how_to_get`, `lp_view_faq`, `lp_view_final_cta`

CTA: `line_click_hero`, `line_click_lecture_content`, `line_click_how_to_get`, `line_click_final_cta`, `line_click_sticky_mobile`

LINEリンクを変更する場合は `script.js` 冒頭の `LINE_URL` と、HTML内のフォールバックURLを同時に変更してください。
