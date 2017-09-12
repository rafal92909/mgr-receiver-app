import { AuthorizeService } from './authorize/authorize.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mgr-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  constructor(private authorizeService: AuthorizeService) { }

  isLoggedIn() {
        return this.authorizeService.isLoggedIn();
    }

}