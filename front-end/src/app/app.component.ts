import { Component, OnInit } from '@angular/core';
import { I18nService } from './application/services/i18n.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private readonly i18nService: I18nService) {}

  ngOnInit(): void {
    this.i18nService.init();
  }
}
