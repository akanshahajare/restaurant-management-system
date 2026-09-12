import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import { toast } from 'sonner';
import {
  ReceiptText,
  Plus,
  Trash2,
  Hash,
  IndianRupee,
  Calculator,
  FileDown,
  Printer,
  RefreshCw,
  ClipboardList,
  Sparkles,
  Tag,
  Clock3,
} from 'lucide-react';
import { downloadInvoicePdf, printInvoice } from '../../utils/pdfUtils.js';

const EMPTY_ITEM = {
  name: '',
  price: 0,
  quantity: 1,
};

const AdminBillingPage = () => {
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [tableNumber, setTableNumber] = useState('');
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [notes, setNotes] = useState('');
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const fetchBills = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/billing');

      setBills(
        Array.isArray(response.data?.data)
          ? response.data.data
          : []
      );
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error(
        error.response?.data?.message || 'Unable to load billing history'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      return sum + price * quantity;
    }, 0);

    const safeDiscount = Math.max(Number(discount || 0), 0);
    const safeServiceCharge = Math.max(
      Number(serviceCharge || 0),
      0
    );

    const gst = Number((subtotal * 0.05).toFixed(2));

    const total = Number(
      Math.max(
        subtotal + gst + safeServiceCharge - safeDiscount,
        0
      ).toFixed(2)
    );

    return {
      subtotal,
      gst,
      total,
      discount: safeDiscount,
      serviceCharge: safeServiceCharge,
    };
  }, [items, discount, serviceCharge]);

  const hasBillableItems = useMemo(() => {
    return items.some((item) => {
      const name = String(item.name || '').trim();
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      return name && quantity > 0 && price >= 0;
    });
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Math.max(Number(item.quantity || 0), 0),
      0
    );
  }, [items]);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const addLine = () => {
    setItems((current) => [
      ...current,
      {
        ...EMPTY_ITEM,
      },
    ]);
  };

  const removeLine = (index) => {
    setItems((current) => {
      if (current.length === 1) {
        return [{ ...EMPTY_ITEM }];
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const resetForm = () => {
    setItems([{ ...EMPTY_ITEM }]);
    setTableNumber('');
    setDiscount(0);
    setServiceCharge(0);
    setNotes('');
  };

  const handleCreate = async () => {
    if (!hasBillableItems) {
      toast.error(
        'Add at least one billable item before generating an invoice'
      );
      return;
    }

    const cleanedItems = items
      .filter((item) => {
        const name = String(item.name || '').trim();
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        return name && quantity > 0 && price >= 0;
      })
      .map((item) => ({
        name: String(item.name).trim(),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
      }));

    setCreating(true);

    try {
      const response = await api.post('/billing', {
        tableNumber: String(tableNumber || '').trim(),
        items: cleanedItems,
        discount: Number(discount || 0),
        serviceCharge: Number(serviceCharge || 0),
        notes: String(notes || '').trim(),
      });

      const createdBill = response.data?.data;

      setCurrentBill(createdBill);

      toast.success('Invoice generated successfully');

      resetForm();

      await fetchBills();
    } catch (error) {
      console.error('Failed to create bill:', error);

      toast.error(
        error.response?.data?.message || 'Unable to create bill'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentBill) {
      toast.error('Generate an invoice first');
      return;
    }

    setPdfGenerating(true);

    try {
      downloadInvoicePdf(currentBill, {
        title: 'Invoice',
      });

      toast.success('Invoice PDF generated');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Unable to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!currentBill) {
      toast.error('Generate an invoice first');
      return;
    }

    try {
      printInvoice(currentBill, {
        title: 'Invoice',
      });

      toast.success('Invoice print window opened');
    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Unable to print invoice');
    }
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Recently created';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently created';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[#E7DDD3] bg-white px-5 py-3 text-sm text-[#6F655E] shadow-sm">
          <RefreshCw className="h-4 w-4 animate-spin text-[#D96A3A]" />
          Loading billing workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[#E7DDD3] bg-[#241B2F] px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#D96A3A]/20 blur-2xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              <Sparkles className="h-3.5 w-3.5 text-[#F0A27F]" />
              Finance & billing
            </div>

            <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              Create a bill.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
              Build restaurant invoices quickly, review the live total,
              and print or download the finished invoice.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white/80">
            <ReceiptText className="h-4 w-4 text-[#F0A27F]" />
            Invoice workspace
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <IndianRupee className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8D83]">
              Current
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#241B2F]">
            {formatCurrency(totals.total)}
          </p>

          <p className="mt-1 text-sm text-[#756B63]">
            Live invoice total
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-[#F4EFE9] p-3 text-[#241B2F]">
              <ClipboardList className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8D83]">
              Items
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#241B2F]">
            {itemCount}
          </p>

          <p className="mt-1 text-sm text-[#756B63]">
            Units on current bill
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-[#FBE9E1] p-3 text-[#D96A3A]">
              <ReceiptText className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8D83]">
              History
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#241B2F]">
            {bills.length}
          </p>

          <p className="mt-1 text-sm text-[#756B63]">
            Generated invoices
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-[#F4EFE9] p-3 text-[#241B2F]">
              <Calculator className="h-5 w-5" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A8D83]">
              Tax
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#241B2F]">
            5%
          </p>

          <p className="mt-1 text-sm text-[#756B63]">
            GST applied to subtotal
          </p>
        </div>
      </section>

      {/* Main workspace */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* Create invoice */}
        <div className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 border-b border-[#EEE5DD] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-[#D96A3A]" />
                <h2 className="font-serif text-2xl text-[#241B2F]">
                  Create invoice
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#756B63]">
                Add items and charges to build the final bill.
              </p>
            </div>

            <div className="rounded-full bg-[#F7F1EB] px-3 py-1.5 text-xs font-semibold text-[#756B63]">
              GST 5%
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {/* Table */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3A3039]">
                <Hash className="h-4 w-4 text-[#D96A3A]" />
                Table number
              </label>

              <input
                value={tableNumber}
                onChange={(event) =>
                  setTableNumber(event.target.value)
                }
                placeholder="e.g. 12"
                className="w-full rounded-2xl border border-[#DED2C8] bg-[#FCFAF7] px-4 py-3.5 text-sm text-[#241B2F] outline-none transition placeholder:text-[#AA9E95] focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
              />
            </div>

            {/* Items */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#3A3039]">
                    Billable items
                  </h3>

                  <p className="mt-1 text-xs text-[#91867E]">
                    Add dishes, drinks, or other charges.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E1D5CB] bg-white px-3.5 py-2 text-xs font-semibold text-[#D96A3A] transition hover:border-[#D96A3A] hover:bg-[#FFF7F3]"
                >
                  <Plus className="h-4 w-4" />
                  Add item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`billing-item-${index}`}
                    className="rounded-[1.5rem] border border-[#E8DED5] bg-[#FCFAF7] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A8D83]">
                        Item {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#B34E3A] transition hover:bg-[#FBE9E1]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_130px]">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#756B63]">
                          Item name
                        </label>

                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'name',
                              event.target.value
                            )
                          }
                          placeholder="e.g. Paneer Tikka"
                          className="w-full rounded-xl border border-[#DED2C8] bg-white px-3.5 py-3 text-sm text-[#241B2F] outline-none transition placeholder:text-[#AA9E95] focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#756B63]">
                          Price
                        </label>

                        <div className="relative">
                          <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8D83]" />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'price',
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-xl border border-[#DED2C8] bg-white py-3 pl-9 pr-3 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#756B63]">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'quantity',
                              Math.max(
                                Number(event.target.value),
                                0
                              )
                            )
                          }
                          className="w-full rounded-xl border border-[#DED2C8] bg-white px-3 py-3 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end text-sm">
                      <span className="text-[#91867E]">
                        Line total
                      </span>

                      <span className="ml-3 font-semibold text-[#241B2F]">
                        {formatCurrency(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra charges */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3A3039]">
                  <Tag className="h-4 w-4 text-[#D96A3A]" />
                  Discount
                </label>

                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8D83]" />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(event) =>
                      setDiscount(
                        Math.max(
                          Number(event.target.value || 0),
                          0
                        )
                      )
                    }
                    className="w-full rounded-2xl border border-[#DED2C8] bg-[#FCFAF7] py-3.5 pl-9 pr-4 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3A3039]">
                  <IndianRupee className="h-4 w-4 text-[#D96A3A]" />
                  Service charge
                </label>

                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8D83]" />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceCharge}
                    onChange={(event) =>
                      setServiceCharge(
                        Math.max(
                          Number(event.target.value || 0),
                          0
                        )
                      )
                    }
                    className="w-full rounded-2xl border border-[#DED2C8] bg-[#FCFAF7] py-3.5 pl-9 pr-4 text-sm text-[#241B2F] outline-none transition focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#3A3039]">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any notes for this invoice..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#DED2C8] bg-[#FCFAF7] px-4 py-3.5 text-sm text-[#241B2F] outline-none transition placeholder:text-[#AA9E95] focus:border-[#D96A3A] focus:ring-4 focus:ring-[#D96A3A]/10"
              />
            </div>

            {/* Totals */}
            <div className="rounded-[1.75rem] bg-[#241B2F] p-5 text-white md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#F0A27F]" />

                <h3 className="font-semibold">
                  Invoice summary
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/65">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-white/65">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(totals.gst)}</span>
                </div>

                <div className="flex items-center justify-between text-white/65">
                  <span>Service charge</span>
                  <span>
                    {formatCurrency(totals.serviceCharge)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-white/65">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>

                <div className="my-4 border-t border-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    Total
                  </span>

                  <span className="font-serif text-2xl text-[#F0A27F]">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !hasBillableItems}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D96A3A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C85D31] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ReceiptText className="h-4 w-4" />
                    Generate invoice
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!currentBill || pdfGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DED2C8] bg-white px-4 py-3.5 text-sm font-semibold text-[#3A3039] transition hover:border-[#D96A3A] hover:bg-[#FFF8F4] hover:text-[#D96A3A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pdfGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!currentBill}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#241B2F] bg-[#241B2F] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#30253D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Printer className="h-4 w-4" />
                Print invoice
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Current invoice */}
          <div className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEE5DD] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-[#D96A3A]" />

                  <h2 className="font-serif text-xl text-[#241B2F]">
                    Latest invoice
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[#91867E]">
                  Your most recently generated bill
                </p>
              </div>

              {currentBill && (
                <span className="rounded-full bg-[#EAF5ED] px-3 py-1.5 text-xs font-semibold text-[#477254]">
                  Generated
                </span>
              )}
            </div>

            {currentBill ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[#FCFAF7] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#9A8D83]">
                        Invoice
                      </p>

                      <p className="mt-1 font-semibold text-[#241B2F]">
                        #
                        {String(currentBill._id || '')
                          .slice(-8)
                          .toUpperCase()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FBE9E1] p-2.5 text-[#D96A3A]">
                      <ReceiptText className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#E8DED5] p-3">
                    <p className="text-xs text-[#91867E]">
                      Table
                    </p>

                    <p className="mt-1 font-semibold text-[#241B2F]">
                      {currentBill.tableNumber || '—'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED5] p-3">
                    <p className="text-xs text-[#91867E]">
                      Total
                    </p>

                    <p className="mt-1 font-semibold text-[#D96A3A]">
                      {formatCurrency(currentBill.total)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9A8D83]">
                    Items
                  </p>

                  <div className="space-y-2">
                    {(currentBill.items || []).map(
                      (item, index) => (
                        <div
                          key={`current-bill-item-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-[#FCFAF7] px-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0 truncate text-[#4C423B]">
                            {item.name} × {item.quantity}
                          </span>

                          <span className="shrink-0 font-semibold text-[#241B2F]">
                            {formatCurrency(
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="border-t border-[#EEE5DD] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#756B63]">
                      Invoice total
                    </span>

                    <span className="font-serif text-2xl text-[#241B2F]">
                      {formatCurrency(currentBill.total)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfGenerating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED2C8] px-3 py-2.5 text-xs font-semibold text-[#3A3039] transition hover:border-[#D96A3A] hover:text-[#D96A3A] disabled:opacity-40"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#241B2F] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#30253D]"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#DED2C8] bg-[#FCFAF7] px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBE9E1] text-[#D96A3A]">
                  <ReceiptText className="h-5 w-5" />
                </div>

                <p className="mt-4 font-semibold text-[#3A3039]">
                  No invoice generated yet
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#91867E]">
                  Add at least one item and generate an invoice to
                  see its preview here.
                </p>
              </div>
            )}
          </div>

          {/* Recent bills */}
          <div className="rounded-[2rem] border border-[#E7DDD3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEE5DD] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#D96A3A]" />

                  <h2 className="font-serif text-xl text-[#241B2F]">
                    Recent bills
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[#91867E]">
                  Latest generated invoices
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchBills(true)}
                disabled={refreshing}
                className="rounded-xl border border-[#E1D5CB] p-2 text-[#756B63] transition hover:border-[#D96A3A] hover:text-[#D96A3A] disabled:opacity-50"
                title="Refresh bills"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {bills.length === 0 ? (
                <div className="rounded-2xl bg-[#FCFAF7] px-4 py-8 text-center">
                  <ClipboardList className="mx-auto h-7 w-7 text-[#C8BDB4]" />

                  <p className="mt-3 text-sm font-semibold text-[#4C423B]">
                    No invoices yet
                  </p>

                  <p className="mt-1 text-xs text-[#91867E]">
                    Generated invoices will appear here.
                  </p>
                </div>
              ) : (
                bills.slice(0, 8).map((bill) => (
                  <div
                    key={bill._id}
                    className="rounded-2xl border border-[#E8DED5] bg-[#FCFAF7] p-4 transition hover:border-[#D9C9BC]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.12em] text-[#9A8D83]">
                          Invoice
                        </p>

                        <p className="mt-1 truncate font-semibold text-[#241B2F]">
                          #
                          {String(bill._id || '')
                            .slice(-8)
                            .toUpperCase()}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#FBE9E1] px-3 py-1.5 text-xs font-semibold text-[#D96A3A]">
                        {formatCurrency(bill.total)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#756B63]">
                      <span>
                        Table {bill.tableNumber || '—'}
                      </span>

                      <span>
                        {(bill.items || []).length} item
                        {(bill.items || []).length === 1
                          ? ''
                          : 's'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-[#9A8D83]">
                      {formatDate(
                        bill.createdAt || bill.updatedAt
                      )}
                    </div>

                    {(bill.items || []).length > 0 && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#756B63]">
                        {(bill.items || [])
                          .map(
                            (item) =>
                              `${item.name} × ${item.quantity}`
                          )
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBillingPage;