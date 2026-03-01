import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Plus, ShoppingCart, ShoppingBag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ordersApi, productsApi } from '@/services/api';
import { Order, OrderStatus, OrderType, City } from '@/types';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import PlaceGuestOrderModal from '@/components/orders/PlaceGuestOrderModal';
import PlaceGroceryOrderModal from '@/components/orders/PlaceGroceryOrderModal';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-info/10 text-info border-info/20',
  preparing: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const approvalStatusColors: Record<string, string> = {
  pending_approval: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface PlacedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  type: 'guest' | 'custom' | 'grocery';
  city: string;
  items: number;
  totalAmount: number;
  orderDate: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  notes?: string;
}

const mockGroceryOrders = [
  { id: 'g1', orderNumber: 'GRO-2024-001', vendor: 'Fresh Farm Supplies', city: 'Mumbai', items: 12, totalAmount: 4800, orderDate: '2024-01-15T10:00:00Z', status: 'delivered' as OrderStatus, deliveryDate: '2024-01-16T08:00:00Z' },
  { id: 'g2', orderNumber: 'GRO-2024-002', vendor: 'Metro Cash & Carry', city: 'Delhi', items: 8, totalAmount: 3200, orderDate: '2024-01-15T11:00:00Z', status: 'confirmed' as OrderStatus, deliveryDate: '2024-01-17T09:00:00Z' },
  { id: 'g3', orderNumber: 'GRO-2024-003', vendor: 'City Grocers', city: 'Pune', items: 15, totalAmount: 6500, orderDate: '2024-01-14T09:00:00Z', status: 'pending' as OrderStatus, deliveryDate: '2024-01-16T10:00:00Z' },
];

// Map routes to tab values
const routeToTab: Record<string, string> = {
  '/orders': 'all',
  '/orders/today': 'today',
  '/orders/custom': 'custom',
  '/orders/groceries': 'groceries',
};

const tabToRoute: Record<string, string> = {
  all: '/orders',
  today: '/orders/today',
  custom: '/orders/custom',
  groceries: '/orders/groceries',
};

export default function Orders() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestModalType, setGuestModalType] = useState<'guest' | 'custom'>('guest');
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

  // Derive active tab from current route
  const activeTab = routeToTab[location.pathname] || 'all';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, citiesData] = await Promise.all([
          activeTab !== 'groceries'
            ? ordersApi.getAll({
                type: (activeTab !== 'all' && activeTab !== 'today') ? activeTab as OrderType : undefined,
                city: selectedCity !== 'all' ? selectedCity : undefined,
                status: selectedStatus !== 'all' ? selectedStatus as OrderStatus : undefined,
                search: search || undefined,
              })
            : Promise.resolve({ orders: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
          productsApi.getCities(),
        ]);
        setOrders(ordersData.orders);
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, selectedCity, selectedStatus, search]);

  const handleTabChange = (value: string) => {
    navigate(tabToRoute[value] || '/orders');
  };

  const handleExport = async () => {
    try {
      const blob = await ordersApi.exportOrders({}, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export orders:', error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const handleGuestOrderPlaced = (orderData: { name: string; type: 'guest' | 'custom'; city: string; items: number; total: number }) => {
    const newOrder: PlacedOrder = {
      id: `po-${Date.now()}`,
      orderNumber: `${orderData.type === 'guest' ? 'GST' : 'CST'}-${new Date().getFullYear()}-${String(placedOrders.length + 1).padStart(3, '0')}`,
      customerName: orderData.name,
      type: orderData.type,
      city: orderData.city,
      items: orderData.items,
      totalAmount: orderData.total,
      orderDate: new Date().toISOString(),
      status: 'pending_approval',
    };
    setPlacedOrders(prev => [newOrder, ...prev]);
    toast({
      title: '📋 Order Sent for Approval',
      description: `${orderData.type === 'guest' ? 'Guest' : 'Custom'} order for ${orderData.name} has been sent to Super Admin for approval.`,
    });
  };

  const handleGroceryOrderPlaced = (orderData: { vendor: string; city: string; items: number; total: number }) => {
    const newOrder: PlacedOrder = {
      id: `po-${Date.now()}`,
      orderNumber: `GRO-${new Date().getFullYear()}-${String(placedOrders.length + 1).padStart(3, '0')}`,
      customerName: orderData.vendor,
      type: 'grocery',
      city: orderData.city,
      items: orderData.items,
      totalAmount: orderData.total,
      orderDate: new Date().toISOString(),
      status: 'pending_approval',
    };
    setPlacedOrders(prev => [newOrder, ...prev]);
    toast({
      title: '📋 Grocery Order Sent for Approval',
      description: `Grocery order from ${orderData.vendor} has been sent to Super Admin for approval.`,
    });
  };

  const isGuestOrCustomTab = activeTab === 'custom' || activeTab === 'guest';
  const isGroceriesTab = activeTab === 'groceries';
  const customGuestPlacedOrders = placedOrders.filter(o => o.type === 'guest' || o.type === 'custom');
  const groceryPlacedOrders = placedOrders.filter(o => o.type === 'grocery');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="custom">Custom / Guest</TabsTrigger>
            <TabsTrigger value="groceries" className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Groceries
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {isGuestOrCustomTab && (
              <>
                <Button size="sm" variant="outline" onClick={() => { setGuestModalType('guest'); setGuestModalOpen(true); }} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Place Guest Order
                </Button>
                <Button size="sm" onClick={() => { setGuestModalType('custom'); setGuestModalOpen(true); }} className="gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" /> Place Custom Order
                </Button>
              </>
            )}
            {isGroceriesTab && (
              <Button size="sm" onClick={() => setGroceryModalOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Place Grocery Order
              </Button>
            )}
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        {!isGroceriesTab && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by employee or order number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Cities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Standard Orders Tabs */}
        {(['all', 'today'].includes(activeTab)) && (
          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden sm:table-cell">Items</TableHead>
                      <TableHead className="hidden lg:table-cell">Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No orders found</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{order.employeeEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{order.city}</TableCell>
                          <TableCell className="hidden sm:table-cell">{order.totalQuantity}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(order.orderDate)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Custom/Guest Orders Tab */}
        <TabsContent value="custom" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead className="hidden lg:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 && customGuestPlacedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        No custom/guest orders found
                        <div className="mt-3 flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setGuestModalType('guest'); setGuestModalOpen(true); }} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Place Guest Order
                          </Button>
                          <Button size="sm" onClick={() => { setGuestModalType('custom'); setGuestModalOpen(true); }} className="gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5" /> Place Custom Order
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{order.employeeEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.city}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.totalQuantity}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {customGuestPlacedOrders.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border bg-muted/40">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" /> Orders Pending Super Admin Approval
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden sm:table-cell">Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Approval Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customGuestPlacedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{order.type}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{order.city}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={approvalStatusColors[order.status]}>
                            <Clock className="w-3 h-3 mr-1" /> Pending Approval
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Groceries Tab */}
        <TabsContent value="groceries" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by vendor or order number..." className="pl-9" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Cities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Vendor / Supplier</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden sm:table-cell">Line Items</TableHead>
                    <TableHead className="hidden lg:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Order Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGroceryOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
                          <p className="text-muted-foreground text-sm">No grocery orders yet</p>
                          <Button size="sm" onClick={() => setGroceryModalOpen(true)} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Place First Grocery Order
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockGroceryOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="font-medium">{order.vendor}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.city}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(order.orderDate)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{order.deliveryDate ? formatDate(order.deliveryDate) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {groceryPlacedOrders.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border bg-muted/40">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" /> Grocery Orders Pending Super Admin Approval
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden sm:table-cell">Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Approval Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groceryPlacedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.city}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={approvalStatusColors[order.status]}>
                            <Clock className="w-3 h-3 mr-1" /> Pending Approval
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <OrderDetailsModal order={selectedOrder} open={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
      <PlaceGuestOrderModal open={guestModalOpen} onClose={() => setGuestModalOpen(false)} type={guestModalType} onOrderPlaced={handleGuestOrderPlaced} />
      <PlaceGroceryOrderModal open={groceryModalOpen} onClose={() => setGroceryModalOpen(false)} onOrderPlaced={handleGroceryOrderPlaced} />
    </div>
  );
}
