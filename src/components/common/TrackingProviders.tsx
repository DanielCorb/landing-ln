'use client';

import { Suspense, type ReactNode } from 'react';
// components
import EmbedPickerLoader from '@components/common/EmbedPickerLoader';
import EssentialCookiesBootstrap from '@components/common/EssentialCookiesBootstrap';
import TrackingBootstrap from '@components/common/TrackingBootstrap';

/** Client-only tracking/embed hooks. Renders nothing visible. */
export default function TrackingProviders({ children }: { children?: ReactNode }) {
  return (
    <>
      <EssentialCookiesBootstrap />
      <TrackingBootstrap />
      <Suspense fallback={null}>
        <EmbedPickerLoader />
      </Suspense>
      {children}
    </>
  );
}
