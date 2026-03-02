interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

export function TrustScore({ score, size = 'sm' }: TrustScoreProps) {
  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (score * circumference);

  let color = 'text-danger';
  if (percentage >= 60) color = 'text-success';
  else if (percentage >= 30) color = 'text-warning';

  const dimension = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`relative ${dimension} flex items-center justify-center`} title={`Trust score: ${percentage}%`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className={`${textSize} font-semibold ${color}`}>{percentage}</span>
    </div>
  );
}
