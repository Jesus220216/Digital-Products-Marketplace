/*
# Digital Products Marketplace Schema

1. New Tables
- `products` - Digital products (videos, PDFs) for sale
  - id, title, description, type (video/pdf), price, thumbnail_url, file_url, affiliate_commission_pct, is_active, created_at
- `profiles` - Extended user profiles (customers and affiliates)
  - id, email, full_name, is_affiliate, affiliate_code, affiliate_balance, created_at
- `orders` - Purchase orders
  - id, user_id, total_amount, status, affiliate_code_used, created_at
- `order_items` - Individual items within an order
  - id, order_id, product_id, price_at_purchase, commission_amount
- `affiliate_withdrawals` - Affiliate withdrawal requests
  - id, affiliate_id, amount, status, created_at

2. Security
- Enable RLS on all tables
- Owner-scoped policies for profiles, orders, order_items, affiliate_withdrawals
- Public read for active products (catalog browsing)
- Authenticated users can create orders for themselves
- Affiliates can read their own data and commissions

3. Notes
- Uses auth.users for authentication (Supabase built-in)
- affiliate_code is auto-generated unique code for affiliates
- affiliate_commission_pct stores commission percentage (0-100)
*/

-- Products table (digital products for sale)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('video', 'pdf')),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  thumbnail_url text,
  file_url text NOT NULL,
  affiliate_commission_pct decimal(5,2) NOT NULL DEFAULT 10.00 CHECK (affiliate_commission_pct >= 0 AND affiliate_commission_pct <= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  is_affiliate boolean NOT NULL DEFAULT false,
  affiliate_code text UNIQUE,
  affiliate_balance decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  affiliate_code_used text,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_at_purchase decimal(10,2) NOT NULL,
  commission_amount decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Affiliate withdrawals table
CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_code ON orders(affiliate_code_used);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Products policies (active products are publicly readable)
DROP POLICY IF EXISTS "anon_read_active_products" ON products;
CREATE POLICY "anon_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_read_all_products" ON products;
CREATE POLICY "authenticated_read_all_products" ON products FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_products" ON products;
CREATE POLICY "authenticated_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_products" ON products;
CREATE POLICY "authenticated_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_products" ON products;
CREATE POLICY "authenticated_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Profiles policies (owner-scoped)
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Orders policies (owner-scoped)
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Order items policies (via parent order ownership)
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Affiliate withdrawals policies (owner-scoped)
DROP POLICY IF EXISTS "select_own_withdrawals" ON affiliate_withdrawals;
CREATE POLICY "select_own_withdrawals" ON affiliate_withdrawals FOR SELECT
  TO authenticated USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "insert_own_withdrawals" ON affiliate_withdrawals;
CREATE POLICY "insert_own_withdrawals" ON affiliate_withdrawals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = affiliate_id);

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate affiliate code when user becomes affiliate
CREATE OR REPLACE FUNCTION handle_affiliate_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_affiliate = true AND OLD.is_affiliate = false AND NEW.affiliate_code IS NULL THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliate_code ON profiles;
CREATE TRIGGER trigger_affiliate_code
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_affiliate_code();
