import { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, Edit, RotateCcw, Package, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/services/api';
import { Product, City, Kitchen, ProductCategory } from '@/types';
import AddProductModal from '@/components/products/AddProductModal';

const categoryLabels: Record<ProductCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  beverages: 'Beverages',
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
        let filtered = productsData.products;
        if (vegFilter !== 'all') {
          filtered = filtered.filter(p => p.tags?.includes(vegFilter));
        }
        setProducts(filtered);
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

  const resetFilters = () => {
    setSearch('');
    setSelectedCity('all');
    setSelectedCategory('all');
    setVegFilter('all');
    setAvailabilityFilter(undefined);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProducts(next);
  };

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    setProducts(prev => prev.map(p =>
      selectedProducts.has(p.id) ? { ...p, isAvailable: action === 'activate' } : p
    ));
    toast({ title: `${selectedProducts.size} products ${action === 'activate' ? 'activated' : 'deactivated'}` });
    setSelectedProducts(new Set());
  };

  const handleExport = () => {
    const csv = 'Name,Category,City,Kitchen,Price,Available\n' +
      products.map(p => `${p.name},${p.category},${p.city},${p.kitchenName},${p.price},${p.isAvailable}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: 'Export successful' });
  };

  const handleAddSuccess = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    setShowAddModal(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const activeCount = products.filter(p => p.isAvailable).length;
  const inactiveCount = products.filter(p => !p.isAvailable).length;

  return (
    <div className="space-y-6">
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
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                Bulk Activate ({selectedProducts.size})
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                Bulk Deactivate ({selectedProducts.size})
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={vegFilter} onValueChange={setVegFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Veg/Non-Veg" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="veg">🟢 Veg</SelectItem>
                <SelectItem value="non-veg">🔴 Non-Veg</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={availabilityFilter === true}
                onCheckedChange={v => setAvailabilityFilter(v ? true : undefined)}
              />
              <span className="text-sm text-muted-foreground">Available only</span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Select All */}
      {products.length > 0 && !loading && (
        <div className="flex items-center gap-2">
          <Checkbox checked={selectedProducts.size === products.length && products.length > 0} onCheckedChange={toggleSelectAll} />
          <span className="text-sm text-muted-foreground">Select all ({products.length})</span>
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
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or add a new product</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
        ) : (
          products.map(product => {
            const isVeg = product.tags?.includes('veg');
            return (
              <Card
                key={product.id}
                className="overflow-hidden group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="relative h-40 bg-muted">
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                      className="bg-background/80"
                    />
                  </div>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                  {/* Badges overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge variant={product.isAvailable ? 'default' : 'secondary'} className={`text-xs ${product.isAvailable ? 'bg-success' : ''}`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-lg">{isVeg ? '🟢' : '🔴'}</span>
                  </div>
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast({ title: `Viewing ${product.name}` })}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => toast({ title: `Editing ${product.name}` })}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.kitchenName}</p>
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
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        cities={cities}
        kitchens={kitchens}
      />
    </div>
  );
}
