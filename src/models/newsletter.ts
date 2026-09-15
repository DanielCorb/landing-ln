/** Where a subscriber sits in the opt-in lifecycle. */
export type SubscriberStatus = 'active' | 'unsubscribed';

/**
 * A newsletter subscriber.
 *
 * The Firestore document id *is* the lowercased address, which is what makes both
 * subscribing and unsubscribing a single direct write with no lookup and no chance of
 * duplicates differing only by case.
 */
export interface Subscriber {
  email: string;
  status: SubscriberStatus;
  agreedToTerms: boolean;
  subscribedAt: Date | null;
  unsubscribedAt: Date | null;
}
