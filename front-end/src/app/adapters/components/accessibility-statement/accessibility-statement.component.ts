import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-accessibility-statement',
    templateUrl: './accessibility-statement.component.html',
    styleUrls: ['./accessibility-statement.component.css'],
    imports: [RouterLink, TranslatePipe]
})
export class AccessibilityStatementComponent {}
