/*
  # Fix watch progress functions

  1. Changes
    - Drop existing functions
    - Recreate functions with correct parameter names
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS update_watch_progress(uuid,text,text,integer,integer,integer,integer,text);
DROP FUNCTION IF EXISTS get_last_watched_position(uuid,text,text);

-- Create or replace function to update watch progress
CREATE OR REPLACE FUNCTION update_watch_progress(
  p_user_id uuid,
  p_media_type text,
  p_media_id text,
  p_watch_position integer,
  p_video_length integer,
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
    IF p_video_length > 0 THEN
      v_progress := (p_watch_position * 100) / p_video_length;
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
      watch_position,
      video_length,
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
      p_watch_position,
      p_video_length,
      v_progress,
      now()
    )
    ON CONFLICT (user_id, media_type, media_id)
    DO UPDATE SET
      season_number = EXCLUDED.season_number,
      episode_number = EXCLUDED.episode_number,
      episode_name = EXCLUDED.episode_name,
      watch_position = EXCLUDED.watch_position,
      video_length = EXCLUDED.video_length,
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
  watch_position integer,
  video_length integer,
  progress integer,
  season_number integer,
  episode_number integer,
  episode_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.watch_position,
    h.video_length,
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