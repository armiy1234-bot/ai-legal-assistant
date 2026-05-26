import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.SYNC_WEBHOOK_SECRET}`;
    
    if (authHeader !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scriptPath = path.join(process.cwd(), 'user-data', 'auto-sync.ps1');
    const { stdout, stderr } = await execAsync(
      `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { timeout: 30000, cwd: process.cwd() }
    );

    if (stderr) {
      console.error('Sync stderr:', stderr);
    }

    return NextResponse.json({
      success: true,
      output: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'lexai-sync-webhook',
    timestamp: new Date().toISOString()
  });
}
