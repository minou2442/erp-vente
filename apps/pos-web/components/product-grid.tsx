"use client";

interface ProductCardItem {
  id: string;
  name: string;
  barcode: string;
  stockQty: number;
  salePrice: number;
}

interface ProductGridProps {
  products: ProductCardItem[];
  onAdd: (productId: string) => void;
}

export default function ProductGrid({ products, onAdd }: ProductGridProps) {
  return (
    <section className="pos-panel">
      <h2>Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.barcode}</p>
            <p>Stock: {product.stockQty}</p>
            <p>Price: {product.salePrice}</p>
            <button className="btn-primary" onClick={() => onAdd(product.id)} type="button">
              Add
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
