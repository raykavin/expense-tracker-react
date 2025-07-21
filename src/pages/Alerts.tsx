import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Target, Clock, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Alerts() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { alerts, markAlertAsRead, clearAlerts } = useAppStore();

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'read') return alert.isRead;
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'goal_reminder':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'bill_due':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'recurring_transaction':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return 'destructive';
      case 'goal_reminder':
        return 'default';
      case 'bill_due':
        return 'secondary';
      case 'recurring_transaction':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('alerts_and_notifications')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-3">
                {unreadCount} {t('new')}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {t('stay_updated_with_your_financial_activities')}
          </p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" onClick={clearAlerts}>
            <X className="mr-2 h-4 w-4" />
            {t('clear_all')}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_alerts')}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('unread')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budget_alerts')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.type === 'budget_exceeded').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('goal_reminders')}</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.type === 'goal_reminder').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">{t('all_alerts')} ({alerts.length})</TabsTrigger>
          <TabsTrigger value="unread">{t('unread')} ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">{t('read')} ({alerts.length - unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant={getAlertColor(alert.type) as "default" | "destructive" | "outline" | "secondary"}>
                            {alert.type.replace('_', ' ')}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {t('new')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(alert.createdAt)} at {new Date(alert.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        {t('mark_as_read')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'all' ? t('no_alerts_yet') : t(`no_${filter}_alerts`)}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? t('alerts_will_appear_here')
                    : t(`no_${filter}_alerts_to_display`)
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
