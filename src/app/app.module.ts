import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { UploadComponent } from './pages/upload/upload.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RedirectComponent } from './pages/redirect/redirect.component';
import { HeaderComponent } from './components/header/header.component';
import { DailyStatsComponent } from './components/daily-stats/daily-stats.component';
import { WeeklyProgressComponent } from './components/weekly-progress/weekly-progress.component';
import { ScreenshotModalComponent } from './components/screenshot-modal/screenshot-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UploadComponent,
    DashboardComponent,
    RedirectComponent,
    HeaderComponent,
    DailyStatsComponent,
    WeeklyProgressComponent,
    ScreenshotModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
