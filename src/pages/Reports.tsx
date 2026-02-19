import { useState, useEffect } from 'react';
import { Download, BarChart3, Users, MapPin, Utensils, MessageSquareWarning, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { reportsApi } from '@/services/api';
import { OrdersReport, ConsumptionReport, CityUsageReport, MealTrendsReport } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['hsl(24,95%,53%)', 'hsl(38,92%,50%)', 'hsl(142,71%,45%)', 'hsl(199,89%,48%)', 'hsl(280,65%,60%)'];

interface Complaint {
  id: string;
  employeeId: string;
  employeeName: string;
  city: string;
  type: 'food_quality' | 'delivery' | 'system_issue' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const mockComplaints: Complaint[] = [
  { id: 'c1', employeeId: 'emp1', employeeName: 'Rahul Sharma', city: 'Mumbai', type: 'food_quality', subject: 'Cold food delivery', description: 'The lunch was delivered cold today. Needs better packaging.', status: 'open', priority: 'high', createdAt: '2026-02-12T09:30:00Z' },
  { id: 'c2', employeeId: 'emp2', employeeName: 'Priya Patel', city: 'Delhi', type: 'system_issue', subject: 'Cannot place order from app', description: 'Getting error when trying to place order via mobile app since morning.', status: 'in_progress', priority: 'high', createdAt: '2026-02-11T14:00:00Z' },
  { id: 'c3', employeeId: 'emp3', employeeName: 'Amit Kumar', city: 'Bangalore', type: 'delivery', subject: 'Late delivery', description: 'Lunch was delivered 45 minutes late.', status: 'resolved', priority: 'medium', createdAt: '2026-02-10T12:00:00Z' },
  { id: 'c4', employeeId: 'emp5', employeeName: 'Vikram Singh', city: 'Chennai', type: 'food_quality', subject: 'Wrong item received', description: 'Ordered Veg Thali but received Non-Veg.', status: 'open', priority: 'high', createdAt: '2026-02-11T13:00:00Z' },
  { id: 'c5', employeeId: 'emp4', employeeName: 'Sneha Reddy', city: 'Hyderabad', type: 'other', subject: 'Menu variety', description: 'Request to add more South Indian options for breakfast.', status: 'open', priority: 'low', createdAt: '2026-02-09T10:00:00Z' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function Reports() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [period, setPeriod] = useState('monthly');
  const [ordersReport, setOrdersReport] = useState<OrdersReport | null>(null);
  const [consumptionReport, setConsumptionReport] = useState<ConsumptionReport | null>(null);
  const [cityReport, setCityReport] = useState<CityUsageReport | null>(null);
  const [trendsReport, setTrendsReport] = useState<MealTrendsReport | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const filters = { type: 'orders' as const, period: period as any, dateFrom: '', dateTo: '' };
      try {
        const [orders, consumption, city, trends] = await Promise.all([
          reportsApi.getOrdersReport(filters),
          reportsApi.getConsumptionReport(filters),
          reportsApi.getCityUsageReport(filters),
          reportsApi.getMealTrendsReport(filters),
        ]);
        setOrdersReport(orders);
        setConsumptionReport(consumption);
        setCityReport(city);
        setTrendsReport(trends);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  const handleExport = (format: 'csv' | 'xlsx') => {
    toast({ title: 'Export Started', description: `Report exported as ${format.toUpperCase()}.` });
  };

  const updateComplaintStatus = (id: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast({ title: 'Status Updated', description: `Complaint marked as ${status.replace('_', ' ')}` });
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = { open: 'bg-destructive/10 text-destructive', in_progress: 'bg-warning/10 text-warning', resolved: 'bg-success/10 text-success' };
    return <Badge className={`${variants[status] || ''} border-0`}>{status.replace('_', ' ')}</Badge>;
  };

  const priorityBadge = (priority: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'outline'> = { high: 'destructive', medium: 'secondary', low: 'outline' };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Comprehensive reports and issue tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button size="sm" onClick={() => handleExport('xlsx')}>
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="orders"><BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />Orders</TabsTrigger>
          <TabsTrigger value="consumption"><Users className="h-4 w-4 mr-1 hidden sm:inline" />Consumption</TabsTrigger>
          <TabsTrigger value="city"><MapPin className="h-4 w-4 mr-1 hidden sm:inline" />City</TabsTrigger>
          <TabsTrigger value="trends"><Utensils className="h-4 w-4 mr-1 hidden sm:inline" />Trends</TabsTrigger>
          <TabsTrigger value="complaints"><MessageSquareWarning className="h-4 w-4 mr-1 hidden sm:inline" />Issues</TabsTrigger>
        </TabsList>

        {/* Orders Report */}
        <TabsContent value="orders" className="space-y-4">
          {ordersReport && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{ordersReport.totalOrders.toLocaleString()}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(ordersReport.totalAmount)}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Order Value</p><p className="text-2xl font-bold">{formatCurrency(ordersReport.averageOrderValue)}</p></CardContent></Card>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Cancelled</p><p className="text-2xl font-bold text-destructive">{ordersReport.ordersByStatus.cancelled}</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Daily Order Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={ordersReport.dailyTrend.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={v => v.slice(5)} fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="hsl(24,95%,53%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(ordersReport.ordersByStatus).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(24,95%,53%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Consumption Report */}
        <TabsContent value="consumption" className="space-y-4">
          {consumptionReport && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Top Consumers</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={consumptionReport.topConsumers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis dataKey="employeeName" type="category" width={120} fontSize={12} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="amount" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Employee Consumption Details</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumptionReport.employees.map(emp => (
                        <TableRow key={emp.employeeId}>
                          <TableCell className="font-medium">{emp.employeeName}</TableCell>
                          <TableCell>{emp.totalOrders}</TableCell>
                          <TableCell>{formatCurrency(emp.totalAmount)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {Object.entries(emp.mealBreakdown).map(([k, v]) => (
                                <Badge key={k} variant="secondary" className="text-xs capitalize">{k}: {v}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* City Report */}
        <TabsContent value="city" className="space-y-4">
          {cityReport && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">City-wise Orders</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={cityReport.cities.map(c => ({ name: c.city, value: c.totalOrders }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {cityReport.cities.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">City Revenue</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={cityReport.cities}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="totalAmount" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">City Details</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>City</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Avg/Employee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cityReport.cities.map(c => (
                        <TableRow key={c.city}>
                          <TableCell className="font-medium">{c.city}</TableCell>
                          <TableCell>{c.totalOrders.toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(c.totalAmount)}</TableCell>
                          <TableCell>{c.employeeCount}</TableCell>
                          <TableCell>{c.avgOrdersPerEmployee.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trends Report */}
        <TabsContent value="trends" className="space-y-4">
          {trendsReport && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Meal Type Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={trendsReport.mealTypes.map(m => ({ name: m.type, value: m.orderCount }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {trendsReport.mealTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Weekday Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={trendsReport.weekdayDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" fontSize={12} tickFormatter={v => v.slice(0, 3)} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="hsl(199,89%,48%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Popular Items</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trendsReport.popularItems.map((item, i) => (
                        <TableRow key={item.productId}>
                          <TableCell><Badge variant="outline">{i + 1}</Badge></TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.orderCount}</TableCell>
                          <TableCell>{item.totalQuantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Complaints / Issues */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Issues</p><p className="text-2xl font-bold">{complaints.length}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold text-destructive">{complaints.filter(c => c.status === 'open').length}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-warning">{complaints.filter(c => c.status === 'in_progress').length}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-success">{complaints.filter(c => c.status === 'resolved').length}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Issues & Complaints</CardTitle>
              <CardDescription>Food quality, delivery, and system issues reported by employees</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="hidden sm:table-cell">City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.employeeName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{c.city}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{c.type.replace('_', ' ')}</Badge></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{priorityBadge(c.priority)}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell>
                        <Select value={c.status} onValueChange={v => updateComplaintStatus(c.id, v as Complaint['status'])}>
                          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
