import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllAccessCodes } from '@/lib/accessCodeService';
import { AccessCode } from '@/types';
import { Search, Filter, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const IDManagementTab = () => {
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<AccessCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teacher' | 'coordinator'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unused' | 'used'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  useEffect(() => {
    filterCodes();
  }, [codes, searchTerm, filterType, filterStatus]);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const allCodes = await getAllAccessCodes();
      allCodes.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      setCodes(allCodes);
    } catch (error) {
      toast.error('Failed to load access codes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCodes = () => {
    let filtered = [...codes];

    if (searchTerm) {
      filtered = filtered.filter(code =>
        code.code.includes(searchTerm) ||
        (code.usedBy && code.usedBy.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(code => code.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(code => code.status === filterStatus);
    }

    setFilteredCodes(filtered);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading codes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-medium">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by code or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="teacher">Teacher</option>
              <option value="coordinator">Coordinator</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="unused">Unused</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Codes</p>
            <p className="text-2xl font-bold">{codes.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Unused Codes</p>
            <p className="text-2xl font-bold text-green-700">
              {codes.filter(c => c.status === 'unused').length}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Used Codes</p>
            <p className="text-2xl font-bold text-blue-700">
              {codes.filter(c => c.status === 'used').length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Generated At</th>
                <th className="text-left py-3 px-4">Used By</th>
                <th className="text-left py-3 px-4">Used At</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No codes found
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono font-semibold">{code.code}</td>
                    <td className="py-3 px-4 capitalize">{code.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          code.status === 'unused'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {code.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(code.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {code.usedBy || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {code.usedAt ? new Date(code.usedAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedCode === code.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
