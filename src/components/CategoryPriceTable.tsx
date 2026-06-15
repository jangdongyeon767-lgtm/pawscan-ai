import { useMemo, useState } from "react";
import { ArrowRight, Award, Cat, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AMAZON_TAG = "mycatdogmarket-20";
const amazonUrl = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
const chewyUrl = (q: string) =>
  `https://www.chewy.com/s?rh=c%3A288&query=${encodeURIComponent(q)}`;

type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  ingredient: string;
  store: "Amazon" | "Chewy";
  query: string;
};

const PRODUCTS: Product[] = [
  { id: "cf1", brand: "Purina ONE", name: "Indoor Advantage Adult", price: 26.99, ingredient: "닭고기", store: "Amazon", query: "Purina ONE Indoor Advantage Cat" },
  { id: "cf2", brand: "Hill's Science Diet", name: "Adult Indoor Chicken", price: 39.99, ingredient: "닭고기", store: "Amazon", query: "Hill's Science Diet Adult Indoor Cat Chicken" },
  { id: "cf3", brand: "Blue Buffalo", name: "Wilderness Indoor Chicken", price: 44.99, ingredient: "닭고기", store: "Chewy", query: "Blue Buffalo Wilderness Indoor Chicken Cat" },
  { id: "cf4", brand: "Wellness CORE", name: "Grain Free Salmon Recipe", price: 49.99, ingredient: "연어", store: "Amazon", query: "Wellness CORE Grain Free Salmon Cat" },
  { id: "cf5", brand: "Royal Canin", name: "Indoor Adult Dry Cat Food", price: 42.99, ingredient: "닭고기", store: "Chewy", query: "Royal Canin Indoor Adult Cat" },
  { id: "cf6", brand: "Iams", name: "Proactive Health Indoor Weight & Hairball", price: 22.99, ingredient: "닭고기", store: "Amazon", query: "Iams Proactive Health Indoor Cat" },
  { id: "cf7", brand: "Hill's Science Diet", name: "Sensitive Stomach & Skin", price: 47.99, ingredient: "연어", store: "Chewy", query: "Hill's Science Diet Sensitive Stomach Cat" },
  { id: "cf8", brand: "Blue Buffalo", name: "Life Protection Adult Chicken", price: 32.99, ingredient: "닭고기", store: "Amazon", query: "Blue Buffalo Life Protection Adult Cat Chicken" },
];

type SortKey = "price-asc" | "price-desc" | "brand";

export function CategoryPriceTable() {
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [ingredientFilter, setIngredientFilter] = useState<string>("all");

  const products = useMemo(() => {
    let list = [...PRODUCTS];
    if (brandFilter !== "all") list = list.filter((p) => p.brand === brandFilter);
    if (ingredientFilter !== "all") list = list.filter((p) => p.ingredient === ingredientFilter);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "brand":
        list.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
    }
    return list;
  }, [sort, brandFilter, ingredientFilter]);

  const brands = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.brand))), []);
  const ingredients = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.ingredient))), []);

  const cheapest = products[0];

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-foreground px-3 py-1 text-xs font-medium mb-3">
            <Cat className="h-3.5 w-3.5 text-primary" />
            무료 · 고양이 사료 최저가 비교
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            고양이 사료 인기 브랜드 최저가
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            가격 · 브랜드 · 원료로 필터링하고 Amazon · Chewy에서 바로 구매하세요.
          </p>
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
