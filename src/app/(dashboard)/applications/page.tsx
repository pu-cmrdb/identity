import { ApplicationGrid } from './_components/app-grid';
import { CreateApplicationButton } from './_components/create-app-button';

export default function DashboardApplicationsPage() {
  return (
    <div className="
      space-y-8 p-4
      md:p-8
      xl:p-16
    "
    >
      <div className="space-y-12 p-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-medium">我的應用程式</h1>

          <p className="text-lg text-muted-foreground">
            建立並管理你的 OAuth 應用程式。透過應用程式，你可以讓其他服務使用你的帳號進行授權登入。
          </p>
        </div>

        <div className="flex flex-row-reverse">
          <CreateApplicationButton />
        </div>

        <ApplicationGrid />
      </div>
    </div>
  );
}
