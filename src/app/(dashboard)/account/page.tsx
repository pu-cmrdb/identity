import { PasskeysSection } from './_sections/passkeys-section';
import { ProfileSection } from './_sections/profile-section';
import { SocialConnectionsSection } from './_sections/social-connections-section';

export default function DashboardProfilePage() {
  return (
    <div className="
      space-y-8 p-4
      md:p-8
      xl:p-16
    "
    >
      <div className="space-y-12 p-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-medium">帳號資訊</h1>

          <p className="text-lg text-muted-foreground">
            管理你的個人資料、社群帳號連結與密碼金鑰等登入方式。
          </p>
        </div>

        <ProfileSection />

        <SocialConnectionsSection />

        <PasskeysSection />
      </div>
    </div>
  );
}
