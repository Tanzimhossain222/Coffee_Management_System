import { NextResponse } from 'next/server';

import { db } from '@/backend/database/client';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Health check with database connectivity test
export async function GET() {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      api: 'ok',
      database: 'checking...',
    },
    performance: {
      responseTime: 0,
      dbQueryTime: 0,
    },
    environment: {
      node: process.env.NODE_ENV || 'development',
      dbConfigured: !!process.env.DATABASE_URL,
    },
  };

  try {
    // Test database connection with timeout
    const dbStartTime = Date.now();

    // Set a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Database query timeout after 5s')),
        5000
      );
    });

    // Database query promise
    const queryPromise = db.execute(
      sql`SELECT 1 as health_check, NOW() as server_time`
    );

    // Race between query and timeout
    const result = (await Promise.race([queryPromise, timeoutPromise])) as any;

    const dbEndTime = Date.now();
    const dbQueryTime = dbEndTime - dbStartTime;

    health.checks.database = 'connected';
    health.performance.dbQueryTime = dbQueryTime;

    // Warn if connection is slow (Neon wake-up)
    if (dbQueryTime > 1000) {
      health.checks.database = 'slow_connection';
      (
        health as any
      ).warning = `Database query took ${dbQueryTime}ms - possible cold start or network latency`;
    }

    const endTime = Date.now();
    health.performance.responseTime = endTime - startTime;

    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    console.error('Health check failed:', error);
    console.error('Error cause:', error.cause);
    console.error(
      'Full error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );

    health.status = 'unhealthy';
    health.checks.database = 'failed';

    const errorDetails: any = {
      message: error.message,
      code: error.code,
      type: error.constructor.name,
      cause: error.cause
        ? {
            message: error.cause?.message,
            code: error.cause?.code,
            type: error.cause?.constructor?.name,
            errors: error.cause?.errors?.map((e: any) => ({
              message: e.message,
              code: e.code,
              type: e.constructor?.name,
            })),
          }
        : undefined,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    };

    // Specific diagnosis for common issues
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorDetails.diagnosis = 'Database connection timeout - possible causes:';
      errorDetails.possibleCauses = [
        '1. Neon database is waking up from idle state (takes 5-15s)',
        '2. Network connectivity issues',
        '3. Connection pool exhausted',
        '4. Firewall blocking PostgreSQL port',
        '5. Invalid SSL configuration',
      ];
      errorDetails.recommendations = [
        'Increase connection timeout in database config',
        'Add retry logic for initial connections',
        'Check Neon dashboard for database status',
        'Verify network connectivity to Neon',
        'Consider connection pooling with proper timeout settings',
      ];
    } else if (error.code === 'ENOTFOUND') {
      errorDetails.diagnosis = 'Database host not found';
      errorDetails.recommendations = [
        'Check DATABASE_URL in .env',
        'Verify network/DNS configuration',
      ];
    } else if (error.code === 'ECONNREFUSED') {
      errorDetails.diagnosis = 'Connection refused by database';
      errorDetails.recommendations = [
        'Verify database is running',
        'Check firewall settings',
      ];
    }

    const endTime = Date.now();
    health.performance.responseTime = endTime - startTime;

    return NextResponse.json(
      {
        ...health,
        error: errorDetails,
      },
      { status: 503 }
    );
  }
}
