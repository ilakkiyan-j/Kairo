import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomName = searchParams.get('room') || 'kairo-field-room';
    const participantName = searchParams.get('username') || `tech-${Math.floor(Math.random() * 1000)}`;

    const apiKey = process.env.LIVEKIT_API_KEY || 'APIU3xtxRhU9tiY';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'tIQWK8ZXZuB5T0HSqYca4uUH5FLkt8kDfMahEMyXV0Z';
    const wsUrl = process.env.LIVEKIT_URL || 'wss://kairo-y07agfac.livekit.cloud';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'LiveKit API Key or Secret not configured' },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '1h',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      wsUrl,
      roomName,
      identity: participantName,
    });
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate token' },
      { status: 500 }
    );
  }
}
