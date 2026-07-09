// lib/serialize.ts
// Serializers — convert raw Mongoose documents to clean API response shapes.
// Never return a raw Mongoose document from a route — always run it through
// the matching serializer. This guarantees the shape is identical everywhere
// a model is returned, matching API_REFERENCE.md exactly.

export function serializeBusiness(doc: any) {
  return {
    id:             doc._id.toString(),
    name:           doc.name,
    ntn:            doc.ntn ?? null,
    strn:           doc.strn ?? null,
    address:        doc.address ?? null,
    logoUrl:        doc.logoUrl ?? null,
    defaultGstRate: doc.defaultGstRate,
    currency:       doc.currency,
  };
}

export function serializeClient(doc: any) {
  return {
    id:          doc._id.toString(),
    name:        doc.name,
    email:       doc.email ?? null,
    phone:       doc.phone ?? null,
    address:     doc.address ?? null,
    ntn:         doc.ntn ?? null,
    isCorporate: doc.isCorporate,
  };
}

export function serializeInvoice(doc: any) {
  return {
    id:            doc._id.toString(),
    invoiceNumber: doc.invoiceNumber,
    status:        doc.status,
    issueDate:     doc.issueDate,
    dueDate:       doc.dueDate ?? null,
    currency:      doc.currency,
    gstType:       doc.gstType,
    gstRate:       doc.gstRate,
    subtotal:      doc.subtotal,
    gstAmount:     doc.gstAmount,
    total:         doc.total,
    whtApplicable: doc.whtApplicable,
    whtRate:       doc.whtRate,
    whtAmount:     doc.whtAmount,
    netPayable:    doc.netPayable,
    notes:         doc.notes ?? null,
    pdfUrl:        doc.pdfUrl ?? null,
    items: doc.items.map((item: any) => ({
      description: item.description,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice,
      amount:      item.amount,
      sortOrder:   item.sortOrder,
    })),
  };
}