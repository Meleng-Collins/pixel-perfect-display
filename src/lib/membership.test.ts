import { describe, it, expect } from 'vitest';
import { documentLimit, validDocument } from './membership';
describe('Private member documents', () => {
 it('accepts documents up to the 5 MB limit', () => { expect(documentLimit).toBe(5242880); expect(validDocument({size:5242880,type:'application/pdf'})).toBe(true); expect(validDocument({size:5242881,type:'application/pdf'})).toBe(false); });
 it('allows only PDF, JPG, PNG and WebP documents', () => { for (const type of ['application/pdf','image/jpeg','image/png','image/webp']) expect(validDocument({size:100,type})).toBe(true); expect(validDocument({size:100,type:'text/html'})).toBe(false); expect(validDocument({size:0,type:'application/pdf'})).toBe(false); });
});