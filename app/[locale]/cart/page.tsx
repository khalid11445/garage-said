import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartView from '@/components/CartView';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'cart', '/cart');
}
export default function CartPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <CartView />
      </main>
      <Footer />
    </>
  );
}