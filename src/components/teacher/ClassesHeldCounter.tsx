import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduledClass } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ClassesHeldCounterProps {
  scheduledClasses: ScheduledClass[];
  loading?: boolean;
}

export const ClassesHeldCounter = ({ scheduledClasses, loading = false }: ClassesHeldCounterProps) => {
  const stats = useMemo(() => {
    const completed = scheduledClasses.filter(c => c.status === 'completed').length;
    const scheduled = scheduledClasses.filter(c => c.status === 'scheduled').length;
    const ongoing = scheduledClasses.filter(c => c.status === 'ongoing').length;
    const total = scheduledClasses.length;

    const last7Days = scheduledClasses
      .filter(c => {
        const classDate = new Date(c.startTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return classDate >= weekAgo;
      })
      .filter(c => c.status === 'completed').length;

    return { completed, scheduled, ongoing, total, last7Days };
  }, [scheduledClasses]);

  const chartData = [
    { name: 'Completed', value: stats.completed, fill: '#10b981' },
    { name: 'Scheduled', value: stats.scheduled, fill: '#3b82f6' },
    { name: 'Ongoing', value: stats.ongoing, fill: '#f59e0b' },
  ];

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Classes Held</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Classes Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.ongoing}</p>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </div>
        </div>

        {stats.total > 0 && (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.last7Days}</span> classes held in the last 7 days
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
