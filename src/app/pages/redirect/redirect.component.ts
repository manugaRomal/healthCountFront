import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  refreshPage(): void {
    window.location.reload();
  }

  ngOnInit(): void {
    // Check if user has a valid token, if so redirect to home
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/home']);
      }
    });
  }

  tryAgain(): void {
    // Try to re-authenticate
    this.authService.ensureValidSession();
  }
}
