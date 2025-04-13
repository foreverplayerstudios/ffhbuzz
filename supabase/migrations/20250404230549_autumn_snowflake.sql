/*
  # Simplify watch history tracking

  1. Changes
    - Add new function for simple history tracking without progress
    - Keep only essential information for watch history

  2. Security
    - Maintain existing RLS policies
*/

-- Create function to update watch history
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