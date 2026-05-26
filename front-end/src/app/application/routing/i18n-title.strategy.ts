import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class I18nTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {
    super();
    this.translate.onLangChange.subscribe(() => {
      this.updateTitle(this.router.routerState.snapshot);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    if (!routeTitle) {
      return;
    }

    const translated = this.translate.instant(routeTitle);
    this.title.setTitle(translated === routeTitle ? routeTitle : translated);
  }
}
