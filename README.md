# waserin個人サイト

自己紹介＋作品ギャラリーの個人サイト。ループエンジニアリング（Claude Codeの
`/evolve`自動サイクル）で構築する。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run lint       # JS lint
npm run lint:css   # CSS lint
npm run test       # テスト（ビルド結果の検証を含む）
npm run build      # dist/ に静的サイトを出力
```

## 構成

- `index.html` : トップページ（自己紹介・作品一覧・連絡先）
- `partials/` : ヘッダー・フッター（`npm run build` で各ページに合体される）
- `styles/` : CSS（`tokens.css` に配色トークンをまとめる）
- `src/` : JS（ロジックは `logic.js`、エントリは `main.js`）
- `scripts/build.js` : ビルドスクリプト（`{{BASE}}` 置換・partials合体）
- `docs/ROADMAP.md` : タスク管理（優先順位・完成の定義はここに記載）
- `docs/roadmap-done.md` : 完了タスクの退避先
- `docs/cycle-log.md` : evolveサイクルの実施記録
- `.claude/skills/evolve/SKILL.md` : 自動開発サイクルの実行手順
- `CLAUDE.md` : このリポジトリでの作業方針（コンセプト・content-pendingの扱いなど）

## 運用ルール（詳細は `CLAUDE.md` 参照）

- チャットでの相談中はコードを実装しない。実装は `/evolve` サイクル内でのみ行う
- 自己紹介・作品説明などの本文はループが勝手に創作しない
  （`[要入力：...]` のプレースホルダーを置き、ユーザーが後から入力する＝`content-pending`）
- mainへの直接push・PRの作成/マージは禁止。取り込みは人間が判断する
- マージ後、GitHub Actionsが自動でGitHub Pagesへデプロイする（`.github/workflows/pages.yml`）
