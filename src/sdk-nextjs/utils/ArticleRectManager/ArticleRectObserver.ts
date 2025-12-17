import { EventEmitter } from '../EventEmitter';
import ResizeObserver from 'resize-observer-polyfill';

interface EventMap {
  'init': undefined;
  'scroll': undefined;
  'resize': DOMRect;
}

export class ArticleRectObserver extends EventEmitter<EventMap> {
  private resizeObserver: ResizeObserver;
  private articleWidth: number = 1;
  private registry: Map<string, HTMLElement> = new Map();
  private scrollPos: number = window.scrollY;
  private animationFrame: number = NaN;
  private parent: HTMLElement | undefined = undefined;
  private sectionsScrollMap: Map<string, number> = new Map();
  private previousParentWidth: number | null = null;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
  }

  get scroll(): number {
    return this.scrollPos;
  }

  getSectionScroll(sectionId: string): number {
    const sectionTop = this.sectionsScrollMap.get(sectionId);
    if (sectionTop === undefined) return 0;
    return -(sectionTop / this.articleWidth - this.scrollPos);
  }

  getSectionTop(sectionId: string): number {
    const sectionTop = this.sectionsScrollMap.get(sectionId);
    return sectionTop ?? 0;
  }

  get width(): number {
    return this.articleWidth;
  }

  private setScroll(scroll: number) {
    this.scrollPos = scroll;
  }

  init(parent: HTMLElement) {
    this.parent = parent;
    const parentBoundary = parent.getBoundingClientRect();
    const articleWidth = parentBoundary.width;
    this.articleWidth = articleWidth;
    this.previousParentWidth = articleWidth;
    this.setScroll(parent.scrollTop / articleWidth);
    const onScroll = () => {
      this.handleScroll(parent.scrollTop);
      if (!isNaN(this.animationFrame)) return;
      this.animationFrame = window.requestAnimationFrame(() => {
        this.animationFrame = NaN;
        this.emit('scroll', undefined);
      });
    };
    parent.addEventListener('scroll', onScroll);
    for (const sectionId of this.registry.keys()) {
      const el = this.registry.get(sectionId);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      this.sectionsScrollMap.set(sectionId, rect.top - parentBoundary.top + this.parent.scrollTop);
    }
    this.isInitialized = true;
    this.emit('init', undefined);
    return () => {
      this.parent = undefined;
      this.isInitialized = false;
      this.previousParentWidth = null;
      parent.removeEventListener('scroll', onScroll);
      if (!isNaN(this.animationFrame)) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = NaN;
      }
    };
  }

  register(el: HTMLElement, sectionId: string) {
    this.registry.set(sectionId, el);
    this.resizeObserver.observe(el);
    return () => {
      this.registry.delete(sectionId);
      this.resizeObserver.unobserve(el);
    };
  }

  private handleScroll = (scroll: number) => {
    this.setScroll(scroll / this.articleWidth);
  };

  private handleResize() {
    if (!this.parent) return;
    const parentBoundary = this.parent.getBoundingClientRect();
    const newWidth = parentBoundary.width;
    if (!this.isInitialized || this.previousParentWidth === newWidth) {
      this.articleWidth = newWidth;
      this.previousParentWidth = newWidth;
      return;
    }
    this.articleWidth = newWidth;
    this.previousParentWidth = newWidth;
    this.setScroll(window.scrollY / this.articleWidth);
    this.emit('resize', parentBoundary);
    for (const sectionId of this.registry.keys()) {
      const el = this.registry.get(sectionId);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      this.sectionsScrollMap.set(sectionId, rect.top - parentBoundary.top - this.parent.scrollTop);
    }
  };
}
