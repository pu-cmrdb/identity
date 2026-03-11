# 架構說明

## 概覽

行雲者研發基地身份認證與存取管理系統（IAM）是以 Next.js App Router 為核心，整合 Better Auth 處理認證邏輯，tRPC 提供型別安全的 API 層，Drizzle ORM 操作 SQLite 資料庫。

## 目錄結構

```
identity/
├── src/
│   ├── app/                        # Next.js App Router 頁面與路由
│   │   ├── (auth)/                 # 認證相關頁面（login、OAuth2 consent）
│   │   ├── (dashboard)/            # 登入後頁面（帳號設定、使用者管理）
│   │   ├── api/
│   │   │   ├── auth/[...all]/      # Better Auth 處理器
│   │   │   ├── trpc/[trpc]/        # tRPC 端點
│   │   │   └── user/[id]/image/    # 使用者頭像上傳
│   │   └── .well-known/            # OAuth2/OIDC 探索端點
│   ├── server/
│   │   ├── auth/                   # Better Auth 設定、用戶端、存取控制
│   │   ├── api/                    # tRPC 路由與 context
│   │   └── database/               # Drizzle client、schema、seed
│   ├── trpc/                       # tRPC React provider 與 RSC 整合
│   ├── components/
│   │   ├── providers/              # React providers（session 等）
│   │   └── ui/                     # shadcn/ui 元件
│   ├── hooks/                      # 自訂 React hooks
│   └── env.ts                      # 環境變數驗證（arktype + t3-env）
├── drizzle/                        # 資料庫遷移檔案
├── scripts/                        # 工具腳本
└── types/                          # 全域型別定義
```

## 技術層次

### 資料層

- **SQLite**（libsql）搭配 **Drizzle ORM**
- 所有資料表以 `identity_` 為前綴
- Schema 由 Better Auth 自動產生，存放於 `src/server/database/schema/auth.ts`（不應手動修改）
- 遷移檔案由 `drizzle-kit` 管理

### API 層

- **Better Auth**：處理所有認證端點，掛載於 `/api/auth/[...all]`
- **tRPC v11**：型別安全的 JSON-RPC，掛載於 `/api/trpc/[trpc]`
  - 使用 `superjson` 序列化（支援 Date、Map 等型別）
  - 分為 `publicProcedure`（無需登入）與 `protectedProcedure`（需要 session）
  - 開發環境加入 timing middleware，記錄每個 procedure 的執行時間

### 應用層

- **Next.js App Router**：Server Components 優先，需要互動的部分才用 Client Components
- RSC 透過 `src/trpc/server.tsx` 直接呼叫 tRPC（不經過 HTTP）
- Client Components 透過 `useTRPC()` hook 搭配 TanStack Query 呼叫

## 認證架構

Better Auth 負責所有認證邏輯，載入以下 plugins：

| Plugin | 用途 |
| --- | --- |
| `admin` | 角色權限管理（`admin` / `user`） |
| `auditLog` | 記錄所有認證事件 |
| `oauthProvider` | 將此服務作為 OAuth2/OIDC Provider |
| `username` | 自訂使用者名稱 |
| `passkey` | WebAuthn Passkey 支援 |
| `jwt` | JWT token 產生 |
| `openAPI` | 自動產生 API 文件（`/reference`） |

OAuth2/OIDC 支援的 scopes：`openid`、`profile`、`email`、`offline_access`。

## 資料庫 Schema

### 核心資料表

| 資料表 | 說明 |
| --- | --- |
| `users` | 使用者基本資料，含 `username`、`role`、`banned` 等自訂欄位 |
| `sessions` | 登入 session，含 IP 與 user agent |
| `accounts` | OAuth 第三方帳號連結（Discord 等） |
| `verifications` | 電子郵件驗證碼 |
| `passkeys` | WebAuthn 金鑰資料 |
| `audit_logs` | 認證事件稽核記錄，含 severity 與 metadata |

### OAuth2/OIDC 資料表

| 資料表 | 說明 |
| --- | --- |
| `oauthClients` | 已註冊的 OAuth2 客戶端 |
| `oauthAccessTokens` | 存取 token |
| `oauthRefreshTokens` | 更新 token |
| `oauthConsents` | 使用者授權記錄 |
| `jwkss` | JWT 金鑰對 |

## 環境變數驗證

`src/env.ts` 使用 `arktype` 定義 schema，透過 `@t3-oss/env-nextjs` 在啟動時驗證。Server-only，在 Client 存取會直接拋出錯誤。

## 主要資料流

**登入**：表單送出 → `authClient.signIn.email()` → Better Auth → session cookie → 導向 dashboard

**OAuth2 授權**：外部服務導向 `/oauth2/authorize?client_id=...` → 確認 session → 顯示授權頁面 → 使用者同意 → 回傳授權碼

**API 呼叫（Client）**：`useTRPC()` → TanStack Query → `/api/trpc` → `protectedProcedure` 驗證 session → Drizzle 查詢

**API 呼叫（RSC）**：`api.users.list()` → tRPC server-side caller（不走 HTTP）→ Drizzle 查詢
