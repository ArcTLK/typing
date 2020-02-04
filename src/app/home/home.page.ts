import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private paramMapSub: any;
  private instanceId: string;
  public time: number;
  private allWords: string[] = [];
  public words: string[] = [];
  private ticking: boolean = false;
  public correctWords: number = 0;
  public incorrectWords: number = 0;
  public input: string = '';
  public wpm: string = '0';
  private totalTime: number = 60;
  public shownWords: number = 15;
  private name: string = '';
  public round: number = 1;
  private wordRange: number;
  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private alert: AlertController
  ) {}

  ngOnInit() {
    // get category id and event index
    this.paramMapSub = this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.name = paramMap.get('name');
      this.round = parseInt(paramMap.get('round'));
      this.http.get('assets/words.json').subscribe((data: string[]) => {
        this.allWords = data;
        if (this.round === 1) {
          this.wordRange = 400;
          this.totalTime = 60;
        }
        else if (this.round === 2) {
          this.wordRange = 700;
          this.totalTime = 120;
        }
        else {
          this.wordRange = this.allWords.length;
          this.totalTime = 150;
        }
        this.time = this.totalTime;
        for(let i = 0; i < 15; ++i) {
          this.words.push(this.allWords[Math.floor(Math.random() * this.wordRange)]);
        }
      });
      this.instanceId = this.firestore.createId();
    });
  }

  ngOnDestroy() {
    this.paramMapSub.unsubscribe();
  }

  evaluate() {
    if (this.ticking === false) {
      this.ticking = true;
      --this.time;
      var interval = window.setInterval(() => {
        if (this.time > 0) {
          --this.time;
          this.wpm = (this.correctWords * 60 / (this.totalTime - this.time)).toFixed(2);
          this.firestore.doc('/typingResults/' + this.instanceId).set({
            name: this.name,
            wpm: this.wpm,
            time: Date.now(),
            correct: this.correctWords,
            incorrect: this.incorrectWords,
            round: this.round
          });
        }
        else {
            this.ticking = false;
            this.words = [];
            this.input = '';
            this.correctWords = 0;
            this.incorrectWords = 0;
            this.wpm = '0';
            window.clearInterval(interval);
          }
      }, 1000);
    }

    // check if last character is a space
    if (this.input[this.input.length - 1] === ' ') {
      if (this.input.trim() === this.words[this.correctWords + this.incorrectWords]) {
        ++this.correctWords;
      }
      else {
        // highlight entire word as red
        for(let i = 0; i < this.words[this.correctWords + this.incorrectWords].length; ++i) {
          document.getElementById(((this.correctWords + this.incorrectWords) % this.shownWords) + '-' + i).style.color = 'red';
        }
        ++this.incorrectWords;
      }
      this.words.push(this.allWords[Math.floor(Math.random() * this.wordRange)]);
      this.input = '';
    }
    else {
      // highlight correct & wrong letters
      for(var i = 0; i < this.input.length && i < this.words[this.correctWords + this.incorrectWords].length; ++i) {
        if (this.input.charAt(i) === this.words[this.correctWords + this.incorrectWords].charAt(i)) {
          document.getElementById(((this.correctWords + this.incorrectWords) % this.shownWords) + '-' + i).style.color = 'green';
        }
        else {
          document.getElementById(((this.correctWords + this.incorrectWords) % this.shownWords) + '-' + i).style.color = 'red';
        }
      }
      // return rest of the word to normal
      while(i < this.words[this.correctWords + this.incorrectWords].length) {
        document.getElementById(((this.correctWords + this.incorrectWords) % this.shownWords) + '-' + i).style.color = '#000';
        ++i;
      }
    }
  }
  async showAlert() {
    let alert = await this.alert.create({
      header: 'Round ' + this.round,
      backdropDismiss: false,
      message: '<strong>Scores:</strong><br />Correct: '+ this.correctWords + '<br />Incorrect: ' + this.incorrectWords + '<br />Accuracy: ' + (this.correctWords / (this.correctWords + this.incorrectWords) * 100).toFixed(2) + '<br />WPM: ' + this.wpm + '<br />Are you ready for the next round? (' + (this.round - 1) + '/3 done)',
      buttons: [{
        text: 'Start',
        handler: data => {
          if (this.round === 2 && data.key === 'roundtwokey') {
            alert.dismiss();
            return false;
          }
          else if (this.round === 3 && data.key === 'startthefinalround') {
            alert.dismiss();
            return false;
          }
          else {
            return false;
          }
        }
      }],
      inputs: [{
        'name': 'key',
        'type': 'password',
        'placeholder': 'Enter key for round ' + this.round + ' here'
      }]
    });
    await alert.present();
  }
  get mins() {
    const mins = Math.floor(this.time / 60);
    if (mins < 10) {
      return '0' + mins.toString();
    }
    else {
      return mins.toString();
    }
  }

  get secs() {
    const secs = (this.time % 60);
    if (secs < 10) {
      return '0' + secs.toString();
    }
    else {
      return secs.toString();
    }
  }

  floor(number: number) {
    return Math.floor(number);
  }
}
