/** The social networks Lumea Nouă is present on. */
export type SocialPlatformId = 'instagram' | 'facebook' | 'tiktok' | 'telegram';

export interface SocialPlatform {
  id: SocialPlatformId;
  /** Human label, e.g. "Instagram" */
  label: string;
  /**
   * What the visitor sees as the account name. Deliberately *not* derived from the
   * URL — Facebook pages without a vanity URL and Telegram invite links produce
   * unreadable slugs like `profile.php?id=…` or `+piuDH_6ePDU3ZjJk`.
   */
  handle: string;
  url: string;
}
