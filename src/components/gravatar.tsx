'use client';

import { useEffect, useState } from 'react';

import { AvatarImage } from '@/components/ui/avatar';

/**
 * Gravatar 圖片元件的屬性
 */
type AvatarProps = Omit<React.ComponentPropsWithoutRef<typeof AvatarImage>, 'src'> & Readonly<{
  /** 用於生成 Gravatar 圖片的電子郵件地址 */
  email: string;
}>;

/**
 * 顯示使用者的 Gravatar 頭像圖片
 *
 * 此元件使用 SHA-256 雜湊演算法處理電子郵件地址，
 * 並從 Gravatar 服務載入對應的頭像圖片。
 * 若找不到頭像則顯示預設的 identicon。
 *
 * @param props - 元件屬性
 * @param props.email - 用於生成 Gravatar 圖片的電子郵件地址
 * @returns Gravatar 圖片元件
 *
 * @example
 * ```tsx
 * <GravatarImage email="user@example.com" />
 * ```
 */
export function GravatarImage({ email, ...props }: AvatarProps) {
  const [hash, setHash] = useState<string>('');

  useEffect(() => {
    void hashEmail(email).then(setHash);
  }, [email]);

  const src = hash ? `https://www.gravatar.com/avatar/${hash}?d=identicon` : '';

  return (
    <AvatarImage
      src={src}
      {...props}
    />
  );
}

/**
 * 使用 SHA-256 雜湊電子郵件地址
 *
 * @param email - 要雜湊的電子郵件地址
 * @returns SHA-256 雜湊值的十六進制字串
 */
async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
