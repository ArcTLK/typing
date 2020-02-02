import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public time: number;
  private allWords: string[] = [];
  public words: string[] = [];
  private ticking: boolean = false;
  public correctWords: number = 0;
  public input: string = '';
  public wpm: string = '';
  private totalTime: number = 120;
  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.time = this.totalTime;
    this.http.get('assets/words.json').subscribe((data: string[]) => {
      this.allWords = data;
      for(let i = 0; i < 15; ++i) {
        this.words.push(this.allWords[Math.floor(Math.random() * this.allWords.length)]);
      }
    });
  }

  evaluate() {
    if (this.ticking === false) {
      this.ticking = true;
      --this.time;
      var interval = window.setInterval(() => {
        if (this.time > 0) {
          --this.time;
          this.wpm = (this.correctWords * 60 / (this.totalTime - this.time)).toFixed(2);
        }
        else {
          window.clearInterval(interval);
        }
      }, 1000);
    }

    // check if last character is a space
    if (this.input[this.input.length - 1] === ' ') {
      // take last word from input
      const word = this.input.slice(0, this.input.length - 1).split(' ').pop();
      if (word === this.words[0]) {
        ++this.correctWords;
        this.words.shift();
        this.words.push(this.allWords[Math.floor(Math.random() * this.allWords.length)]);
      }
    }
    else {
      // take last word from input
      const word = this.input.split(' ').pop();
      // highlight correct & wrong letters
      for(var i = 0; i < word.length; ++i) {
        if (word.charAt(i) === this.words[0].charAt(i)) {
          document.getElementById(0 + '-' + i).style.color = 'green';
        }
        else {
          document.getElementById(0 + '-' + i).style.color = 'red';
        }
      }
      // return rest of the word to normal
      while(i < this.words[0].length) {
        document.getElementById(0 + '-' + i).style.color = '#000';
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

}
