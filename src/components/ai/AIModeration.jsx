import { Sparkles, AlertCircle, CheckCircle, Flame } from 'lucide-react';

export default function AIModeration({ decision, reason, score }) {
  if (!decision) return null;


  const isApproved = decision === 'APPROVE';

  return (
    <div className={`rounded-2xl border p-4 mb-6 shadow-sm overflow-hidden relative ${isApproved ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'
      }`}>
      {/* Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-[4]">
        {isApproved ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
      </div>

      <div className="relative flex items-start gap-4">
        <div className={`mt-1 p-2 rounded-xl border ${isApproved ? 'bg-green-100/50 border-green-200 text-green-600' : 'bg-red-100/50 border-red-200 text-red-600'
          }`}>
          {isApproved ? <Sparkles size={18} /> : <Flame size={18} />}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isApproved ? 'text-green-800' : 'text-red-800'
              }`}>
              AI Content Moderated - {decision}
            </h4>
            {score && (
              <span className="text-[10px] font-bold bg-white/50 px-1.5 rounded-full border border-inherit">
                Confidence: {Math.round(score * 100)}%
              </span>
            )}
          </div>

          <p className={`text-sm leading-relaxed font-medium ${isApproved ? 'text-green-700/80' : 'text-red-700/80'
            }`}>
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
}