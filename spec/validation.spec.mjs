import { Server, Client } from '../.bin/release/registry.mjs';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const addon = require('../.bin/release/broker_addon.node');

describe('Input Validation', () => {
  let server;

  beforeAll(() => {
    server = new Server(':0');
    server.start();
  });

  afterAll(() => {
    if (server) server.stop();
    if (addon.cleanup) addon.cleanup();
  });

  describe('Server constructor', () => {
    it('should reject missing address argument', () => {
      expect(() => new Server()).toThrow();
    });

    it('should reject non-string address', () => {
      expect(() => new Server(12345)).toThrow();
    });

    it('should reject empty string address', () => {
      expect(() => new Server('')).toThrow();
    });

    it('should reject address exceeding 256 characters', () => {
      const longAddr = 'a'.repeat(257);
      expect(() => new Server(longAddr)).toThrow();
    });

    it('should accept valid address at 256 character limit', () => {
      // Should not throw on construction (may fail on start, but constructor validates length)
      expect(() => new Server('a'.repeat(256))).not.toThrow();
    });
  });

  describe('Client constructor', () => {
    it('should reject missing arguments', () => {
      expect(() => new Client()).toThrow();
    });

    it('should reject missing channelID', () => {
      expect(() => new Client(server.addr())).toThrow();
    });

    it('should reject non-string address', () => {
      expect(() => new Client(12345, randomUUID())).toThrow();
    });

    it('should reject non-string channelID', () => {
      expect(() => new Client(server.addr(), 12345)).toThrow();
    });

    it('should reject empty address', () => {
      expect(() => new Client('', randomUUID())).toThrow();
    });

    it('should reject address exceeding 256 characters', () => {
      expect(() => new Client('a'.repeat(257), randomUUID())).toThrow();
    });

    it('should reject channelID that is not 36 characters', () => {
      expect(() => new Client(server.addr(), 'not-a-uuid')).toThrow();
    });

    it('should reject channelID that is too long', () => {
      expect(() => new Client(server.addr(), 'a'.repeat(37))).toThrow();
    });

    it('should reject channelID that is too short', () => {
      expect(() => new Client(server.addr(), 'a'.repeat(35))).toThrow();
    });
  });

  describe('Client.publish', () => {
    it('should reject non-string non-buffer payload', () => {
      const channelID = randomUUID();
      const client = new Client(server.addr(), channelID);
      expect(() => client.publish(12345)).toThrow();
      expect(() => client.publish(null)).toThrow();
      expect(() => client.publish(undefined)).toThrow();
      client.close();
    });
  });

  describe('Client.onMessage', () => {
    it('should reject non-function callback', () => {
      const channelID = randomUUID();
      const client = new Client(server.addr(), channelID);
      expect(() => client._client.onMessage('not a function')).toThrow();
      expect(() => client._client.onMessage(123)).toThrow();
      client.close();
    });
  });
});
