-- Enable UUID extension
create extension if not exists pgcrypto;

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  plan text default 'free' check (plan in ('free', 'pro', 'agency')),
  credits int default 5,
  stripe_customer_id text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ad analyses table
create table if not exists ad_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  image_url text not null,
  image_storage_path text,
  score int check (score >= 0 and score <= 100),
  suggestions jsonb default '[]'::jsonb,
  strengths jsonb default '[]'::jsonb,
  weaknesses jsonb default '[]'::jsonb,
  improvements jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Funnels table
create table if not exists funnels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  niche text not null,
  product_name text,
  structure jsonb not null,
  copies jsonb not null,
  audiences jsonb not null,
  thumbnail_url text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- Stripe subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_product_id text not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table ad_analyses enable row level security;
alter table funnels enable row level security;
alter table subscriptions enable row level security;

-- RLS Policies for users
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- RLS Policies for ad_analyses
create policy "Users can view own analyses"
  on ad_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on ad_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on ad_analyses for delete
  using (auth.uid() = user_id);

-- RLS Policies for funnels
create policy "Users can view own funnels"
  on funnels for select
  using (auth.uid() = user_id);

create policy "Users can insert own funnels"
  on funnels for insert
  with check (auth.uid() = user_id);

create policy "Users can update own funnels"
  on funnels for update
  using (auth.uid() = user_id);

create policy "Users can delete own funnels"
  on funnels for delete
  using (auth.uid() = user_id);

-- RLS Policies for subscriptions
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on subscriptions for update
  using (auth.uid() = user_id);

-- Create indexes for performance
create index idx_ad_analyses_user_id on ad_analyses(user_id);
create index idx_ad_analyses_created_at on ad_analyses(created_at desc);
create index idx_funnels_user_id on funnels(user_id);
create index idx_subscriptions_user_id on subscriptions(user_id);

-- Create storage bucket for ad images
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true);

-- Storage policies
create policy "Users can upload ad images"
  on storage.objects for insert
  with check (bucket_id = 'ad-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own ad images"
  on storage.objects for select
  using (bucket_id = 'ad-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own ad images"
  on storage.objects for delete
  using (bucket_id = 'ad-images' and auth.uid()::text = (storage.foldername(name))[1]);