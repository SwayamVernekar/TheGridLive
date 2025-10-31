// Naively converted from TypeScript — please review for correctness.
import { BarChart3, GitCompare, Activity } from 'lucide-react';



export function QuickNav({ onNavigate }) {
  const analyticsPages = [
    {
      name: 'Head-to-Head',
      path,
      icon,
      description,
    },
    {
      name: 'Consistency',
      path,
      icon,
      description,
    },
    {
      name: 'Race Pace',
      path,
      icon,
      description,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {analyticsPages.map((page) => {
        const Icon = page.icon;
        return (
          <button
            key={page.path}
            onClick={() => onNavigate(page.path)}
            className="bg-f1gray rounded-lg p-6 shadow-lg hover:scale-105 transition-transform text-left"
          >
            <Icon className="w-8 h-8 text-f1red mb-3" />
            <h3 className="text-xl font-bold text-f1light mb-2">{page.name}</h3>
            <p className="text-f1light/60">{page.description}</p>
          </button>
        );
      })}
    </div>
  );
}
