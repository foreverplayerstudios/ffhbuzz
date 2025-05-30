/*
  # Fix watch history and progress tracking

  1. Changes
    - Drop duplicate columns
    - Add correct progress tracking columns
    - Update functions for progress tracking

  2. Security
    - Maintain existing RLS policies
*/

-- Drop duplicate columns
ALTER TABLE watch_history
DROP COLUMN IF EXISTS current_time,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS play_time,
DROP COLUMN IF EXISTS total_duration;

-- Add correct progress tracking columns
ALTER TABLE watch_history
ADD COLUMN IF NOT EXISTS current_position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_length integer DEFAULT 0;

-- Create or replace function to update watch progress
CREATE OR REPLACE FUNCTION update_watch_progress(
  p_user_id uuid,
  p_media_type text,
  p_media_id text,
  p_current_position integer,
  p_total_length integer,
  p_season_number integer DEFAULT NULL,
  p_episode_number integer DEFAULT NULL,
  p_episode_name text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Calculate progress percentage
  DECLARE
    v_progress integer;
  BEGIN
    IF p_total_length > 0 THEN
      v_progress := (p_current_position * 100) / p_total_length;
    ELSE
      v_progress := 0;
    END IF;

    -- Update watch history
    INSERT INTO watch_history (
      user_id,
      media_type,
      media_id,
      season_number,
      episode_number,
      episode_name,
      current_position,
      total_length,
      progress,
      watched_at
    )
    VALUES (
      p_user_id,
      p_media_type,
      p_media_id,
      p_season_number,
      p_episode_number,
      p_episode_name,
      p_current_position,
      p_total_length,
      v_progress,
      now()
    )
    ON CONFLICT (user_id, media_type, media_id)
    DO UPDATE SET
      season_number = EXCLUDED.season_number,
      episode_number = EXCLUDED.episode_number,
      episode_name = EXCLUDED.episode_name,
      current_position = EXCLUDED.current_position,
      total_length = EXCLUDED.total_length,
      progress = EXCLUDED.progress,
      watched_at = EXCLUDED.watched_at;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to get last watched position
CREATE OR REPLACE FUNCTION get_last_watched_position(
  p_user_id uuid,
  p_media_type text,
  p_media_id text
)
RETURNS TABLE (
  current_position integer,
  total_length integer,
  progress integer,
  season_number integer,
  episode_number integer,
  episode_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.current_position,
    h.total_length,
    h.progress,
    h.season_number,
    h.episode_number,
    h.episode_name
  FROM watch_history h
  WHERE h.user_id = p_user_id
    AND h.media_type = p_media_type
    AND h.media_id = p_media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;