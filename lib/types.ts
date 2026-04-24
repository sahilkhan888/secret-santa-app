export type EventStatus = 'draft' | 'open' | 'closed' | 'drawn' | 'completed';
export type HotDrink = 'coffee' | 'tea' | 'neither';
export type ShirtSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'none';

export interface EventRow {
  id: string;
  name: string;
  slug: string;
  registration_opens_at: string;
  registration_closes_at: string;
  reveal_at: string;
  gifting_day: string;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
}

export interface ParticipantRow {
  id: string;
  event_id: string;
  name: string;
  team: string;
  email: string;
  budget_amount: number;
  wishlist_likes: string;
  wishlist_dislikes: string;
  hot_drink: HotDrink;
  shirt_size: ShirtSize;
  joined_at: string;
  is_active: boolean;
}
