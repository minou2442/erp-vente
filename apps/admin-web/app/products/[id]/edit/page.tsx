"use client";

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditPageProps) {
  return (
    <section className="panel">
      <h2>Edit Product</h2>
      <p>Product ID: {params.id}</p>
      <p>Connect this form to PATCH /api/products/:id for full edit workflow.</p>
    </section>
  );
}
