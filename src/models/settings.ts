/**
 * Site settings — mirrors the dashboard's Firestore document `settings/general`.
 *
 * Every field is optional-tolerant: the public site renders sensible defaults when
 * the document (or a field inside it) is missing.
 */

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SeoDefaults {
  metaTitle: string;
  metaDescription: string;
  faviconUrl: string;
}

export interface SiteSettings {
  publicationName: string;
  logoUrl: string;
  socialLinks: SocialLink[];
  seoDefaults?: SeoDefaults;
  /** Public address shown to readers on the contact page. */
  contactEmail?: string;
  /**
   * Internal inbox that receives "someone subscribed" and "new contact message" notices.
   *
   * Deliberately separate from `contactEmail`: that one is published on the site for
   * readers to write to, this one is where the editorial team is alerted. They are often
   * the same address, but conflating them would mean a change to the public listing
   * silently redirects the team's notifications.
   */
  notificationEmail?: string;
  aboutPageContent?: string;
  kofiLink?: string;
}
