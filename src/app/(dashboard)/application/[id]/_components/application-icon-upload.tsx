'use client';

import { ImageUpIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_ICON_SIZE = 1024 * 1024;

type ApplicationIconUploadProps = Readonly<{
  clientId: string;
  clientName: string;
  logoUri?: string | null;
}>;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export function ApplicationIconUpload({
  clientId,
  clientName,
  logoUri,
}: ApplicationIconUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploadedLogoUri, setUploadedLogoUri] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const displayedLogoUri = uploadedLogoUri || logoUri || undefined;

  const uploadIcon = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      toast.error('請上傳 PNG、JPG 或 WebP 圖片');
      return;
    }
    if (file.size > MAX_ICON_SIZE) {
      toast.error('圖片大小不可超過 1 MB');
      return;
    }

    setIsUploading(true);
    try {
      const nextLogoUri = await readAsDataUrl(file);
      const result = await authClient.oauth2.updateClient({
        client_id: clientId,
        update: { logo_uri: nextLogoUri },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setUploadedLogoUri(nextLogoUri);
      await queryClient.invalidateQueries({
        queryKey: ['authClient.oauth2.getClients'],
      });
      toast.success('應用程式圖示已更新');
    } catch (error) {
      toast.error('上傳應用程式圖示時發生錯誤', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm">應用程式圖示</p>
      <div className="flex items-center gap-4">
        <Avatar className="size-20 rounded-2xl">
          <AvatarImage
            className="rounded-2xl"
            draggable={false}
            src={displayedLogoUri}
          />
          <AvatarFallback className="rounded-2xl text-xl">
            {clientName[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => void uploadIcon(event.target.files?.[0])}
            ref={inputRef}
            type="file"
          />
          <Button
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            type="button"
            variant="outline"
          >
            {isUploading ? <Spinner /> : <ImageUpIcon />}
            上傳圖示
          </Button>
          <p className="text-muted-foreground text-xs">
            PNG、JPG 或 WebP，檔案大小上限為 1 MB。
          </p>
        </div>
      </div>
    </div>
  );
}
