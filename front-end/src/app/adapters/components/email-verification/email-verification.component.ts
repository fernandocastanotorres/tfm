import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-email-verification',
    templateUrl: './email-verification.component.html',
    imports: [NgIf, RouterLink, TranslatePipe]
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  success = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isLoading = false;
      this.success = false;
      return;
    }

    this.authService.verifyEmailToken(token).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
      },
      error: () => {
        this.success = false;
        this.isLoading = false;
      }
    });
  }
}
