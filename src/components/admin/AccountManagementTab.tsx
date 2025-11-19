import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllUserAccounts,
  suspendUserAccount,
  unsuspendUserAccount,
  deleteUserAccount,
  resetUserAccount,
  getUserAccountWithDetails
} from '@/lib/accountManagementService';
import { UserAccount } from '@/types';
import { Search, Trash2, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AccountManagementTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const allAccounts = await getAllUserAccounts();
      allAccounts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAccounts(allAccounts);
    } catch (error) {
      toast.error('Failed to load accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
      return;
    }

    const filtered = accounts.filter(account =>
      account.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accessCode.includes(searchTerm) ||
      account.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAccounts(filtered);
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount || !user) return;

    try {
      await deleteUserAccount(selectedAccount.userId, user.id, user.name);
      toast.success('Account deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
      await loadAccounts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete account');
      console.error('Delete account error:', error);
    }
  };

  const handleResetAccount = async () => {
    if (!selectedAccount || !user) return;

    try {
      await resetUserAccount(selectedAccount.userId, user.id, user.name);
      toast.success('Account reset successfully');
      setResetDialogOpen(false);
      setSelectedAccount(null);
      await loadAccounts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset account');
      console.error('Reset account error:', error);
    }
  };

  const handleSuspendAccount = async () => {
    if (!selectedAccount || !user || !suspensionReason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }

    try {
      await suspendUserAccount(selectedAccount.userId, user.id, user.name, suspensionReason);
      toast.success('Account suspended successfully');
      setSuspendDialogOpen(false);
      setSelectedAccount(null);
      setSuspensionReason('');
      loadAccounts();
    } catch (error) {
      toast.error('Failed to suspend account');
      console.error(error);
    }
  };

  const handleUnsuspendAccount = async (account: UserAccount) => {
    if (!user) return;

    try {
      await unsuspendUserAccount(account.userId, user.id, user.name);
      toast.success('Account unsuspended successfully');
      loadAccounts();
    } catch (error) {
      toast.error('Failed to unsuspend account');
      console.error(error);
    }
  };

  const openAccountDetails = async (account: UserAccount) => {
    try {
      const details = await getUserAccountWithDetails(account.userId);
      setAccountDetails(details);
      setSelectedAccount(account);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load account details');
      console.error('Load account details error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-medium">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by user ID, access code, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold">{accounts.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Active</p>
            <p className="text-2xl font-bold text-green-700">
              {accounts.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">Suspended</p>
            <p className="text-2xl font-bold text-red-700">
              {accounts.filter(a => a.status === 'suspended').length}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">Deleted</p>
            <p className="text-2xl font-bold text-gray-700">
              {accounts.filter(a => a.status === 'deleted').length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">User ID</th>
                <th className="text-left py-3 px-4">Access Code</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Created At</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No accounts found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-mono">{account.userId.substring(0, 12)}...</td>
                    <td className="py-3 px-4 font-semibold">{account.accessCode}</td>
                    <td className="py-3 px-4 capitalize">{account.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          account.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : account.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(account.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAccountDetails(account)}
                          title="View Details"
                        >
                          View
                        </Button>
                        {account.status === 'active' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setSuspendDialogOpen(true);
                              }}
                              title="Suspend Account"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setResetDialogOpen(true);
                              }}
                              title="Reset Account"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setDeleteDialogOpen(true);
                              }}
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {account.status === 'suspended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnsuspendAccount(account)}
                            title="Unsuspend Account"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account and all associated data including enrollments,
              attendance records, classes, and courses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all user data including enrollments, attendance, classes, and courses,
              but the account will remain active. The user can continue using the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAccount}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending this account. The user will not be able to access the
              system while suspended.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspension-reason">Reason for Suspension</Label>
              <Textarea
                id="suspension-reason"
                placeholder="Enter reason..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSuspendAccount} className="bg-destructive">
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {accountDetails && (
        <Dialog open={!!accountDetails} onOpenChange={() => {
          setAccountDetails(null);
          setSelectedAccount(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {accountDetails.user && (
                <div>
                  <p className="text-sm font-semibold">User Information</p>
                  <p className="text-sm text-muted-foreground">Name: {accountDetails.user.name}</p>
                  <p className="text-sm text-muted-foreground">Email: {accountDetails.user.email}</p>
                  <p className="text-sm text-muted-foreground">User ID: {accountDetails.user.id}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">Account Information</p>
                <p className="text-sm text-muted-foreground">Role: {accountDetails.account?.role || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Status: {accountDetails.account?.status || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Access Code: {accountDetails.account?.accessCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Statistics</p>
                <p className="text-sm text-muted-foreground">Enrollments: {accountDetails.enrollmentCount}</p>
                <p className="text-sm text-muted-foreground">Courses Created: {accountDetails.courseCount}</p>
              </div>
              {accountDetails.account?.status === 'suspended' && accountDetails.account.suspendedAt && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-semibold text-red-700">Suspension Details</p>
                  <p className="text-sm text-red-600">Reason: {accountDetails.account.suspensionReason}</p>
                  <p className="text-sm text-red-600">
                    Suspended At: {new Date(accountDetails.account.suspendedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setAccountDetails(null);
                setSelectedAccount(null);
              }}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
