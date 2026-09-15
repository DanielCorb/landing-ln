// models
import { Rubrica } from '@models/post';

/**
 * Presentation metadata for one of the three fixed rubrici.
 *
 * There is no `rubrici` collection in Firestore — the set is closed and lives in
 * `@constants/rubrici`. This type describes the shape of those entries.
 */
export interface RubricaMeta {
  slug: Rubrica;
  name: string;
  description: string;
  /** Which inline icon component renders for this rubrică */
  iconId: 'typewriter' | 'map' | 'mailbox';
}
