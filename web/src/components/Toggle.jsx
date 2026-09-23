import clsx from 'clsx';

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className={clsx(
          "w-8 h-4 rounded-full relative transition-colors duration-200",
          checked ? "bg-accent" : "bg-white/20 group-hover:bg-white/30"
        )}>
          <div className={clsx(
            "w-4 h-4 bg-white rounded-full absolute left-0 top-0 transition-transform duration-300 ease-spring",
            checked ? "transform translate-x-[100%] border-accent" : "border-gray-300"
          )}></div>
        </div>
      </div>
      {label && <span className="ml-3 text-xs font-medium text-white/80 select-none">{label}</span>}
    </label>
  );
}