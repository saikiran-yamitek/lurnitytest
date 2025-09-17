// backend/utils/pdfReceipt.js
import PDFDocument from 'pdfkit';

export function generateReceiptStream(user) {
  const doc = new PDFDocument();

  doc.fontSize(20).text('Lurnity - Fee Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(14).text(`Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Course: ${user.course}`);
  doc.text(`Course Fee: ₹${user.courseFee || 0}`);
  doc.text(`Amount Paid: ₹${user.amountPaid || 0}`);
  const balance = (user.courseFee || 0) - (user.amountPaid || 0);
  doc.text(`Balance: ₹${balance}`);
  doc.moveDown();
  doc.text(`Thank you for your payment.`, { align: 'center' });

  doc.end();
  return doc;
}

export async function generateAndUploadReceipt(receiptData) {
  // generate the PDF
  const pdf = await createPdfReceipt(receiptData);

  // upload to S3 (example using AWS SDK v3)
  const s3 = new S3Client();
  await s3.send(new PutObjectCommand({
    Bucket: process.env.RECEIPTS_BUCKET,
    Key: `receipts/${receiptData.id}.pdf`,
    Body: pdf,
    ContentType: "application/pdf",
  }));

  return `s3://${process.env.RECEIPTS_BUCKET}/receipts/${receiptData.id}.pdf`;
}

