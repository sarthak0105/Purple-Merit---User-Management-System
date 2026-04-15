import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'green' | 'cyan' | 'pink' | 'orange';
}

const accentColors = {
  green: {
    border: 'border-primary/30',
    bg: 'bg-primary/5',
    icon: 'text-primary',
    glow: 'neon-glow-green',
  },
  cyan: {
    border: 'border-secondary/30',
    bg: 'bg-secondary/5',
    icon: 'text-secondary',
    glow: 'neon-glow-cyan',
  },
  pink: {
    border: 'border-accent/30',
    bg: 'bg-accent/5',
    icon: 'text-accent',
    glow: 'neon-glow-pink',
  },
  orange: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    icon: 'text-yellow-500',
    glow: 'shadow-lg shadow-yellow-500/20',
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'green',
}: StatsCardProps) {
  const colors = accentColors[accentColor];

  return (
    <Card
      className={`card-gradient border ${colors.border} ${colors.glow} transition-all hover:scale-105`}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                trend.isPositive ? 'text-primary' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </Card>
  );
}
