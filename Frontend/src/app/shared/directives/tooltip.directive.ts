import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy, inject, signal } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class AppTooltipDirective implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText || this.tooltipElement) return;
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.removeTooltip();
  }

  ngOnDestroy(): void {
    this.removeTooltip();
  }

  private createTooltip(): void {
    this.tooltipElement = this.renderer.createElement('div');
    const textNode = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, textNode);

    // Dynamic Tailwind & inline styling for smooth animated tooltip bubble
    this.renderer.addClass(this.tooltipElement, 'fixed');
    this.renderer.addClass(this.tooltipElement, 'z-[9999]');
    this.renderer.addClass(this.tooltipElement, 'px-2.5');
    this.renderer.addClass(this.tooltipElement, 'py-1');
    this.renderer.addClass(this.tooltipElement, 'text-[11px]');
    this.renderer.addClass(this.tooltipElement, 'font-medium');
    this.renderer.addClass(this.tooltipElement, 'text-white');
    this.renderer.addClass(this.tooltipElement, 'bg-slate-900/90');
    this.renderer.addClass(this.tooltipElement, 'dark:bg-slate-800/95');
    this.renderer.addClass(this.tooltipElement, 'backdrop-blur-sm');
    this.renderer.addClass(this.tooltipElement, 'rounded-md');
    this.renderer.addClass(this.tooltipElement, 'shadow-lg');
    this.renderer.addClass(this.tooltipElement, 'pointer-events-none');
    this.renderer.addClass(this.tooltipElement, 'transition-all');
    this.renderer.addClass(this.tooltipElement, 'duration-200');
    this.renderer.addClass(this.tooltipElement, 'opacity-0');
    this.renderer.addClass(this.tooltipElement, 'scale-95');
    this.renderer.addClass(this.tooltipElement, 'whitespace-nowrap');

    this.renderer.appendChild(document.body, this.tooltipElement);
    this.positionTooltip();

    // Trigger smooth fade & scale-in animation
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.removeClass(this.tooltipElement, 'opacity-0');
        this.renderer.removeClass(this.tooltipElement, 'scale-95');
        this.renderer.addClass(this.tooltipElement, 'opacity-100');
        this.renderer.addClass(this.tooltipElement, 'scale-100');
      }
    }, 10);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'bottom':
        top = hostRect.bottom + 6;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - 6;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + 6;
        break;
      case 'top':
      default:
        top = hostRect.top - tooltipRect.height - 6;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
    }

    // Keep within viewport bounds
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
