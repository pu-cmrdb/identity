'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SiDiscord as DiscordIcon } from '@icons-pack/react-simple-icons';
import { toast } from 'sonner';

import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

export function SocialConnectionsSection() {
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryFn: async () => {
      const result = await authClient.listAccounts();
      if (result.error) throw new Error(result.error.message ?? '無法取得帳號資訊');
      return result.data;
    },
    queryKey: ['listAccounts'],
  });

  const { isPending: isUnlinkingDiscord, mutate: unlinkDiscord } = useMutation({
    mutationFn: async () => {
      const result = await authClient.unlinkAccount({ providerId: 'discord' });

      if (result.error) {
        toast.error('解除連繫時發生錯誤', {
          description: result.error.message,
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['listAccounts'] });
      toast.success('已解除連繫 Discord 帳號');
    },
  });

  const hasDiscordLinked = accounts?.find((v) => v.providerId === 'discord');

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold">社交連繫</h2>
      <p className="text-muted-foreground">
        連結社交帳號後，可直接使用第三方帳號登入，無需輸入密碼
      </p>
      <div className="my-4">
        {!accounts
          ? <Spinner />
          : (
              <Item>
                <ItemMedia variant="icon">
                  <DiscordIcon className="
                    size-6 text-[#454FBF]
                    dark:text-[#5865F2]
                  "
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Discord</ItemTitle>
                </ItemContent>
                <ItemActions>
                  {hasDiscordLinked
                    ? (
                        <Button
                          disabled={isUnlinkingDiscord}
                          onClick={() => unlinkDiscord()}
                          variant="outline"
                        >
                          {isUnlinkingDiscord && <Spinner />}
                          解除連接
                        </Button>
                      )
                    : (
                        <Button
                          onClick={() => {
                            void authClient.linkSocial({
                              callbackURL: window.location.href,
                              provider: 'discord',
                            });
                          }}
                        >
                          連接
                        </Button>
                      )}
                </ItemActions>
              </Item>
            )}
      </div>
    </section>
  );
}
