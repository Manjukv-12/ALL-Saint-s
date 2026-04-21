import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Baby,
  BookOpen,
  Church,
  Clock,
  Cross,
  Eye,
  HandHeart,
  Heart,
  Mail,
  MapPin,
  Music,
  Phone,
  Target,
  Users,
  Wine,
  Sunrise,
  HelpCircle,
} from 'lucide-react';

const ICONS: Record<string, FC<LucideProps>> = {
  Baby,
  BookOpen,
  Church,
  Clock,
  Cross,
  Eye,
  HandHeart,
  Heart,
  Mail,
  MapPin,
  Music,
  Phone,
  Target,
  Users,
  Wine,
  Sunrise,
};

type Props = { name: string; size?: number; className?: string };

export function LucideIconByName({ name, size = 24, className }: Props) {
  const Cmp = ICONS[name] ?? HelpCircle;
  return <Cmp size={size} className={className} aria-hidden />;
}
