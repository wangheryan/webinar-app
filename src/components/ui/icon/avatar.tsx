// components/Avatar.tsx
import React from 'react';

interface AvatarProps {
  size?: number; // Mengatur ukuran lebar & tinggi (opsional)
  className?: string; // Untuk styling tambahan via Tailwind
}

export default function Avatar({ size = 100, className = "" }: AvatarProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Lingkaran Background */}
      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
      
      {/* Kepala Avatar */}
      <circle cx="50" cy="40" r="20" fill="#475569" />
      
      {/* Bahu/Badan Avatar */}
      <path
        d="M20 85C20 71.1929 31.1929 60 45 60H55C68.8071 60 80 71.1929 80 85V100H20V85Z"
        fill="#475569"
      />
    </svg>
  );
}