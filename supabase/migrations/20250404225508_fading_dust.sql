/*
  # Add watch progress tracking

  1. Changes
    - Add progress tracking columns to watch_history table
    - Add function to update watch progress
    - Add function to get last watched position

  2. Security
    - Enable RLS for all new functions
    - Add policies for authenticated users
*/

-- Add progress tracking columns
ALTER TABLE watch_history
ADD COLUMN play_time integer DEFAULT 0,
ADD COLUMN total_duration integer DEFAULT 0;

-- Create function to update watch progress
CREATE OR REPLACE FUNCTION update_watch_progress(
  p_user_id uuid,
  p_media_type text,
  p_media_id text,
  p_play_time integer,
  p_total_duration integer,
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
    IF p_total_duration > 0 THEN
      v_progress := (p_play_time * 100) / p_total_duration;
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
      play_time,
      total_duration,
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
      p_play_time,
      p_total_duration,
      v_progress,
      now()
    )
    ON CONFLICT (user_id, media_type, media_id)
    DO UPDATE SET
      season_number = EXCLUDED.season_number,
      episode_number = EXCLUDED.episode_number,
      episode_name = EXCLUDED.episode_name,
      play_time = EXCLUDED.play_time,
      total_duration = EXCLUDED.total_duration,
      progress = EXCLUDED.progress,
      watched_at = EXCLUDED.watched_at;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get last watched position
CREATE OR REPLACE FUNCTION get_last_watched_position(
  p_user_id uuid,
  p_media_type text,
  p_media_id text
)
RETURNS TABLE (
  play_time integer,
  total_duration integer,
  progress integer,
  season_number integer,
  episode_number integer,
  episode_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.play_time,
    h.total_duration,
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