import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronDown, Minus, Plus, ShoppingCart, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner';
type VegType = 'veg' | 'non-veg';
type CuisineKey = 'indian' | 'chinese' | 'continental' | 'custom';
type ModeKey = 'individual' | 'combo';

interface MealCard {
  id: string;
  cuisine: CuisineKey;
  name: string;
  description: string;
  vegNonVeg: VegType;
  type: MealType;
  basePrice: number;
  items: string[];
  selected: boolean;
  quantity: number;
  selectedItem: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const cuisineItems: Record<CuisineKey, string[]> = {
  indian: ['Dal Makhani', 'Paneer Butter Masala', 'Roti', 'Biryani', 'Chole Bhature', 'Raita', 'Rice'],
  chinese: ['Fried Rice', 'Noodles', 'Manchurian', 'Spring Rolls', 'Momos', 'Soup'],
  continental: ['Pasta', 'Grilled Sandwich', 'Caesar Salad', 'Club Sandwich', 'Pizza', 'Garlic Bread'],
  custom: ['Thali Veg', 'Thali Non-Veg', 'Mini Meal', 'Executive Meal', 'Diet Meal'],
};

const kitchenMap: Record<CuisineKey, { kitchen: string; restaurant: string; price: number }> = {
  indian: { kitchen: 'Spice Garden', restaurant: 'Desi Flavors', price: 160 },
  chinese: { kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', price: 180 },
  continental: { kitchen: 'Euro Bistro', restaurant: 'The Continental', price: 220 },
  custom: { kitchen: 'Paradise Kitchen', restaurant: 'Meal Box', price: 150 },
};

const initialMeals: MealCard[] = [
  { id: 'in-veg', cuisine: 'indian', name: 'Indian Veg', description: 'Wholesome north-Indian veg thali', vegNonVeg: 'veg', type: 'lunch', basePrice: 160, items: cuisineItems.indian, selected: false, quantity: 1, selectedItem: '' },
  { id: 'in-nv', cuisine: 'indian', name: 'Indian Non-Veg', description: 'Rich non-veg curry with rice & roti', vegNonVeg: 'non-veg', type: 'lunch', basePrice: 190, items: cuisineItems.indian, selected: false, quantity: 1, selectedItem: '' },
  { id: 'in-bfast', cuisine: 'indian', name: 'Indian Breakfast', description: 'Idli, vada, sambar & chutney', vegNonVeg: 'veg', type: 'breakfast', basePrice: 90, items: ['Idli', 'Vada', 'Dosa', 'Upma', 'Poha'], selected: false, quantity: 1, selectedItem: '' },
  { id: 'ch-veg', cuisine: 'chinese', name: 'Chinese Veg', description: 'Fried rice + veg Manchurian combo', vegNonVeg: 'veg', type: 'lunch', basePrice: 170, items: cuisineItems.chinese, selected: false, quantity: 1, selectedItem: '' },
  { id: 'ch-nv', cuisine: 'chinese', name: 'Chinese Non-Veg', description: 'Chilli chicken with noodles', vegNonVeg: 'non-veg', type: 'lunch', basePrice: 210, items: cuisineItems.chinese, selected: false, quantity: 1, selectedItem: '' },
  { id: 'ch-momos', cuisine: 'chinese', name: 'Momos Special', description: 'Steam or fried momos with dip', vegNonVeg: 'veg', type: 'breakfast', basePrice: 120, items: ['Veg Momos', 'Paneer Momos', 'Chicken Momos'], selected: false, quantity: 1, selectedItem: '' },
  { id: 'co-pasta', cuisine: 'continental', name: 'Continental Veg', description: 'Creamy pasta & garlic bread', vegNonVeg: 'veg', type: 'lunch', basePrice: 200, items: cuisineItems.continental, selected: false, quantity: 1, selectedItem: '' },
  { id: 'co-nv', cuisine: 'continental', name: 'Continental Non-Veg', description: 'Grilled chicken with salad', vegNonVeg: 'non-veg', type: 'lunch', basePrice: 250, items: cuisineItems.continental, selected: false, quantity: 1, selectedItem: '' },
  { id: 'cu-std', cuisine: 'custom', name: 'Standard Meal', description: 'Balanced full meal for everyday', vegNonVeg: 'veg', type: 'lunch', basePrice: 140, items: cuisineItems.custom, selected: false, quantity: 1, selectedItem: '' },
  { id: 'cu-prem', cuisine: 'custom', name: 'Premium Meal', description: 'Executive meal with dessert', vegNonVeg: 'veg', type: 'lunch', basePrice: 200, items: cuisineItems.custom, selected: false, quantity: 1, selectedItem: '' },
  { id: 'cu-diet', cuisine: 'custom', name: 'Diet Meal', description: 'Low-calorie healthy meal plan', vegNonVeg: 'veg', type: 'lunch', basePrice: 160, items: cuisineItems.custom, selected: false, quantity: 1, selectedItem: '' },
];

const comboMeals: MealCard[] = [
  { id: 'combo-1', cuisine: 'indian', name: 'Indian Feast Combo', description: 'Dal + Paneer + Roti + Rice + Dessert', vegNonVeg: 'veg', type: 'lunch', basePrice: 280, items: ['Full Combo'], selected: false, quantity: 1, selectedItem: 'Full Combo' },
  { id: 'combo-2', cuisine: 'chinese', name: 'Dragon Combo', description: 'Noodles + Fried Rice + Manchurian + Soup', vegNonVeg: 'veg', type: 'lunch', basePrice: 320, items: ['Full Combo'], selected: false, quantity: 1, selectedItem: 'Full Combo' },
  { id: 'combo-3', cuisine: 'continental', name: 'Euro Combo', description: 'Pasta + Salad + Garlic Bread + Dessert', vegNonVeg: 'veg', type: 'lunch', basePrice: 380, items: ['Full Combo'], selected: false, quantity: 1, selectedItem: 'Full Combo' },
  { id: 'combo-4', cuisine: 'custom', name: 'Office Power Combo', description: 'Full meal + snack + beverage', vegNonVeg: 'veg', type: 'lunch', basePrice: 240, items: ['Full Combo'], selected: false, quantity: 1, selectedItem: 'Full Combo' },
];

const cuisineTabs: { key: CuisineKey; label: string; emoji: string }[] = [
  { key: 'indian', label: 'Indian', emoji: '🍛' },
  { key: 'chinese', label: 'Chinese', emoji: '🥡' },
  { key: 'continental', label: 'Continental', emoji: '🍝' },
  { key: 'custom', label: 'Custom', emoji: '🍱' },
];

const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function VegBadge({ type }: { type: VegType }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border',
      type === 'veg'
        ? 'border-success text-success'
        : 'border-destructive text-destructive',
    )}>
      <span className={cn('w-2 h-2 rounded-full', type === 'veg' ? 'bg-success' : 'bg-destructive')} />
      {type === 'veg' ? 'VEG' : 'N-VEG'}
    </span>
  );
}

function TypeBadge({ type }: { type: MealType }) {
  const map: Record<MealType, string> = {
    breakfast: 'bg-warning/10 text-warning',
    lunch: 'bg-info/10 text-info',
    dinner: 'bg-primary/10 text-primary',
  };
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', map[type])}>
      {type}
    </span>
  );
}

interface MealCardProps {
  meal: MealCard;
  onToggle: () => void;
  onQtyChange: (delta: number) => void;
  onItemChange: (v: string) => void;
  onTypeChange: (v: MealType) => void;
}

function MealCardComponent({ meal, onToggle, onQtyChange, onItemChange, onTypeChange }: MealCardProps) {
  const info = kitchenMap[meal.cuisine];
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-card transition-all duration-200 cursor-pointer group',
        meal.selected
          ? 'border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.15)] shadow-lg'
          : 'border-border hover:shadow-md hover:-translate-y-0.5',
      )}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className={cn(
        'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
        meal.selected ? 'border-primary bg-primary' : 'border-border bg-background group-hover:border-primary/50',
      )}>
        {meal.selected && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2 pr-6 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-card-foreground leading-tight">{meal.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{meal.description}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <VegBadge type={meal.vegNonVeg} />
          <TypeBadge type={meal.type} />
        </div>

        {/* Price & Kitchen */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">₹{meal.basePrice}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{info.kitchen}</span>
        </div>

        {/* Expanded controls when selected */}
        {meal.selected && (
          <div
            className="mt-3 pt-3 border-t border-border space-y-2"
            onClick={e => e.stopPropagation()}
          >
            {/* Item select */}
            {meal.items.length > 1 && (
              <Select value={meal.selectedItem} onValueChange={onItemChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {meal.items.map(item => (
                    <SelectItem key={item} value={item} className="text-xs">{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Meal type */}
            <Select value={meal.type} onValueChange={v => onTypeChange(v as MealType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast" className="text-xs">Breakfast</SelectItem>
                <SelectItem value="lunch" className="text-xs">Lunch</SelectItem>
                <SelectItem value="dinner" className="text-xs">Dinner</SelectItem>
              </SelectContent>
            </Select>

            {/* Quantity stepper */}
            <div className="flex items-center justify-between bg-muted rounded-lg px-2 py-1">
              <span className="text-xs text-muted-foreground">Qty</span>
              <div className="flex items-center gap-2">
                <button
                  className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:border-primary transition-colors"
                  onClick={() => onQtyChange(-1)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{meal.quantity}</span>
                <button
                  className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:border-primary transition-colors"
                  onClick={() => onQtyChange(1)}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderSettings() {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [mode, setMode] = useState<ModeKey>('individual');
  const [activeCuisine, setActiveCuisine] = useState<CuisineKey>('indian');
  const [meals, setMeals] = useState<MealCard[]>(initialMeals);
  const [combos, setCombos] = useState<MealCard[]>(comboMeals);
  const [saving, setSaving] = useState(false);

  const currentList = mode === 'individual' ? meals : combos;
  const setCurrentList = mode === 'individual' ? setMeals : setCombos;

  const visibleMeals = currentList.filter(m => m.cuisine === activeCuisine);
  const selectedMeals = currentList.filter(m => m.selected);

  const totalQty = selectedMeals.reduce((s, m) => s + m.quantity, 0);
  const totalCost = selectedMeals.reduce((s, m) => s + m.quantity * m.basePrice, 0);

  const updateMeal = (id: string, patch: Partial<MealCard>) => {
    setCurrentList(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const toggleMeal = (id: string) => {
    setCurrentList(prev => prev.map(m =>
      m.id === id ? { ...m, selected: !m.selected, quantity: !m.selected ? 1 : m.quantity } : m
    ));
  };

  const handleQty = (id: string, delta: number) => {
    setCurrentList(prev => prev.map(m =>
      m.id === id ? { ...m, quantity: Math.max(1, m.quantity + delta) } : m
    ));
  };

  const removeFromSummary = (id: string) => updateMeal(id, { selected: false });

  const handleConfirm = async () => {
    if (selectedMeals.length === 0) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast({
      title: '🎉 Order Scheduled!',
      description: `${selectedMeals.length} meal(s) for ${format(selectedDate, 'dd MMM yyyy')}. Kitchen & Super Admin notified.`,
    });
    setMeals(initialMeals);
    setCombos(comboMeals);
  };

  // Group selected meals by cuisine for summary
  const groupedSummary = useMemo(() => {
    const groups: Record<string, MealCard[]> = {};
    selectedMeals.forEach(m => {
      if (!groups[m.cuisine]) groups[m.cuisine] = [];
      groups[m.cuisine].push(m);
    });
    return groups;
  }, [selectedMeals]);

  const selectedCuisines = [...new Set(selectedMeals.map(m => m.cuisine))];

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-5 border-b border-border">
        {/* Left: title + badge */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Order Settings</h1>
            <p className="text-xs text-muted-foreground">Schedule meals for your team</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs font-medium">TekMeals Inc.</Badge>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* City */}
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Date picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 text-xs gap-2 px-3">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {format(selectedDate, 'dd MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>

          {/* Enable ordering toggle */}
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-card">
            <span className="text-xs font-medium text-muted-foreground">Ordering</span>
            <Switch checked={orderingEnabled} onCheckedChange={setOrderingEnabled} />
          </div>

          {/* Save */}
          <Button
            className="h-9 px-4 text-xs font-semibold"
            onClick={handleConfirm}
            disabled={selectedMeals.length === 0 || saving || !orderingEnabled}
          >
            {saving ? 'Saving…' : 'Confirm Order'}
          </Button>
        </div>
      </div>

      {/* ── Main 2-col layout ──────────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0 items-start">

        {/* ── LEFT: Meal Configuration (70%) ─────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Mode segmented control */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
            {(['individual', 'combo'] as ModeKey[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                  mode === m
                    ? 'bg-card shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'individual' ? 'Individual Meals' : 'Combo Meals'}
              </button>
            ))}
          </div>

          {/* Cuisine pill tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {cuisineTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCuisine(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  activeCuisine === tab.key
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-card',
                )}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {currentList.filter(m => m.cuisine === tab.key && m.selected).length > 0 && (
                  <span className={cn(
                    'ml-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold',
                    activeCuisine === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground',
                  )}>
                    {currentList.filter(m => m.cuisine === tab.key && m.selected).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Meal grid */}
          {visibleMeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {visibleMeals.map(meal => (
                <MealCardComponent
                  key={meal.id}
                  meal={meal}
                  onToggle={() => toggleMeal(meal.id)}
                  onQtyChange={delta => handleQty(meal.id, delta)}
                  onItemChange={v => updateMeal(meal.id, { selectedItem: v })}
                  onTypeChange={v => updateMeal(meal.id, { type: v })}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-muted/30">
              <Utensils className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No meals in this category</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try another cuisine tab</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky Summary Panel (30%) ──────────────────────── */}
        <div className="w-72 xl:w-80 shrink-0 sticky top-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Order Summary</span>
              {selectedMeals.length > 0 && (
                <Badge className="ml-auto text-[10px] h-5">{selectedMeals.length}</Badge>
              )}
            </div>

            {/* Summary body */}
            <div className="p-4 space-y-3">

              {/* Date & city meta */}
              <div className="rounded-lg bg-muted/50 px-3 py-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{format(selectedDate, 'dd MMM yyyy (EEE)')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium text-foreground">{selectedCity}</span>
                </div>
              </div>

              {/* Selected meals or empty state */}
              {selectedMeals.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No meals selected</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">Click cards to add meals</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedSummary).map(([cuisine, items]) => (
                    <div key={cuisine}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1 capitalize">
                        {cuisineTabs.find(t => t.key === cuisine)?.emoji} {cuisine}
                      </p>
                      <div className="space-y-1">
                        {items.map(meal => (
                          <div key={meal.id} className="flex items-center gap-2 text-xs">
                            <VegBadge type={meal.vegNonVeg} />
                            <span className="flex-1 text-foreground truncate">{meal.name}</span>
                            <span className="text-muted-foreground shrink-0">×{meal.quantity}</span>
                            <span className="text-primary font-semibold shrink-0">₹{meal.basePrice * meal.quantity}</span>
                            <button
                              onClick={() => removeFromSummary(meal.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedMeals.length > 0 && (
                <>
                  <Separator />

                  {/* Kitchen assignments */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Kitchens</p>
                    {selectedCuisines.map(c => {
                      const info = kitchenMap[c as CuisineKey];
                      return (
                        <div key={c} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{info.kitchen}</span>
                          <span className="text-foreground font-medium">{info.restaurant}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Qty</span>
                      <span className="font-semibold text-foreground">{totalQty} meals</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">Estimated Cost</span>
                      <span className="text-primary">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CTA footer */}
            <div className="px-4 pb-4">
              <Button
                className="w-full h-9 text-xs font-semibold"
                disabled={selectedMeals.length === 0 || saving || !orderingEnabled}
                onClick={handleConfirm}
              >
                {saving ? 'Confirming…' : selectedMeals.length === 0 ? 'Select meals to confirm' : `Confirm ${selectedMeals.length} Meal${selectedMeals.length > 1 ? 's' : ''}`}
              </Button>
              {!orderingEnabled && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Enable ordering toggle to confirm
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
