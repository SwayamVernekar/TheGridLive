// Naively converted from TypeScript — please review for correctness.
import { ReactNode } from 'react';



export function ChartContainer({ title, description, children }) {
  return (
    <div className="bg-f1gray rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-f1light mb-2">{title}</h2>
      {description && <p className="text-f1light/60 text-sm mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
