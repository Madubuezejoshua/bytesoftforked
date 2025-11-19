import { useEffect, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { useAuth } from '@/contexts/AuthContext';
import { LiveKitService } from '@/lib/liveKitService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Monitor, MonitorOff } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface MeetingRoomProps {
  roomName: string;
  onLeave: () => void;
  role?: 'host' | 'participant' | 'observer';
}

const MeetingRoom = ({ roomName, onLeave, role = 'participant' }: MeetingRoomProps) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let connectionTimeout: NodeJS.Timeout;

    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        connectionTimeout = setTimeout(() => {
          if (isMounted) {
            setError('Connection timeout. Please check your internet connection and try again.');
            setIsConnecting(false);
          }
        }, 15000);

        let tokenData;
        try {
          tokenData = await LiveKitService.getAccessToken(
            user.name || user.id,
            roomName,
            role === 'observer' ? 'viewer' : role === 'host' ? 'host' : 'participant'
          );

          if (!tokenData?.token || !tokenData?.url) {
            throw new Error('Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.');
          }
        } catch (tokenError) {
          if (isMounted) {
            const errorMessage = tokenError instanceof Error ? tokenError.message : 'Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.';
            console.error('Failed to retrieve LiveKit token:', errorMessage);
            setError(errorMessage);
            setIsConnecting(false);
          }
          return;
        }

        if (!isMounted) return;

        const newRoom = new Room();

        newRoom.on(RoomEvent.ParticipantConnected, () => {
          if (isMounted) updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, () => {
          if (isMounted) updateParticipants(newRoom);
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, _, participant) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            const element = track.attach();
            const container = document.getElementById(`participant-${participant.identity}`);
            if (container) {
              container.appendChild(element);
            }
          }
        });

        newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
          if (isMounted && state === 'connected') {
            setIsConnecting(false);
          }
        });

        await newRoom.connect(tokenData.url, tokenData.token);

        if (!isMounted) {
          newRoom.disconnect();
          return;
        }

        setRoom(newRoom);
        updateParticipants(newRoom);

        const videoEnabled = role !== 'observer';
        const audioEnabled = role !== 'observer';

        await newRoom.localParticipant.setCameraEnabled(videoEnabled && isVideoEnabled);
        await newRoom.localParticipant.setMicrophoneEnabled(audioEnabled && isAudioEnabled);

        if (role === 'observer') {
          setIsVideoEnabled(false);
          setIsAudioEnabled(false);
        }

        if (isMounted) {
          setIsConnecting(false);
        }
      } catch (err) {
        if (!isMounted) return;

        console.error('Error connecting to room:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        let userMessage = 'Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.';

        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          userMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (errorMessage.includes('Authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
          userMessage = 'Authentication failed. Please log in again.';
        } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          userMessage = 'Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.';
        } else if (errorMessage.includes('Could not connect to LiveKit')) {
          userMessage = errorMessage;
        }

        setError(userMessage);
        setIsConnecting(false);
      } finally {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
      }
    };

    connectToRoom();

    return () => {
      isMounted = false;
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (room) {
        room.disconnect();
      }
    };
  }, [user, roomName, role]);

  const updateParticipants = (currentRoom: Room) => {
    const participantList = Array.from(currentRoom.remoteParticipants.values()).map(
      (p) => p.identity
    );
    participantList.unshift(currentRoom.localParticipant.identity);
    setParticipants(participantList);
  };

  const toggleVideo = async () => {
    if (!room || role === 'observer') return;
    const newState = !isVideoEnabled;
    await room.localParticipant.setCameraEnabled(newState);
    setIsVideoEnabled(newState);
  };

  const toggleAudio = async () => {
    if (!room || role === 'observer') return;
    const newState = !isAudioEnabled;
    await room.localParticipant.setMicrophoneEnabled(newState);
    setIsAudioEnabled(newState);
  };

  const toggleScreenShare = async () => {
    if (!room || role !== 'host') return;
    const newState = !isScreenSharing;
    await room.localParticipant.setScreenShareEnabled(newState);
    setIsScreenSharing(newState);
  };

  const handleLeave = () => {
    if (room) {
      room.disconnect();
    }
    onLeave();
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button onClick={onLeave} variant="outline">Go Back</Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isConnecting && !room) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Connecting to meeting...</p>
          <p className="text-xs text-muted-foreground">Setting up video connection</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-xl font-bold">{roomName}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {participants.map((participant) => (
            <Card key={participant} className="p-4">
              <div
                id={`participant-${participant}`}
                className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                  {participant}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              {role !== 'observer' && (
                <>
                  <Button
                    variant={isVideoEnabled ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleVideo}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant={isAudioEnabled ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleAudio}
                    title={isAudioEnabled ? 'Mute' : 'Unmute'}
                  >
                    {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                </>
              )}

              {role === 'host' && (
                <Button
                  variant={isScreenSharing ? 'default' : 'outline'}
                  size="icon"
                  onClick={toggleScreenShare}
                  title="Share Screen"
                >
                  {isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
                </Button>
              )}

              <Button
                variant="destructive"
                size="icon"
                onClick={handleLeave}
                title={role === 'observer' ? 'Leave meeting' : 'End meeting'}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
