import { X, AlertCircle, Terminal, Braces, ArrowRight } from 'lucide-react';
import Button from './Button';

interface DriftDetailsModalProps {
    projectId: string;
    detection: any;
    onClose: () => void;
}

export default function DriftDetailsModal({ detection, onClose }: DriftDetailsModalProps) {
    if (!detection) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-400 text-xs uppercase">{detection.method}</span>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{detection.endpointPath}</h2>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{detection.discrepancyType.replace('_', ' ')} detected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <Braces className="w-3 h-3" /> Documented Spec
                        </div>
                        <div className="bg-slate-900 rounded-3xl p-6 overflow-auto max-h-96 shadow-inner">
                            <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                                {JSON.stringify(detection.specDefinition, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <Terminal className="w-3 h-3" /> Live Response
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 overflow-auto max-h-96">
                            <pre className="text-xs text-slate-700 font-mono leading-relaxed">
                                {JSON.stringify(detection.actualResponse, null, 2)}
                            </pre>
                        </div>
                    </div>
                </main>

                <footer className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <p className="text-xs font-medium text-slate-400">
                        Detected on {new Date(detection.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose}>Dismiss</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6">
                            Update Spec <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
}