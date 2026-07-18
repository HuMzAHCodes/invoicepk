'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api-client';
import InvoiceFilters from '@/components/Invoices/InvoiceFilters';
import InvoiceTable from '@/components/Invoices/InvoiceTable';
import InvoicePagination from '@/components/Invoices/InvoicePagination';
import InvoiceSkeleton from '@/components/Invoices/InvoiceSkeleton';
import theme from '@/styles/theme';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { id: string; name: string } | null;
  status: 'draft' | 'sent' | 'paid';
  subtotal: number;
  gstAmount: number;
  total: number;
  netPayable: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
}

interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
}

// ─── Page ──────────────────────────────────────────────────────────────────

function InvoicesPageContent() {
  // ─── State ─────────────────────────────────────────────────────────────

  const searchParams = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState(() => searchParams.get('status') ?? 'All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status !== 'All') params.set('status', status);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const query = params.toString();
      const data = await apiGet<InvoicesResponse>(
        `/invoices${query ? `?${query}` : ''}`
      );

      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invoices'
      );
    } finally {
      setLoading(false);
    }
  }, [status, from, to, page, limit]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setPage(1);
  }

  function handleFromChange(newFrom: string) {
    setFrom(newFrom);
    setPage(1);
  }

  function handleToChange(newTo: string) {
    setTo(newTo);
    setPage(1);
  }

  function handleClearFilters() {
    setStatus('All');
    setFrom('');
    setTo('');
    setPage(1);
  }

  // ─── Styles ────────────────────────────────────────────────────────────

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
  };

  const newBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.fast,
  };

  const errorBoxStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.danger[50],
    color: theme.colors.danger[600],
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing[6],
  };

  const retryBtnStyle: React.CSSProperties = {
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.danger[600],
    border: `1px solid ${theme.colors.danger[600]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    cursor: 'pointer',
    marginTop: theme.spacing[3],
    transition: theme.transitions.fast,
  };

  const emptyStyle: React.CSSProperties = {
    padding: `${theme.spacing[12]} ${theme.spacing[4]}`,
    textAlign: 'center',
    color: theme.colors.neutral[400],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
  };

  const hasFilters = status !== 'All' || from !== '' || to !== '';

  // ─── Loading ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Invoices</h1>
          <Link href="/invoices/new" style={newBtnStyle}>
            + New Invoice
          </Link>
        </div>
        <InvoiceSkeleton />
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Invoices</h1>
          <Link href="/invoices/new" style={newBtnStyle}>
            + New Invoice
          </Link>
        </div>
        <div style={errorBoxStyle}>{error}</div>
        <button type="button" onClick={fetchInvoices} style={retryBtnStyle}>
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Invoices</h1>
        <Link href="/invoices/new" style={newBtnStyle}>
          + New Invoice
        </Link>
      </div>

      <InvoiceFilters
        status={status}
        from={from}
        to={to}
        onStatusChange={handleStatusChange}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onClear={handleClearFilters}
      />

      {invoices.length === 0 ? (
        <div style={emptyStyle}>
          <p>
            {hasFilters
              ? 'No invoices match your filters.'
              : 'No invoices found.'}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                ...retryBtnStyle,
                color: theme.colors.primary[600],
                borderColor: theme.colors.primary[600],
              }}
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/invoices/new"
              style={{
                ...retryBtnStyle,
                color: theme.colors.primary[600],
                borderColor: theme.colors.primary[600],
                display: 'inline-block',
                textDecoration: 'none',
              }}
            >
              Create your first invoice
            </Link>
          )}
        </div>
      ) : (
        <>
          <InvoiceTable invoices={invoices} />
          <InvoicePagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoiceSkeleton />}>
      <InvoicesPageContent />
    </Suspense>
  );
}