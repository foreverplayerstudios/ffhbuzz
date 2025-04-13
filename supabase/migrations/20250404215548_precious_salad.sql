/*
  # Create comments and reactions system

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references auth.users)
      - `media_type` (text)
      - `media_id` (text)
      - `likes` (integer)
      - `dislikes` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `comment_reactions`
      - `user_id` (uuid, references auth.users)
      - `comment_id` (uuid, references comments)
      - `reaction_type` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Anyone can read comments and reactions
      - Authenticated users can create comments
      - Users can only update/delete their own comments
      - Users can manage their own reactions
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment reactions policies
CREATE POLICY "Comment reactions are viewable by everyone"
  ON comment_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reactions"
  ON comment_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON comment_reactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON comment_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update comment likes/dislikes count
CREATE OR REPLACE FUNCTION update_comment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments SET dislikes = dislikes + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.comment_id;
    ELSE
      UPDATE comments SET dislikes = GREATEST(dislikes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type != NEW.reaction_type THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments 
      SET likes = GREATEST(likes - 1, 0),
          dislikes = dislikes + 1 
      WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments 
      SET likes = likes + 1,
          dislikes = GREATEST(dislikes - 1, 0)
      WHERE id = NEW.comment_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating comment reaction counts
DROP TRIGGER IF EXISTS on_reaction_change ON comment_reactions;
CREATE TRIGGER on_reaction_change
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reaction_count();