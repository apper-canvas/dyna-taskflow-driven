import { motion } from 'framer-motion';

const ProgressRing = ({ 
  progress = 0, 
  size = 80, 
  strokeWidth = 8, 
  className = '',
  showText = true,
  color = '#4F46E5'
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        height={size}
        width={size}
        className="progress-ring"
      >
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="progress-ring-circle"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {showText && (
          <text
            x="50%"
            y="50%"
            dy=".3em"
            textAnchor="middle"
            className="text-sm font-semibold fill-current"
          >
            {Math.round(progress)}%
          </text>
        )}
      </svg>
    </div>
  );
};

export default ProgressRing;