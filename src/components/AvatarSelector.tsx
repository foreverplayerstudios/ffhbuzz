import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface AvatarSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  showModal?: boolean;
}

// Default avatar for new users
export const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Midnight&backgroundColor=2a2a2a&radius=50&mouth=cute&eyes=plain';

const AVATAR_OPTIONS = [
  // Dark skin tone avatars
  { seed: 'Midnight', backgroundColor: '2a2a2a', eyes: 'plain', mouth: 'cute' },
  { seed: 'Shadow', backgroundColor: '1f1f1f', eyes: 'wink', mouth: 'smileTeeth' },
  { seed: 'Eclipse', backgroundColor: '242424', eyes: 'glasses', mouth: 'wideSmile' },
  { seed: 'Onyx', backgroundColor: '2d2d2d', eyes: 'shades', mouth: 'smileLol' },
  { seed: 'Raven', backgroundColor: '1a1a1a', eyes: 'stars', mouth: 'tongueOut' },
  { seed: 'Obsidian', backgroundColor: '202020', eyes: 'cute', mouth: 'kissHeart' },
  { seed: 'Ebony', backgroundColor: '262626', eyes: 'love', mouth: 'lilSmile' },
  { seed: 'Jet', backgroundColor: '232323', eyes: 'wink2', mouth: 'drip' },
  // Medium skin tone avatars
  { seed: 'Dusk', backgroundColor: '3d3d3d', eyes: 'closed', mouth: 'shy' },
  { seed: 'Storm', backgroundColor: '333333', eyes: 'sleepClose', mouth: 'plain' },
  { seed: 'Thunder', backgroundColor: '383838', eyes: 'pissed', mouth: 'pissed' },
  { seed: 'Cloud', backgroundColor: '2f2f2f', eyes: 'crying', mouth: 'sad' },
  // Light skin tone avatars
  { seed: 'Pearl', backgroundColor: '4a4a4a', eyes: 'glasses', mouth: 'wideSmile' },
  { seed: 'Silver', backgroundColor: '404040', eyes: 'stars', mouth: 'smileTeeth' },
  { seed: 'Platinum', backgroundColor: '454545', eyes: 'love', mouth: 'kissHeart' },
  { seed: 'Crystal', backgroundColor: '3a3a3a', eyes: 'cute', mouth: 'lilSmile' },
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ value, onChange, onClose, showModal = false }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(value);

  const getAvatarUrl = (seed: string, backgroundColor: string, eyes: string, mouth: string) => {
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${seed}&backgroundColor=${backgroundColor}&radius=50&eyes=${eyes}&mouth=${mouth}`;
  };

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onChange(avatarUrl);
  };

  if (!showModal) {
    return (
      <button
        onClick={onClose}
        className="group relative w-24 h-24 rounded-full overflow-hidden transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
      >
        <img
          src={value || DEFAULT_AVATAR}
          alt="Current Avatar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">Change</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative bg-[#1a1a1a] rounded-2xl w-full max-w-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Choose your avatar</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/[0.05]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {AVATAR_OPTIONS.map(({ seed, backgroundColor, eyes, mouth }) => {
            const avatarUrl = getAvatarUrl(seed, backgroundColor, eyes, mouth);
            const isSelected = selectedAvatar === avatarUrl;

            return (
              <button
                key={seed}
                onClick={() => handleSelect(avatarUrl)}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden transition-all duration-300",
                  "hover:scale-110 hover:shadow-xl hover:shadow-primary-500/20 hover:z-10",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                  isSelected && "ring-2 ring-primary-500 scale-110 z-10"
                )}
              >
                <img
                  src={avatarUrl}
                  alt={`Avatar ${seed}`}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};