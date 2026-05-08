import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  GuardianApiResponse,
  GuardianResult,
  NewsArticle,
  NewsCategory,
} from '../../models/news.model';

@Injectable({ providedIn: 'root' })
export class EntertainmentNewsService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = 'https://content.guardianapis.com/search';

  news = signal<NewsArticle[]>([]);
  newsLoading = signal(false);
  newsError = signal<string | null>(null);
  activeCategory = signal<NewsCategory>('top');

  fetchNews(category: NewsCategory): void {
    if (this.newsLoading()) return;
    this.newsLoading.set(true);
    this.newsError.set(null);
    this.activeCategory.set(category);

    const params = this.buildParams(category);

    this.http.get<GuardianApiResponse>(this.BASE_URL, { params }).subscribe({
      next: (res) => {
        this.news.set(res.response.results.map((r) => this.mapArticle(r)));
        this.newsLoading.set(false);
      },
      error: () => {
        this.newsError.set('Could not load news. Please try again later.');
        this.newsLoading.set(false);
      },
    });
  }

  selectCategory(category: NewsCategory): void {
    this.fetchNews(category);
  }

  private buildParams(category: NewsCategory): HttpParams {
    const base = new HttpParams()
      .set('show-fields', 'thumbnail,trailText,byline')
      .set('order-by', 'newest')
      .set('page-size', '10')
      .set('api-key', environment.guardianApiKey);

    switch (category) {
      case 'movie':
        return base.set('section', 'film');
      case 'tv':
        return base.set('section', 'tv-and-radio');
      case 'celebrity':
        return base.set('section', 'culture').set('q', 'celebrity OR actor OR actress');
      default:
        return base.set('q', 'film OR movie OR television');
    }
  }

  private mapArticle(r: GuardianResult): NewsArticle {
    return {
      id: r.id,
      title: r.webTitle,
      excerpt: r.fields?.trailText ?? '',
      imageUrl: r.fields?.thumbnail ?? null,
      publishedAt: new Date(r.webPublicationDate),
      sourceLabel: r.sectionName,
      articleUrl: r.webUrl,
    };
  }
}
