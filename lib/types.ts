export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: 'buyer' | 'seller';
  shop_name: string | null;
  avatar_url: string | null;
  country_code: string;
  phone: string | null;
  whatsapp_number: string | null;
  telegram_username: string | null;
  is_verified: boolean;
  ships_internationally: boolean;
  created_at: string;
};
