import { describe, it, expect } from 'vitest';
import { getChordShape } from '../chord-shapes';

describe('getChordShape', () => {
  it('returns the standard open-position shapes for natural roots', () => {
    expect(getChordShape('C')!.frets).toEqual([null, 3, 2, 0, 1, 0]);
    expect(getChordShape('D')!.frets).toEqual([null, null, 0, 2, 3, 2]);
    expect(getChordShape('E')!.frets).toEqual([0, 2, 2, 1, 0, 0]);
    expect(getChordShape('G')!.frets).toEqual([3, 2, 0, 0, 0, 3]);
    expect(getChordShape('A')!.frets).toEqual([null, 0, 2, 2, 2, 0]);
  });

  it('returns standard barre shapes for roots with no open position (F, B)', () => {
    expect(getChordShape('F')!.frets).toEqual([1, 3, 3, 2, 1, 1]);
    expect(getChordShape('Fmaj7')!.frets).toEqual([null, null, 3, 2, 1, 0]);
    expect(getChordShape('B')!.frets).toEqual([null, 2, 4, 4, 4, 2]);
    expect(getChordShape('Bm')!.frets).toEqual([null, 2, 4, 4, 3, 2]);
  });

  it('slides barre shapes to the correct fret for sharps/flats', () => {
    // F# major = F major shape (E-shape barre) moved up 2 frets
    expect(getChordShape('F#')!.frets).toEqual([2, 4, 4, 3, 2, 2]);
    // Bb major = A-shape barre at fret 1
    expect(getChordShape('Bb')!.frets).toEqual([null, 1, 3, 3, 3, 1]);
  });

  it('prefers the site\'s lowest-position voicing over a higher barre shape', () => {
    // C minor: the site's primary voicing is this lower, non-barre shape
    // rather than the "textbook" A-shape barre at fret 3.
    expect(getChordShape('Cm')!.frets).toEqual([null, 3, 1, 0, 1, 3]);
  });

  it('has correct easy open shapes for common sus chords', () => {
    expect(getChordShape('Dsus4')!.frets).toEqual([null, null, 0, 2, 3, 3]);
    expect(getChordShape('Dsus2')!.frets).toEqual([null, null, 0, 2, 3, 0]);
    expect(getChordShape('Asus4')!.frets).toEqual([null, 0, 2, 2, 3, 0]);
    expect(getChordShape('Asus2')!.frets).toEqual([null, 0, 2, 2, 0, 0]);
  });

  it('builds correct power chord (5) shapes', () => {
    expect(getChordShape('E5')!.frets).toEqual([0, 2, null, null, null, null]);
    expect(getChordShape('A5')!.frets).toEqual([null, 0, 2, 2, null, null]);
  });

  it('ignores the bass note on slash chords and diagrams the base chord', () => {
    expect(getChordShape('G/B')!.frets).toEqual(getChordShape('G')!.frets);
  });

  it('covers the extended qualities scraped from all-guitar-chords.com', () => {
    expect(getChordShape('Cdim')!.frets).toEqual([null, 3, 4, 5, 4, null]);
    expect(getChordShape('Cdim7')!.frets).toEqual([2, null, 1, 2, 1, null]);
    expect(getChordShape('Gaug')!.frets).toEqual([3, 2, 1, 0, 0, 3]);
    expect(getChordShape('C9')!.frets).toEqual([null, 3, 2, 3, 3, 3]);
    expect(getChordShape('Gadd9')!.frets).toEqual([null, 10, 9, 7, 10, 7]);
    expect(getChordShape('Am6')!.frets).toEqual([null, null, 2, 2, 1, 2]);
    expect(getChordShape('Am7b5')!.frets).toEqual([null, 0, 1, 0, 1, null]);
    expect(getChordShape('G7sus4')!.frets).toEqual([3, 5, 3, 5, 3, 3]);
  });

  it('returns null for chord suffixes it does not recognize, instead of guessing', () => {
    expect(getChordShape('Cxyz')).toBeNull();
    expect(getChordShape('C13#9#11')).toBeNull();
  });

  it('returns null for unparseable input', () => {
    expect(getChordShape('Chorus')).toBeNull();
    expect(getChordShape('')).toBeNull();
  });
});
