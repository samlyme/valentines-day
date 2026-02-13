import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import './index.css';
import { Loading } from './Loading';

// Import images
import img1 from './images/1.jpeg';
import img2 from './images/2.jpeg';
import img3 from './images/3.png';
import img5 from './images/5.png';
import img6 from './images/6.png';
import img7 from './images/7.png';
import img8 from './images/01K9KDFV28KDTKVWYPW2VXW586-low-res-branded-.png';

interface MediaItem {
  id: number;
  src: string;
  type: 'image' | 'video';
  title: string;
  animationStyle: 'fade' | 'slide' | 'flip' | 'scale' | 'blur' | 'rotate' | 'elastic' | 'bounce';
}

const mediaItems: MediaItem[] = [
  { id: 1, src: img1, type: 'image', title: 'where it began...', animationStyle: 'fade' },
  { id: 2, src: img2, type: 'image', title: 'spookie', animationStyle: 'flip' },
  { id: 3, src: img3, type: 'image', title: 'even spookier (calc)', animationStyle: 'scale' },
  { id: 4, src: '/images/4.mov', type: 'video', title: 'i realized i should take more photos', animationStyle: 'blur' },
  { id: 5, src: img5, type: 'image', title: 'whose that cutie', animationStyle: 'rotate' },
  { id: 6, src: img6, type: 'image', title: 'brug', animationStyle: 'elastic' },
  { id: 7, src: img7, type: 'image', title: 'cutie', animationStyle: 'bounce' },
  { id: 8, src: img8, type: 'image', title: 'will you be my valentine?', animationStyle: 'slide' },
];

// Unique animation configurations for each slide
// Note: cubic-bezier X values (1st and 3rd) must be in [0, 1] range for WAAPI
const animationConfigs = {
  fade: {
    enter: { scale: 0.95 },
    center: { scale: 1 },
    exit: { scale: 1.05 },
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  },
  slide: {
    enter: { x: '100vw' },
    center: { x: 0 },
    exit: { x: '-100vw' },
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
  },
  flip: {
    enter: { rotateY: 90, scale: 0.8 },
    center: { rotateY: 0, scale: 1 },
    exit: { rotateY: -90, scale: 0.8 },
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
  },
  scale: {
    enter: { scale: 0 },
    center: { scale: 1 },
    exit: { scale: 0 },
    transition: { duration: 0.9, ease: [0.68, 0.55, 0.265, 1.55] }
  },
  blur: {
    enter: { filter: 'blur(30px)', scale: 1.1 },
    center: { filter: 'blur(0px)', scale: 1 },
    exit: { filter: 'blur(20px)', scale: 0.95 },
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
  },
  rotate: {
    enter: { rotate: -180, scale: 0.5 },
    center: { rotate: 0, scale: 1 },
    exit: { rotate: 180, scale: 0.5 },
    transition: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }
  },
  elastic: {
    enter: { y: '100vh', scale: 0.3 },
    center: { y: 0, scale: 1 },
    exit: { y: '-100vh', scale: 0.3 },
    transition: { duration: 1.4, ease: [0.68, 0.6, 0.32, 1.6] }
  },
  bounce: {
    enter: { y: '-100%' },
    center: { y: 0 },
    exit: { y: '100%' },
    transition: { 
      duration: 1,
      ease: [0.175, 0.885, 0.32, 1.275],
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Unique media entrance animations
const mediaEntranceAnimations = [
  { scale: [0.5, 1.1, 1], transition: { duration: 1.2, times: [0, 0.6, 1] } },
  { x: ['-100%', '10%', '0%'], transition: { duration: 1, times: [0, 0.7, 1] } },
  { rotate: [10, -5, 0], scale: [0.8, 1.05, 1], transition: { duration: 1.1 } },
  { y: ['100%', '-5%', '0%'], scale: [1.2, 0.95, 1], transition: { duration: 1.3 } },
  { filter: ['blur(40px)', 'blur(0px)'], scale: [1.3, 1], transition: { duration: 1 } },
  { rotateX: [45, 0], scale: [0.7, 1], transition: { duration: 1.2 } },
  { x: ['100%', '0%'], rotate: [15, 0], transition: { duration: 0.9 } },
  { scale: [0, 1.2, 1], y: ['50%', '0%'], transition: { duration: 1.1, type: "spring" } },
];

// Unique floating patterns for particles
const particlePatterns = [
  { y: [0, -100, 0], x: [0, 50, 0], rotate: [0, 360] },
  { y: [0, -150, 0], x: [0, -30, 0], scale: [1, 1.5, 1] },
  { y: [0, -80, 0], x: [0, 80, -40, 0], opacity: [0.3, 1, 0.3] },
  { y: [0, -200, 0], rotate: [0, 180, 360], scale: [0.5, 1, 0.5] },
  { y: [0, -120, 0], x: [0, 20, -60, 0], rotate: [0, -90, 0] },
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Preload all media
  useEffect(() => {
    const preloadMedia = async () => {
      const totalItems = mediaItems.length;
      let loadedCount = 0;

      const loadPromises = mediaItems.map((item) => {
        return new Promise<void>((resolve) => {
          if (item.type === 'video') {
            // For videos, we just need to check if the file is accessible
            // Video loading is handled by the browser when played
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            const handleLoad = () => {
              loadedCount++;
              setLoadingProgress((loadedCount / totalItems) * 100);
              resolve();
            };

            video.addEventListener('loadedmetadata', handleLoad);
            video.addEventListener('error', () => {
              // Even on error, count as loaded to not block
              loadedCount++;
              setLoadingProgress((loadedCount / totalItems) * 100);
              resolve();
            });
            
            video.src = item.src;
            // Timeout fallback
            setTimeout(() => {
              if (loadedCount < totalItems) {
                loadedCount++;
                setLoadingProgress((loadedCount / totalItems) * 100);
                resolve();
              }
            }, 2000);
          } else {
            // For images, preload them
            const img = new Image();
            
            const handleLoad = () => {
              loadedCount++;
              setLoadingProgress((loadedCount / totalItems) * 100);
              resolve();
            };

            img.addEventListener('load', handleLoad);
            img.addEventListener('error', () => {
              // Even on error, count as loaded to not block
              loadedCount++;
              setLoadingProgress((loadedCount / totalItems) * 100);
              resolve();
            });
            
            img.src = item.src;
            // Timeout fallback
            setTimeout(() => {
              if (loadedCount < totalItems) {
                loadedCount++;
                setLoadingProgress((loadedCount / totalItems) * 100);
                resolve();
              }
            }, 2000);
          }
        });
      });

      await Promise.all(loadPromises);
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    preloadMedia();
  }, []);

  // Motion values for smooth animations
  const scrollProgress = useMotionValue(0);
  const smoothScrollProgress = useSpring(scrollProgress, { stiffness: 100, damping: 30 });
  
  // Unique transforms for each slide
  const backgroundRotate = useTransform(smoothScrollProgress, [0, 1], [0, 360]);
  const backgroundScale = useTransform(smoothScrollProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const contentRotate = useTransform(smoothScrollProgress, [0, 1], [0, 15]);

  // Memoized random values for unique particles per render - Valentine's colors
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      pattern: particlePatterns[i % particlePatterns.length],
      delay: Math.random() * 3,
      duration: 8 + Math.random() * 10,
      size: 3 + Math.random() * 5,
      color: `hsla(${320 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%, ${0.3 + Math.random() * 0.4})`,
    }));
  }, []);

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        navigate(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(mediaItems.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTransitioning]);

  // Wheel events
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollDelay = 1200;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollDelay || isTransitioning) {
        e.preventDefault();
        return;
      }

      if (Math.abs(e.deltaY) > 30) {
        e.preventDefault();
        lastScrollTime = now;
        
        if (e.deltaY > 0) {
          setScrollDirection('down');
          navigate(1);
        } else {
          setScrollDirection('up');
          navigate(-1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, isTransitioning]);

  // Touch support
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          setScrollDirection('down');
          navigate(1);
        } else {
          setScrollDirection('up');
          navigate(-1);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, isTransitioning]);

  // Video control
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const navigate = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < mediaItems.length) {
      goToSlide(newIndex);
    }
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    scrollProgress.set(index / (mediaItems.length - 1));
    
    setTimeout(() => setIsTransitioning(false), 1400);
  };

  const currentItem = mediaItems[currentIndex];
  const currentConfig = animationConfigs[currentItem.animationStyle];
  const currentMediaAnimation = mediaEntranceAnimations[currentIndex % mediaEntranceAnimations.length];

  // Unique slide variants based on current item
  // Include transition in each variant to avoid AnimatePresence issues
  const slideVariants = {
    enter: (direction: 'up' | 'down') => ({
      ...currentConfig.enter,
      y: direction === 'down' && currentItem.animationStyle === 'elastic' ? '100vh' : 
         direction === 'up' && currentItem.animationStyle === 'elastic' ? '-100vh' : 
         currentConfig.enter.y,
      transition: currentConfig.transition,
    }),
    center: {
      ...currentConfig.center,
      transition: currentConfig.transition,
    },
    exit: (direction: 'up' | 'down') => ({
      ...currentConfig.exit,
      y: direction === 'down' && currentItem.animationStyle === 'elastic' ? '-100vh' : 
         direction === 'up' && currentItem.animationStyle === 'elastic' ? '100vh' : 
         currentConfig.exit.y,
      transition: currentConfig.transition,
    }),
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Loading key="loading" progress={loadingProgress} />}
      </AnimatePresence>
      
      <motion.div 
        className="app" 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
      {/* Rotating gradient background - Valentine's theme */}
      <motion.div 
        className="background-gradient"
        style={{ 
          rotate: backgroundRotate,
          scale: backgroundScale,
        }}
        animate={{
          background: [
            'conic-gradient(from 0deg at 30% 50%, rgba(255,105,180,0.4) 0deg, rgba(220,20,60,0.3) 120deg, rgba(255,20,147,0.2) 240deg, transparent 360deg)',
            'conic-gradient(from 90deg at 70% 50%, rgba(255,105,180,0.4) 0deg, rgba(220,20,60,0.3) 120deg, rgba(255,20,147,0.2) 240deg, transparent 360deg)',
            'conic-gradient(from 180deg at 50% 30%, rgba(255,105,180,0.4) 0deg, rgba(220,20,60,0.3) 120deg, rgba(255,20,147,0.2) 240deg, transparent 360deg)',
            'conic-gradient(from 270deg at 50% 70%, rgba(255,105,180,0.4) 0deg, rgba(220,20,60,0.3) 120deg, rgba(255,20,147,0.2) 240deg, transparent 360deg)',
            'conic-gradient(from 360deg at 30% 50%, rgba(255,105,180,0.4) 0deg, rgba(220,20,60,0.3) 120deg, rgba(255,20,147,0.2) 240deg, transparent 360deg)',
          ],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* Unique floating particles */}
      <div className="particles">
        {particles.map((p, i) => (
          <motion.div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0%' : '30%',
            }}
            animate={{
              ...p.pattern,
              transition: {
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: i % 2 === 0 ? 'easeInOut' : 'linear',
              },
            }}
          />
        ))}
      </div>

      {/* Floating hearts */}
      <div className="floating-hearts">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="floating-heart"
            style={{
              left: `${5 + (i * 6) + Math.random() * 4}%`,
              fontSize: `${16 + Math.random() * 20}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-100px',
              opacity: [0, 0.6, 0.6, 0],
              x: [0, (Math.random() - 0.5) * 100, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear',
            }}
          >
            {i % 4 === 0 ? '❤️' : i % 4 === 1 ? '💕' : i % 4 === 2 ? '💖' : '💗'}
          </motion.div>
        ))}
      </div>

      {/* Valentine's header */}
      <motion.div
        className="valentine-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          textAlign: 'center',
        }}
      >
        <motion.h1
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #fff 0%, #ff69b4 50%, #ff1744 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 10px rgba(255, 105, 180, 0.5))',
          }}
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
        </motion.h1>
      </motion.div>

      {/* Main gallery */}
      <div className="gallery-container">
        <AnimatePresence mode="wait" custom={scrollDirection}>
          <motion.div
            key={currentIndex}
            custom={scrollDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="slide active"
            style={{ zIndex: 10 }}
          >
            <motion.div 
              className="slide-content"
              style={{ rotateX: contentRotate }}
            >
              <motion.div
                key={`media-${currentIndex}`}
                className="media-wrapper"
                initial={currentMediaAnimation}
                animate={{ 
                  scale: 1, 
                  x: 0, 
                  y: 0, 
                  rotate: 0,
                  rotateX: 0,
                  filter: 'blur(0px)',
                }}
                transition={currentMediaAnimation.transition}
                style={{
                  '--bg-image': `url(${currentItem.src})`,
                } as React.CSSProperties}
              >
                {currentItem.type === 'video' ? (
                  <>
                    <video 
                      ref={(el) => { videoRefs.current[currentIndex] = el; }}
                      src={currentItem.src}
                      className="slide-media"
                      muted
                      loop
                      playsInline
                      controls
                    />
                    <div className="video-fallback" style={{display: 'none'}}>
                      <p>Video format not supported</p>
                      <a href={currentItem.src} download>Download video</a>
                    </div>
                  </>
                ) : (
                  <motion.img 
                    src={currentItem.src} 
                    alt={currentItem.title}
                    className="slide-media"
                    whileHover={{ 
                      scale: 1.05,
                      rotateZ: currentIndex % 2 === 0 ? 2 : -2,
                      transition: { duration: 0.4 }
                    }}
                  />
                )}
              </motion.div>
              
              {/* Unique overlays per slide */}
              <motion.div 
                className="slide-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{
                  background: currentIndex % 2 === 0 
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
                    : 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.1) 100%)'
                }}
              />
              
              <motion.div 
                className="slide-vignette"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />
              
              {/* Unique shine effect */}
              <motion.div 
                className="slide-shine"
                initial={{ x: '-200%', opacity: 0 }}
                animate={{ 
                  x: ['-200%', '200%'],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 4 + currentIndex,
                  ease: 'easeInOut',
                }}
                style={{
                  background: currentIndex % 3 === 0 
                    ? 'linear-gradient(90deg, transparent, rgba(255,105,180,0.2), transparent)'
                    : currentIndex % 3 === 1
                    ? 'linear-gradient(45deg, transparent, rgba(255,23,68,0.2), transparent)'
                    : 'linear-gradient(-45deg, transparent, rgba(255,182,193,0.2), transparent)',
                }}
              />
              
              {/* Unique floating elements per slide */}
              <div className="slide-particles">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="slide-particle"
                    style={{
                      left: `${10 + i * 15}%`,
                      bottom: `${10 + (i % 3) * 30}%`,
                      width: i % 2 === 0 ? 6 : 4,
                      height: i % 2 === 0 ? 6 : 4,
                      background: i % 3 === 0 ? '#ff69b4' : i % 3 === 1 ? '#ff1744' : '#ffb6c1',
                      borderRadius: '50%',
                    }}
                    animate={{
                      y: [0, -40 - i * 10, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 5), 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>

              {/* Unique title animation per slide */}
              <motion.div
                className="slide-title"
                initial={{ 
                  y: currentIndex % 4 === 0 ? 80 : currentIndex % 4 === 1 ? -80 : 0,
                  x: currentIndex % 4 === 2 ? '-80%' : currentIndex % 4 === 3 ? '80%' : '-50%',
                  opacity: 0,
                  rotateZ: currentIndex % 2 === 0 ? -5 : 5,
                }}
                animate={{ 
                  y: 0, 
                  x: '-50%', 
                  opacity: 1,
                  rotateZ: 0,
                }}
                transition={{ 
                  delay: 0.6, 
                  duration: 0.9, 
                  ease: currentIndex % 2 === 0 ? [0.34, 1.56, 0.64, 1] : [0.68, -0.55, 0.265, 1.55]
                }}
              >
                <h2>{currentItem.title}</h2>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots with unique animations */}
      <motion.div 
        className="nav-dots"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        {mediaItems.map((item, index) => (
          <motion.button
            key={index}
            className="nav-dot"
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ 
              scale: 1.4,
              rotate: index % 2 === 0 ? 10 : -10,
            }}
            whileTap={{ scale: 0.8 }}
            animate={{
              scale: index === currentIndex ? [1.2, 1.3, 1.2] : 1,
              backgroundColor: index === currentIndex ? '#ff69b4' : 'rgba(255,255,255,0.2)',
              borderColor: index === currentIndex ? '#ff1493' : 'rgba(255,255,255,0.3)',
              boxShadow: index === currentIndex 
                ? ['0 0 10px rgba(255,105,180,0.5)', '0 0 25px rgba(255,105,180,0.8)', '0 0 10px rgba(255,105,180,0.5)']
                : '0 0 0px rgba(255,105,180,0)',
            }}
            transition={{
              scale: { duration: 1.5, repeat: index === currentIndex ? Infinity : 0 },
              boxShadow: { duration: 2, repeat: index === currentIndex ? Infinity : 0 },
            }}
            style={{
              borderRadius: index % 3 === 0 ? '50%' : index % 3 === 1 ? '30%' : '10%',
            }}
          />
        ))}
      </motion.div>

      {/* Progress bar with wave animation */}
      <motion.div 
        className="progress-bar"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentIndex + 1) / mediaItems.length) * 100}%`,
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.32, 0.72, 0, 1]
          }}
          style={{
            background: `linear-gradient(90deg, 
              ${currentIndex % 2 === 0 ? '#ff69b4' : '#ff1744'} 0%, 
              ${currentIndex % 2 === 0 ? '#ff1744' : '#ffb6c1'} 50%, 
              ${currentIndex % 2 === 0 ? '#ffb6c1' : '#ff69b4'} 100%)`,
          }}
        />
      </motion.div>

      {/* Slide counter with flip animation */}
      <motion.div 
        className="slide-counter"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.span 
          className="counter-current"
          key={currentIndex}
          initial={{ 
            rotateX: -90, 
            opacity: 0,
            y: scrollDirection === 'down' ? -30 : 30,
          }}
          animate={{ 
            rotateX: 0, 
            opacity: 1,
            y: 0,
          }}
          exit={{ 
            rotateX: 90, 
            opacity: 0,
            y: scrollDirection === 'down' ? 30 : -30,
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {String(currentIndex + 1).padStart(2, '0')}
        </motion.span>
        <motion.span 
          className="counter-separator"
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >/</motion.span>
        <motion.span 
          className="counter-total"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {String(mediaItems.length).padStart(2, '0')}
        </motion.span>
      </motion.div>

      {/* Navigation arrows with unique hover effects */}
      <motion.button 
        className="nav-arrow nav-arrow-up"
        onClick={() => navigate(-1)}
        disabled={currentIndex === 0}
        aria-label="Previous slide"
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: currentIndex === 0 ? 0.2 : 1, 
          x: 0,
          y: currentIndex === 0 ? 0 : [0, -5, 0],
        }}
        whileHover={{ 
          scale: currentIndex === 0 ? 1 : 1.2, 
          rotate: currentIndex === 0 ? 0 : -15,
          backgroundColor: 'rgba(255,105,180,0.3)',
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          y: { duration: 2, repeat: Infinity },
          default: { duration: 0.3 }
        }}
      >
        ↑
      </motion.button>
      <motion.button 
        className="nav-arrow nav-arrow-down"
        onClick={() => navigate(1)}
        disabled={currentIndex === mediaItems.length - 1}
        aria-label="Next slide"
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: currentIndex === mediaItems.length - 1 ? 0.2 : 1, 
          x: 0,
          y: currentIndex === mediaItems.length - 1 ? 0 : [0, 5, 0],
        }}
        whileHover={{ 
          scale: currentIndex === mediaItems.length - 1 ? 1 : 1.2, 
          rotate: currentIndex === mediaItems.length - 1 ? 0 : 15,
          backgroundColor: 'rgba(255,23,68,0.3)',
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          y: { duration: 2, repeat: Infinity },
          default: { duration: 0.3 }
        }}
      >
        ↓
      </motion.button>
    </motion.div>
    </>
  );
}

export { App };
export default App;
