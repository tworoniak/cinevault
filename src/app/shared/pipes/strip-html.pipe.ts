import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtml', standalone: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return new DOMParser().parseFromString(value, 'text/html').body.textContent ?? '';
  }
}
