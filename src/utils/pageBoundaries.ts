export interface VerticalSpan { top: number; bottom: number }
export interface PageSlice { start: number; end: number }

/**
 * 按实际文字行选断点。不可分条目只在它能装进一页时避让；
 * 避让会令当前页无法前进时，退回文字行规则，避免死循环和空白页。
 * 小数坐标原样保留，不能取整后切掉抗锯齿文字的末端。
 */
export function planPageSlices(height: number, capacity: number,
  lines: VerticalSpan[], keepTogether: VerticalSpan[] = []): PageSlice[] {
  if (!Number.isFinite(height) || height < 0 || !Number.isFinite(capacity) || capacity <= 0)
    throw new Error('Invalid page dimensions');
  const valid = (span: VerticalSpan) => Number.isFinite(span.top) && Number.isFinite(span.bottom)
    && span.bottom > span.top;
  const text = lines.filter(valid);
  if (text.some(line => line.bottom - line.top > capacity))
    throw new Error('A text line is taller than the page content area');
  const blocks = keepTogether.filter(valid).filter(span => span.bottom - span.top <= capacity);
  const retreat = (target: number, start: number, spans: VerticalSpan[]) => {
    let end = target;
    // 连续回退，处理互相重叠的文字行、标题与短条目。
    for (;;) {
      const crossing = spans.filter(span => span.top < end && span.bottom > end && span.bottom > start);
      if (!crossing.length) return end;
      const next = Math.min(...crossing.map(span => span.top));
      if (next <= start + .01) return start;
      end = next;
    }
  };
  const pages: PageSlice[] = [];
  let start = 0;
  while (start < height) {
    const target = Math.min(height, start + capacity);
    let end = target === height ? height : retreat(target, start, [...text, ...blocks]);
    if (end <= start + .01) end = retreat(target, start, text);
    if (end <= start + .01) throw new Error('Cannot find a safe page boundary');
    pages.push({ start, end });
    start = end;
  }
  return pages.length ? pages : [{ start: 0, end: 0 }];
}
