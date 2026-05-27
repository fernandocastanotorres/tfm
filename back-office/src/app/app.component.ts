import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'bo-root',
    template: '<router-outlet></router-outlet>',
    styles: [],
    standalone: false
})
export class AppComponent implements OnInit {
  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.use('es-ES');
  }
}
