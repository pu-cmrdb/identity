import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GravatarImage } from '@/components/gravatar';
import { schema } from '@/server/database';

type UserItemProps = Readonly<{
  user: typeof schema.users.$inferSelect;
}>;

export function UserItem({ user }: UserItemProps) {
  return (
    <Item>
      <ItemMedia>
        <Avatar className="size-10">
          <GravatarImage email={user.email} />

          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          {user.displayUsername ?? user.username}

          <span className="font-normal text-muted-foreground">{user.name}</span>
        </ItemTitle>

        <ItemDescription>
          {user.email}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
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

            <DropdownMenuItem variant="destructive">
              <Trash2Icon />
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
}
