import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IDGenerationTab } from '@/components/admin/IDGenerationTab';
import { IDManagementTab } from '@/components/admin/IDManagementTab';
import { AccountManagementTab } from '@/components/admin/AccountManagementTab';
import { AuditLogsTab } from '@/components/admin/AuditLogsTab';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Shield, Activity, Key, UserCog } from 'lucide-react';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('id-generation');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    {
      label: 'ID Generation',
      onClick: () => setActiveTab('id-generation'),
    },
    {
      label: 'ID Management',
      onClick: () => setActiveTab('id-management'),
    },
    {
      label: 'Accounts',
      onClick: () => setActiveTab('accounts'),
    },
    {
      label: 'Audit Logs',
      onClick: () => setActiveTab('audit-logs'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Admin Panel"
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        navigationItems={navigationItems}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="id-generation">
            <IDGenerationTab />
          </TabsContent>

          <TabsContent value="id-management">
            <IDManagementTab />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountManagementTab />
          </TabsContent>

          <TabsContent value="audit-logs">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
