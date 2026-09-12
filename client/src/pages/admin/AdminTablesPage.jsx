import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Plus,
  Trash2,
  QrCode,
  Utensils,
  Link2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const AdminTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  const fetchTables = async () => {
    setLoading(true);

    try {
      const response = await api.get('/tables');
      setTables(response.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Unable to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = async () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter a table number');
      return;
    }

    try {
      await api.post('/tables', {
        number: tableNumber.trim(),
      });

      toast.success('Table created');
      setTableNumber('');
      fetchTables();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Unable to create table'
      );
    }
  };

  const removeTable = async (id) => {
    if (!window.confirm('Delete this table?')) return;

    try {
      await api.delete(`/tables/${id}`);
      toast.success('Table removed');
      fetchTables();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Unable to remove table'
      );
    }
  };

  const getTableStatus = (status) => {
    const normalized = String(status || '').toUpperCase();

    if (normalized === 'AVAILABLE') {
      return {
        label: 'Available',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }

    return {
      label: normalized.replaceAll('_', ' ') || 'Occupied',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: XCircle,
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#D96A3A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D96A3A]">
              Restaurant setup
            </span>
          </div>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#241B2F]">
            Table management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766D78]">
            Create dining tables and generate QR codes that take guests
            directly to the CloudCraves menu.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E8DED2] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241B2F] text-white">
            <QrCode className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#91858C]">
              Total tables
            </p>
            <p className="text-xl font-semibold text-[#241B2F]">
              {tables.length}
            </p>
          </div>
        </div>
      </div>

      {/* Add table */}
      <Card className="overflow-hidden border border-[#E8DED2] bg-white shadow-sm">
        <div className="border-b border-[#EEE5DC] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D96A3A]/10 text-[#D96A3A]">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#241B2F]">
                Add a new table
              </h2>
              <p className="mt-0.5 text-sm text-[#8A8088]">
                Give the table a number or identifier.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-6 sm:flex-row">
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTable();
              }
            }}
            placeholder="e.g. 12"
            className="h-12 flex-1 rounded-xl border border-[#E8DED2] bg-[#FAF7F2] px-4 text-sm text-[#241B2F] outline-none transition placeholder:text-[#A59B9F] focus:border-[#D96A3A] focus:ring-2 focus:ring-[#D96A3A]/10"
          />

          <Button
            onClick={addTable}
            className="h-12 rounded-xl bg-[#D96A3A] px-6 font-semibold text-white shadow-sm transition hover:bg-[#C85D31]"
          >
            <span className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add table
            </span>
          </Button>
        </div>
      </Card>

      {/* Empty state */}
      {tables.length === 0 ? (
        <Card className="border border-dashed border-[#DCCFC3] bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#241B2F]/5 text-[#241B2F]">
            <Utensils className="h-7 w-7" />
          </div>

          <h2 className="mt-5 font-serif text-2xl font-semibold text-[#241B2F]">
            No tables yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#8A8088]">
            Add your first dining table above to generate a QR menu link.
          </p>
        </Card>
      ) : (
        /* Tables */
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            const url = `${
              import.meta.env.VITE_FRONTEND_URL || window.location.origin
            }/menu?table=${table.number}`;

            const status = getTableStatus(table.status);
            const StatusIcon = status.icon;

            return (
              <Card
                key={table._id}
                className="group overflow-hidden border border-[#E8DED2] bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Card header */}
                <div className="flex items-start justify-between border-b border-[#EEE5DC] px-5 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A0959C]">
                      Dining table
                    </p>

                    <h2 className="mt-1 font-serif text-2xl font-semibold text-[#241B2F]">
                      Table {table.number}
                    </h2>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </div>
                </div>

                {/* QR */}
                <div className="px-5 pt-5">
                  <div className="flex items-center justify-center rounded-2xl border border-[#E8DED2] bg-[#FAF7F2] p-6">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <QRCodeCanvas
                        value={url}
                        size={170}
                        bgColor="#ffffff"
                        fgColor="#241B2F"
                        level="M"
                      />
                    </div>
                  </div>
                </div>

                {/* Link */}
                <div className="px-5 pt-5">
                  <div className="rounded-xl bg-[#F7F2EC] p-3.5">
                    <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8A8088]">
                      <Link2 className="h-3.5 w-3.5" />
                      Menu link
                    </div>

                    <p className="break-all text-xs leading-5 text-[#554B55]">
                      {url}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 px-5 py-5">
                  <div className="flex items-center gap-2 text-xs text-[#8A8088]">
                    <QrCode className="h-4 w-4 text-[#D96A3A]" />
                    Scan to order
                  </div>

                  <Button
                    onClick={() => removeTable(table._id)}
                    className="rounded-xl bg-[#FFF1EF] px-3.5 text-sm font-semibold text-[#B94738] shadow-none hover:bg-[#FDE3DF]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTablesPage;