import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, numberAttribute } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() rootMargin = '50px';
  @Input({ transform: numberAttribute }) threshold = 0.1;
  @Input({ transform: numberAttribute }) delay = 0; // opcional delay para suavizar o trigger

  @Output() appear = new EventEmitter<void>();
  @Output() disappear = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private timeoutId?: number;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    const options = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
          }
          this.timeoutId = window.setTimeout(() => {
            this.appear.emit();
          }, this.delay);
        } else {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
          }
          this.disappear.emit();
        }
      });
    }, options);

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
