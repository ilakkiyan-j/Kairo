'use client';

import React from 'react';
import { Database, ShieldAlert, Wrench, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface ContextItem {
  id: string;
  category: string;
  title: string;
  score: number;
  details: any;
}

interface RetrievedContextCardProps {
  contextItems: ContextItem[];
  queryText: string | null;
}

export const RetrievedContextCard: React.FC<RetrievedContextCardProps> = ({
  contextItems,
  queryText,
}) => {
  // Demo fallback context if no live turn has occurred yet
  const defaultItems: ContextItem[] = [
    {
      id: 'E17',
      category: 'error_code',
      title: 'Pressure Sensor Signal Anomaly / Out of Range',
      score: 32.0,
      details: {
        equipment_type: 'XJ-400',
        severity: 'High',
        meaning: 'Primary discharge pressure sensor PT-204 feedback signal deviated by >15%.',
        recommended_checks: [
          'Inspect sensor PT-204 wiring harness and terminal block.',
          'Verify sensor reading against manual analog gauge PI-204.',
          'Perform zero-point calibration if analog reading matches.',
        ],
      },
    },
    {
      id: 'P-204',
      category: 'equipment',
      title: 'High-Pressure Hydraulic Feed Pump',
      score: 30.5,
      details: {
        site: 'Site-12',
        model: 'XJ-400',
        operating_pressure: '4.5 to 8.0 bar',
        location: 'Site 12 - Substation B, Bay 4',
      },
    },
    {
      id: 'ISO-S12-04',
      category: 'safety',
      title: 'Site 12 Electrical & Hydraulic Isolation Procedure',
      score: 29.0,
      details: {
        mandatory_ppe: ['Arc-flash face shield', 'Class 0 insulated gloves', 'Steel-toe boots'],
        steps: [
          'Disconnect and lock out main 415V breaker CB-204.',
          'Apply personal LOTO padlock and tag.',
          'Depressurize hydraulic manifold via bleed valve BV-01.',
        ],
      },
    },
    {
      id: 'MR-2026-8841',
      category: 'maintenance',
      title: 'Maintenance Record P-204',
      score: 27.0,
      details: {
        date: '2026-08-24 (18 days ago)',
        technician: 'Sarah Jenkins',
        action: 'Pressure sensor PT-204 inspection and zero-point calibration.',
      },
    },
  ];

  const itemsToDisplay = contextItems.length > 0 ? contextItems : defaultItems;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'error_code':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
          label: 'Error Code',
          color: 'bg-red-500/10 border-red-500/30 text-red-400',
        };
      case 'equipment':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Equipment Spec',
          color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        };
      case 'safety':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Safety Procedure',
          color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        };
      case 'maintenance':
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Maintenance Log',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        };
      default:
        return {
          icon: <Layers className="w-3.5 h-3.5 text-slate-400" />,
          label: category,
          color: 'bg-slate-800 border-slate-700 text-slate-300',
        };
    }
  };

  return (
    <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase font-mono">
            Retrieved Operational Context
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {itemsToDisplay.length} Records Injected
        </span>
      </div>

      {queryText && (
        <div className="text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">Query: </span>
          <span className="text-cyan-300">&quot;{queryText}&quot;</span>
        </div>
      )}

      {/* Accordion / Cards List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {itemsToDisplay.map((item, idx) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={idx}
              className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono border ${badge.color}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-bold">
                    {item.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Score: {item.score}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-200">
                {item.title}
              </h4>

              {/* Dynamic Key-Value snippets */}
              <div className="text-xs font-mono text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-md border border-slate-800/80">
                {item.details.severity && (
                  <p>
                    <strong className="text-red-400">Severity: </strong>
                    <span className="text-red-300 font-bold">{item.details.severity}</span>
                  </p>
                )}
                {item.details.meaning && (
                  <p>
                    <strong className="text-slate-300">Meaning: </strong>
                    {item.details.meaning}
                  </p>
                )}
                {item.details.model && (
                  <p>
                    <strong className="text-slate-300">Model: </strong>
                    {item.details.model}
                  </p>
                )}
                {item.details.location && (
                  <p>
                    <strong className="text-slate-300">Location: </strong>
                    {item.details.location}
                  </p>
                )}
                {item.details.operating_pressure && (
                  <p>
                    <strong className="text-slate-300">Pressure Range: </strong>
                    {item.details.operating_pressure}
                  </p>
                )}
                {item.details.action && (
                  <p>
                    <strong className="text-slate-300">Action: </strong>
                    {item.details.action}
                  </p>
                )}
                {item.details.findings && (
                  <p>
                    <strong className="text-emerald-400">Findings: </strong>
                    {item.details.findings}
                  </p>
                )}
                {(item.details.technician || item.details.date) && (
                  <p className="text-[11px] text-slate-500">
                    <strong className="text-slate-400">Log Info: </strong>
                    {item.details.technician ? `${item.details.technician} ` : ''}
                    {item.details.date ? `(${item.details.date})` : ''}
                  </p>
                )}
                {item.details.probable_causes && Array.isArray(item.details.probable_causes) && (
                  <div>
                    <strong className="text-slate-300 block mb-0.5">Probable Causes:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                      {item.details.probable_causes.slice(0, 2).map((cause: string, cIdx: number) => (
                        <li key={cIdx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.details.recommended_checks && Array.isArray(item.details.recommended_checks) && (
                  <div>
                    <strong className="text-slate-300 block mb-0.5">Recommended Checks:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                      {item.details.recommended_checks.slice(0, 2).map((check: string, cIdx: number) => (
                        <li key={cIdx}>{check}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.details.mandatory_ppe && Array.isArray(item.details.mandatory_ppe) && (
                  <p>
                    <strong className="text-amber-400">Mandatory PPE: </strong>
                    <span className="text-amber-200">{item.details.mandatory_ppe.join(', ')}</span>
                  </p>
                )}
                {item.details.steps && Array.isArray(item.details.steps) && (
                  <div>
                    <strong className="text-amber-400 block mb-0.5">Isolation Steps:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1">
                      {item.details.steps.slice(0, 2).map((step: string, sIdx: number) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
