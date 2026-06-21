import React from 'react';
import { FlashListProps } from '@shopify/flash-list/dist/FlashListProps';
import { ImageProps } from 'expo-image';

declare module '@shopify/flash-list' {
  export function FlashList<T>(props: FlashListProps<T> & React.RefAttributes<any>): React.ReactElement | null;
}

declare module 'expo-image' {
  export const Image: React.FC<ImageProps & React.RefAttributes<any>>;
}
