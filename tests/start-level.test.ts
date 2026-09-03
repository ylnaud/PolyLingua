import { describe, it, expect } from 'vitest';
import { isLevelOpen, startLevelKey } from '../src/lib/startLevel';

const NIVELES = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const nadaAprobado = () => false;

function abiertos(startLevel: string, isPassed: (levelId: string) => boolean = nadaAprobado) {
  return NIVELES.filter((_, i) => isLevelOpen(i, { levelIds: NIVELES, startLevel, isPassed }));
}

describe('nivel de inicio', () => {
  it('sin elegir nada se comporta como siempre: solo el primero', () => {
    expect(abiertos('a1')).toEqual(['a1']);
  });

  it('elegir B1 abre hasta B1, incluidos los de abajo', () => {
    // Los anteriores quedan abiertos a propósito: repasar algo más fácil nunca
    // fue el problema que el candado venía a resolver.
    expect(abiertos('b1')).toEqual(['a1', 'a2', 'b1']);
  });

  it('elegir C2 abre el curso entero', () => {
    expect(abiertos('c2')).toEqual(NIVELES);
  });

  it('hacia adelante sigue mandando el examen', () => {
    // Con B1 elegido y su examen aprobado, se abre B2 — pero no C1.
    const aprobado = (id: string) => id === 'b1';
    expect(abiertos('b1', aprobado)).toEqual(['a1', 'a2', 'b1', 'b2']);
  });

  it('un nivel guardado que ya no existe no abre nada de más', () => {
    expect(abiertos('b3')).toEqual(['a1']);
  });

  it('la clave lleva el idioma: se puede ir por B1 en inglés y A1 en alemán', () => {
    expect(startLevelKey('de')).toBe('polylingua-start-level-de');
    expect(startLevelKey('en')).not.toBe(startLevelKey('de'));
  });
});
