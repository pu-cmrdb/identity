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
        <h1 className="text-2xl">帳號資訊</h1>

        <ProfileSection />

        <SocialConnectionsSection />

        <PasskeysSection />
      </div>
    </div>
  );
}
