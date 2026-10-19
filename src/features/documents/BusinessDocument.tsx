import { money } from '@/lib/domain/money'
import { documentStyles } from './documentStyles'
import type { DocumentModel } from './model'
function date(value: string) {
  const d = new Date(value.length === 10 ? `${value}T12:00:00+01:00` : value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-NG', {
        timeZone: 'Africa/Lagos',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}
export function BusinessDocument({ document: d }: { document: DocumentModel }) {
  const amount = (n: number) => money(n, d.currency)
  return (
    <article className="oga-document" aria-label={`${d.kind} ${d.reference}`}>
      <style>{documentStyles}</style>
      <div className="doc-top" />
      <header className="doc-header">
        <div>
          <div className="doc-brand">
            {d.business.logo && /^https?:\/\//.test(d.business.logo) && (
              <img className="doc-logo" src={d.business.logo} alt="" />
            )}
            <h2>{d.business.name}</h2>
          </div>
          <p className="muted" style={{ maxWidth: 350, marginTop: 14, fontSize: 11 }}>
            {d.business.address}
          </p>
          {d.business.contact && (
            <p className="muted" style={{ fontSize: 11 }}>
              {d.business.contact}
            </p>
          )}
        </div>
        <div className="doc-title">
          <h1>
            {d.kind === 'receipt' ? 'Receipt' : d.kind === 'invoice' ? 'Invoice' : 'Statement'}
          </h1>
          <p className="doc-ref">{d.reference}</p>
          <p className="muted" style={{ fontSize: 10, marginTop: 8 }}>
            {d.kind === 'invoice' ? 'Payment request' : 'Payments recorded to date'}
          </p>
        </div>
      </header>
      <div className="doc-body">
        <div className="doc-meta">
          <section>
            <p className="doc-label">{d.kind === 'invoice' ? 'Bill to' : 'Received from'}</p>
            <p className="doc-name">{d.customer.name}</p>
            {d.customer.email && <p>{d.customer.email}</p>}
            {d.customer.phone && <p>{d.customer.phone}</p>}
            <span
              className={`doc-badge ${d.status === 'Cancelled' || d.status === 'cancelled' ? 'doc-cancelled' : d.balance > 0 ? 'doc-open' : ''}`}
            >
              {d.status}
            </span>
          </section>
          <section>
            <div className="doc-date">
              <span>{d.kind === 'invoice' ? 'Issue date' : 'Sale date'}</span>
              <strong>{date(d.date)}</strong>
            </div>
            {d.dueDate && (
              <div className="doc-date">
                <span>Due date</span>
                <strong>{date(d.dueDate)}</strong>
              </div>
            )}
            <div className="doc-date">
              <span>Currency</span>
              <strong>{d.currency}</strong>
            </div>
            {d.paymentMethod && (
              <div className="doc-date">
                <span>Recorded method</span>
                <strong>{d.paymentMethod}</strong>
              </div>
            )}
          </section>
        </div>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="num">Qty</th>
              <th className="num">Unit price</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className="num">{item.quantity}</td>
                <td className="num">{amount(item.unitPrice)}</td>
                <td className="num">{amount(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!d.items.length && (
          <p className="doc-unavailable">Item details are not available in this response.</p>
        )}
        <div className="doc-summary">
          <div className="doc-totals">
            <div className="doc-total-line">
              <span>Subtotal</span>
              <span>{amount(d.subtotal)}</span>
            </div>
            {d.discount > 0 && (
              <div className="doc-total-line">
                <span>Discount</span>
                <span>−{amount(d.discount)}</span>
              </div>
            )}
            {d.vat > 0 && (
              <div className="doc-total-line">
                <span>
                  VAT {d.vatRate}%{d.vatInclusive ? ' (included)' : ''}
                </span>
                <span>{amount(d.vat)}</span>
              </div>
            )}
            {d.wht > 0 && (
              <div className="doc-total-line">
                <span>Withholding tax</span>
                <span>−{amount(d.wht)}</span>
              </div>
            )}
            <div className="doc-total-line doc-grand">
              <span>Total</span>
              <span>{amount(d.total)}</span>
            </div>
            <div className="doc-total-line doc-paid">
              <span>Amount paid</span>
              <span>{amount(d.paid)}</span>
            </div>
            <div className="doc-total-line doc-balance">
              <span>Balance due</span>
              <span>{amount(d.balance)}</span>
            </div>
          </div>
        </div>
        {(d.notes || d.terms) && (
          <section className="doc-note">
            <p className="doc-label">Notes & payment terms</p>
            {d.terms && <p>{d.terms}</p>}
            {d.notes && <p>{d.notes}</p>}
          </section>
        )}
        <p className="doc-fine">
          {d.kind === 'invoice'
            ? 'This invoice is a request for payment. It is not proof of payment.'
            : 'This document summarizes the sale and all payments recorded against it. It does not identify an individual bank transaction.'}
        </p>
      </div>
      <footer className="doc-footer">
        <span className="doc-thanks">Thank you for your business.</span>
        <span>{d.reference} · Prepared with OgaOS</span>
      </footer>
    </article>
  )
}
