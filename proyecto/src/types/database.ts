export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'video' | 'pdf';
          price: number;
          thumbnail_url: string | null;
          file_url: string;
          affiliate_commission_pct: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          type: 'video' | 'pdf';
          price: number;
          thumbnail_url?: string | null;
          file_url: string;
          affiliate_commission_pct?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'video' | 'pdf';
          price?: number;
          thumbnail_url?: string | null;
          file_url?: string;
          affiliate_commission_pct?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_affiliate: boolean;
          affiliate_code: string | null;
          affiliate_balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_affiliate?: boolean;
          affiliate_code?: string | null;
          affiliate_balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          is_affiliate?: boolean;
          affiliate_code?: string | null;
          affiliate_balance?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          affiliate_code_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          affiliate_code_used?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          affiliate_code_used?: string | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          price_at_purchase: number;
          commission_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          price_at_purchase: number;
          commission_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          price_at_purchase?: number;
          commission_amount?: number;
          created_at?: string;
        };
      };
      affiliate_withdrawals: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          status: 'pending' | 'completed' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          amount: number;
          status?: 'pending' | 'completed' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          amount?: number;
          status?: 'pending' | 'completed' | 'rejected';
          created_at?: string;
        };
      };
    };
  };
}

export type Product = Database['public']['Tables']['products']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type AffiliateWithdrawal = Database['public']['Tables']['affiliate_withdrawals']['Row'];

export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
