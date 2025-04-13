import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, ThumbsUp, ThumbsDown, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes: number;
  dislikes: number;
  user: {
    username: string;
    avatar_url: string;
  };
  user_reaction?: 'like' | 'dislike';
}

interface CommentsProps {
  mediaType: 'movie' | 'tv';
  mediaId: string;
}

export const Comments: React.FC<CommentsProps> = ({ mediaType, mediaId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('media_type', mediaType)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user reactions if logged in
      if (user && data) {
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('comment_id, reaction_type')
          .eq('user_id', user.id)
          .in('comment_id', data.map(comment => comment.id));

        const reactionsMap = reactions?.reduce((acc, reaction) => {
          acc[reaction.comment_id] = reaction.reaction_type;
          return acc;
        }, {} as Record<string, 'like' | 'dislike'>);

        setComments(data.map(comment => ({
          ...comment,
          user_reaction: reactionsMap?.[comment.id]
        })));
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to new comments
    const commentsSubscription = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `media_type=eq.${mediaType} AND media_id=eq.${mediaId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [mediaType, mediaId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          media_type: mediaType,
          media_id: mediaId,
          user_id: user.id
        });

      if (error) throw error;

      setNewComment('');
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Please sign in to react to comments');
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      const currentReaction = comment?.user_reaction;

      // Remove existing reaction if clicking the same button
      if (currentReaction === reactionType) {
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              [reactionType + 's']: c[reactionType + 's'] - 1,
              user_reaction: undefined
            };
          }
          return c;
        }));
      } else {
        // Add new reaction or change existing one
        await supabase
          .from('comment_reactions')
          .upsert({
            user_id: user.id,
            comment_id: commentId,
            reaction_type: reactionType
          });

        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              [reactionType + 's']: c[reactionType + 's'] + 1,
              [(currentReaction || '') + 's']: currentReaction ? c[currentReaction + 's'] - 1 : c[currentReaction + 's'],
              user_reaction: reactionType
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-bold text-white">Comments</h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Write a comment..." : "Sign in to comment"}
            disabled={!user || isSubmitting}
            className={cn(
              "w-full min-h-[100px] px-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl",
              "text-white placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          {!user && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <AlertCircle className="w-5 h-5" />
                <span>Please sign in to comment</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!user || isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 border-2 border-t-primary-500 rounded-full animate-spin" />
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-500/10">
                    {comment.user.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt={comment.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-primary-500 font-medium">
                          {comment.user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {comment.user.username || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-300 leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleReaction(comment.id, 'like')}
                  disabled={!user}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full transition-colors",
                    comment.user_reaction === 'like'
                      ? "bg-green-500/20 text-green-400"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </button>
                <button
                  onClick={() => handleReaction(comment.id, 'dislike')}
                  disabled={!user}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full transition-colors",
                    comment.user_reaction === 'dislike'
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{comment.dislikes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};