// Centralized logging utility
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  // Helper method to format log messages
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      return { message: formattedMessage, data };
    }
    
    return formattedMessage;
  }

  // Development only logs
  debug(message, data = null) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, data);
      if (data) {
        console.log(formatted.message, formatted.data);
      } else {
        console.log(formatted);
      }
    }
  }

  // Information logs (development and production)
  info(message, data = null) {
    const formatted = this.formatMessage('info', message, data);
    if (data) {
      console.info(formatted.message, formatted.data);
    } else {
      console.info(formatted);
    }
  }

  // Warning logs (development and production)
  warn(message, data = null) {
    const formatted = this.formatMessage('warn', message, data);
    if (data) {
      console.warn(formatted.message, formatted.data);
    } else {
      console.warn(formatted);
    }
  }

  // Error logs (development and production)
  error(message, error = null) {
    const formatted = this.formatMessage('error', message);
    
    if (error) {
      console.error(formatted, error);
      
      // In production, send to error monitoring service
      if (this.isProduction) {
        this.sendToErrorService(message, error);
      }
    } else {
      console.error(formatted);
    }
  }

  // API request/response logging (development only)
  api(method, url, data = null) {
    if (this.isDevelopment) {
      const message = `API ${method.toUpperCase()} ${url}`;
      this.debug(message, data);
    }
  }

  // Performance timing logs
  time(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Component lifecycle logs (development only)
  component(componentName, lifecycle, data = null) {
    if (this.isDevelopment) {
      const message = `${componentName} - ${lifecycle}`;
      this.debug(message, data);
    }
  }

  // Send errors to monitoring service in production
  sendToErrorService(message, error) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just structure the data for future integration
    const errorData = {
      message,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };

    // Example: Send to external service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(errorData) });
    
    // For now, just store in console in production for manual monitoring
    console.error('Error to be sent to monitoring service:', errorData);
  }

  // Batch logging for performance
  batch(logs) {
    if (this.isDevelopment && logs.length > 0) {
      console.group('Batch Logs');
      logs.forEach(({ level, message, data }) => {
        this[level](message, data);
      });
      console.groupEnd();
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Convenience exports for common logging patterns
export const logError = (message, error) => logger.error(message, error);
export const logWarning = (message, data) => logger.warn(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logDebug = (message, data) => logger.debug(message, data);
export const logAPI = (method, url, data) => logger.api(method, url, data);
export const logComponent = (name, lifecycle, data) => logger.component(name, lifecycle, data);