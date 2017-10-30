import { BigChartComponent } from './dashboard/big-chart/big-chart.component';
import { DashboardServie } from './dashboard/dashboard.service';
import { SmallChartComponent } from './dashboard/small-chart/small-chart.component';
import { ErrorServie } from './error/error.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from './authorize/logout.component';
import { LoginComponent } from './authorize/login.component';
import { LogoComponent } from './logo.component';
import { AuthenticationComponent } from './authorize/authentication.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AuthorizeService } from './authorize/authorize.service';
import { HttpModule } from '@angular/http';
import { routing } from './app.routing';

import { AppComponent } from "./app.component";
import { HeaderComponent } from './header.component';
import { ErrorComponent } from './error/error.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { ChartModule } from 'angular2-highcharts';

@NgModule({
    declarations: [
        AppComponent,        
        HeaderComponent,
        AuthenticationComponent,
        LoginComponent,
        LogoutComponent,
        LogoComponent,
        ErrorComponent,
        DashboardComponent,
        SmallChartComponent,
        BigChartComponent
],
    imports: [
        BrowserModule, 
        ChartModule.forRoot(require('highcharts')),
        ChartModule.forRoot(require('highcharts/highstock')),
        routing, 
        HttpModule,
        CommonModule,
        ReactiveFormsModule
    ],
    providers: [AuthorizeService, ErrorServie, DashboardServie],
    bootstrap: [AppComponent]
})
export class AppModule {

}