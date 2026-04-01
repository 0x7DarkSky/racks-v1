import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { products } from "../data/products";

export default function Redirect() {
  const { productId } = useParams();

  useEffect(() => {
    const product = products.find((p) => p.id === productId);

    if (product && product.affiliate_url) {
      window.location.href = product.affiliate_url;
    } else {
      console.error("Product not found or missing affiliate link");
    }
  }, [productId]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      Redirecting...
    </div>
  );
}