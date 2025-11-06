'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  href
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="ChamadoPro Logo"
            fill
            sizes="(max-width: 768px) 32px, 48px"
            className="object-contain"
            priority
            onError={() => {
              // Tenta logo.svg se logo.png não existir
              setImageError(true);
            }}
          />
        ) : (
          // Fallback se a imagem não carregar
          <div className="h-full w-full bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">CP</span>
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          ChamadoPro
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

