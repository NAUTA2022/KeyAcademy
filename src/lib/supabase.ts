import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Only create the client when both env vars are present.
// When Supabase is not configured the app falls back to localStorage / Notion.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as never;

/* ─── Types ──────────────────────────────────────────────────── */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  location?: string;
  image_urls: string[];
  video_url?: string;
  agenda: string;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_email: string;
  user_name: string;
  wallet_address?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  type: 'video' | 'download' | 'live';
  content_url?: string;
  instructor: string;
  duration?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

/* ─── SQL schema (run once in Supabase SQL editor) ───────────── */
/*
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz not null,
  end_date timestamptz,
  location text,
  image_urls text[] default '{}',
  video_url text,
  agenda text default '',
  created_at timestamptz default now()
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  wallet_address text,
  created_at timestamptz default now(),
  unique(event_id, user_email)
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric default 0,
  image_url text,
  category text,
  type text default 'video',
  content_url text,
  instructor text,
  duration text,
  level text default 'beginner',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table events enable row level security;
alter table registrations enable row level security;
alter table courses enable row level security;

-- Allow public reads
create policy "Public read events" on events for select using (true);
create policy "Public read courses" on courses for select using (true);
create policy "Insert registrations" on registrations for insert with check (true);
create policy "Read own registrations" on registrations for select using (true);
*/
