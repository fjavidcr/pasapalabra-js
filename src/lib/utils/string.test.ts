import test from 'node:test'
import assert from 'node:assert'
import { normalizeString } from './string.ts'

test('normalizeString utility', async (t) => {
  await t.test('should trim whitespace', () => {
    assert.strictEqual(normalizeString('  hello  '), 'hello')
    assert.strictEqual(normalizeString('\n  world \t'), 'world')
  })

  await t.test('should convert to lowercase', () => {
    assert.strictEqual(normalizeString('HELLO'), 'hello')
    assert.strictEqual(normalizeString('pAsaPalabra'), 'pasapalabra')
  })

  await t.test('should remove Spanish accents (diacritics)', () => {
    assert.strictEqual(normalizeString('áéíóú'), 'aeiou')
    assert.strictEqual(normalizeString('ÁÉÍÓÚ'), 'aeiou')
  })

  await t.test('should handle the letter ñ', () => {
    assert.strictEqual(normalizeString('niño'), 'nino')
    assert.strictEqual(normalizeString('NIÑO'), 'nino')
  })

  await t.test('should handle the letter ü', () => {
    assert.strictEqual(normalizeString('pingüino'), 'pinguino')
    assert.strictEqual(normalizeString('PINGÜINO'), 'pinguino')
  })

  await t.test('should handle combination of all features', () => {
    assert.strictEqual(normalizeString('  ÁÉÍóú ñ Ü  '), 'aeiou n u')
  })

  await t.test('should handle empty strings', () => {
    assert.strictEqual(normalizeString(''), '')
    assert.strictEqual(normalizeString('   '), '')
  })
})
