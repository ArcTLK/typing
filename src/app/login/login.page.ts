import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public key: string = '';
  public name: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  async validateKey() {
    if (this.key === 'muskmelon') {
      this.router.navigateByUrl('/results');
    }
    else if (this.key === 'watermelon' && this.name !== '') {
      this.router.navigateByUrl('/home/' + this.name);
    }
    else if (this.key !== 'watermelon') {
      const alert = await this.alertController.create({
        header: 'Hmm...',
        message: 'Seems like you\'ve entered an invalid key!',
        buttons: ['Retry']
      });
      await alert.present();
    }
    else {
      const alert = await this.alertController.create({
        header: 'Hmm...',
        message: 'You didn\'t name yourself!',
        buttons: ['Sorry']
      });
      await alert.present();
    }
  }

}
