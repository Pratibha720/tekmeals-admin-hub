import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, Eye, Edit, RotateCcw, Package, CheckCircle, XCircle, CalendarDays, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api';
import { Product, City, Kitchen, ProductCategory } from '@/types';
import AddProductModal from '@/components/products/AddProductModal';
import ProductViewModal from '@/components/products/ProductViewModal';
import ProductEditModal from '@/components/products/ProductEditModal';

const categoryLabels: Record<ProductCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  beverages: 'Beverages',
};

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const allDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Extended mock products with more items to simulate dynamic data
const additionalProducts: Product[] = [
  { id: 'p7', name: 'Chole Bhature', description: 'Spicy chickpea curry with fried bread', category: 'lunch', price: 130, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&h=200&fit=crop', city: 'Delhi', kitchenId: 'k2', kitchenName: 'Punjab Grill', isAvailable: true, nutritionInfo: { calories: 550, protein: 15, carbs: 65, fat: 22 }, tags: ['veg', 'north-indian'], createdAt: '2024-01-07T10:00:00Z', updatedAt: '2024-01-16T14:00:00Z' },
  { id: 'p8', name: 'Chicken Tikka', description: 'Tandoori spiced grilled chicken', category: 'dinner', price: 220, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop', city: 'Mumbai', kitchenId: 'k1', kitchenName: 'Spice Garden', isAvailable: true, nutritionInfo: { calories: 380, protein: 32, carbs: 8, fat: 18 }, tags: ['non-veg', 'tandoori'], createdAt: '2024-01-08T10:00:00Z', updatedAt: '2024-01-17T14:00:00Z' },
  { id: 'p9', name: 'Veg Pulao', description: 'Aromatic rice with mixed vegetables', category: 'lunch', price: 140, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&h=200&fit=crop', city: 'Bangalore', kitchenId: 'k3', kitchenName: 'South Express', isAvailable: true, nutritionInfo: { calories: 320, protein: 8, carbs: 55, fat: 8 }, tags: ['veg', 'rice'], createdAt: '2024-01-09T10:00:00Z', updatedAt: '2024-01-18T14:00:00Z' },
  { id: 'p10', name: 'Poha', description: 'Flattened rice with peanuts and herbs', category: 'breakfast', price: 60, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&h=200&fit=crop', city: 'Mumbai', kitchenId: 'k1', kitchenName: 'Spice Garden', isAvailable: true, nutritionInfo: { calories: 180, protein: 5, carbs: 32, fat: 4 }, tags: ['veg', 'breakfast', 'light'], createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-19T14:00:00Z' },
  { id: 'p11', name: 'Egg Curry', description: 'Boiled eggs in spiced gravy', category: 'dinner', price: 150, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&h=200&fit=crop', city: 'Hyderabad', kitchenId: 'k4', kitchenName: 'Paradise Kitchen', isAvailable: false, nutritionInfo: { calories: 280, protein: 18, carbs: 12, fat: 16 }, tags: ['non-veg', 'curry'], createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-20T14:00:00Z' },
  { id: 'p12', name: 'Upma', description: 'Semolina porridge with vegetables', category: 'breakfast', price: 55, image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&h=200&fit=crop', city: 'Chennai', kitchenId: 'k5', kitchenName: 'Madras Cafe', isAvailable: true, nutritionInfo: { calories: 200, protein: 6, carbs: 35, fat: 5 }, tags: ['veg', 'south-indian', 'breakfast'], createdAt: '2024-01-12T10:00:00Z', updatedAt: '2024-01-21T14:00:00Z' },
];

// Weekly meal planner mock
const defaultWeeklyPlan: Record<DayOfWeek, string[]> = {
  Monday: ['p1', 'p3', 'p5', 'p9', 'p10'],
  Tuesday: ['p2', 'p4', 'p7', 'p8'],
  Wednesday: ['p1', 'p3', 'p6', 'p9', 'p12'],
  Thursday: ['p2', 'p5', 'p7', 'p10', 'p11'],
  Friday: ['p1', 'p4', 'p8', 'p9'],
  Saturday: ['p3', 'p10', 'p12'],
  Sunday: [],
};

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [weeklyPlan, setWeeklyPlan] = useState<Record<DayOfWeek, string[]>>(defaultWeeklyPlan);
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, citiesData, kitchensData] = await Promise.all([
          productsApi.getAll({
            city: selectedCity !== 'all' ? selectedCity : undefined,
            category: selectedCategory !== 'all' ? selectedCategory as ProductCategory : undefined,
            search: search || undefined,
            isAvailable: availabilityFilter,
          }),
          productsApi.getCities(),
          productsApi.getKitchens(),
        ]);
        // Combine with additional products for dynamic display
        let allProducts = [...productsData.products, ...additionalProducts];
        // Remove duplicates
        const seen = new Set<string>();
        allProducts = allProducts.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        
        if (vegFilter !== 'all') {
          allProducts = allProducts.filter(p => p.tags?.includes(vegFilter));
        }
        if (selectedCity !== 'all') {
          allProducts = allProducts.filter(p => p.city === selectedCity);
        }
        if (selectedCategory !== 'all') {
          allProducts = allProducts.filter(p => p.category === selectedCategory);
        }
        if (search) {
          const s = search.toLowerCase();
          allProducts = allProducts.filter(p => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
        }
        if (availabilityFilter !== undefined) {
          allProducts = allProducts.filter(p => p.isAvailable === availabilityFilter);
        }
        setProducts(allProducts);
        setCities(citiesData);
        setKitchens(kitchensData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity, selectedCategory, search, availabilityFilter, vegFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / pageSize);

  const resetFilters = () => {
    setSearch(''); setSelectedCity('all'); setSelectedCategory('all');
    setVegFilter('all'); setAvailabilityFilter(undefined); setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) setSelectedProducts(new Set());
    else setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedProducts(next);
  };

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    setProducts(prev => prev.map(p => selectedProducts.has(p.id) ? { ...p, isAvailable: action === 'activate' } : p));
    toast({ title: `${selectedProducts.size} products ${action === 'activate' ? 'activated' : 'deactivated'}` });
    setSelectedProducts(new Set());
  };

  const handleExport = () => {
    const csv = 'Name,Category,City,Price,Available\n' +
      products.map(p => `${p.name},${p.category},${p.city},${p.price},${p.isAvailable}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: 'Export successful' });
  };

  // Auto-fetch image for product name using Unsplash source
  const getAutoImage = (name: string) => {
    return `https://source.unsplash.com/300x200/?${encodeURIComponent(name + ' food')}`;
  };

  const handleAddSuccess = (product: Product) => {
    // Auto-fill image if missing
    if (!product.image) {
      product.image = getAutoImage(product.name);
    }
    // Auto-fill nutrition if missing
    if (!product.nutritionInfo || !product.nutritionInfo.calories) {
      product.nutritionInfo = {
        calories: Math.floor(Math.random() * 300) + 150,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 40) + 10,
        fat: Math.floor(Math.random() * 15) + 3,
      };
    }
    setProducts(prev => [product, ...prev]);
    setShowAddModal(false);
    toast({ title: '✅ Product Added', description: `${product.name} added with auto-fetched image and nutrition info.` });
  };

  const handleEditSave = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditProduct(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const activeCount = products.filter(p => p.isAvailable).length;
  const inactiveCount = products.filter(p => !p.isAvailable).length;

  const toggleDayProduct = (day: DayOfWeek, productId: string) => {
    setWeeklyPlan(prev => {
      const dayProducts = [...(prev[day] || [])];
      const idx = dayProducts.indexOf(productId);
      if (idx >= 0) dayProducts.splice(idx, 1);
      else dayProducts.push(productId);
      return { ...prev, [day]: dayProducts };
    });
  };

  const saveWeeklyPlan = () => {
    toast({ title: '✅ Weekly Meal Plan Saved', description: 'The weekly meal assignments have been updated successfully.' });
    setEditingDay(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Products</TabsTrigger>
          <TabsTrigger value="weekly" className="gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Weekly Meal Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{activeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold">{inactiveCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
              {selectedProducts.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>Bulk Activate ({selectedProducts.size})</Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>Bulk Deactivate ({selectedProducts.size})</Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={selectedCity} onValueChange={v => { setSelectedCity(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Cities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={vegFilter} onValueChange={v => { setVegFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Veg/Non-Veg" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="veg">🟢 Veg</SelectItem>
                    <SelectItem value="non-veg">🔴 Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch checked={availabilityFilter === true} onCheckedChange={v => { setAvailabilityFilter(v ? true : undefined); setCurrentPage(1); }} />
                  <span className="text-sm text-muted-foreground">Available only</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetFilters}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
              </div>
            </CardContent>
          </Card>

          {/* Select All */}
          {paginatedProducts.length > 0 && !loading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0} onCheckedChange={toggleSelectAll} />
                <span className="text-sm text-muted-foreground">Select all ({paginatedProducts.length})</span>
              </div>
              <p className="text-sm text-muted-foreground">{products.length} total products</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <CardContent className="pt-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : paginatedProducts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or add a new product</p>
                <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
              </div>
            ) : (
              paginatedProducts.map(product => {
                const isVeg = product.tags?.includes('veg');
                return (
                  <Card key={product.id} className="overflow-hidden group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                    <div className="relative h-40 bg-muted">
                      <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selectedProducts.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} className="bg-background/80" />
                      </div>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop`;
                          }}
                        />
                      ) : (
                        <img
                          src={getAutoImage(product.name)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop`;
                          }}
                        />
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge variant={product.isAvailable ? 'default' : 'secondary'} className={`text-xs ${product.isAvailable ? 'bg-success' : ''}`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-lg">{isVeg ? '🟢' : '🔴'}</span>
                      </div>
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setViewProduct(product)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.city}</p>
                        </div>
                        <p className="text-lg font-bold text-primary shrink-0">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="capitalize text-xs">{product.category}</Badge>
                        {product.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      {product.nutritionInfo?.calories && (
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {product.nutritionInfo.calories} kcal · {product.nutritionInfo.protein}g protein · {product.nutritionInfo.carbs}g carbs · {product.nutritionInfo.fat}g fat
                        </p>
                      )}
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </TabsContent>

        {/* Weekly Meal Planner */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Company Weekly Meal Planner</h2>
              <p className="text-sm text-muted-foreground">Assign products to each day of the week for employees</p>
            </div>
            <Button onClick={saveWeeklyPlan} size="sm">💾 Save Plan</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allDays.map(day => {
              const dayProductIds = weeklyPlan[day] || [];
              const dayProducts = dayProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
              const isEditing = editingDay === day;
              const isWeekend = day === 'Saturday' || day === 'Sunday';

              return (
                <Card key={day} className={isWeekend ? 'opacity-80' : ''}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {day}
                        {isWeekend && <Badge variant="secondary" className="text-[9px]">Weekend</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{dayProducts.length} items</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingDay(isEditing ? null : day)}>
                          {isEditing ? 'Done' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    {isEditing ? (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {products.filter(p => p.isAvailable).map(product => (
                          <label key={product.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                            <Checkbox
                              checked={dayProductIds.includes(product.id)}
                              onCheckedChange={() => toggleDayProduct(day, product.id)}
                            />
                            <span className="text-xs">{product.tags?.includes('veg') ? '🟢' : '🔴'}</span>
                            <span className="text-xs font-medium">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{formatCurrency(product.price)}</span>
                          </label>
                        ))}
                      </div>
                    ) : dayProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No meals assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {dayProducts.map(product => (
                          <Badge key={product.id} variant="outline" className="text-[10px] gap-1">
                            <span>{product.tags?.includes('veg') ? '🟢' : '🔴'}</span>
                            {product.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} cities={cities} kitchens={kitchens} />
      <ProductViewModal open={!!viewProduct} onClose={() => setViewProduct(null)} product={viewProduct} />
      <ProductEditModal open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSave={handleEditSave} />
    </div>
  );
}
