import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

interface GenreBadgeProps {
  id: number;
  name: string;
  mediaType: 'movie' | 'tv';
  className?: string;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({ id, name, mediaType, className }) => {
  return (
    <Link
      to={`/genre/${id}/${mediaType}`}
      className={cn(
        "px-3 py-1.5 bg-white/[0.05] text-gray-300 rounded-full text-sm backdrop-blur-sm",
        "transition-all duration-300 hover:bg-primary-500/20 hover:text-primary-400 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
        className
      )}
    >
      {name}
    </Link>
  );
};