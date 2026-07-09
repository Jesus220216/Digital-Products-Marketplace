/*
# Add affiliate balance increment function

1. New Functions
- increment_affiliate_balance - Atomic function to add commissions to affiliate balance

2. Notes
- This function safely increments the affiliate balance for commission payouts tracking
*/

CREATE OR REPLACE FUNCTION increment_affiliate_balance(affiliate_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET affiliate_balance = affiliate_balance + amount
  WHERE id = affiliate_id;
END;
$$ LANGUAGE plpgsql;
