import { AuthorizeService } from './authorize.service';
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
    selector: 'mgr-login',
    templateUrl: './login.component.html',
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
export class LoginComponent implements OnInit {
    myForm: FormGroup;
    display = 'block';
    
    constructor(private authorizeService: AuthorizeService, private router: Router) { }

    onClose() {
        this.display = 'none';
        this.router.navigateByUrl('/logo');
    }

    onSubmit() {        
        this.authorizeService.login(this.myForm.value.password).subscribe(
            data => { 
                localStorage.setItem('token', data.token);
                this.myForm.reset();
                this.router.navigateByUrl('/logo');
            },
            error => {
                console.error(error);
                this.router.navigateByUrl('/logo');
            }
        );        
    }

    ngOnInit() {
        this.myForm = new FormGroup({         
            password: new FormControl(null, Validators.required)
        });
    }
}