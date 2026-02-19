import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Receipt, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/services/api';
import { OrderStats, TrendData, ChartDataPoint } from '@/types';
import OrdersTrendChart from '@/components/dashboard/OrdersTrendChart';
import CityDistributionChart from '@/components/dashboard/CityDistributionChart';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}

function KpiCard({ title, value, trend, icon: Icon, description, loading }: KpiCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {trend >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+{trend}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-destructive">{trend}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<{ activeEmployees: number } | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<{ count: number; amount: number } | null>(null);
  const [ordersTrend, setOrdersTrend] = useState<TrendData[]>([]);
  const [cityDistribution, setCityDistribution] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, employees, invoices, trend, cities] = await Promise.all([
          dashboardApi.getOrderStats(),
          dashboardApi.getEmployeeStats(),
          dashboardApi.getPendingInvoices(),
          dashboardApi.getOrdersTrend(),
          dashboardApi.getCityDistribution(),
        ]);
        
        setOrderStats(stats);
        setEmployeeStats(employees);
        setPendingInvoices(invoices);
        setOrdersTrend(trend);
        setCityDistribution(cities);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Today's Orders"
          value={orderStats?.todayOrders || 0}
          trend={orderStats?.todayOrdersTrend}
          icon={ShoppingCart}
          description="vs yesterday"
          loading={loading}
        />
        <KpiCard
          title="Monthly Orders"
          value={orderStats?.monthlyOrders?.toLocaleString() || '0'}
          trend={orderStats?.monthlyOrdersTrend}
          icon={CalendarDays}
          description="vs last month"
          loading={loading}
        />
        <KpiCard
          title="Active Employees"
          value={employeeStats?.activeEmployees || 0}
          icon={Users}
          loading={loading}
        />
        <KpiCard
          title="Pending Invoices"
          value={pendingInvoices ? formatCurrency(pendingInvoices.amount) : '₹0'}
          icon={Receipt}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Daily orders for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTrendChart data={ordersTrend} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>City Distribution</CardTitle>
            <CardDescription>Orders by city</CardDescription>
          </CardHeader>
          <CardContent>
            <CityDistributionChart data={cityDistribution} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
