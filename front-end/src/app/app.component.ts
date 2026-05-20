import { Component, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from './application/services/i18n.service';
import { ThemePaletteService } from './application/services/theme-palette.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly i18nService: I18nService,
    private readonly themePaletteService: ThemePaletteService
  ) {}

  ngOnInit(): void {
    this.i18nService.init();
    this.themePaletteService.loadAndApply().subscribe();

    this.subscriptions.add(
      interval(60000).subscribe(() => this.themePaletteService.loadAndApply().subscribe())
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        this.themePaletteService.loadAndApply().subscribe();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.subscriptions.add({ unsubscribe: () => document.removeEventListener('visibilitychange', onVisibilityChange) });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
