import { ErrorServie } from './../error/error.service';
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Http, Response, Headers } from "@angular/http";


@Injectable()
export class DashboardServie {
    private loggers = [];
    constructor(private http: Http, private errorService: ErrorServie) { }

    getLoggers() {
        const token = localStorage.getItem('token')
        ? '?token=' + localStorage.getItem('token')
        : '';
        return this.http.get('http://localhost:3001/dashboard/get-loggers' + token)
        .map((response: Response) => {
            this.loggers = [];
            const mongoLoggers = response.json().obj;            
            for (let logger of mongoLoggers) {
                this.loggers.push(logger);
                
            }
            return this.loggers;
        })
        .catch(
            (error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json())
            }
        );

    }
}