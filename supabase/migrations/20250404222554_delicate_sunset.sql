/*
  # Update watch history table to include season and episode information

  1. Changes
    - Add season_number and episode_number columns to watch_history table
    - Add episode_name column to store the episode title
    - Add function to update watch history with episode details

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to watch_history table
ALTER TABLE watch_history
ADD COLUMN season_number integer,
ADD COLUMN episode_number integer,
ADD COLUMN episode_name text;

-- Create a function to update watch history with episode details
CREATE OR REPLACE FUNCTION update_watch_history(
  p_user_id uuid,
  p_media_type text,
  p_media_id text,
  p_season_number integer DEFAULT NULL,
  p_episode_number integer DEFAULT NULL,
  p_episode_name text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO watch_history (
    user_id,
    media_type,
    media_id,
    season_number,
    episode_number,
    episode_name,
    watched_at
  )
  VALUES (
    p_user_id,
    p_media_type,
    p_media_id,
    p_season_number,
    p_episode_number,
    p_episode_name,
    now()
  )
  ON CONFLICT (user_id, media_type, media_id)
  DO UPDATE SET
    season_number = EXCLUDED.season_number,
    episode_number = EXCLUDED.episode_number,
    episode_name = EXCLUDED.episode_name,
    watched_at = EXCLUDED.watched_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an index for faster episode lookups
CREATE INDEX IF NOT EXISTS watch_history_episode_idx 
ON watch_history (media_type, media_id, season_number, episode_number);