import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { createAccessCode, createBulkAccessCodes } from '@/lib/accessCodeService';
import { AccessCode } from '@/types';
import { Copy, Download, Key } from 'lucide-react';
import { toast } from 'sonner';

export const IDGenerationTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<AccessCode[]>([]);
  const [bulkCount, setBulkCount] = useState<string>('10');

  const handleGenerateSingleCode = async (type: 'teacher' | 'coordinator') => {
    if (!user) return;

    setLoading(true);
    try {
      const code = await createAccessCode(type, user.id, user.name);
      setGeneratedCodes(prev => [code, ...prev]);
      toast.success(`${type === 'teacher' ? 'Teacher' : 'Coordinator'} code generated successfully`);
    } catch (error) {
      toast.error('Failed to generate code');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulkCodes = async (type: 'teacher' | 'coordinator') => {
    if (!user) return;

    const count = parseInt(bulkCount);
    if (isNaN(count) || count < 1 || count > 100) {
      toast.error('Please enter a valid count between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      const codes = await createBulkAccessCodes(type, count, user.id, user.name);
      setGeneratedCodes(prev => [...codes, ...prev]);
      toast.success(`Generated ${count} ${type} codes successfully`);
    } catch (error) {
      toast.error('Failed to generate bulk codes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportToCSV = () => {
    if (generatedCodes.length === 0) {
      toast.error('No codes to export');
      return;
    }

    const headers = ['Code', 'Type', 'Status', 'Generated At'];
    const rows = generatedCodes.map(code => [
      code.code,
      code.type,
      code.status,
      new Date(code.generatedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Codes exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Teacher Codes (6-digit)</h3>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleGenerateSingleCode('teacher')}
              disabled={loading}
              className="w-full"
            >
              Generate Single Code
            </Button>

            <div className="space-y-2">
              <Label htmlFor="teacher-bulk">Bulk Generate</Label>
              <div className="flex gap-2">
                <Input
                  id="teacher-bulk"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="Enter count"
                />
                <Button
                  onClick={() => handleGenerateBulkCodes('teacher')}
                  disabled={loading}
                  variant="outline"
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Coordinator Codes (8-digit)</h3>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleGenerateSingleCode('coordinator')}
              disabled={loading}
              className="w-full"
            >
              Generate Single Code
            </Button>

            <div className="space-y-2">
              <Label htmlFor="coordinator-bulk">Bulk Generate</Label>
              <div className="flex gap-2">
                <Input
                  id="coordinator-bulk"
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="Enter count"
                />
                <Button
                  onClick={() => handleGenerateBulkCodes('coordinator')}
                  disabled={loading}
                  variant="outline"
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {generatedCodes.length > 0 && (
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated Codes</h3>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Generated At</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generatedCodes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono font-semibold">{code.code}</td>
                    <td className="py-3 px-4 capitalize">{code.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          code.status === 'unused'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {code.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(code.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
