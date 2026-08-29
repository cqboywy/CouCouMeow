import { describe, expect, it } from 'vitest';
import { getNextTextbookPage, getTextbookPageById, getUnitTextbookPages } from './pepGrade4UpperTextbookPages';

describe('PEP 四年级上册逐页教材内容', () => {
  it('按印刷页码提供 Unit 1 的完整第 2–13 页', () => {
    expect(getUnitTextbookPages('pep4a-u1').map(page => page.printedPage)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(getNextTextbookPage('pep4a-u1-p3')?.id).toBe('pep4a-u1-p4');
    expect(getNextTextbookPage('pep4a-u1-p13')?.id).toBe('pep4a-u2-p14');
  });

  it('按印刷页码提供 Unit 2 的完整第 14–25 页，并从 Unit 1 自然接续', () => {
    expect(getUnitTextbookPages('pep4a-u2').map(page => page.printedPage)).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
    expect(getNextTextbookPage('pep4a-u1-p13')?.id).toBe('pep4a-u2-p14');
    expect(getNextTextbookPage('pep4a-u2-p25')).toBeUndefined();
  });

  it('保留第 3 页原句和可追溯的重点来源', () => {
    const page = getTextbookPageById('pep4a-u1-p3');

    expect(page?.sections[0]?.sentences[0]?.english).toBe('How do these children help at home?');
    expect(page?.focusItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ english: 'children', source: 'appendix-word' }),
    ]));
  });
});
