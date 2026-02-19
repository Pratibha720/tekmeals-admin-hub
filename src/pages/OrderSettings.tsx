import { useState, useMemo } from 'react';
import { Search, ToggleLeft, Utensils, UtensilsCrossed, BookOpen, ChefHat, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
type MealTime = 'Breakfast' | 'Lunch' | 'Dinner';
type VegType = 'veg' | 'non-veg';
type CuisineKey = 'indian' | 'chinese' | 'continental' | 'custom';
type ModeKey = 'individual' | 'combo';

interface Meal {
  id: string;
  name: string;
  description: string;
  vegType: VegType;
  mealTime: MealTime;
  cuisine: CuisineKey;
  price: number;
  kitchen: string;
  restaurant: string;
  enabled: boolean; // This is the core toggle — employees see it only when true
  featured: boolean;
  quantityLimit: number | null;
}

// ─── Static Meal Data ─────────────────────────────────────────────────────────
const allMeals: Meal[] = [
  // Indian
  { id: 'in-veg-l', name: 'North Indian Veg Thali', description: 'Dal, paneer, roti, rice & salad', vegType: 'veg', mealTime: 'Lunch', cuisine: 'indian', price: 160, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'in-nv-l', name: 'Chicken Curry Meal', description: 'Rich chicken curry with rice & naan', vegType: 'non-veg', mealTime: 'Lunch', cuisine: 'indian', price: 190, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: 50 },
  { id: 'in-veg-b', name: 'South Indian Breakfast', description: 'Idli, vada, dosa with sambar & chutney', vegType: 'veg', mealTime: 'Breakfast', cuisine: 'indian', price: 90, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: false, quantityLimit: null },
  { id: 'in-nv-d', name: 'Mutton Biryani', description: 'Dum-style mutton biryani with raita', vegType: 'non-veg', mealTime: 'Dinner', cuisine: 'indian', price: 240, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: true, quantityLimit: 30 },
  { id: 'in-veg-d', name: 'Veg Biryani Dinner', description: 'Fragrant veg biryani with salan', vegType: 'veg', mealTime: 'Dinner', cuisine: 'indian', price: 180, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },

  // Chinese
  { id: 'ch-veg-l', name: 'Chinese Veg Meal', description: 'Fried rice + veg Manchurian', vegType: 'veg', mealTime: 'Lunch', cuisine: 'chinese', price: 170, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: false, quantityLimit: null },
  { id: 'ch-nv-l', name: 'Chilli Chicken Noodles', description: 'Hakka noodles with chilli chicken', vegType: 'non-veg', mealTime: 'Lunch', cuisine: 'chinese', price: 210, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: null },
  { id: 'ch-veg-b', name: 'Momos & Soup', description: 'Steam momos with hot & sour soup', vegType: 'veg', mealTime: 'Breakfast', cuisine: 'chinese', price: 120, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: true, quantityLimit: null },
  { id: 'ch-nv-d', name: 'Kung Pao Chicken', description: 'Spicy chicken with fried rice', vegType: 'non-veg', mealTime: 'Dinner', cuisine: 'chinese', price: 230, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: 40 },

  // Continental
  { id: 'co-veg-l', name: 'Creamy Pasta Meal', description: 'Pasta with garlic bread & side salad', vegType: 'veg', mealTime: 'Lunch', cuisine: 'continental', price: 200, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: false, quantityLimit: null },
  { id: 'co-nv-l', name: 'Grilled Chicken Plate', description: 'Grilled chicken with veggies & mash', vegType: 'non-veg', mealTime: 'Lunch', cuisine: 'continental', price: 250, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: true, quantityLimit: 35 },
  { id: 'co-veg-b', name: 'Continental Breakfast', description: 'Toast, eggs, juice & fruit plate', vegType: 'veg', mealTime: 'Breakfast', cuisine: 'continental', price: 130, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: false, featured: false, quantityLimit: null },

  // Custom
  { id: 'cu-std', name: 'Standard Meal Box', description: 'Balanced everyday full meal', vegType: 'veg', mealTime: 'Lunch', cuisine: 'custom', price: 140, kitchen: 'Paradise Kitchen', restaurant: 'Meal Box', enabled: true, featured: false, quantityLimit: null },
  { id: 'cu-prem', name: 'Executive Meal Box', description: 'Premium meal with dessert & beverage', vegType: 'veg', mealTime: 'Lunch', cuisine: 'custom', price: 200, kitchen: 'Paradise Kitchen', restaurant: 'Meal Box', enabled: false, featured: false, quantityLimit: 20 },
  { id: 'cu-diet', name: 'Diet Meal Plan', description: 'Low-calorie healthy option', vegType: 'veg', mealTime: 'Lunch', cuisine: 'custom', price: 160, kitchen: 'Paradise Kitchen', restaurant: 'Meal Box', enabled: true, featured: false, quantityLimit: null },
];

const comboMeals: Meal[] = [
  { id: 'combo-1', name: 'Indian Feast Combo', description: 'Dal + Paneer + Roti + Rice + Dessert', vegType: 'veg', mealTime: 'Lunch', cuisine: 'indian', price: 280, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'combo-2', name: 'Dragon Power Combo', description: 'Noodles + Fried Rice + Manchurian + Soup', vegType: 'veg', mealTime: 'Lunch', cuisine: 'chinese', price: 320, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: null },
  { id: 'combo-3', name: 'Euro Combo Platter', description: 'Pasta + Salad + Garlic Bread + Dessert', vegType: 'veg', mealTime: 'Lunch', cuisine: 'continental', price: 380, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: true, quantityLimit: 25 },
  { id: 'combo-4', name: 'Office Power Combo', description: 'Full meal + snack + beverage', vegType: 'veg', mealTime: 'Lunch', cuisine: 'custom', price: 240, kitchen: 'Paradise Kitchen', restaurant: 'Meal Box', enabled: false, featured: false, quantityLimit: null },
  { id: 'combo-5', name: 'Non-Veg Feast Combo', description: 'Chicken + mutton + naan + rice + dessert', vegType: 'non-veg', mealTime: 'Dinner', cuisine: 'indian', price: 420, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: false, quantityLimit: 15 },
];

const cuisineTabs: { key: CuisineKey; label: string; emoji: string }[] = [
  { key: 'indian', label: 'Indian', emoji: '🍛' },
  { key: 'chinese', label: 'Chinese', emoji: '🥡' },
  { key: 'continental', label: 'Continental', emoji: '🍝' },
  { key: 'custom', label: 'Custom', emoji: '🍱' },
];

const mealTimeFilters: { key: MealTime | 'all'; label: string }[] = [
  { key: 'all', label: 'All Times' },
  { key: 'Breakfast', label: 'Breakfast' },
  { key: 'Lunch', label: 'Lunch' },
  { key: 'Dinner', label: 'Dinner' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function VegBadge({ type }: { type: VegType }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border',
      type === 'veg'
        ? 'border-success text-success bg-success/5'
        : 'border-destructive text-destructive bg-destructive/5',
    )}>
      <span className={cn('w-2 h-2 rounded-full', type === 'veg' ? 'bg-success' : 'bg-destructive')} />
      {type === 'veg' ? 'VEG' : 'NON-VEG'}
    </span>
  );
}

function MealTimeBadge({ time }: { time: MealTime }) {
  const map: Record<MealTime, string> = {
    Breakfast: 'bg-warning/10 text-warning border-warning/20',
    Lunch: 'bg-info/10 text-info border-info/20',
    Dinner: 'bg-primary/10 text-primary border-primary/20',
  };
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', map[time])}>
      {time}
    </span>
  );
}

interface MealToggleCardProps {
  meal: Meal;
  onToggle: (id: string) => void;
  onQuantityLimitChange: (id: string, val: number | null) => void;
}

function MealToggleCard({ meal, onToggle, onQuantityLimitChange }: MealToggleCardProps) {
  const [editingQty, setEditingQty] = useState(false);

  return (
    <div className={cn(
      'relative rounded-xl border bg-card transition-all duration-200 overflow-hidden',
      meal.enabled
        ? 'border-border shadow-sm'
        : 'border-border/50 opacity-60',
    )}>
      {/* Status strip */}
      <div className={cn('h-1 w-full', meal.enabled ? 'bg-success' : 'bg-muted')} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-card-foreground leading-tight">{meal.name}</p>
              {meal.featured && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-semibold">Featured</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
          </div>
          {/* Availability toggle — the core control */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Switch
              checked={meal.enabled}
              onCheckedChange={() => onToggle(meal.id)}
              className="data-[state=checked]:bg-success"
            />
            <span className={cn('text-[9px] font-semibold', meal.enabled ? 'text-success' : 'text-muted-foreground')}>
              {meal.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          <VegBadge type={meal.vegType} />
          <MealTimeBadge time={meal.mealTime} />
        </div>

        <Separator className="my-3" />

        {/* Bottom info */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-primary">₹{meal.price}</p>
            <p className="text-[10px] text-muted-foreground">{meal.kitchen}</p>
          </div>

          {/* Quantity limit control */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">Qty Limit</span>
            {editingQty ? (
              <Input
                type="number"
                min={1}
                autoFocus
                defaultValue={meal.quantityLimit ?? ''}
                placeholder="Unlimited"
                className="h-7 w-24 text-xs text-right"
                onBlur={e => {
                  const val = parseInt(e.target.value);
                  onQuantityLimitChange(meal.id, isNaN(val) || val < 1 ? null : val);
                  setEditingQty(false);
                }}
              />
            ) : (
              <button
                onClick={() => setEditingQty(true)}
                className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
              >
                {meal.quantityLimit ? `${meal.quantityLimit} meals` : 'Unlimited'}
              </button>
            )}
          </div>
        </div>

        {/* Visibility status bar */}
        <div className={cn(
          'mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-xs',
          meal.enabled
            ? 'bg-success/8 border border-success/20'
            : 'bg-muted/50 border border-border',
        )}>
          {meal.enabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
              <span className="text-success font-medium">Visible to employees in app</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Hidden from employee app</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ meals }: { meals: Meal[] }) {
  const total = meals.length;
  const enabled = meals.filter(m => m.enabled).length;
  const disabled = total - enabled;
  const veg = meals.filter(m => m.vegType === 'veg').length;

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: 'Total Meals', value: total, color: 'text-foreground' },
        { label: 'Available to Employees', value: enabled, color: 'text-success' },
        { label: 'Hidden from Employees', value: disabled, color: 'text-destructive' },
        { label: 'Veg Options', value: veg, color: 'text-success' },
      ].map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
          <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderSettings() {
  const { toast } = useToast();
  const [mode, setMode] = useState<ModeKey>('individual');
  const [activeCuisine, setActiveCuisine] = useState<CuisineKey>('indian');
  const [activeMealTime, setActiveMealTime] = useState<MealTime | 'all'>('all');
  const [search, setSearch] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [saving, setSaving] = useState(false);

  const [individualMeals, setIndividualMeals] = useState<Meal[]>(allMeals);
  const [comboMealsList, setComboMealsList] = useState<Meal[]>(comboMeals);

  const currentMeals = mode === 'individual' ? individualMeals : comboMealsList;
  const setCurrentMeals = mode === 'individual' ? setIndividualMeals : setComboMealsList;

  // Filter visible meals
  const visibleMeals = useMemo(() => {
    return currentMeals.filter(m => {
      if (m.cuisine !== activeCuisine) return false;
      if (activeMealTime !== 'all' && m.mealTime !== activeMealTime) return false;
      if (vegFilter !== 'all' && m.vegType !== vegFilter) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [currentMeals, activeCuisine, activeMealTime, vegFilter, search]);

  // Stats for current mode
  const stats = useMemo(() => currentMeals, [currentMeals]);

  const toggleMeal = (id: string) => {
    setCurrentMeals(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const setQtyLimit = (id: string, val: number | null) => {
    setCurrentMeals(prev => prev.map(m => m.id === id ? { ...m, quantityLimit: val } : m));
  };

  // Cuisine counts for tabs
  const cuisineCounts = useMemo(() => {
    const counts: Record<CuisineKey, { total: number; enabled: number }> = {
      indian: { total: 0, enabled: 0 },
      chinese: { total: 0, enabled: 0 },
      continental: { total: 0, enabled: 0 },
      custom: { total: 0, enabled: 0 },
    };
    currentMeals.forEach(m => {
      counts[m.cuisine].total++;
      if (m.enabled) counts[m.cuisine].enabled++;
    });
    return counts;
  }, [currentMeals]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    const enabledCount = currentMeals.filter(m => m.enabled).length;
    toast({
      title: '✅ Availability Saved',
      description: `${enabledCount} meal(s) are now visible to your employees.`,
    });
  };

  const enableAll = () => setCurrentMeals(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: true } : m));
  const disableAll = () => setCurrentMeals(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: false } : m));

  return (
    <div className="space-y-5">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-5 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ToggleLeft className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Meal Availability Control</h1>
            <p className="text-xs text-muted-foreground">Enable or disable meals visible to employees in their app</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs font-medium hidden sm:flex">TekMeals Inc.</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ── Info Banner ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-info/5 border border-info/20">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info/90 leading-relaxed">
          <strong>How it works:</strong> Toggle meals ON to make them visible to employees in their ordering app. 
          Toggle OFF to hide them. Set quantity limits to cap how many can be ordered per day. 
          Changes take effect immediately after saving.
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <StatsBar meals={stats} />

      {/* ── Mode Segmented Control ────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['individual', 'combo'] as ModeKey[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setActiveCuisine('indian'); setActiveMealTime('all'); setSearch(''); }}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-semibold transition-all capitalize',
              mode === m
                ? 'bg-card shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'individual' ? '🍽 Individual Meals' : '🎁 Combo Meals'}
          </button>
        ))}
      </div>

      {/* ── 2-column layout ───────────────────────────────────────────── */}
      <div className="flex gap-5 items-start">

        {/* LEFT: Meal Configuration */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Cuisine pill tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {cuisineTabs.map(tab => {
              const count = cuisineCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCuisine(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    activeCuisine === tab.key
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-card',
                  )}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                    activeCuisine === tab.key
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-success/10 text-success',
                  )}>
                    {count.enabled}/{count.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search meals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Meal time filter */}
            <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
              {mealTimeFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveMealTime(f.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    activeMealTime === f.key
                      ? 'bg-card shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Veg/Non-veg filter */}
            <Select value={vegFilter} onValueChange={v => setVegFilter(v as typeof vegFilter)}>
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                <SelectItem value="veg" className="text-xs">🟢 Veg Only</SelectItem>
                <SelectItem value="non-veg" className="text-xs">🔴 Non-Veg Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions for this cuisine */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">
              {visibleMeals.length} meal{visibleMeals.length !== 1 ? 's' : ''} shown
              {' · '}
              <span className="text-success">{visibleMeals.filter(m => m.enabled).length} enabled</span>
              {' · '}
              <span className="text-muted-foreground">{visibleMeals.filter(m => !m.enabled).length} disabled</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={enableAll}>
                Enable All
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={disableAll}>
                Disable All
              </Button>
            </div>
          </div>

          {/* Meal Grid */}
          {visibleMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {visibleMeals.map(meal => (
                <MealToggleCard
                  key={meal.id}
                  meal={meal}
                  onToggle={toggleMeal}
                  onQuantityLimitChange={setQtyLimit}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No meals match filters</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* RIGHT: Sticky Summary Panel */}
        <div className="w-64 xl:w-72 shrink-0 sticky top-4 space-y-3">

          {/* Availability Summary */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Availability Summary</span>
            </div>
            <div className="p-4 space-y-3">
              {cuisineTabs.map(tab => {
                const count = cuisineCounts[tab.key];
                const pct = count.total > 0 ? Math.round((count.enabled / count.total) * 100) : 0;
                return (
                  <div key={tab.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground font-medium">{tab.emoji} {tab.label}</span>
                      <span className="text-muted-foreground">{count.enabled}/{count.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', pct === 100 ? 'bg-success' : pct > 50 ? 'bg-warning' : 'bg-destructive')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Quick Guide</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: '🟢', text: 'Green status = meal visible to employees' },
                { icon: '⚫', text: 'Grey status = meal hidden from employee app' },
                { icon: '🔢', text: 'Qty limit caps how many can order daily' },
                { icon: '💾', text: 'Click "Save Changes" to apply updates' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Save CTA */}
          <Button
            className="w-full h-9 text-xs font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving Changes…' : '💾 Save Availability Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
