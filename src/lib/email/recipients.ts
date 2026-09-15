// constants
import { getAdminAddress } from '@constants/email';
// lib
import { getSettings } from '@lib/firestore/settings';

/**
 * Where internal notifications go — new subscribers, unsubscribes, contact messages.
 *
 * Firestore first, environment second. Keeping the address in `settings/general` means the
 * editorial team can redirect their own alerts from the dashboard, without an env var
 * change and a redeploy of the site. The env fallback is what keeps the notifications
 * working before anyone has filled the field in, and if the settings document is ever
 * unreachable.
 *
 * `getSettings` is memoised per request, so calling this alongside other settings reads
 * costs one Firestore round trip, not two.
 */
export const getNotificationAddress = async (): Promise<string | null> => {
  try {
    const settings = await getSettings();
    const configured = settings.notificationEmail?.trim();
    if (configured) return configured;
  } catch (error) {
    console.error('Could not read notificationEmail from settings; falling back to env.', error);
  }

  return getAdminAddress();
};
