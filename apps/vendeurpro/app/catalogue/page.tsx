import { PhoneShell } from "@/components/shell";
import { Money } from "@/components/money";
import { products } from "@vpct/db/mock";

export default function CatalogPage() {
  return (
    <PhoneShell active="catalog">
      <main className="px-gutter py-4">
        <h1 className="text-title text-ink">Catalogue</h1>
        <p className="mt-1 text-sm text-text-muted">Deux produits fictifs, pour composer une commande.</p>
        <ul className="mt-4 space-y-2">
          {products.map((product) => (
            <li key={product.id} className="rounded-lg bg-surface p-4 shadow-card">
              <p className="font-semibold text-ink">
                {product.name}
                {product.variant ? ` · ${product.variant}` : ""}
              </p>
              <Money value={product.priceFcfa} inline className="text-md" />
            </li>
          ))}
        </ul>
      </main>
    </PhoneShell>
  );
}
