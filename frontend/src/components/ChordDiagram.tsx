import { getChordShape } from '../lib/chord-shapes';

interface ChordDiagramProps {
  name: string;
}

const STRINGS = 6;
const FRETS_SHOWN = 4;
const W = 64;
const H = 76;
const GRID_TOP = 18;
const GRID_LEFT = 8;
const GRID_RIGHT = W - 8;
const GRID_BOTTOM = GRID_TOP + 48;
const STRING_GAP = (GRID_RIGHT - GRID_LEFT) / (STRINGS - 1);
const FRET_GAP = (GRID_BOTTOM - GRID_TOP) / FRETS_SHOWN;

export function ChordDiagram({ name }: ChordDiagramProps) {
  const shape = getChordShape(name);

  if (!shape) {
    // Unsupported quality (dim, aug, 9, add9, ...) -- show the name only,
    // no guessed fingering.
    return (
      <div className="chord-diagram chord-diagram-unsupported" title="No diagram available for this chord">
        <div className="chord-diagram-name">{name}</div>
        <div className="chord-diagram-noshape">?</div>
      </div>
    );
  }

  const { frets, baseFret } = shape;
  // Window starts at fret 1 if everything fits in the first 4 frets,
  // otherwise slides up so the lowest fretted note is visible (like a
  // real chord book showing "5fr" next to the diagram).
  const windowStart = baseFret > FRETS_SHOWN - 1 ? baseFret : 1;

  const stringX = (i: number) => GRID_LEFT + i * STRING_GAP;
  const fretY = (f: number) => GRID_TOP + f * FRET_GAP;

  return (
    <div className="chord-diagram">
      <div className="chord-diagram-name">{name}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {windowStart > 1 && (
          <text x={GRID_LEFT - 6} y={GRID_TOP + FRET_GAP * 0.75} className="chord-diagram-fretlabel">
            {windowStart}fr
          </text>
        )}

        {/* nut (thick line) or top fret (thin line) */}
        <line
          x1={GRID_LEFT} y1={GRID_TOP} x2={GRID_RIGHT} y2={GRID_TOP}
          className={windowStart === 1 ? 'chord-diagram-nut' : 'chord-diagram-fretline'}
        />
        {/* fret lines */}
        {Array.from({ length: FRETS_SHOWN }).map((_, i) => (
          <line
            key={i}
            x1={GRID_LEFT} y1={fretY(i + 1)} x2={GRID_RIGHT} y2={fretY(i + 1)}
            className="chord-diagram-fretline"
          />
        ))}
        {/* strings */}
        {Array.from({ length: STRINGS }).map((_, i) => (
          <line
            key={i}
            x1={stringX(i)} y1={GRID_TOP} x2={stringX(i)} y2={GRID_BOTTOM}
            className="chord-diagram-string"
          />
        ))}

        {/* open / muted markers above the nut */}
        {frets.map((f, i) => {
          if (f === null) {
            return (
              <text key={i} x={stringX(i)} y={GRID_TOP - 6} className="chord-diagram-mute" textAnchor="middle">
                &#215;
              </text>
            );
          }
          if (f === 0) {
            return (
              <circle key={i} cx={stringX(i)} cy={GRID_TOP - 7} r={2.6} className="chord-diagram-open" />
            );
          }
          return null;
        })}

        {/* fretted dots */}
        {frets.map((f, i) => {
          if (f === null || f === 0) return null;
          const rel = f - windowStart + 1; // which line-gap within the window
          if (rel < 1 || rel > FRETS_SHOWN) return null;
          const y = GRID_TOP + (rel - 0.5) * FRET_GAP;
          return <circle key={i} cx={stringX(i)} cy={y} r={4.5} className="chord-diagram-dot" />;
        })}
      </svg>
    </div>
  );
}
