import React from 'react';
import { Task } from '../types';
import { Icons } from './Icons';
import { getThemeColor } from '../utils';

interface TaskRowProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onStar: (id: number) => void;
    onFocus: (id: number) => void;
    showTypeDot?: boolean;
    isBlurred?: boolean;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle, onDelete, onStar, onFocus, showTypeDot, isBlurred }) => {
    return (
        <div className={`group flex items-center p-2.5 rounded-lg border border-transparent hover:bg-white/[0.03] hover:border-white/5 transition-all cursor-pointer ${task.done ? 'opacity-60' : ''}`}
             onClick={() => onFocus(task.id)}>
            <div className="flex items-center flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <div 
                    onClick={() => onToggle(task.id)}
                    className={`w-[18px] h-[18px] rounded border flex items-center justify-center mr-3 flex-shrink-0 cursor-pointer transition-colors
                    ${task.done 
                        ? 'bg-saas border-saas text-white' 
                        : 'border-slate-600 hover:border-slate-400 bg-transparent'}`}
                >
                    {task.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4L3.5 6.5L9 1" /></svg>}
                </div>
                
                {showTypeDot && (
                    <div className={`w-1.5 h-1.5 rounded-full mr-3 shadow-[0_0_8px_currentColor] flex-shrink-0 ${getThemeColor(task.type)} bg-current`}></div>
                )}

                <span 
                    className={`text-sm truncate select-none transition-all duration-300 ${task.done ? 'line-through text-slate-500' : 'text-slate-200'} ${isBlurred ? 'blur-[5px] group-hover:blur-0 opacity-50 group-hover:opacity-100' : ''}`}
                >
                    {task.text}
                </span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 ml-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
                    className={`p-1 hover:scale-110 transition-transform ${task.todayStar ? 'text-gold opacity-100 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-600 hover:text-gold'}`}
                >
                    <Icons.Star size={16} fill={task.todayStar ? "currentColor" : "none"} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    className="p-1 text-slate-600 hover:text-alert hover:scale-110 transition-all"
                >
                    <Icons.Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default TaskRow;