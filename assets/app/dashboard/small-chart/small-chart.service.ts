import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class SmallChartService {
  private url = 'http://localhost:500';  
  private socket;
  
  // sendMessage(message){
  //   this.socket.emit('add-message', message);    
  // }
  
  getMessages(i: number) {
    this.url = this.url + i;
    let observable = new Observable(observer => {      
      this.socket = io(this.url);
      this.socket.on('message', (data) => {
        observer.next(data);    
      });
      return () => {
        this.socket.disconnect();
      };  
    })     
    return observable;
  }  
}