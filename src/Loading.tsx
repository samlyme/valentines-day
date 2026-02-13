import { motion } from 'framer-motion';
import './index.css';

interface LoadingProps {
  progress: number;
}

export function Loading({ progress }: LoadingProps) {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="loading-background" />
      
      {/* Floating hearts in background */}
      <div className="loading-hearts">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`loading-heart-${i}`}
            className="loading-heart"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${12 + Math.random() * 16}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-100px',
              opacity: [0, 0.3, 0.3, 0],
              x: [0, (Math.random() - 0.5) * 60, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
          >
            {i % 4 === 0 ? '❤️' : i % 4 === 1 ? '💕' : i % 4 === 2 ? '💖' : '💗'}
          </motion.div>
        ))}
      </div>

      {/* Main loading animation */}
      <motion.div
        className="loading-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Pulsing heart */}
        <motion.div
          className="loading-heart-icon"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          💝
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="loading-text"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Loading memories...
        </motion.p>

        {/* Progress bar */}
        <div className="loading-progress-container">
          <motion.div
            className="loading-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Percentage */}
        <motion.span
          className="loading-percentage"
          key={progress}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </motion.div>

      {/* Corner decorations */}
      <div className="loading-decorations">
        <motion.div
          className="loading-corner top-left"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          ✨
        </motion.div>
        <motion.div
          className="loading-corner top-right"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          🌸
        </motion.div>
        <motion.div
          className="loading-corner bottom-left"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          🌺
        </motion.div>
        <motion.div
          className="loading-corner bottom-right"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          ✨
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Loading;
