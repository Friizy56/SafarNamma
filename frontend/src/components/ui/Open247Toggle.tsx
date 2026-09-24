import { Moon } from 'lucide-react';

/* "Open 24/7" switch that sits above the opening/closing time pickers. */
export const Open247Toggle = ({ checked, onChange, id = 'open-24-7' }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) => (
  <label htmlFor={id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 cursor-pointer select-none">
    <span className="flex items-center gap-3">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${checked ? 'bg-[#102A2E] text-[#F2ECE3]' : 'bg-gray-100 text-gray-500'}`}>
        <Moon className="w-4 h-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-900">Open 24/7</span>
        <span className="block text-xs text-gray-500">Never closes, day or night</span>
      </span>
    </span>
    <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
    <span
      aria-hidden
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[#E0561F] ${checked ? 'bg-[#E0561F]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </label>
);
