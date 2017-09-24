import { ErrorServie } from './../error/error.service';
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Http, Response, Headers } from "@angular/http";


@Injectable()
export class DashboardServie {        
    constructor(private http: Http, private errorService: ErrorServie) { }

    getLoggers() {
        const token = localStorage.getItem('token')
        ? '?token=' + localStorage.getItem('token')
        : '';
        return this.http.get('http://localhost:3001/dashboard/get-loggers' + token)
        .map((response: Response) => {
            var loggers = [];
            const mongoLoggers = response.json().obj;            
            for (let logger of mongoLoggers) {
                loggers.push(logger);                                
            }
            return loggers;
        })
        .catch(
            (error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json())
            }
        );

    }

    getDataFrames(itemId: String) {
        const token = localStorage.getItem('token')
        ? '&token=' + localStorage.getItem('token')
        : '';
        return this.http.get('http://localhost:3001/dashboard/get-data-frames?itemId=' + itemId + token)
        .map((response: Response) => {
            var descFrame = [];
            var dataFrames = [];
            const mongoFrames = response.json().obj;            
            if (mongoFrames.length == 2) {
                descFrame = mongoFrames[0];
                dataFrames = mongoFrames[1];
                // for (let dataFrame of mongoFrames[1]) {
                //     dataFrames.push(dataFrame);                
                // }
            }
            
            return [descFrame, dataFrames];
        })
        .catch(
            (error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json())
            }
        );

    }
}