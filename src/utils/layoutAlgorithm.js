/**
 * Layout Algorithm System
 * Dynamic container and button layout management with intelligent positioning
 */

export class LayoutAlgorithm {
  constructor(config = {}) {
    this.config = {
      gridColumns: config.gridColumns || 3,
      gridGap: config.gridGap || 16,
      containerPadding: config.containerPadding || 24,
      buttonSize: config.buttonSize || 'medium',
      animationDuration: config.animationDuration || 300,
      ...config
    };
  }

  /**
   * Calculate optimal grid layout based on item count
   */
  calculateGridLayout(itemCount) {
    const { gridColumns, gridGap } = this.config;

    // Intelligent column calculation
    let columns = gridColumns;
    if (itemCount <= 2) columns = 2;
    else if (itemCount <= 4) columns = 2;
    else if (itemCount <= 6) columns = 3;
    else if (itemCount <= 9) columns = 3;
    else columns = 4;

    const rows = Math.ceil(itemCount / columns);

    return {
      columns,
      rows,
      gridGap,
      totalItems: itemCount,
      layout: 'grid'
    };
  }

  /**
   * Calculate flex layout with dynamic wrapping
   */
  calculateFlexLayout(items, containerWidth) {
    const { buttonSize, gridGap } = this.config;

    const buttonSizes = {
      small: 100,
      medium: 150,
      large: 200
    };

    const itemWidth = buttonSizes[buttonSize] || 150;
    const itemsPerRow = Math.floor((containerWidth + gridGap) / (itemWidth + gridGap));

    return {
      itemsPerRow: Math.max(1, itemsPerRow),
      itemWidth,
      layout: 'flex',
      wrap: true
    };
  }

  /**
   * Generate container styles based on layout type
   */
  getContainerStyles(layoutType = 'grid', options = {}) {
    const baseStyles = {
      display: layoutType === 'grid' ? 'grid' : 'flex',
      gap: `${this.config.gridGap}px`,
      padding: `${this.config.containerPadding}px`,
      width: '100%',
      position: 'relative'
    };

    if (layoutType === 'grid') {
      return {
        ...baseStyles,
        gridTemplateColumns: `repeat(${options.columns || this.config.gridColumns}, 1fr)`,
        gridAutoRows: 'minmax(100px, auto)'
      };
    }

    return {
      ...baseStyles,
      flexWrap: 'wrap',
      justifyContent: options.justify || 'flex-start',
      alignItems: options.align || 'stretch'
    };
  }

  /**
   * Calculate swipe boundaries and thresholds
   */
  calculateSwipeBoundaries(containerElement) {
    if (!containerElement) return null;

    const rect = containerElement.getBoundingClientRect();
    const swipeThreshold = rect.width * 0.25; // 25% of container width

    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      swipeThreshold,
      swipeMinVelocity: 0.5 // pixels per millisecond
    };
  }

  /**
   * Analyze swipe gesture and determine action
   */
  analyzeSwipe(startPos, endPos, duration) {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Determine direction
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    let direction = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      distance,
      velocity,
      angle,
      deltaX,
      deltaY,
      isSwipe: distance > 50 && velocity > 0.3
    };
  }

  /**
   * Generate button layout positions with animation delays
   */
  generateButtonPositions(itemCount) {
    const layout = this.calculateGridLayout(itemCount);
    const positions = [];

    for (let i = 0; i < itemCount; i++) {
      const row = Math.floor(i / layout.columns);
      const col = i % layout.columns;

      positions.push({
        index: i,
        row,
        col,
        animationDelay: i * 50, // Stagger animation
        x: col * (100 / layout.columns),
        y: row * 100
      });
    }

    return positions;
  }

  /**
   * Smart container resizing algorithm
   */
  calculateResponsiveLayout(viewportWidth) {
    let columns, buttonSize;

    if (viewportWidth < 640) {
      // Mobile
      columns = 1;
      buttonSize = 'large';
    } else if (viewportWidth < 768) {
      // Tablet portrait
      columns = 2;
      buttonSize = 'medium';
    } else if (viewportWidth < 1024) {
      // Tablet landscape
      columns = 3;
      buttonSize = 'medium';
    } else {
      // Desktop
      columns = 4;
      buttonSize = 'medium';
    }

    return {
      columns,
      buttonSize,
      isCompact: viewportWidth < 768
    };
  }
}

/**
 * Utility functions for layout calculations
 */
export const layoutUtils = {
  /**
   * Convert layout config to CSS classes
   */
  getLayoutClasses(layout) {
    const classes = ['layout-container'];

    if (layout.layout === 'grid') {
      classes.push('layout-grid');
      classes.push(`grid-cols-${layout.columns}`);
    } else {
      classes.push('layout-flex');
    }

    return classes.join(' ');
  },

  /**
   * Calculate item dimensions
   */
  getItemDimensions(size) {
    const dimensions = {
      small: { width: 100, height: 100 },
      medium: { width: 150, height: 150 },
      large: { width: 200, height: 200 }
    };

    return dimensions[size] || dimensions.medium;
  },

  /**
   * Generate transition styles
   */
  getTransitionStyles(duration = 300) {
    return {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform, opacity'
    };
  }
};

export default LayoutAlgorithm;
