//import { Router, NavigationExtras } from '@angular/router';
import { Error } from './error.model';
import { EventEmitter } from '@angular/core';

export class ErrorServie {
    errorOccurred = new EventEmitter<Error>();

    //constructor(private router: Router) { }

    handleError(error: any) {
        const errorData = new Error(error.title, error.error.message);
        this.errorOccurred.emit(errorData);
    }
}