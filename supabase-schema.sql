-- Run this in your Supabase SQL editor

create table public.company_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  company_name text not null default '',
  owner_name text not null default '',
  email text not null default '',
  phone text default '',
  address text default '',
  city text default '',
  state text default '',
  zip text default '',
  license_number text default '',
  insurance_number text default '',
  logo_url text default '',
  website text default '',
  payment_terms text default 'Payment due within 30 days of completion.',
  default_tax_rate numeric(5,2) default 8.25,
  default_validity_days integer default 30,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  subscription_plan text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text default '',
  phone text default '',
  address text default '',
  notes text default '',
  created_at timestamptz default now()
);

create table public.estimates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  estimate_number text not null,
  status text not null default 'draft',
  trade_type text not null,
  job_title text not null default '',
  job_description text not null default '',
  job_address text default '',
  customer_name text default '',
  customer_email text default '',
  customer_phone text default '',
  line_items jsonb not null default '[]',
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 8.25,
  tax_amount numeric(12,2) default 0,
  discount_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text default '',
  valid_until date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table public.company_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.estimates enable row level security;

create policy "Users own their profile" on public.company_profiles
  for all using (auth.uid() = user_id);

create policy "Users own their customers" on public.customers
  for all using (auth.uid() = user_id);

create policy "Users own their estimates" on public.estimates
  for all using (auth.uid() = user_id);

-- Auto-create company profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.company_profiles (user_id, email, owner_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
