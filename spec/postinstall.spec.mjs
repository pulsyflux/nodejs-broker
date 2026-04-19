import { compareVersions, checkGoVersion } from '../postinstall.mjs';

describe('postinstall utilities', () => {

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(compareVersions('1.25.0', '1.25.0')).toBe(0);
      expect(compareVersions('1.25', '1.25.0')).toBe(0);
    });

    it('should return 1 when a > b', () => {
      expect(compareVersions('1.25.1', '1.25.0')).toBe(1);
      expect(compareVersions('1.26.0', '1.25.0')).toBe(1);
      expect(compareVersions('2.0.0', '1.25.0')).toBe(1);
    });

    it('should return -1 when a < b', () => {
      expect(compareVersions('1.24.0', '1.25.0')).toBe(-1);
      expect(compareVersions('1.25.0', '1.25.1')).toBe(-1);
      expect(compareVersions('0.9.0', '1.0.0')).toBe(-1);
    });

    it('should handle versions with different segment counts', () => {
      expect(compareVersions('1.25', '1.25.0')).toBe(0);
      expect(compareVersions('1.25.0', '1.25')).toBe(0);
      expect(compareVersions('1.25', '1.25.1')).toBe(-1);
    });
  });

  describe('checkGoVersion', () => {
    it('should accept go version >= 1.25', () => {
      expect(checkGoVersion('go version go1.25.0 windows/amd64')).toBe(true);
      expect(checkGoVersion('go version go1.25.3 windows/amd64')).toBe(true);
      expect(checkGoVersion('go version go1.26.0 linux/amd64')).toBe(true);
      expect(checkGoVersion('go version go2.0.0 darwin/arm64')).toBe(true);
    });

    it('should reject go version < 1.25', () => {
      expect(checkGoVersion('go version go1.24.0 windows/amd64')).toBe(false);
      expect(checkGoVersion('go version go1.22.5 linux/amd64')).toBe(false);
      expect(checkGoVersion('go version go1.21.0 darwin/arm64')).toBe(false);
    });

    it('should reject malformed version strings', () => {
      expect(checkGoVersion('')).toBe(false);
      expect(checkGoVersion('not a version')).toBe(false);
      expect(checkGoVersion('go version')).toBe(false);
    });

    it('should accept custom minimum version', () => {
      expect(checkGoVersion('go version go1.22.0 windows/amd64', '1.22.0')).toBe(true);
      expect(checkGoVersion('go version go1.21.0 windows/amd64', '1.22.0')).toBe(false);
    });

    it('should handle version without patch number', () => {
      expect(checkGoVersion('go version go1.25 windows/amd64')).toBe(true);
    });
  });
});
