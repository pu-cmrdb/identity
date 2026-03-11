# Identity

行雲者研發基地身份認證與存取管理系統（IAM）。處理帳號登入、OAuth2 授權與 Passkey 驗證。

## 技術棧

- 框架：[Next.js](https://nextjs.org/) 16（App Router）
- 語言：TypeScript 5
- 認證：[Better Auth](https://www.better-auth.com/)（含 Passkey、OAuth Provider、稽核日誌）
- API：[tRPC](https://trpc.io/) v11 + TanStack Query
- 資料庫：SQLite（[libsql](https://github.com/tursodatabase/libsql)）+ [Drizzle ORM](https://orm.drizzle.team/)
- UI：Tailwind CSS v4、Radix UI、shadcn/ui
- 執行環境：[Bun](https://bun.sh/)

## 環境設定

### 1. 安裝相依套件

```bash
bun install
```

### 2. 設定環境變數

複製 `.env.example` 並填入對應的值：

```bash
cp .env.example .env
```

| 變數 | 說明 |
| --- | --- |
| `APP_DEV_URL` | 本機開發網址（例：`http://localhost:3000`） |
| `APP_PROD_URL` | 正式環境網址 |
| `BETTER_AUTH_SECRET` | 加密金鑰（隨機字串即可） |
| `BETTER_AUTH_DISCORD_CLIENT_ID` | Discord OAuth Client ID |
| `BETTER_AUTH_DISCORD_CLIENT_SECRET` | Discord OAuth Client Secret |
| `DATABASE_URL` | 資料庫位址，預設為 `file:./data/db.sqlite` |

### 3. 初始化資料庫

```bash
bun run db:generate
bun run drizzle:migrate
bun run db:seed
```

## 開發

```bash
bun run dev              # 啟動開發伺服器（Turbopack，port 3000）
bun run check            # ESLint + TypeScript 型別檢查
bun run drizzle:studio   # 開啟 Drizzle Studio
```

## 建置

```bash
bun run build   # 正式環境建置
bun run start   # 啟動正式伺服器
```

## 正式環境部署（Docker）

### 首次部署

```bash
git clone https://github.com/pu-cmrdb/identity.git && cd identity

# 設定環境變數
cp .env.example .env
# 填入所有值（DATABASE_URL 預設已正確，無需修改）

# 在主機上執行資料庫遷移
bun install
bunx drizzle-kit migrate

# 啟動容器
docker compose up -d --build
```

### 後續更新

```bash
git pull

# 若有 schema 異動，先執行遷移
bun install
bunx drizzle-kit migrate

docker compose up -d --build
```

### 常用指令

```bash
docker compose logs -f identity   # 查看 logs
docker compose restart identity   # 重啟（不重新建置）
docker compose down               # 停止
```

## 授權

本專案為行雲者研發基地團隊內部私有專案，未經授權不得對外散布或使用。

## 貢獻

詳見 [CONTRIBUTING.md](./CONTRIBUTING.md)。
