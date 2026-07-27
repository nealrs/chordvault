import { useMemo } from 'react';
import { getUniqueChords } from '../lib/chords';
import { ChordDiagram } from './ChordDiagram';
import { useChordChartVisible } from '../hooks/useChordChartVisible';

interface ChordChartBarProps {
  content: string;
  transpose: number;
}

export function ChordChartBar({ content, transpose }: ChordChartBarProps) {
  const { visible, toggle } = useChordChartVisible();
  const chords = useMemo(() => getUniqueChords(content, transpose), [content, transpose]);

  if (!chords.length) return null;

  return (
    <div className="chord-chart-bar">
      <button
        className="chord-chart-toggle"
        onClick={toggle}
        title={visible ? 'Hide chord chart' : 'Show chord chart'}
      >
        &#9834; {visible ? '▲' : '▼'}
      </button>
      {visible && (
        <div className="chord-chart-scroll">
          {chords.map((c) => (
            <ChordDiagram key={c} name={c} />
          ))}
        </div>
      )}
    </div>
  );
}
