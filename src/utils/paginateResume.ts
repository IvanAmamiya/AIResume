import { planPageSlices, type VerticalSpan } from './pageBoundaries';

const mm = 96 / 25.4;
const minimumMargin = 10 * mm;

/** 把已完成渲染的模板转换为独立 A4 页面；不修改原模板或用户数据。 */
export function paginateResume(source: HTMLElement): HTMLElement[] {
  const stage = document.createElement('div');
  Object.assign(stage.style, { position: 'absolute', top: '0', left: '-100000px', width: '210mm' });
  document.body.append(stage);
  try {
    const doubleColumn = source.classList.contains('resume-template-c');
    const sourceLanes = doubleColumn
      ? Array.from(source.children) as HTMLElement[] : [source];
    const shell = source.cloneNode(false) as HTMLElement;
    shell.classList.add('resume-page');
    Object.assign(shell.style, { height: '297mm', minHeight: '297mm', width: '210mm',
      flexShrink: '0', overflow: 'hidden', margin: '0' });
    const slots: HTMLElement[] = [];
    if (doubleColumn) {
      shell.style.padding = '0';
      for (const lane of sourceLanes) {
        const slot = lane.cloneNode(false) as HTMLElement;
        const style = getComputedStyle(lane);
        Object.assign(slot.style, { height: '297mm', minHeight: '0', margin: '0',
          paddingTop: `${Math.max(minimumMargin, parseFloat(style.paddingTop) || 0)}px`,
          paddingBottom: `${Math.max(minimumMargin, parseFloat(style.paddingBottom) || 0)}px` });
        shell.append(slot);
        slots.push(slot);
      }
    } else {
      const style = getComputedStyle(source);
      shell.style.paddingTop = `${Math.max(minimumMargin, parseFloat(style.paddingTop) || 0)}px`;
      shell.style.paddingBottom = `${Math.max(minimumMargin, parseFloat(style.paddingBottom) || 0)}px`;
      slots.push(shell);
    }
    stage.append(shell);
    const lanes = slots.map((slot, index) => {
      const style = getComputedStyle(slot);
      const slotRect = slot.getBoundingClientRect();
      const width = slotRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const capacity = slotRect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const flow = sourceLanes[index].cloneNode(true) as HTMLElement;
      // 保留 scoped 属性和 flex/order 等模板样式，只移除纸张与栏位外边距。
      flow.classList.remove('resume-page');
      Object.assign(flow.style, { width: `${width}px`, height: 'auto', minHeight: '0',
        padding: '0', margin: '0', position: 'relative', transform: 'none', overflow: 'visible', flexShrink: '0' });
      // 必须在页面栏位里测量：字体、行高、CSS 变量来自纸张祖先。
      // 将栏位直接挂到 body 会继承编辑器字号，导致测量与导出换行不同。
      slot.append(flow);
      const origin = flow.getBoundingClientRect().top;
      const lines: VerticalSpan[] = [];
      const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      // Range 按真实字形位置测量，包括 CJK、emoji、粗体和链接内部文本。
      // 同一行字形合并为一个禁止裁切区间，避免逐字符断点误判。
      while ((node = walker.nextNode())) {
        const text = node.textContent ?? '';
        if (!text.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of Array.from(range.getClientRects())) {
          if (rect.height && rect.width) lines.push({ top: rect.top - origin, bottom: rect.bottom - origin });
        }
      }
      // 某些字体的字形包围框会超出首行的 line-height；为首行补出真实空间。
      // 给断点再保留 1 px 安全距离，防止画布抗锯齿落在裁切边上。
      const topInset = Math.max(0, -Math.min(0, ...lines.map(line => line.top))) + 1;
      flow.style.paddingTop = `${topInset}px`;
      for (const line of lines) { line.top += topInset - 1; line.bottom += topInset + 1; }
      const span = (element: Element): VerticalSpan => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top - origin, bottom: rect.bottom - origin };
      };
      // 图片不可切；短条目整体避让。超过一页的条目自动退回文字行规则。
      const blocks = Array.from(flow.querySelectorAll(
        'img, p, li, .skill-tag, .item, .education-item, .work-item, .project-item, .experience-item, .honor-item')).map(span);
      const images = Array.from(flow.querySelectorAll('img')).map(span);
      if (images.some(image => image.bottom - image.top > capacity))
        throw new Error('An image is taller than the page content area');
      for (const heading of Array.from(flow.querySelectorAll('h1,h2,h3,h4,.section-title,.side-title'))) {
        const headingSpan = span(heading);
        const nextLine = lines.filter(line => line.top >= headingSpan.bottom - .1)
          .sort((a, b) => a.top - b.top)[0];
        blocks.push({ top: headingSpan.top, bottom: nextLine?.bottom ?? headingSpan.bottom });
      }
      const height = Math.max(flow.scrollHeight, ...lines.map(line => line.bottom), 0);
      // 图片是硬约束；短条目避让退回文字行策略时也不能把照片切开。
      const slices = planPageSlices(height, capacity, [...lines, ...images], blocks);
      flow.remove();
      return { flow, slices };
    });
    return Array.from({ length: Math.max(...lanes.map(lane => lane.slices.length)) }, (_, pageIndex) => {
      const page = shell.cloneNode(true) as HTMLElement;
      const pageSlots = doubleColumn ? Array.from(page.children) as HTMLElement[] : [page];
      lanes.forEach(({ flow, slices }, index) => {
        const slice = slices[pageIndex];
        if (!slice) return;
        const viewport = document.createElement('div');
        Object.assign(viewport.style, { height: `${slice.end - slice.start}px`, width: '100%',
          overflow: 'hidden', flexShrink: '0', position: 'relative' });
        const copy = flow.cloneNode(true) as HTMLElement;
        copy.style.transform = `translateY(-${slice.start}px)`;
        viewport.append(copy);
        pageSlots[index].append(viewport);
      });
      return page;
    });
  } finally { stage.remove(); }
}
