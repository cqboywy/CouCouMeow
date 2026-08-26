import { Cat } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="brand" aria-label="凑凑喵英语乐园">
      <span className="brand__icon" aria-hidden="true"><Cat size={28} strokeWidth={2.2} /></span>
      <span>
        <h1 className="brand__name">凑凑喵英语乐园</h1>
        <span className="brand__english" lang="en">CouCouMeow English Land</span>
      </span>
    </div>
  );
}
