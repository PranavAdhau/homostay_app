import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import api from '../../lib/adminAxios';
interface Stats {
  total_homestays: number;
  active_homestays: number;
  total_bookings: number;
  pending_bookings: number;
  approved_bookings: number;
  confirmed_bookings: number;
  rejected_bookings: number;
  completed_bookings: number;
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data?.success && response.data?.data) {
        setStats(response.data.data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="text-sm text-muted-foreground py-10 text-center">
        Failed to load dashboard stats
      </div>
    );
  }
  const statCards = [
    { title: 'Total Homestays', value: stats.total_homestays, icon: Building2, variant: 'primary' as const },
    { title: 'Active Homestays', value: stats.active_homestays, icon: Building2, variant: 'success' as const },
    { title: 'Total Bookings', value: stats.total_bookings, icon: Calendar, variant: 'accent' as const },
    { title: 'Pending Bookings', value: stats.pending_bookings, icon: Clock, variant: 'warning' as const },
    { title: 'Approved Bookings', value: stats.approved_bookings, icon: CheckCircle, variant: 'success' as const },
    { title: 'Completed Bookings', value: stats.completed_bookings, icon: CheckCircle, variant: 'primary' as const },
  ];
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10',
    success: 'bg-success/10 text-success border-success/20 bg-gradient-to-br from-success/5 to-success/10',
    accent: 'bg-accent/20 text-accent-foreground border-accent/30 bg-gradient-to-br from-accent/5 to-accent/20',
    warning: 'bg-warning/10 text-warning border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10',
  };
  return (
    <div className="w-full space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-1.5">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">Your homestay business at a glance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 border-border h-full hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl border ${variantStyles[stat.variant]} shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
