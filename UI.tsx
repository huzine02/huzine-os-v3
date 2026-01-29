import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; borderLeftColor?: string }> = ({ children, className = "", borderLeftColor }) => (
    <div className={`bg-bg-glass backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden shadow-lg ${className}`}
         style={borderLeftColor ? { borderLeft: `3px solid ${borderLeftColor}` } : {}}>
        {children}
    </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost' | 'primary' | 'outline' | 'alert' }> = ({ children, variant = 'outline', className = "", ...props }) => {
    const base = "h-[34px] px-4 rounded-lg text-xs font-medium font-sans transition-all flex items-center justify-center gap-2";
    const variants = {
        ghost: "hover:bg-white/5 text-slate-400 hover:text-white",
        outline: "border border-white/[0.06] text-slate-400 hover:bg-white/5 hover:text-white hover:border-slate-500",
        primary: "bg-pro text-white border border-blue-500 hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
        alert: "bg-red-900/20 text-red-500 border border-red-900/40 hover:bg-red-900/40 animate-pulse-soft"
    };
    
    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => (
    <input 
        ref={ref}
        className={`bg-white/[0.03] border border-white/[0.06] text-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white/5 focus:border-slate-500 focus:outline-none transition-all w-full placeholder:text-slate-600 ${className}`}
        {...props}
    />
));

export const SmartTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
            {children}
        </table>
    </div>
);
