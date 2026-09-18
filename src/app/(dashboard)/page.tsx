import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8 p-4 md:p-8 xl:p-16">
      <div className="space-y-12 p-4">
        <div className="space-y-4">
          <h1 className="font-medium text-3xl">歡迎使用身份識別服務</h1>

          <p className="text-lg text-muted-foreground">
            在這裡，您可以管理帳號資訊、設定登入方式，以及建立與管理 OAuth
            應用程式。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            className="space-y-2 rounded-lg border p-6 transition-colors hover:bg-muted/50"
            href="/account"
          >
            <h2 className="font-medium text-lg">帳號資訊</h2>

            <p className="text-muted-foreground text-sm">
              更新個人資料、管理社群帳號連結，以及設定密碼金鑰等登入方式。
            </p>
          </Link>

          <Link
            className="space-y-2 rounded-lg border p-6 transition-colors hover:bg-muted/50"
            href="/applications"
          >
            <h2 className="font-medium text-lg">我的應用程式</h2>

            <p className="text-muted-foreground text-sm">
              建立並管理您的 OAuth
              應用程式，讓其他服務透過您的帳號進行授權登入。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
