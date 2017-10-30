import { ErrorServie } from './../../error/error.service';
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Http, Response, Headers } from "@angular/http";



  

    @Injectable()
    export class BigChartService {    
        constructor(private http: Http, private errorService: ErrorServie) { }
    

        getData(itemId: String, startdate: Number, stopdate: Number) {
            const token = localStorage.getItem('token')
            ? '&token=' + localStorage.getItem('token')
            : '';
            return this.http.get('http://localhost:3001/bigchart/get-data?itemId=' + itemId + "&startdate=" + startdate + "&stopdate=" + stopdate + token)
            .map((response: Response) => {                
                var dataFrames = response.json().obj;                                
                return dataFrames;
            })
            .catch(
                (error: Response) => {
                    this.errorService.handleError(error);
                    return Observable.throw(error)
                }
            );
    
        }
    }