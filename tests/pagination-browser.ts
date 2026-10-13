// 手动浏览器回归入口：npm run dev，然后访问 /tests/pagination-browser.html。
// 只使用仓库自带示例；独立 Pinia 实例、不安装持久化插件、不修改编辑器数据。
import { createApp, nextTick } from 'vue';
import { createPinia } from 'pinia';
import { useResumeStore } from '../src/store';
import { i18n } from '../src/i18n';
import { paginateResume } from '../src/utils/paginateResume';
import { createResumePdf } from '../src/utils/exportResumePdf';
import '../src/template/resume.css';
import 'ant-design-vue/dist/reset.css';

const modules = import.meta.glob('../src/template/**/index.vue');
const result = document.querySelector('#results')!;
const fixture = document.querySelector<HTMLElement>('#fixture')!;
const preview = document.querySelector('#preview')!;
fixture.style.cssText = 'position:absolute;left:-100000px;top:0;width:210mm';
const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
let longPages: HTMLElement[] = [];
const exportButton = document.querySelector<HTMLButtonElement>('#export-long')!;
const validateButton = document.querySelector<HTMLButtonElement>('#validate-pdf')!;
validateButton.addEventListener('click', async () => {
  validateButton.disabled = true;
  try {
    const pdf = await createResumePdf(longPages);
    assert(pdf.getNumberOfPages() === longPages.length, 'PDF and preview page counts differ');
    assert(Math.abs(pdf.internal.pageSize.getWidth() - 210) < .1, 'PDF A4 width');
    assert(Math.abs(pdf.internal.pageSize.getHeight() - 297) < .1, 'PDF A4 height');
    result.textContent += `\nPDF PASS: ${pdf.getNumberOfPages()} pages, A4; each preview page rendered separately (no download)`;
  } catch (error) { result.textContent += `\nPDF FAIL: ${error}`; }
  finally { validateButton.disabled = !longPages.length; }
});
exportButton.addEventListener('click', async () => {
  exportButton.disabled = true;
  try { (await createResumePdf(longPages)).save('pagination-six-page.pdf'); }
  catch (error) { result.textContent += `\nPDF FAIL: ${error}`; }
  finally { exportButton.disabled = !longPages.length; }
});

function audit(pages: HTMLElement[]) {
  const lines: string[] = [];
  for (const page of pages) {
    const rect = page.getBoundingClientRect();
    assert(Math.abs(rect.height - 297 * 96 / 25.4) < 1, 'A4 height');
    assert(Math.abs(rect.width - 210 * 96 / 25.4) < 1, 'A4 width');
    const slots = page.classList.contains('resume-template-c') ? Array.from(page.children) : [page];
    for (const slot of slots) {
      const viewport = slot.firstElementChild as HTMLElement | null;
      if (!viewport) continue;
      const clip = viewport.getBoundingClientRect();
      assert(clip.top >= rect.top + 10 * 96 / 25.4 - 1, 'repeated top margin');
      assert(clip.bottom <= rect.bottom - 10 * 96 / 25.4 + 1, 'repeated bottom margin');
      for (const image of Array.from(viewport.querySelectorAll('img'))) {
        const box = image.getBoundingClientRect();
        if (box.bottom <= clip.top || box.top >= clip.bottom) continue;
        assert(box.top >= clip.top - .1 && box.bottom <= clip.bottom + .1, 'image clipped vertically');
        assert(box.left >= clip.left - 1 && box.right <= clip.right + 1, 'image overflows horizontally');
      }
      const walker = document.createTreeWalker(viewport, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const line of Array.from(range.getClientRects())) {
          if (!line.width || !line.height || line.bottom <= clip.top + .05 || line.top >= clip.bottom - .05) continue;
          assert(line.top >= clip.top - .1 && line.bottom <= clip.bottom + .1,
            `glyph line clipped vertically: ${node.textContent?.slice(0,30)} line=${line.top.toFixed(2)}..${line.bottom.toFixed(2)} clip=${clip.top.toFixed(2)}..${clip.bottom.toFixed(2)}`);
          assert(line.left >= clip.left - 1 && line.right <= clip.right + 1, 'text overflows horizontally');
          lines.push(`${node.textContent}:${line.height.toFixed(2)}:${line.width.toFixed(2)}`);
        }
      }
    }
  }
  return lines;
}

async function run() {
  (document.querySelector('#run') as HTMLButtonElement).disabled = true;
  const output: string[] = [];
  result.textContent = 'Running…';
  const example = await (await fetch('/resumeData.json')).json();
  const cases = [
    { name: 'sample', font: 14.5, long: false },
    { name: 'large-font-long-paragraph', font: 24, long: true },
    { name: 'small-font-long-url', font: 12, long: true },
  ];
  let passed = 0;
  for (const [path, loader] of Object.entries(modules)) {
    for (const scenario of cases) {
      const pinia = createPinia();
      const store = useResumeStore(pinia);
      const data = structuredClone(example);
      data.resumeSetting.fontSize = scenario.font;
      if (scenario.long) {
        data.summary = Array.from({ length: 100 }, (_, index) =>
          `段落${index}：日本語 中文 English **bold** 😀 [link](https://example.com/${'long'.repeat(25)})。`).join(' ');
      }
      store.$patch(data);
      const { default: template } = await loader() as { default: Parameters<typeof createApp>[0] };
      const app = createApp(template, { colorShades: {} });
      app.use(pinia); app.use(i18n); app.mount(fixture);
      try {
        await nextTick(); await document.fonts.ready;
        const source = fixture.querySelector<HTMLElement>('.resume-paper')!;
        await Promise.all(Array.from(source.querySelectorAll('img'), img => img.decode().catch(() => undefined)));
        const pages = paginateResume(source);
        preview.replaceChildren(...pages);
        const first = audit(pages);
        // 以全高度、无裁切的相同栏位建立对照，比较所有文字行的次数和尺寸。
        // 每页的 clone 含整栏内容，所以必须检查可见 Range，不能比较 textContent。
        const baseline = pages[0].cloneNode(true) as HTMLElement;
        baseline.style.height = '100000px';
        const slots = baseline.classList.contains('resume-template-c') ? Array.from(baseline.children) : [baseline];
        for (const slot of slots) {
          (slot as HTMLElement).style.height = '100000px';
          const viewport = slot.firstElementChild as HTMLElement;
          if (viewport) { viewport.style.height = '99900px'; viewport.firstElementChild && ((viewport.firstElementChild as HTMLElement).style.transform = 'none'); }
        }
        preview.append(baseline);
        const expected: string[] = [];
        for (const slot of slots) {
          const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT);
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if (!node.textContent?.trim()) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            for (const r of Array.from(range.getClientRects())) if (r.width && r.height)
              expected.push(`${node.textContent}:${r.height.toFixed(2)}:${r.width.toFixed(2)}`);
          }
        }
        baseline.remove();
        assert(JSON.stringify(first.sort()) === JSON.stringify(expected.sort()), 'visible text duplicated or missing');
        passed++;
        if (path.includes('/templateC/') && scenario.name === 'large-font-long-paragraph') {
          longPages = pages.map(page => page.cloneNode(true) as HTMLElement);
          exportButton.disabled = false;
          validateButton.disabled = false;
        }
        output.push(`PASS ${path.split('/').slice(-2)[0]} / ${scenario.name}: ${pages.length} pages; ${first.length} visible text runs`);
      } catch (error) { output.push(`FAIL ${path} / ${scenario.name}: ${error}`); }
      finally { app.unmount(); }
      result.textContent = output.join('\n');
    }
  }
  result.textContent += `\n${passed}/15 passed`;
  (document.querySelector('#run') as HTMLButtonElement).disabled = false;
}
document.querySelector('#run')!.addEventListener('click', () => run().catch(error => { result.textContent += `\n${error}`; }));
