import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';

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
  private totalTime: number = 120;
  public shownWords: number = 15;
  private name: string = '';

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // get category id and event index
    this.paramMapSub = this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.name = paramMap.get('name');
    });
    this.time = this.totalTime;
    this.http.get('assets/words.json').subscribe((data: string[]) => {
      this.allWords = data;
      for(let i = 0; i < 15; ++i) {
        this.words.push(this.allWords[Math.floor(Math.random() * this.allWords.length)]);
      }
    });
    this.instanceId = this.firestore.createId();
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
            incorrect: this.incorrectWords
          });
        }
        else {
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
      this.words.push(this.allWords[Math.floor(Math.random() * this.allWords.length)]);
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
