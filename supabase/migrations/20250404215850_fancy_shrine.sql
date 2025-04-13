/*
  # Add watchlist and history tables

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `media_type` (text, movie or tv)
      - `media_id` (text)
      - `created_at` (timestamptz)
    
    - `watch_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `media_type` (text, movie or tv)
      - `media_id` (text)
      - `watched_at` (timestamptz)
      - `progress` (integer, percentage watched)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access control
*/

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_type, media_id)
);

-- Create watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  watched_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, media_type, media_id)
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
  ON watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can view their own watch history"
  ON watch_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watch history"
  ON watch_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history"
  ON watch_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS watchlist_user_idx ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS watchlist_media_idx ON watchlist (media_type, media_id);
CREATE INDEX IF NOT EXISTS watch_history_user_idx ON watch_history (user_id);
CREATE INDEX IF NOT EXISTS watch_history_media_idx ON watch_history (media_type, media_id);
CREATE INDEX IF NOT EXISTS watch_history_watched_at_idx ON watch_history (watched_at DESC);