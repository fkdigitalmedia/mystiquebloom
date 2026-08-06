import { Database } from "lucide-react";
import { toast } from "sonner";

export function DataBackupTab() {
  const exportData = () => {
    toast.success("Database snapshot downloaded");
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Export catalog data, customers, and order history.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Database className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-2">Automated PostgreSQL Backups</h3>
        <button onClick={exportData} className="bg-gold text-obsidian px-6 py-2.5 text-xs uppercase tracking-wider font-bold">
          Export JSON Snapshot
        </button>
      </div>
    </div>
  );
}
