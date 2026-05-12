import { useMemo, useState } from "react";
import { ArrowRight, Award, Dog, Cat, Cookie, Drumstick, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AMAZON_TAG = "YOUR_AMAZON_ID";
const amazonUrl = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
const chewyUrl = (q: string) =>
  `https://www.chewy.com/s?rh=c%3A288&query=${encodeURIComponent(q)}`;

type Category = "dog-food" | "cat-food" | "dog-treats" | "cat-treats";
type Product = {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price: number; // USD lowest known
  ingredient: string; // 주원료
  store: "Amazon" | "Chewy";
  query: string;
};

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
  { id: "dog-food", label: "강아지 사료", icon: Dog },
  { id: "cat-food", label: "고양이 사료", icon: Cat },
  { id: "dog-treats", label: "강아지 간식", icon: Drumstick },
  { id: "cat-treats", label: "고양이 간식", icon: Cookie },
];

const PRODUCTS: Product[] = [
  // Dog food
  { id: "df1", category: "dog-food", brand: "Blue Buffalo", name: "Life Protection Adult Chicken", price: 59.99, ingredient: "닭고기", store: "Amazon", query: "Blue Buffalo Life Protection Adult Chicken" },
  { id: "df2", category: "dog-food", brand: "Hill's Science Diet", name: "Adult Perfect Weight", price: 64.99, ingredient: "닭고기", store: "Amazon", query: "Hill's Science Diet Perfect Weight Adult Dog" },
  { id: "df3", category: "dog-food", brand: "Purina Pro Plan", name: "Sensitive Skin & Stomach Salmon", price: 74.99, ingredient: "연어", store: "Chewy", query: "Purina Pro Plan Sensitive Skin Stomach Salmon Dog" },
  { id: "df4", category: "dog-food", brand: "Wellness CORE", name: "Grain Free Original Turkey", price: 69.99, ingredient: "칠면조", store: "Amazon", query: "Wellness CORE Grain Free Original Turkey Dog" },
  { id: "df5", category: "dog-food", brand: "Royal Canin", name: "Mobility Support Formula", price: 79.99, ingredient: "닭고기", store: "Chewy", query: "Royal Canin Mobility Dog" },

  // Cat food
  { id: "cf1", category: "cat-food", brand: "Purina ONE", name: "Indoor Advantage Adult", price: 26.99, ingredient: "닭고기", store: "Amazon", query: "Purina ONE Indoor Advantage Cat" },
  { id: "cf2", category: "cat-food", brand: "Hill's Science Diet", name: "Adult Indoor Chicken", price: 39.99, ingredient: "닭고기", store: "Amazon", query: "Hill's Science Diet Adult Indoor Cat Chicken" },
  { id: "cf3", category: "cat-food", brand: "Blue Buffalo", name: "Wilderness Indoor Chicken", price: 44.99, ingredient: "닭고기", store: "Chewy", query: "Blue Buffalo Wilderness Indoor Chicken Cat" },
  { id: "cf4", category: "cat-food", brand: "Wellness CORE", name: "Grain Free Salmon Recipe", price: 49.99, ingredient: "연어", store: "Amazon", query: "Wellness CORE Grain Free Salmon Cat" },

  // Dog treats
  { id: "dt1", category: "dog-treats", brand: "Milk-Bone", name: "Original Biscuits", price: 9.99, ingredient: "곡물", store: "Amazon", query: "Milk-Bone Original Biscuits Dog Treats" },
  { id: "dt2", category: "dog-treats", brand: "Greenies", name: "Original Dental Treats", price: 24.99, ingredient: "곡물 + 민트", store: "Chewy", query: "Greenies Original Dental Dog Treats" },
  { id: "dt3", category: "dog-treats", brand: "Blue Buffalo", name: "Health Bars Bacon Egg Cheese", price: 6.49, ingredient: "베이컨", store: "Amazon", query: "Blue Buffalo Health Bars Bacon Egg Cheese" },
  { id: "dt4", category: "dog-treats", brand: "Zuke's", name: "Mini Naturals Chicken", price: 12.99, ingredient: "닭고기", store: "Chewy", query: "Zuke's Mini Naturals Chicken Dog Treats" },

  // Cat treats
  { id: "ct1", category: "cat-treats", brand: "Temptations", name: "Classic Tasty Chicken", price: 4.99, ingredient: "닭고기", store: "Amazon", query: "Temptations Classic Tasty Chicken Cat Treats" },
  { id: "ct2", category: "cat-treats", brand: "Greenies", name: "Feline Dental Treats Salmon", price: 7.49, ingredient: "연어", store: "Chewy", query: "Greenies Feline Dental Treats Salmon" },
  { id: "ct3", category: "cat-treats", brand: "Churu", name: "Lickable Tuna Recipe", price: 10.99, ingredient: "참치", store: "Amazon", query: "Churu Lickable Tuna Cat Treats" },
];

type SortKey = "price-asc" | "price-desc" | "brand";

export function CategoryPriceTable({ petTypes = ["dog", "cat"] }: { petTypes?: ("dog" | "cat")[] } = {}) {
  const allowed = useMemo(() => {
    const set = new Set<Category>();
    if (petTypes.includes("dog")) {
      set.add("dog-food");
      set.add("dog-treats");
    }
    if (petTypes.includes("cat")) {
      set.add("cat-food");
      set.add("cat-treats");
    }
    return set;
  }, [petTypes]);
  const visibleCategories = CATEGORIES.filter((c) => allowed.has(c.id));
  const [active, setActive] = useState<Category>(visibleCategories[0]?.id ?? "dog-food");
  if (!allowed.has(active) && visibleCategories[0]) {
    // keep active in sync if pet types change
    setTimeout(() => setActive(visibleCategories[0].id), 0);
  }
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [ingredientFilter, setIngredientFilter] = useState<string>("all");

  const products = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.category === active);
    if (brandFilter !== "all") list = list.filter((p) => p.brand === brandFilter);
    if (ingredientFilter !== "all") list = list.filter((p) => p.ingredient === ingredientFilter);
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "brand":
        list = [...list].sort((a, b) => a.brand.localeCompare(b.brand));
        break;
    }
    return list;
  }, [active, sort, brandFilter, ingredientFilter]);

  const brands = useMemo(
    () => Array.from(new Set(PRODUCTS.filter((p) => p.category === active).map((p) => p.brand))),
    [active],
  );
  const ingredients = useMemo(
    () => Array.from(new Set(PRODUCTS.filter((p) => p.category === active).map((p) => p.ingredient))),
    [active],
  );

  const cheapest = products[0];

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-foreground px-3 py-1 text-xs font-medium mb-3">
            무료 카테고리 가격 비교
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            카테고리별 인기 브랜드 최저가
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            가격 · 브랜드 · 원료로 필터링하고 바로 구매하세요.
          </p>
        </div>

        {/* Category tabs */}
        <div className={`grid grid-cols-2 ${visibleCategories.length >= 4 ? "sm:grid-cols-4" : `sm:grid-cols-${visibleCategories.length}`} gap-2 mb-5`}>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c.id);
                setBrandFilter("all");
                setIngredientFilter("all");
              }}
              className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition-all ${
                active === c.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <c.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">정렬</span>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">가격 낮은 순</SelectItem>
                <SelectItem value="price-desc">가격 높은 순</SelectItem>
                <SelectItem value="brand">브랜드명</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">브랜드</span>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-9 w-[160px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">원료</span>
            <Select value={ingredientFilter} onValueChange={setIngredientFilter}>
              <SelectTrigger className="h-9 w-[140px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {ingredients.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.3fr_1fr_0.8fr_0.7fr_auto] gap-3 px-4 py-3 bg-secondary/40 text-xs font-medium text-muted-foreground">
            <div>제품</div>
            <div>브랜드</div>
            <div>원료</div>
            <div>가격</div>
            <div>구매</div>
          </div>
          <div className="divide-y divide-border">
            {products.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">
                조건에 맞는 제품이 없어요.
              </div>
            )}
            {products.map((p) => {
              const url = p.store === "Amazon" ? amazonUrl(p.query) : chewyUrl(p.query);
              const isCheapest = cheapest && p.id === cheapest.id;
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.3fr_1fr_0.8fr_0.7fr_auto] gap-3 px-4 py-3 items-center text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {p.name}
                      {isCheapest && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-success text-white">
                          <Award className="h-3 w-3" />
                          최저가
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground sm:hidden mt-0.5">
                      {p.brand} · {p.ingredient}
                    </div>
                  </div>
                  <div className="hidden sm:block text-muted-foreground">{p.brand}</div>
                  <div className="hidden sm:block text-muted-foreground">{p.ingredient}</div>
                  <div className="hidden sm:block font-semibold text-primary">
                    ${p.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="sm:hidden font-semibold text-primary">
                      ${p.price.toFixed(2)}
                    </span>
                    <a href={url} target="_blank" rel="noopener noreferrer sponsored">
                      <Button size="sm" variant="outline" className="rounded-full">
                        {p.store}
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
