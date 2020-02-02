import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public key: string;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  async validateKey() {
    if (this.key === 'watermelon') {
      this.router.navigateByUrl('/home');
    }
    else {
      const alert = await this.alertController.create({
        header: 'Hmm...',
        message: 'Seems like you\'ve entered an invalid key!',
        buttons: ['Retry']
      });
      await alert.present();
    }
  }

}
