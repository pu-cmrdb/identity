'use client';

import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';
import { useTRPC } from '@/trpc/react';

import type { inferProcedureOutput } from '@trpc/server';

import type { AppRouter } from '@/server/api/root';

type UserItemMenuDialogContentProps = Readonly<{
  setOpen: (open: boolean) => void;
}> & UserItemMenuProps;

type UserItemMenuProps = Readonly<{
  user: inferProcedureOutput<AppRouter['users']['list']>['data'][number];
}>;

export function UserItemMenu({ user }: UserItemMenuProps) {
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<'delete' | 'edit' | null>(null);

  const setDialog = (tag: 'delete' | 'edit') => {
    if (user.role === 'admin' && tag === 'delete') return;
    setDialogContent(tag);
    setOpen(true);
  };

  const content = (() => {
    switch (dialogContent) {
      case 'delete': return <UserItemMenuDeleteContent setOpen={setOpen} user={user} />;
    }
  })();

  return (
    <AlertDialog
      onOpenChange={setOpen}
      onOpenChangeComplete={(value) => {
        if (!value) setDialogContent(null);
      }}
      open={open}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button size="icon" variant="ghost">
              <EllipsisVerticalIcon />
            </Button>
          )}
        />

        <DropdownMenuContent>
          <DropdownMenuItem>
            <PencilIcon />
            編輯
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={user.role === 'admin'}
            onClick={() => setDialog('delete')}
            variant="destructive"
          >
            <Trash2Icon />
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>

      </DropdownMenu>

      {content}
    </AlertDialog>
  );
}

export function UserItemMenuDeleteContent({ setOpen, user }: UserItemMenuDialogContentProps) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const result = await authClient.admin.removeUser({
        userId: user.id,
      });
      if (result.error) throw new Error(result.error.message);
    },
    onError: (error) => {
      toast.error('刪除使用者時發生錯誤', {
        description: error.message,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.users.list.infiniteQueryKey() });

      setOpen(false);
      toast.success('使用者刪除成功');
    },
  });

  return (
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>確認刪除？</AlertDialogTitle>

        <AlertDialogDescription>
          你確定要刪除使用者「
          {user.name}
          」？

          <br />
          這個動作將無法復原。
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>
          取消
        </AlertDialogCancel>

        <AlertDialogAction
          disabled={isPending}
          onClick={() => mutate()}
          variant="destructive"
        >
          {isPending && <Spinner data-icon="inline-start" />}
          確認
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
