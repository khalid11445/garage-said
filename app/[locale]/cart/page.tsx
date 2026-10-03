import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartView from '@/components/CartView';

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