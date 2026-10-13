import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

/** 渲染已经分页的 DOM 快照。每张画布对应一页，禁止再对长图切片。 */
export async function createResumePdf(pages: HTMLElement[]): Promise<jsPDF> {
  if (!pages.length) throw new Error('Resume pages are not ready');
  const container = document.createElement('div');
  Object.assign(container.style, { position: 'absolute', top: '0', left: '-100000px', width: '210mm' });
  document.body.append(container);
  try {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    for (const [index, page] of pages.entries()) {
      const copy = page.cloneNode(true) as HTMLElement;
      copy.style.boxShadow = 'none';
      container.replaceChildren(copy);
      const canvas: HTMLCanvasElement = await html2pdf().set({
        margin: 0, pagebreak: { mode: [] },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(copy).toCanvas().get('canvas');
      if (index) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', .98), 'JPEG', 0, 0, 210, 297);
    }
    return pdf;
  } finally { container.remove(); }
}
