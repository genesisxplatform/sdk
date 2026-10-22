/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { components } from '@gxpl/components';
import * as elements from '@gxpl/components/elements';
import { useComponentElement } from './useComponentElement';

jest.mock('@gxpl/components/elements', () => {
  const actual = jest.requireActual('@gxpl/components/elements');
  return {
    ...actual,
    getComponentElement: jest.fn(actual.getComponentElement),
    hasComponentElementFailed: jest.fn(actual.hasComponentElementFailed),
    loadComponentElement: jest.fn(actual.loadComponentElement)
  };
});

const mocked = jest.mocked(elements);
const actual = jest.requireActual<typeof elements>('@gxpl/components/elements');

describe('useComponentElement', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mocked.getComponentElement.mockReset().mockImplementation(actual.getComponentElement);
    mocked.hasComponentElementFailed.mockReset().mockImplementation(actual.hasComponentElementFailed);
    mocked.loadComponentElement.mockReset().mockImplementation(actual.loadComponentElement);
  });

  it('gets built-in elements synchronously from elements.node under jest', () => {
    const faq = components.find(component => component.id === 'faq');
    const { result } = renderHook(() => useComponentElement('faq'));
    expect(result.current).toEqual({ Element: faq?.element, isPending: false, isFailed: false });
    expect(mocked.loadComponentElement).not.toHaveBeenCalled();
  });

  it('switches from pending to failed once the load rejects, without retrying on re-render', async () => {
    let failed = false;
    const error = new Error('ChunkLoadError');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mocked.getComponentElement.mockReturnValue(undefined);
    mocked.hasComponentElementFailed.mockImplementation(() => failed);
    mocked.loadComponentElement.mockImplementation(() => {
      failed = true;
      return Promise.reject(error);
    });

    const { result, rerender } = renderHook(() => useComponentElement('faq'));
    expect(result.current).toEqual({ Element: undefined, isPending: true, isFailed: false });

    await waitFor(() => expect(result.current.isFailed).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('Failed to load component "faq":', error);
    const calls = mocked.loadComponentElement.mock.calls.length;

    rerender();
    rerender();
    expect(mocked.loadComponentElement).toHaveBeenCalledTimes(calls);
  });

  it('shows the element once a pending load resolves', async () => {
    const faq = components.find(component => component.id === 'faq');
    let loaded = false;
    mocked.getComponentElement.mockImplementation(() => (loaded ? faq?.element : undefined));
    mocked.loadComponentElement.mockImplementation(() => {
      loaded = true;
      return Promise.resolve(faq?.element);
    });

    const { result } = renderHook(() => useComponentElement('faq'));
    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current).toEqual({ Element: faq?.element, isPending: false, isFailed: false }));
  });
});
