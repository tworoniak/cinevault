import { Component, ElementRef, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-horizontal-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './horizontal-carousel.component.html',
  styleUrl: './horizontal-carousel.component.scss',
})
export class HorizontalCarouselComponent {
  title = input.required<string>();
  seeAllRoute = input<string[] | null>(null);

  private track = viewChild.required<ElementRef<HTMLElement>>('track');

  scrollBy(dir: -1 | 1): void {
    this.track().nativeElement.scrollBy({ left: dir * 600, behavior: 'smooth' });
  }
}
