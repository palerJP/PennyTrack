'use client';

import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export function CategoryIcon({ name, className = 'w-5 h-5', size, color }: CategoryIconProps) {
  // Safe lookup of Lucide icon
  const IconComponent = (Icons as any)[name] || Icons.Tag;
  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
}
