import { ErrorServie } from './../error/error.service';
import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx'; // importujemy dla funkcji map (przetworzenie odpowiedzi od serwera)
import { Observable } from "rxjs";


@Injectable()
export class AuthorizeService {
    isLogin = false;
    constructor(private http: Http, private errorService: ErrorServie) { }

    login(pin: string) {
        const body = '{ "pin": "' + pin + '" }'; 
        const headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http.post('http://localhost:3001/authorize/login', body, { headers: headers })
            .map((response: Response) => response.json())
            .catch(
                (error: Response) => { 
                    this.errorService.handleError(error.json());
                    return Observable.throw(error.json())
                }                    
            );
    }

    logout() {
        localStorage.clear();        
    }

    isLoggedIn() {
        return localStorage.getItem('token') !== null;
    }
}