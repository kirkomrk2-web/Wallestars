import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LayoutAlgorithm, { layoutUtils } from '../utils/layoutAlgorithm';

/**
 * ButtonGrid Component
 * Intelligent grid layout for action buttons with responsive behavior
 */
export default function ButtonGrid({
  children,
  layoutType = 'grid',
  gap = 16,
  columns,
  autoResize = true,
  animated = true,
  className = ''
}) {
  const containerRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const [algorithm] = useState(() => new LayoutAlgorithm({ gridGap: gap }));

  const childrenArray = React.Children.toArray(children);
  const itemCount = childrenArray.length;

  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewportWidth = window.innerWidth;

      // Calculate responsive layout
      const responsiveConfig = algorithm.calculateResponsiveLayout(viewportWidth);

      // Calculate grid layout
      const gridLayout = algorithm.calculateGridLayout(itemCount);

      // Use provided columns or calculated columns
      const finalColumns = columns || responsiveConfig.columns;

      setLayout({
        ...gridLayout,
        columns: finalColumns,
        ...responsiveConfig,
        containerWidth
      });
    };

    calculateLayout();

    if (autoResize) {
      window.addEventListener('resize', calculateLayout);
      return () => window.removeEventListener('resize', calculateLayout);
    }
  }, [itemCount, columns, autoResize, algorithm]);

  if (!layout) return null;

  const containerStyles = algorithm.getContainerStyles(layoutType, {
    columns: layout.columns
  });

  const gridClasses = `
    button-grid-container
    ${layoutType === 'grid' ? 'grid' : 'flex flex-wrap'}
    ${layout.isCompact ? 'compact-mode' : ''}
    ${className}
  `;

  return (
    <div
      ref={containerRef}
      className={gridClasses}
      style={{
        display: layoutType === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: layoutType === 'grid' ? `repeat(${layout.columns}, 1fr)` : undefined,
        gap: `${gap}px`,
        width: '100%'
      }}
    >
      {childrenArray.map((child, index) => {
        const position = algorithm.generateButtonPositions(itemCount)[index];

        if (animated) {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: position.animationDelay / 1000,
                duration: 0.3,
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="button-grid-item"
            >
              {child}
            </motion.div>
          );
        }

        return (
          <div key={index} className="button-grid-item">
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ButtonGridItem Component
 * Individual button item with consistent styling
 */
export function ButtonGridItem({
  icon: Icon,
  title,
  description,
  color = 'from-blue-500 via-blue-600 to-cyan-600',
  onClick,
  badge,
  disabled = false,
  className = ''
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        button-grid-action
        relative overflow-hidden
        w-full h-full min-h-[120px]
        p-4 sm:p-6
        rounded-xl
        glass-effect-hover
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 hover:opacity-10 transition-opacity duration-300`} />

      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary-500 text-white text-xs font-bold"
        >
          {badge}
        </motion.div>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full gap-3">
        {/* Icon */}
        {Icon && (
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg border border-white/10`}
          >
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </motion.div>
        )}

        {/* Text */}
        <div className="text-center">
          <h3 className="font-semibold text-sm sm:text-base text-white mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-dark-400 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * ButtonList Component
 * Vertical list layout for buttons
 */
export function ButtonList({
  children,
  gap = 12,
  animated = true,
  className = ''
}) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={`button-list-container flex flex-col ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {childrenArray.map((child, index) => {
        if (animated) {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {child}
            </motion.div>
          );
        }

        return <div key={index}>{child}</div>;
      })}
    </div>
  );
}

/**
 * ButtonListItem Component
 * Horizontal layout button for lists
 */
export function ButtonListItem({
  icon: Icon,
  title,
  description,
  color = 'from-blue-500 via-blue-600 to-cyan-600',
  onClick,
  rightIcon: RightIcon,
  badge,
  disabled = false,
  className = ''
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        button-list-item
        relative overflow-hidden
        w-full p-4
        rounded-xl
        glass-effect-hover
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Background effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 hover:opacity-10 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative flex items-center gap-4">
        {/* Icon */}
        {Icon && (
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10`}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        )}

        {/* Text */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-white truncate">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-dark-400 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* Right icon */}
        {RightIcon && (
          <RightIcon className="w-5 h-5 text-dark-400 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
