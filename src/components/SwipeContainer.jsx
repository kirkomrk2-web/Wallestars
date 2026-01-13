import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SwipeContainer Component
 * Provides swipeable container with touch/mouse support and pagination
 */
export default function SwipeContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  showControls = true,
  enablePagination = true,
  autoPlay = false,
  autoPlayInterval = 5000
}) {
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const controls = useAnimation();

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  // Convert children to array
  const pages = React.Children.toArray(children);
  const totalPages = pages.length;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !enablePagination) return;

    const interval = setInterval(() => {
      goToNextPage();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, currentPage, enablePagination]);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      onSwipeLeft?.();
    } else if (enablePagination) {
      setCurrentPage(0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      onSwipeRight?.();
    } else if (enablePagination) {
      setCurrentPage(totalPages - 1);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);

    const swipeThreshold = 50;
    const velocityThreshold = 500;

    const { offset, velocity } = info;

    // Horizontal swipe
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
        // Swipe left
        setSwipeDirection('left');
        goToNextPage();
      } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
        // Swipe right
        setSwipeDirection('right');
        goToPrevPage();
      }
    }
    // Vertical swipe
    else {
      if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
        // Swipe up
        setSwipeDirection('up');
        onSwipeUp?.();
      } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
        // Swipe down
        setSwipeDirection('down');
        onSwipeDown?.();
      }
    }

    // Reset position
    controls.start({ x: 0, y: 0 });

    // Clear direction after animation
    setTimeout(() => setSwipeDirection(null), 300);
  };

  return (
    <div className={`swipe-container-wrapper relative ${className}`} ref={containerRef}>
      {/* Main swipeable content */}
      <motion.div
        drag={enablePagination ? 'x' : true}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, opacity }}
        className={`swipe-content ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {enablePagination ? (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: swipeDirection === 'right' ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection === 'right' ? 100 : -100 }}
            transition={{ duration: 0.3 }}
          >
            {pages[currentPage]}
          </motion.div>
        ) : (
          <div>{children}</div>
        )}
      </motion.div>

      {/* Navigation controls */}
      {showControls && enablePagination && totalPages > 1 && (
        <>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0 && !enablePagination}
            className="swipe-control swipe-control-left"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 && !enablePagination}
            className="swipe-control swipe-control-right"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {enablePagination && totalPages > 1 && (
        <div className="swipe-pagination">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`swipe-dot ${index === currentPage ? 'active' : ''}`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe indicator */}
      {swipeDirection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="swipe-indicator"
        >
          {swipeDirection === 'left' && '←'}
          {swipeDirection === 'right' && '→'}
          {swipeDirection === 'up' && '↑'}
          {swipeDirection === 'down' && '↓'}
        </motion.div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        .swipe-container-wrapper {
          position: relative;
          overflow: hidden;
          touch-action: pan-y pinch-zoom;
        }

        .swipe-content {
          width: 100%;
          height: 100%;
          user-select: none;
        }

        .swipe-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }

        .swipe-control:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .swipe-control:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .swipe-control-left {
          left: 16px;
        }

        .swipe-control-right {
          right: 16px;
        }

        .swipe-pagination {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .swipe-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .swipe-dot:hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.2);
        }

        .swipe-dot.active {
          background: white;
          width: 24px;
          border-radius: 4px;
        }

        .swipe-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          color: white;
          z-index: 20;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
