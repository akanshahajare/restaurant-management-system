import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Trash2,
  Utensils,
} from 'lucide-react';
import api from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const {
    cartItems,
    totals,
    tableNumber,
    updateQuantity,
    updateInstructions,
    removeItem,
    clearCart,
    recordRecentOrder,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentState, setPaymentState] = useState('idle');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);

  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    setPaymentState('processing');
    setPaymentError('');
    setPaymentSummary(null);

    try {
      const orderResponse = await api.post('/orders', {
        tableNumber,
        items: cartItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
          instructions: item.instructions,
        })),
        customerNotes: notes,
        discount: Number(discount),
      });

      const createdOrder = orderResponse.data.data;

      recordRecentOrder(createdOrder);
      clearCart();

      setPaymentSummary({
        orderId: createdOrder._id,
        transactionId: null,
        amount: createdOrder.total,
        status: createdOrder.payment?.status || 'PENDING',
        tableNumber: createdOrder.tableNumber,
      });

      setPaymentState('success');

      toast.success('Order placed successfully');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to place order';

      setPaymentError(message);
      setPaymentState('error');

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(
    () => ({
      subtotal: totals.subtotal,
      gst: totals.gst,
      total: totals.total,
      discount: Number(discount) || 0,
    }),
    [totals, discount]
  );

  const finalTotal = Math.max(
    0,
    summary.total - summary.discount
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-sm text-[#766E68]">
            Sending your order to the kitchen...
          </p>
        </div>
      </div>
    );
  }

  if (paymentState === 'success' && paymentSummary) {
    return (
      <div className="mx-auto max-w-3xl py-8 sm:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-[#E7DDD3] bg-white shadow-[0_20px_60px_rgba(36,27,47,0.08)]">
          <div className="bg-[#241B2F] px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D96A3A]">
              <CheckCircle2 size={32} strokeWidth={2.2} />
            </div>

            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#E9B29A]">
              Order confirmed
            </p>

            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Your food is on its way.
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/70">
              We've sent your order to the kitchen. Sit back, relax,
              and we'll take care of the rest.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#766E68]">
                  Order
                </p>
                <p className="mt-2 break-all font-semibold text-[#29242A]">
                  #{paymentSummary.orderId.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#766E68]">
                  Table
                </p>
                <p className="mt-2 font-semibold text-[#29242A]">
                  Table {paymentSummary.tableNumber}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#766E68]">
                  Total
                </p>
                <p className="mt-2 font-semibold text-[#29242A]">
                  ₹{Number(paymentSummary.amount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-4 border-t border-[#E7DDD3] pt-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
                <Clock3 size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-[#29242A]">
                  What's next?
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#766E68]">
                  The kitchen has received your order. You can follow
                  its progress or view your receipt anytime.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() =>
                  navigate(`/order/${paymentSummary.orderId}`)
                }
                className="flex items-center justify-center gap-2 rounded-full bg-[#D96A3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#C85D31]"
              >
                Track Order
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() =>
                  navigate(`/receipt/${paymentSummary.orderId}`)
                }
                className="flex items-center justify-center gap-2 rounded-full border border-[#E7DDD3] bg-white px-5 py-3.5 text-sm font-bold text-[#29242A] transition hover:bg-[#FAF7F2]"
              >
                <Receipt size={17} />
                Receipt
              </button>

              <button
                onClick={() =>
                  navigate('/menu')
                }
                className="rounded-full border border-[#E7DDD3] bg-white px-5 py-3.5 text-sm font-bold text-[#29242A] transition hover:bg-[#FAF7F2]"
              >
                Order More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="restaurant-divider" />

          <span className="restaurant-eyebrow">
            Checkout
          </span>
        </div>

        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-[#29242A] sm:text-5xl lg:text-6xl">
              Almost there.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#766E68] sm:text-base">
              Review your order, add any final notes, and send it
              straight to our kitchen.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#E7DDD3] bg-white px-4 py-2.5">
            <Utensils size={17} className="text-[#D96A3A]" />
            <span className="text-sm font-semibold text-[#29242A]">
              Table {tableNumber}
            </span>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-[2rem] border border-[#E7DDD3] bg-white px-6 py-16 text-center shadow-[0_15px_50px_rgba(36,27,47,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
            <ShoppingBag size={28} />
          </div>

          <h2 className="mt-6 font-serif text-3xl text-[#29242A]">
            Your cart is waiting.
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#766E68]">
            There are no items in your order yet. Explore the menu
            and find something delicious.
          </p>

          <button
            onClick={() => navigate('/menu')}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D96A3A] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#C85D31]"
          >
            Explore Menu
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="restaurant-eyebrow">
                  Your selection
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#29242A]">
                  {cartItems.length}{' '}
                  {cartItems.length === 1 ? 'item' : 'items'}
                </h2>
              </div>

              <button
                onClick={clearCart}
                className="text-xs font-bold uppercase tracking-[0.12em] text-[#766E68] transition hover:text-[#D96A3A]"
              >
                Clear cart
              </button>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.foodId}
                className="overflow-hidden rounded-[1.5rem] border border-[#E7DDD3] bg-white shadow-[0_10px_35px_rgba(36,27,47,0.04)]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    <img
                      src={item.image || '/images/paneer.webp'}
                      alt={item.name}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl text-[#29242A]">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-[#766E68]">
                            ₹{Number(item.price).toFixed(2)} each
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.foodId)}
                          aria-label={`Remove ${item.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#766E68] transition hover:bg-[#F1E9DE] hover:text-[#D96A3A]"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-[#E7DDD3] bg-[#FAF7F2] p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.foodId,
                                item.quantity - 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#29242A] transition hover:bg-white"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="w-9 text-center text-sm font-bold text-[#29242A]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.foodId,
                                item.quantity + 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D96A3A] text-white transition hover:bg-[#C85D31]"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="font-semibold text-[#29242A]">
                          ₹
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#E7DDD3] pt-4">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#766E68]">
                      Special instructions
                    </label>

                    <textarea
                      value={item.instructions || ''}
                      onChange={(e) =>
                        updateInstructions(
                          item.foodId,
                          e.target.value
                        )
                      }
                      placeholder="Less spicy, no onions, extra sauce..."
                      rows={2}
                      className="mt-2 w-full resize-none rounded-xl border border-[#E7DDD3] bg-[#FAF7F2] px-4 py-3 text-sm text-[#29242A] outline-none placeholder:text-[#A39B95] transition focus:border-[#D96A3A] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
                  <Utensils size={18} />
                </div>

                <div>
                  <h3 className="font-semibold text-[#29242A]">
                    Anything else?
                  </h3>

                  <p className="text-xs text-[#766E68]">
                    Add a note for the kitchen.
                  </p>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests for your whole order?"
                rows={3}
                className="mt-5 w-full resize-none rounded-xl border border-[#E7DDD3] bg-[#FAF7F2] px-4 py-3 text-sm text-[#29242A] outline-none placeholder:text-[#A39B95] transition focus:border-[#D96A3A] focus:bg-white"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="overflow-hidden rounded-[2rem] bg-[#241B2F] text-white shadow-[0_20px_60px_rgba(36,27,47,0.16)]">
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E9B29A]">
                      Your order
                    </p>

                    <h2 className="mt-2 font-serif text-3xl">
                      Summary
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-white/65">
                    <span>Subtotal</span>
                    <span>
                      ₹{summary.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/65">
                    <span>GST (5%)</span>
                    <span>
                      ₹{summary.gst.toFixed(2)}
                    </span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex justify-between text-[#E9B29A]">
                      <span>Discount</span>
                      <span>
                        −₹{summary.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/50">
                      Total payable
                    </p>

                    <p className="mt-1 font-serif text-4xl">
                      ₹{finalTotal.toFixed(2)}
                    </p>
                  </div>

                  <span className="mb-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                    Table {tableNumber}
                  </span>
                </div>

                {/* Discount */}
                <div className="mt-7">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/55">
                    Discount
                  </label>

                  <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5">
                    <span className="pl-4 text-white/50">
                      ₹
                    </span>

                    <input
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          Math.max(
                            0,
                            Number(e.target.value)
                          )
                        )
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#D96A3A] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Sending to kitchen...'
                    : 'Place Order'}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-white/45">
                  Your order will be sent directly to the kitchen
                  for preparation.
                </p>
              </div>
            </div>

            {/* Table info */}
            <div className="mt-4 rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E9DE] text-[#D96A3A]">
                  <Utensils size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#766E68]">
                    Serving at
                  </p>

                  <p className="mt-1 font-semibold text-[#29242A]">
                    Table {tableNumber}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#766E68]">
                    Your order will be prepared and served to this
                    table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {(paymentState === 'error' ||
        paymentState === 'cancelled') &&
        paymentError && (
          <div className="mt-6 rounded-2xl border border-[#E8C9B9] bg-[#FFF5EF] p-5 text-sm text-[#7A3D28]">
            <p className="font-bold">
              {paymentState === 'cancelled'
                ? 'Order cancelled'
                : 'Something went wrong'}
            </p>

            <p className="mt-1">
              {paymentError}
            </p>
          </div>
        )}
    </div>
  );
};

export default CheckoutPage;