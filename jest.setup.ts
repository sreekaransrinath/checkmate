import "@testing-library/jest-dom";

// Mock chrome.storage.sync
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
};

global.chrome = {
  storage: {
    sync: mockStorage,
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
} as unknown as typeof chrome;
