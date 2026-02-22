import { useState, useMemo } from 'react';
import { Search, ToggleLeft, Utensils, UtensilsCrossed, BookOpen, ChefHat, Info, CalendarIcon, Plus, Trash2, Minus, Pencil, Calendar as CalendarIconLucide } from 'lucide-react';
import { format, isSameDay, startOfWeek, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
type MealTime = 'Breakfast' | 'Lunch' | 'Dinner';
type VegType = 'veg' | 'non-veg';
type CuisineKey = 'indian' | 'chinese' | 'continental';
type ModeKey = 'individual' | 'combo';
type ScheduleMode = 'monthly' | 'custom' | 'weekly';
type MealType = 'individual' | 'combo';
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Meal {
  id: string;
  name: string;
  description: string;
  vegType: VegType;
  mealTimes: MealTime[];
  mealType: MealType;
  cuisine: CuisineKey;
  price: number;
  kitchen: string;
  restaurant: string;
  enabled: boolean;
  featured: boolean;
  quantityLimit: number | null;
  comboItems?: { mealId: string; qty: number }[];
}

// ─── Standalone Individual Meal Data ──────────────────────────────────────────
const allIndividualMeals: Meal[] = [
  // Indian
  { id: 'ind-roti', name: 'Roti', description: 'Freshly made wheat roti', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 10, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-dal', name: 'Dal', description: 'Yellow dal tadka', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 40, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-rice', name: 'Steamed Rice', description: 'Plain basmati rice', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 30, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-paneer', name: 'Paneer Bhaji', description: 'Paneer cooked in rich gravy', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 70, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-salad', name: 'Salad', description: 'Fresh mixed salad', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 20, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-chaas', name: 'Chaas', description: 'Buttermilk with spices', vegType: 'veg', mealTimes: ['Lunch'], mealType: 'individual', cuisine: 'indian', price: 15, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: false, quantityLimit: null },
  { id: 'ind-sweet', name: 'Sweet / Dessert', description: 'Daily special dessert', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 25, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-chicken', name: 'Chicken Curry', description: 'Rich chicken curry', vegType: 'non-veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'indian', price: 90, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: 50 },
  { id: 'ind-egg', name: 'Egg Bhurji', description: 'Scrambled eggs Indian style', vegType: 'non-veg', mealTimes: ['Breakfast'], mealType: 'individual', cuisine: 'indian', price: 40, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: false, quantityLimit: null },
  { id: 'ind-idli', name: 'Idli (2 pcs)', description: 'Steamed rice cakes with sambar', vegType: 'veg', mealTimes: ['Breakfast'], mealType: 'individual', cuisine: 'indian', price: 35, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-paratha', name: 'Aloo Paratha', description: 'Stuffed potato paratha', vegType: 'veg', mealTimes: ['Breakfast'], mealType: 'individual', cuisine: 'indian', price: 40, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null },
  { id: 'ind-mutton', name: 'Mutton Rogan Josh', description: 'Slow-cooked mutton in spices', vegType: 'non-veg', mealTimes: ['Dinner'], mealType: 'individual', cuisine: 'indian', price: 120, kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: false, featured: true, quantityLimit: 30 },

  // Chinese
  { id: 'ch-friedrice', name: 'Veg Fried Rice', description: 'Classic Chinese fried rice', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'chinese', price: 60, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: false, quantityLimit: null },
  { id: 'ch-noodles', name: 'Hakka Noodles', description: 'Stir-fried hakka noodles', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'chinese', price: 65, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: false, quantityLimit: null },
  { id: 'ch-manchurian', name: 'Veg Manchurian', description: 'Fried veggie balls in sauce', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'chinese', price: 55, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: false, quantityLimit: null },
  { id: 'ch-momos', name: 'Steam Momos (6 pcs)', description: 'Steamed dumplings', vegType: 'veg', mealTimes: ['Breakfast', 'Lunch'], mealType: 'individual', cuisine: 'chinese', price: 50, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: true, quantityLimit: null },
  { id: 'ch-soup', name: 'Hot & Sour Soup', description: 'Classic Chinese soup', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'chinese', price: 40, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: null },
  { id: 'ch-chilli-chicken', name: 'Chilli Chicken', description: 'Spicy fried chicken', vegType: 'non-veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'chinese', price: 80, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: null },
  { id: 'ch-spring-roll', name: 'Spring Roll (4 pcs)', description: 'Crispy vegetable rolls', vegType: 'veg', mealTimes: ['Breakfast', 'Lunch'], mealType: 'individual', cuisine: 'chinese', price: 45, kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: true, featured: false, quantityLimit: null },

  // Continental
  { id: 'co-pasta', name: 'Creamy Pasta', description: 'White sauce penne pasta', vegType: 'veg', mealTimes: ['Lunch'], mealType: 'individual', cuisine: 'continental', price: 75, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: false, quantityLimit: null },
  { id: 'co-garlic-bread', name: 'Garlic Bread (4 pcs)', description: 'Toasted garlic bread', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'continental', price: 40, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: false, quantityLimit: null },
  { id: 'co-side-salad', name: 'Side Salad', description: 'Caesar or garden salad', vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'continental', price: 35, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: false, quantityLimit: null },
  { id: 'co-grilled-chicken', name: 'Grilled Chicken', description: 'Herb grilled chicken breast', vegType: 'non-veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'individual', cuisine: 'continental', price: 100, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: true, quantityLimit: 35 },
  { id: 'co-toast', name: 'Toast & Eggs', description: 'Buttered toast with scrambled eggs', vegType: 'non-veg', mealTimes: ['Breakfast'], mealType: 'individual', cuisine: 'continental', price: 50, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: false, featured: false, quantityLimit: null },
  { id: 'co-fruit-plate', name: 'Fruit Plate', description: 'Fresh seasonal fruits', vegType: 'veg', mealTimes: ['Breakfast'], mealType: 'individual', cuisine: 'continental', price: 45, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: false, featured: false, quantityLimit: null },
  { id: 'co-juice', name: 'Fresh Juice', description: 'Orange or mixed fruit juice', vegType: 'veg', mealTimes: ['Breakfast', 'Lunch'], mealType: 'individual', cuisine: 'continental', price: 30, kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: false, quantityLimit: null },
];

// ─── Default Combo Meals ──────────────────────────────────────────────────────
const defaultComboMeals: Meal[] = [
  {
    id: 'combo-1', name: 'Executive Lunch Combo', description: 'Roti x2, Dal, Rice, Paneer Bhaji, Salad, Sweet',
    vegType: 'veg', mealTimes: ['Lunch'], mealType: 'combo', cuisine: 'indian', price: 180,
    kitchen: 'Spice Garden', restaurant: 'Desi Flavors', enabled: true, featured: false, quantityLimit: null,
    comboItems: [
      { mealId: 'ind-roti', qty: 2 }, { mealId: 'ind-dal', qty: 1 }, { mealId: 'ind-rice', qty: 1 },
      { mealId: 'ind-paneer', qty: 1 }, { mealId: 'ind-salad', qty: 1 }, { mealId: 'ind-sweet', qty: 1 },
    ],
  },
  {
    id: 'combo-2', name: 'Dragon Power Combo', description: 'Fried Rice, Noodles, Manchurian, Soup',
    vegType: 'veg', mealTimes: ['Lunch'], mealType: 'combo', cuisine: 'chinese', price: 220,
    kitchen: 'Dragon Kitchen', restaurant: 'China Bowl', enabled: false, featured: false, quantityLimit: null,
    comboItems: [
      { mealId: 'ch-friedrice', qty: 1 }, { mealId: 'ch-noodles', qty: 1 },
      { mealId: 'ch-manchurian', qty: 1 }, { mealId: 'ch-soup', qty: 1 },
    ],
  },
  {
    id: 'combo-3', name: 'Euro Combo Platter', description: 'Pasta, Salad, Garlic Bread, Juice',
    vegType: 'veg', mealTimes: ['Lunch', 'Dinner'], mealType: 'combo', cuisine: 'continental', price: 180,
    kitchen: 'Euro Bistro', restaurant: 'The Continental', enabled: true, featured: true, quantityLimit: 25,
    comboItems: [
      { mealId: 'co-pasta', qty: 1 }, { mealId: 'co-side-salad', qty: 1 },
      { mealId: 'co-garlic-bread', qty: 1 }, { mealId: 'co-juice', qty: 1 },
    ],
  },
];

const cuisineTabs: { key: CuisineKey; label: string; emoji: string }[] = [
  { key: 'indian', label: 'Indian', emoji: '🍛' },
  { key: 'chinese', label: 'Chinese', emoji: '🥡' },
  { key: 'continental', label: 'Continental', emoji: '🍝' },
];

const allMealTimes: MealTime[] = ['Breakfast', 'Lunch', 'Dinner'];
const allDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mealTimeFilters: { key: MealTime | 'all'; label: string }[] = [
  { key: 'all', label: 'All Times' },
  { key: 'Breakfast', label: 'Breakfast' },
  { key: 'Lunch', label: 'Lunch' },
  { key: 'Dinner', label: 'Dinner' },
];

// Mock day-wise meal schedule
const defaultDayWiseMeals: Record<DayOfWeek, string[]> = {
  Monday: ['ind-roti', 'ind-dal', 'ind-rice', 'ind-paneer', 'ind-salad', 'ind-sweet', 'combo-1'],
  Tuesday: ['ind-roti', 'ind-dal', 'ind-rice', 'ind-chicken', 'ind-salad', 'ch-friedrice', 'ch-noodles', 'combo-2'],
  Wednesday: ['ind-roti', 'ind-dal', 'ind-rice', 'ind-paneer', 'co-pasta', 'co-garlic-bread', 'combo-3'],
  Thursday: ['ind-roti', 'ind-dal', 'ind-rice', 'ind-mutton', 'ch-manchurian', 'ch-momos', 'combo-1'],
  Friday: ['ind-roti', 'ind-dal', 'ind-rice', 'ind-paneer', 'ind-sweet', 'co-grilled-chicken', 'combo-3'],
  Saturday: ['ind-idli', 'ind-paratha', 'ind-egg', 'ch-momos', 'ch-spring-roll'],
  Sunday: ['ind-idli', 'ind-paratha', 'co-toast', 'co-fruit-plate', 'co-juice'],
};

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

function MealTimeBadges({ times, editable, onChange }: { times: MealTime[]; editable?: boolean; onChange?: (times: MealTime[]) => void }) {
  const colorMap: Record<MealTime, string> = {
    Breakfast: 'bg-warning/10 text-warning border-warning/20',
    Lunch: 'bg-info/10 text-info border-info/20',
    Dinner: 'bg-primary/10 text-primary border-primary/20',
  };

  if (!editable) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {times.map(t => (
          <span key={t} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize', colorMap[t])}>
            {t}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {allMealTimes.map(t => {
        const isActive = times.includes(t);
        return (
          <button
            key={t}
            onClick={() => {
              if (!onChange) return;
              if (isActive) {
                if (times.length > 1) onChange(times.filter(x => x !== t));
              } else {
                onChange([...times, t]);
              }
            }}
            className={cn(
              'text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all',
              isActive
                ? colorMap[t] + ' ring-1 ring-offset-1 ring-current'
                : 'border-border text-muted-foreground bg-muted/30 hover:bg-muted',
            )}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

interface MealToggleCardProps {
  meal: Meal;
  onToggle: (id: string) => void;
  onMealTimesChange: (id: string, times: MealTime[]) => void;
  onQuantityLimitChange: (id: string, val: number | null) => void;
  individualMeals?: Meal[];
  onEdit?: (meal: Meal) => void;
}

function MealToggleCard({ meal, onToggle, onMealTimesChange, onQuantityLimitChange, individualMeals, onEdit }: MealToggleCardProps) {
  const [editingQty, setEditingQty] = useState(false);

  return (
    <div className={cn(
      'relative rounded-xl border bg-card transition-all duration-200 overflow-hidden',
      meal.enabled ? 'border-border shadow-sm' : 'border-border/50 opacity-60',
    )}>
      <div className={cn('h-1 w-full', meal.enabled ? 'bg-success' : 'bg-muted')} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-card-foreground leading-tight">{meal.name}</p>
              {meal.featured && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-semibold">Featured</Badge>
              )}
              {meal.mealType === 'combo' && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold text-primary border-primary/30">COMBO</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meal.description}</p>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Switch checked={meal.enabled} onCheckedChange={() => onToggle(meal.id)} className="data-[state=checked]:bg-success" />
            <span className={cn('text-[9px] font-semibold', meal.enabled ? 'text-success' : 'text-muted-foreground')}>
              {meal.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          <VegBadge type={meal.vegType} />
          {onEdit && meal.mealType === 'combo' && (
            <button
              onClick={() => onEdit(meal)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <Pencil className="w-2.5 h-2.5" /> Edit
            </button>
          )}
        </div>

        {/* Combo items breakdown */}
        {meal.mealType === 'combo' && meal.comboItems && individualMeals && (
          <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Includes:</p>
            <div className="flex flex-wrap gap-1">
              {meal.comboItems.map(ci => {
                const item = individualMeals.find(m => m.id === ci.mealId);
                return (
                  <span key={ci.mealId} className="text-[10px] bg-card border border-border rounded px-1.5 py-0.5 text-foreground">
                    {item?.name || ci.mealId} {ci.qty > 1 ? `x${ci.qty}` : ''}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Choosable meal times */}
        <div className="mt-3">
          <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Available for:</p>
          <MealTimeBadges times={meal.mealTimes} editable onChange={(times) => onMealTimesChange(meal.id, times)} />
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-primary">₹{meal.price}</p>
            <p className="text-[10px] text-muted-foreground">{meal.kitchen}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-muted-foreground font-medium">Qty Limit</span>
            {editingQty ? (
              <Input
                type="number" min={1} autoFocus
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
              <button onClick={() => setEditingQty(true)} className="text-xs font-semibold text-foreground hover:text-primary transition-colors">
                {meal.quantityLimit ? `${meal.quantityLimit} meals` : 'Unlimited'}
              </button>
            )}
          </div>
        </div>

        <div className={cn(
          'mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-xs',
          meal.enabled ? 'bg-success/8 border border-success/20' : 'bg-muted/50 border border-border',
        )}>
          {meal.enabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
              <span className="text-success font-medium">Visible to employees</span>
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

// ─── Create/Edit Combo Modal ─────────────────────────────────────────────────
function CreateComboModal({
  open,
  onClose,
  onSave,
  individualMeals,
  editingCombo,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (combo: Meal) => void;
  individualMeals: Meal[];
  editingCombo?: Meal | null;
}) {
  const [comboName, setComboName] = useState('');
  const [comboCuisine, setComboCuisine] = useState<CuisineKey>('indian');
  const [comboMealTime, setComboMealTime] = useState<MealTime[]>(['Lunch']);
  const [comboPrice, setComboPrice] = useState('');
  const [comboPriceMode, setComboPriceMode] = useState<'auto' | 'manual'>('auto');
  const [comboQtyLimit, setComboQtyLimit] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  // Populate when editing
  useState(() => {
    if (editingCombo) {
      setComboName(editingCombo.name);
      setComboCuisine(editingCombo.cuisine);
      setComboMealTime(editingCombo.mealTimes);
      setComboPrice(String(editingCombo.price));
      setComboQtyLimit(editingCombo.quantityLimit ? String(editingCombo.quantityLimit) : '');
      const items: Record<string, number> = {};
      editingCombo.comboItems?.forEach(ci => { items[ci.mealId] = ci.qty; });
      setSelectedItems(items);
      setComboPriceMode('manual');
    }
  });

  const vegItems = individualMeals.filter(m => m.cuisine === comboCuisine && m.vegType === 'veg');
  const nonVegItems = individualMeals.filter(m => m.cuisine === comboCuisine && m.vegType === 'non-veg');

  const toggleItem = (mealId: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[mealId]) {
        delete next[mealId];
      } else {
        next[mealId] = 1;
      }
      return next;
    });
  };

  const updateItemQty = (mealId: string, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[mealId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [mealId]: newQty };
    });
  };

  const autoTotal = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = individualMeals.find(m => m.id === id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  }, [selectedItems, individualMeals]);

  const finalPrice = comboPriceMode === 'auto' ? autoTotal : Number(comboPrice) || 0;
  const selectedCount = Object.keys(selectedItems).length;

  const handleSave = () => {
    if (!comboName || selectedCount < 2) return;
    const hasNonVeg = Object.keys(selectedItems).some(id => individualMeals.find(m => m.id === id)?.vegType === 'non-veg');
    const comboItems = Object.entries(selectedItems).map(([mealId, qty]) => ({ mealId, qty }));
    const itemNames = comboItems.map(ci => {
      const item = individualMeals.find(m => m.id === ci.mealId);
      return `${item?.name || ci.mealId}${ci.qty > 1 ? ` x${ci.qty}` : ''}`;
    }).join(', ');

    const newCombo: Meal = {
      id: editingCombo?.id || `combo-custom-${Date.now()}`,
      name: comboName,
      description: itemNames,
      vegType: hasNonVeg ? 'non-veg' : 'veg',
      mealTimes: comboMealTime,
      mealType: 'combo',
      cuisine: comboCuisine,
      price: finalPrice,
      kitchen: editingCombo?.kitchen || 'Custom Kitchen',
      restaurant: editingCombo?.restaurant || 'Custom',
      enabled: editingCombo?.enabled ?? true,
      featured: editingCombo?.featured ?? false,
      quantityLimit: comboQtyLimit ? Number(comboQtyLimit) : null,
      comboItems,
    };

    onSave(newCombo);
    setComboName(''); setComboCuisine('indian'); setComboMealTime(['Lunch']);
    setComboPrice(''); setComboPriceMode('auto'); setComboQtyLimit(''); setSelectedItems({});
    onClose();
  };

  const renderItemList = (items: Meal[], sectionLabel: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 pt-2">{sectionLabel}</p>
        {items.map(item => {
          const isSelected = !!selectedItems[item.id];
          const qty = selectedItems[item.id] || 0;
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-b-0 transition-colors',
                isSelected ? 'bg-primary/5' : 'hover:bg-muted/30',
              )}
            >
              <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(item.id)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <VegBadge type={item.vegType} />
                </div>
                <span className="text-[11px] text-muted-foreground">{item.description}</span>
              </div>
              <span className="text-xs font-semibold text-primary shrink-0">₹{item.price}</span>
              {isSelected && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateItemQty(item.id, -1)}
                    className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{qty}</span>
                  <button
                    onClick={() => updateItemQty(item.id, 1)}
                    className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCombo ? 'Edit Combo Meal' : 'Create Custom Combo'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Combo Name <span className="text-destructive">*</span></Label>
            <Input value={comboName} onChange={e => setComboName(e.target.value)} placeholder="e.g. Executive Lunch Combo" />
          </div>

          <div className="space-y-2">
            <Label>Select Cuisine (to pick items from)</Label>
            <div className="flex gap-2 flex-wrap">
              {cuisineTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setComboCuisine(tab.key); setSelectedItems({}); }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    comboCuisine === tab.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 bg-card',
                  )}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Items <span className="text-destructive">*</span> <span className="text-muted-foreground text-xs font-normal">(min 2)</span></Label>
            <div className="border border-border rounded-xl max-h-60 overflow-y-auto">
              {vegItems.length === 0 && nonVegItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No individual items found for this cuisine</p>
              ) : (
                <>
                  {renderItemList(vegItems, '🟢 Veg Items')}
                  {renderItemList(nonVegItems, '🔴 Non-Veg Items')}
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meal Time</Label>
            <MealTimeBadges times={comboMealTime} editable onChange={setComboMealTime} />
          </div>

          <div className="space-y-2">
            <Label>Combo Price</Label>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setComboPriceMode('auto')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  comboPriceMode === 'auto' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground bg-card',
                )}
              >
                Auto (sum of items)
              </button>
              <button
                onClick={() => setComboPriceMode('manual')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  comboPriceMode === 'manual' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground bg-card',
                )}
              >
                Manual price
              </button>
            </div>
            {comboPriceMode === 'auto' ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
                <span className="text-xs text-muted-foreground">Calculated total:</span>
                <span className="text-sm font-bold text-primary">₹{autoTotal}</span>
              </div>
            ) : (
              <Input type="number" value={comboPrice} onChange={e => setComboPrice(e.target.value)} placeholder="₹0" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Daily Quantity Limit (optional)</Label>
            <Input type="number" value={comboQtyLimit} onChange={e => setComboQtyLimit(e.target.value)} placeholder="Leave empty for unlimited" />
          </div>

          {selectedCount > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">Combo Summary</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedItems).map(([id, qty]) => {
                  const item = individualMeals.find(m => m.id === id);
                  return (
                    <Badge key={id} variant="outline" className="text-[10px]">
                      {item?.name} {qty > 1 ? `x${qty}` : ''}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{selectedCount} items selected</span>
                <span className="font-bold text-primary">Total: ₹{finalPrice}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!comboName || selectedCount < 2}>
            {editingCombo ? 'Save Changes' : 'Create Combo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        { label: 'Enabled', value: enabled, color: 'text-success' },
        { label: 'Disabled', value: disabled, color: 'text-destructive' },
        { label: 'Veg Items', value: veg, color: 'text-success' },
      ].map(s => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Day-Wise Meals View ──────────────────────────────────────────────────────
function DayWiseMealsView({ individualMeals, comboMeals }: { individualMeals: Meal[]; comboMeals: Meal[] }) {
  const allMealItems = [...individualMeals, ...comboMeals];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-info/5 border border-info/20">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info/90 leading-relaxed">
          <strong>Day-wise Meal Schedule:</strong> This shows meals set by super admin for each day of the week for your company. Working days are based on company configuration.
        </p>
      </div>
      <div className="space-y-3">
        {allDays.map(day => {
          const mealIds = defaultDayWiseMeals[day] || [];
          const meals = mealIds.map(id => allMealItems.find(m => m.id === id)).filter(Boolean) as Meal[];
          const isWeekend = day === 'Saturday' || day === 'Sunday';
          return (
            <Card key={day} className={cn(isWeekend && 'opacity-70')}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {day}
                    {isWeekend && <Badge variant="secondary" className="text-[9px]">Weekend</Badge>}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">{meals.length} meals</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                {meals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No meals scheduled</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {meals.map(meal => (
                      <span
                        key={meal.id}
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border',
                          meal.mealType === 'combo'
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : meal.vegType === 'veg'
                              ? 'bg-success/5 border-success/20 text-success'
                              : 'bg-destructive/5 border-destructive/20 text-destructive',
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', meal.vegType === 'veg' ? 'bg-success' : 'bg-destructive')} />
                        {meal.name}
                        {meal.mealType === 'combo' && ' 🎁'}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
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
  const [activeView, setActiveView] = useState<'meals' | 'daywise'>('meals');

  // Calendar & schedule
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDates, setCustomDates] = useState<Date[]>([]);

  // Modals
  const [showComboModal, setShowComboModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Meal | null>(null);

  const [individualMeals, setIndividualMeals] = useState<Meal[]>(allIndividualMeals);
  const [comboMealsList, setComboMealsList] = useState<Meal[]>(defaultComboMeals);

  const currentMeals = useMemo(() => {
    if (mode === 'individual') {
      return individualMeals;
    } else {
      return comboMealsList;
    }
  }, [mode, individualMeals, comboMealsList]);

  // Filter visible meals
  const visibleMeals = useMemo(() => {
    return currentMeals.filter(m => {
      if (m.cuisine !== activeCuisine) return false;
      if (activeMealTime !== 'all' && !m.mealTimes.includes(activeMealTime)) return false;
      if (vegFilter !== 'all' && m.vegType !== vegFilter) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [currentMeals, activeCuisine, activeMealTime, vegFilter, search]);

  const stats = useMemo(() => currentMeals, [currentMeals]);

  const toggleMeal = (id: string) => {
    if (mode === 'individual') {
      setIndividualMeals(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    } else {
      setComboMealsList(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    }
  };

  const changeMealTimes = (id: string, times: MealTime[]) => {
    if (mode === 'individual') {
      setIndividualMeals(prev => prev.map(m => m.id === id ? { ...m, mealTimes: times } : m));
    } else {
      setComboMealsList(prev => prev.map(m => m.id === id ? { ...m, mealTimes: times } : m));
    }
  };

  const setQtyLimit = (id: string, val: number | null) => {
    if (mode === 'individual') {
      setIndividualMeals(prev => prev.map(m => m.id === id ? { ...m, quantityLimit: val } : m));
    } else {
      setComboMealsList(prev => prev.map(m => m.id === id ? { ...m, quantityLimit: val } : m));
    }
  };

  const cuisineCounts = useMemo(() => {
    const counts: Record<CuisineKey, { total: number; enabled: number }> = {
      indian: { total: 0, enabled: 0 },
      chinese: { total: 0, enabled: 0 },
      continental: { total: 0, enabled: 0 },
    };
    const all = mode === 'individual' ? individualMeals : comboMealsList;
    all.forEach(m => {
      if (counts[m.cuisine]) {
        counts[m.cuisine].total++;
        if (m.enabled) counts[m.cuisine].enabled++;
      }
    });
    return counts;
  }, [mode, individualMeals, comboMealsList]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    const allMealsList = [...individualMeals, ...comboMealsList];
    const enabledCount = allMealsList.filter(m => m.enabled).length;
    const dateInfo = scheduleMode === 'monthly'
      ? `for ${format(selectedDate, 'MMMM yyyy')}`
      : scheduleMode === 'weekly'
        ? 'for selected week'
        : `for ${customDates.length} selected date(s)`;
    toast({
      title: '✅ Availability Saved',
      description: `${enabledCount} meal(s) are now visible to employees ${dateInfo}.`,
    });
  };

  const enableAll = () => {
    if (mode === 'individual') {
      setIndividualMeals(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: true } : m));
    } else {
      setComboMealsList(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: true } : m));
    }
  };

  const disableAll = () => {
    if (mode === 'individual') {
      setIndividualMeals(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: false } : m));
    } else {
      setComboMealsList(prev => prev.map(m => m.cuisine === activeCuisine ? { ...m, enabled: false } : m));
    }
  };

  const handleAddOrUpdateCombo = (combo: Meal) => {
    setComboMealsList(prev => {
      const existing = prev.findIndex(m => m.id === combo.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = combo;
        return updated;
      }
      return [...prev, combo];
    });
    toast({
      title: editingCombo ? '✏️ Combo updated!' : '🎁 Combo created!',
      description: `${combo.name} has been ${editingCombo ? 'updated' : 'added to combos'}.`,
    });
    setEditingCombo(null);
  };

  const handleEditCombo = (meal: Meal) => {
    setEditingCombo(meal);
    setShowComboModal(true);
  };

  const toggleCustomDate = (date: Date) => {
    setCustomDates(prev => {
      const exists = prev.some(d => isSameDay(d, date));
      if (exists) return prev.filter(d => !isSameDay(d, date));
      return [...prev, date];
    });
  };

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

      {/* ── View Toggle: Meals vs Day-wise ─────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        {([
          { key: 'meals' as const, label: '🍽 Meal Settings', },
          { key: 'daywise' as const, label: '📅 Day-wise Schedule', },
        ]).map(v => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-semibold transition-all',
              activeView === v.key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'daywise' ? (
        <DayWiseMealsView individualMeals={individualMeals} comboMeals={comboMealsList} />
      ) : (
        <>
          {/* ── Schedule Section ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              {(['monthly', 'weekly', 'custom'] as ScheduleMode[]).map(sm => (
                <button
                  key={sm}
                  onClick={() => setScheduleMode(sm)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                    scheduleMode === sm ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {sm === 'monthly' ? '📅 Monthly Default' : sm === 'weekly' ? '📆 Weekly' : '🎯 Custom Dates'}
                </button>
              ))}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {scheduleMode === 'monthly'
                    ? format(selectedDate, 'MMMM yyyy')
                    : scheduleMode === 'weekly'
                      ? `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM')}`
                      : customDates.length > 0
                        ? `${customDates.length} date(s) selected`
                        : 'Select dates'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {scheduleMode === 'monthly' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={d => d && setSelectedDate(d)}
                    className={cn("p-3 pointer-events-auto")}
                  />
                ) : scheduleMode === 'weekly' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={d => d && setSelectedDate(d)}
                    className={cn("p-3 pointer-events-auto")}
                  />
                ) : (
                  <Calendar
                    mode="multiple"
                    selected={customDates}
                    onSelect={(dates) => dates && setCustomDates(dates)}
                    className={cn("p-3 pointer-events-auto")}
                  />
                )}
              </PopoverContent>
            </Popover>

            {scheduleMode === 'weekly' && (
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: 7 }, (_, i) => {
                  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
                  const day = addDays(weekStart, i);
                  return (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {format(day, 'EEE dd')}
                    </Badge>
                  );
                })}
              </div>
            )}

            {scheduleMode === 'custom' && customDates.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {customDates.slice(0, 5).map(d => (
                  <Badge key={d.toISOString()} variant="outline" className="text-[10px] gap-1">
                    {format(d, 'dd MMM')}
                    <button onClick={() => toggleCustomDate(d)} className="hover:text-destructive">×</button>
                  </Badge>
                ))}
                {customDates.length > 5 && (
                  <Badge variant="secondary" className="text-[10px]">+{customDates.length - 5} more</Badge>
                )}
              </div>
            )}
          </div>

          {/* ── Info Banner ───────────────────────────────────────────────── */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-info/5 border border-info/20">
            <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <p className="text-xs text-info/90 leading-relaxed">
              <strong>How it works:</strong> Toggle meals ON to make them visible to employees.
              {mode === 'individual'
                ? ' Individual meals are standalone items employees can order one at a time.'
                : ' Combo meals bundle multiple items together. Use "Create Custom Combo" to build new combos from individual items.'
              }
              {' '}Employees can place only ONE order per meal time (Breakfast/Lunch/Dinner) — either an individual meal or a combo, not both.
            </p>
          </div>

          <StatsBar meals={stats} />

          {/* ── Mode Segmented Control ────────────────────────────────────── */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
            {(['individual', 'combo'] as ModeKey[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setActiveCuisine('indian'); setActiveMealTime('all'); setSearch(''); }}
                className={cn(
                  'px-5 py-2 rounded-lg text-xs font-semibold transition-all capitalize',
                  mode === m ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search meals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
                  {mealTimeFilters.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setActiveMealTime(f.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        activeMealTime === f.key ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <Select value={vegFilter} onValueChange={v => setVegFilter(v as typeof vegFilter)}>
                  <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                    <SelectItem value="veg" className="text-xs">🟢 Veg Only</SelectItem>
                    <SelectItem value="non-veg" className="text-xs">🔴 Non-Veg Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk actions */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  {visibleMeals.length} meal{visibleMeals.length !== 1 ? 's' : ''} shown
                  {' · '}
                  <span className="text-success">{visibleMeals.filter(m => m.enabled).length} enabled</span>
                  {' · '}
                  <span className="text-muted-foreground">{visibleMeals.filter(m => !m.enabled).length} disabled</span>
                </p>
                <div className="flex items-center gap-2">
                  {mode === 'combo' && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => { setEditingCombo(null); setShowComboModal(true); }}>
                      <Plus className="h-3 w-3 mr-1" /> Create Custom Combo
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={enableAll}>Enable All</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={disableAll}>Disable All</Button>
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
                      onMealTimesChange={changeMealTimes}
                      onQuantityLimitChange={setQtyLimit}
                      individualMeals={individualMeals}
                      onEdit={mode === 'combo' ? handleEditCombo : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                  <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No meals match filters</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
                  {mode === 'combo' && (
                    <Button size="sm" className="mt-4" onClick={() => { setEditingCombo(null); setShowComboModal(true); }}>
                      <Plus className="h-3 w-3 mr-1" /> Create Custom Combo
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Sticky Summary Panel */}
            <div className="w-64 xl:w-72 shrink-0 sticky top-4 space-y-3">

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

              {/* Schedule Info */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Schedule</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{scheduleMode}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Period</span>
                    <span className="text-foreground font-medium text-[11px]">
                      {scheduleMode === 'monthly'
                        ? format(selectedDate, 'MMM yyyy')
                        : scheduleMode === 'weekly'
                          ? `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd MMM')}`
                          : `${customDates.length} date(s)`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Rule Reminder */}
              <div className="rounded-xl border border-warning/30 bg-warning/5 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
                  <Info className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-foreground">Order Rule</span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Employees can place <strong className="text-foreground">only 1 order</strong> per meal time (B/L/D) — either an individual meal OR a combo, not both.
                  </p>
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
                    { icon: '🟢', text: 'Green = meal visible to employees' },
                    { icon: '⚫', text: 'Grey = meal hidden from app' },
                    { icon: '🍽', text: 'Individual = single standalone items' },
                    { icon: '🎁', text: 'Combo = bundled meal packages' },
                    { icon: '🕐', text: 'Click meal time pills to choose B/L/D' },
                    { icon: '📅', text: 'Use Monthly, Weekly, or Custom date scheduling' },
                    { icon: '💾', text: 'Click "Save Changes" to apply' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full h-9 text-xs font-semibold" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving Changes…' : '💾 Save Availability Settings'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Combo Builder Modal */}
      <CreateComboModal
        open={showComboModal}
        onClose={() => { setShowComboModal(false); setEditingCombo(null); }}
        onSave={handleAddOrUpdateCombo}
        individualMeals={individualMeals}
        editingCombo={editingCombo}
      />
    </div>
  );
}
