# Monitoring & Observability

This document outlines the comprehensive monitoring and observability setup for the Auto-Detailing Platform.

## Overview

The platform uses Sentry for comprehensive monitoring, including:
- Error tracking and alerting
- Performance monitoring
- Session replay
- Custom business metrics
- Real-time health checks

## Features

### 1. Error Tracking
- **Real-time Error Capture**: All exceptions are automatically captured with context
- **Smart Error Filtering**: Noise reduction while preserving critical errors
- **Session Replay**: Visual reproduction of user sessions leading to errors
- **Error Grouping**: Intelligent error grouping and deduplication

### 2. Performance Monitoring
- **Web Vitals**: Core Web Vitals tracking (LCP, FID, CLS)
- **API Performance**: Response time and status code monitoring
- **Database Queries**: Query performance and optimization insights
- **Component Rendering**: React component performance tracking

### 3. Business Intelligence
- **Booking Metrics**: Creation, conversion rates, and revenue tracking
- **Client Analytics**: Registration and engagement metrics
- **Payment Monitoring**: Transaction success rates and revenue
- **Feature Usage**: Track which features are used most

### 4. System Health
- **Health Checks**: Automated health monitoring for all services
- **Integration Status**: Real-time status of third-party integrations
- **Uptime Monitoring**: System availability and reliability tracking
- **Alert System**: Proactive alerting for critical issues

## Configuration

### Environment Variables
\`\`\`bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
VERCEL_GIT_COMMIT_SHA=auto_populated_by_vercel
NEXT_RUNTIME=nodejs
\`\`\`

### Sentry Configuration
- **Client**: Browser error tracking and session replay
- **Server**: API route and server error monitoring
- **Edge**: Middleware and edge function monitoring

## Usage

### Tracking Business Events
\`\`\`typescript
import { useMonitoring } from '@/hooks/useMonitoring'

const { trackBooking, trackPayment } = useMonitoring()

// Track booking creation
trackBooking('premium-wash', 150)

// Track payment processing
trackPayment(150, 'success')
\`\`\`

### Error Handling
\`\`\`typescript
import { monitoring } from '@/lib/monitoring/monitoring-service'

try {
  // Your code here
} catch (error) {
  monitoring.trackError(error, {
    component: 'BookingForm',
    operation: 'createBooking',
    severity: 'high'
  })
}
\`\`\`

### Performance Tracking
\`\`\`typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

const { measureOperation } = usePerformanceMonitoring('BookingForm')

const result = await measureOperation('createBooking', async () => {
  return await createBooking(data)
})
\`\`\`

## Dashboards

### 1. System Health Dashboard
- Real-time system status
- Integration health monitoring
- Performance metrics overview
- Error rate tracking

### 2. Business Analytics Dashboard
- Revenue and booking metrics
- User engagement analytics
- Feature usage statistics
- Conversion rate tracking

### 3. Performance Dashboard
- Web Vitals monitoring
- API performance metrics
- Database query analysis
- Component render times

## Alerts

### Critical Alerts
- Error rate > 5%
- API response time > 2000ms
- System downtime
- Payment failures

### Warning Alerts
- Error rate > 2%
- API response time > 1000ms
- Integration degradation
- High resource usage

## Testing

Run the monitoring test suite:
\`\`\`bash
# Navigate to /monitoring/test in your application
# Click "Run Tests" to validate all monitoring functionality
\`\`\`

## Best Practices

### 1. Error Handling
- Always provide context when capturing errors
- Use appropriate severity levels
- Include tenant and user information
- Sanitize sensitive data

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Track business-critical operations
- Set performance budgets
- Monitor third-party integrations

### 3. Business Metrics
- Track key business indicators
- Monitor conversion rates
- Analyze user behavior
- Measure feature adoption

### 4. Alerting
- Set up appropriate alert thresholds
- Use different channels for different severities
- Include actionable information in alerts
- Regularly review and update alert rules

## Troubleshooting

### Common Issues
1. **High Error Rate**: Check recent deployments and integration status
2. **Poor Performance**: Analyze slow queries and API calls
3. **Integration Failures**: Verify API keys and connection status
4. **Missing Metrics**: Ensure monitoring initialization is complete

### Debug Mode
Enable debug mode in development:
\`\`\`typescript
// In sentry configuration
debug: process.env.NODE_ENV === 'development'
\`\`\`

## Support

For monitoring-related issues:
1. Check the monitoring dashboard
2. Review Sentry error reports
3. Run the monitoring test suite
4. Contact the development team with error IDs
