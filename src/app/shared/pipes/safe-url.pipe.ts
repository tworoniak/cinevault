import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safe', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string, _type: 'resourceUrl'): SafeResourceUrl {
    const youtubeEmbed = /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]{6,20}(\?.*)?$/;
    if (!youtubeEmbed.test(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
