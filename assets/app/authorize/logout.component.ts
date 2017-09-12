import { Router } from '@angular/router';
import { AuthorizeService } from './authorize.service';
import { Component } from "@angular/core";

@Component({
    selector: 'mgr-logout',
    templateUrl: 'logout.component.html',
    styles: [`
        .backdrop {
            background-color: rgba(0,0,0,0.6);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
        }
    `]
})
export class LogoutComponent {
    message = 'Logout success.'
    display = 'none';

    constructor(private authorizeService: AuthorizeService, private router: Router) {
        this.onLogout();
    }
    onLogout() {
        this.authorizeService.logout();
        this.display = 'block';
    }

    onClose() {
        this.display = 'none';
        this.router.navigate(['/logo']);
    }
}