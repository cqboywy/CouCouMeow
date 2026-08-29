export type TextbookUnitOverview = {
  id: string;
  sequence: number;
  title: string;
  chineseTitle: string;
  firstPage: number;
  lastPage: number;
  modules: string[];
};

export const pepGrade4UpperTextbookUnits: TextbookUnitOverview[] = [
  { id: 'pep4a-u1', sequence: 1, title: 'Helping at home', chineseTitle: '在家帮忙', firstPage: 2, lastPage: 13, modules: ['单元导入', 'Part A', 'Part B', '阅读与项目'] },
  { id: 'pep4a-u2', sequence: 2, title: 'My friends', chineseTitle: '我的朋友', firstPage: 14, lastPage: 25, modules: ['单元导入', 'Part A', 'Part B', '阅读与项目'] },
  { id: 'pep4a-u3', sequence: 3, title: 'Places we live in', chineseTitle: '我们居住的地方', firstPage: 26, lastPage: 37, modules: [] },
  { id: 'pep4a-u4', sequence: 4, title: 'Helping in the community', chineseTitle: '社区互助', firstPage: 38, lastPage: 49, modules: [] },
  { id: 'pep4a-u5', sequence: 5, title: 'The weather and us', chineseTitle: '天气与我们', firstPage: 50, lastPage: 61, modules: [] },
  { id: 'pep4a-u6', sequence: 6, title: 'Changing for the seasons', chineseTitle: '季节变化', firstPage: 62, lastPage: 73, modules: [] },
];

export const getTextbookUnitOverview = (unitId: string) => pepGrade4UpperTextbookUnits.find(unit => unit.id === unitId);
