import { Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appButtonHover]',
  standalone: true,
})
export class AppButtonHoverDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.addClass(this.el.nativeElement, 'hover:-translate-y-0.5');
    this.renderer.addClass(this.el.nativeElement, 'hover:shadow-md');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeClass(this.el.nativeElement, 'hover:-translate-y-0.5');
    this.renderer.removeClass(this.el.nativeElement, 'hover:shadow-md');
  }

  @HostListener('mousedown')
  onMouseDown(): void {
    this.renderer.addClass(this.el.nativeElement, 'active:scale-95');
  }
}
