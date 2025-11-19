import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { Meeting } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { MeetingService } from '@/lib/meetingService';
import { LiveKitService } from '@/lib/liveKitService';
import { toast } from 'sonner';
import MeetingRoom from './MeetingRoom';

interface MeetingsListProps {
  userRole: 'teacher' | 'student' | 'coordinator';
  refreshTrigger?: number;
}

const MeetingsList = ({ userRole }: MeetingsListProps) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [joiningMeeting, setJoiningMeeting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        if (userRole === 'coordinator' || userRole === 'admin') {
          unsubscribe = MeetingService.subscribeMeetingsForCoordinator(
            (fetchedMeetings) => {
              setMeetings(fetchedMeetings);
              setLoading(false);
            },
            (error) => {
              console.error('Error in coordinator meetings listener:', error);
              setLoading(false);
            }
          );
        } else if (userRole === 'teacher') {
          unsubscribe = MeetingService.subscribeMeetingsForTeacher(
            user.id,
            (fetchedMeetings) => {
              setMeetings(fetchedMeetings);
              setLoading(false);
            },
            (error) => {
              console.error('Error in teacher meetings listener:', error);
              setLoading(false);
            }
          );
        } else if (userRole === 'student') {
          unsubscribe = await MeetingService.subscribeMeetingsForStudent(
            user.id,
            (fetchedMeetings) => {
              setMeetings(fetchedMeetings);
              setLoading(false);
            },
            (error) => {
              console.error('Error in student meetings listener:', error);
              setLoading(false);
            }
          );
        }
      } catch (error) {
        console.error('Error setting up meeting listener:', error);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, userRole]);

  const handleJoinMeeting = async (meeting: Meeting) => {
    if (!user) return;

    if (!meeting.roomName) {
      toast.error('Meeting room is not properly configured. Please contact your administrator.');
      return;
    }

    setJoiningMeeting(meeting.id);
    try {
      const userRole_ = userRole === 'teacher' ? 'host' : userRole === 'coordinator' ? 'viewer' : 'participant';

      console.log(`Joining meeting: ${meeting.roomName} as ${userRole_}`);
      const tokenData = await LiveKitService.getAccessToken(user.name || user.id, meeting.roomName, userRole_);

      if (!tokenData?.token || !tokenData?.url) {
        throw new Error('Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.');
      }

      console.log(`Successfully obtained LiveKit token for room ${meeting.roomName}`);
      setActiveMeeting(meeting.roomName);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join meeting. Please try again.';

      let userFriendlyMessage = 'Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.';

      if (errorMessage.includes('Authentication')) {
        userFriendlyMessage = 'Authentication failed. Please log in again.';
      } else if (errorMessage.includes('credentials not configured')) {
        userFriendlyMessage = 'Could not connect to LiveKit. Please check your internet connection or LiveKit credentials.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage = 'Connection timeout. Check your internet and try again.';
      } else if (errorMessage.includes('Could not connect to LiveKit')) {
        userFriendlyMessage = errorMessage;
      }

      toast.error(userFriendlyMessage);
    } finally {
      setJoiningMeeting(null);
    }
  };

  const handleLeaveMeeting = () => {
    setActiveMeeting(null);
  };

  if (activeMeeting) {
    return (
      <MeetingRoom
        roomName={activeMeeting}
        onLeave={handleLeaveMeeting}
        role={userRole === 'teacher' ? 'host' : userRole === 'coordinator' ? 'observer' : 'participant'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No meetings scheduled</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        meetings.map((meeting) => {
          const scheduledDate = new Date(meeting.scheduledTime);
          const isPast = scheduledDate < new Date();
          const isUpcoming = !isPast;

          return (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      {meeting.title}
                    </CardTitle>
                    {meeting.teacherName && (
                      <CardDescription>Host: {meeting.teacherName}</CardDescription>
                    )}
                  </div>
                  {isUpcoming && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleJoinMeeting(meeting)}
                        disabled={joiningMeeting === meeting.id}
                      >
                        {joiningMeeting === meeting.id ? 'Connecting...' : (userRole === 'teacher' ? 'Enter Meeting' : 'Join Meeting')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {scheduledDate.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                  </div>
                  {isPast && (
                    <span className="px-2 py-1 bg-muted rounded text-xs">Completed</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default MeetingsList;
