import { describe, expect, it } from 'vitest';
import { getNextTextbookPage, getTextbookPageById, getUnitTextbookPages } from './pepGrade4UpperTextbookPages';

describe('PEP 四年级上册逐页教材内容', () => {
  it('按印刷页码排列 Unit 1，并从第 3 页进入第 4 页', () => {
    expect(getUnitTextbookPages('pep4a-u1').map(page => page.printedPage)).toEqual([3, 4]);
    expect(getNextTextbookPage('pep4a-u1-p3')?.id).toBe('pep4a-u1-p4');
  });

  it('保留第 3 页原句和可追溯的重点来源', () => {
    const page = getTextbookPageById('pep4a-u1-p3');

    expect(page?.sections[0]?.sentences[0]?.english).toBe('How do these children help at home?');
    expect(page?.focusItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ english: 'children', source: 'appendix-word' }),
    ]));
  });
});
