export type GiftStatus = 'available' | 'reserved';
export type InviteStatus = 'confirmed' | 'pending';

export type Gift = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  purchase_url: string | null;
  price: number | null;
  status: GiftStatus;
  reserved_by_guest_id: string | null;
  reserved_at: string | null;
  created_at: string;
};

export type Guest = {
  id: string;
  full_name: string;
  phone: string | null;
  group_name?: string | null;
  invite_status?: InviteStatus | null;
  has_accessed: boolean;
  selected_gift_id: string | null;
  selected_at: string | null;
  created_at: string;
};

export type AdminSettings = {
  id: string;
  event_title: string;
  welcome_message: string;
  couple_name: string | null;
  event_date: string | null;
  allow_multiple_gifts_per_guest: boolean;
  theme_color: string | null;
};

export type GuestSession = {
  guestId: string;
  fullName: string;
  selectedGiftId: string | null;
  selectedAt: string | null;
};
