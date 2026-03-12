import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { schema } from '@/server/database';

import { UserItemMenu } from './menu';

type UserItemProps = Readonly<{
  user: typeof schema.users.$inferSelect;
}>;

export function UserItem({ user }: UserItemProps) {
  return (
    <Item>
      <ItemMedia>
        <Avatar className="size-10">
          <AvatarImage draggable={false} src={`/api/user/${user.id}/image`} />

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
        <UserItemMenu user={user} />
      </ItemActions>
    </Item>
  );
}
