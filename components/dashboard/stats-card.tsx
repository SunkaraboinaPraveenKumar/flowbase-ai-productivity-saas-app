
interface StatsCardProps {
  icon: React.ReactElement;
  title: string;
  value: number;
  trend?: string;
  colorClass?: string;
}

export default function StatsCard({ icon, title, value, trend, colorClass = "text-accent-primary" }: StatsCardProps) {
  return (
    <div className="card p-5 flex items-center justify-between hover:border-border-accent hover:-translate-y-0.5 transition-all duration-200">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text-primary">
            {value}
          </span>
          {trend && (
            <span className="text-xs text-accent-green font-medium">
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 bg-bg-secondary border border-border rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
}
