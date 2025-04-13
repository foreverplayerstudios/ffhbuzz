/*
  # Fix comments schema and add missing policies

  1. Changes
    - Add foreign key reference from comments to profiles
    - Add index for faster comment retrieval
    - Add index for reactions
*/

-- Add index for faster comment retrieval
CREATE INDEX IF NOT EXISTS comments_media_idx ON comments (media_type, media_id);

-- Add index for reactions
CREATE INDEX IF NOT EXISTS comment_reactions_user_idx ON comment_reactions (user_id);
CREATE INDEX IF NOT EXISTS comment_reactions_comment_idx ON comment_reactions (comment_id);

-- Add foreign key reference to profiles
ALTER TABLE comments
ADD CONSTRAINT comments_user_profile_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update the trigger function to handle NULL cases
CREATE OR REPLACE FUNCTION update_comment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments SET dislikes = COALESCE(dislikes, 0) + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.comment_id;
    ELSE
      UPDATE comments SET dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type != NEW.reaction_type THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments 
      SET likes = GREATEST(COALESCE(likes, 0) - 1, 0),
          dislikes = COALESCE(dislikes, 0) + 1 
      WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments 
      SET likes = COALESCE(likes, 0) + 1,
          dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0)
      WHERE id = NEW.comment_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;