import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuditLogs } from '@/lib/accessCodeService';
import { AuditLog } from '@/types';
import { Download, Activity } from 'lucide-react';
import { toast } from 'sonner';

export const AuditLogsTab = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await getAuditLogs(100);
      setLogs(auditLogs);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'Details'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.adminName,
      log.action,
      log.targetType,
      log.targetId,
      log.details
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Logs exported successfully');
  };

  const getActionBadgeColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'generate_code':
        return 'bg-blue-100 text-blue-700';
      case 'delete_account':
        return 'bg-red-100 text-red-700';
      case 'reset_account':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspend_account':
        return 'bg-orange-100 text-orange-700';
      case 'unsuspend_account':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-medium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Audit Logs</h3>
          </div>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}
                      >
                        {formatAction(log.action)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {log.adminName}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{log.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Target: {log.targetType}</span>
                      <span className="font-mono">{log.targetId.substring(0, 12)}...</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
