import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit, OnDestroy {
  private resultSub: any;
  public results: any[];
  constructor(
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.resultSub = this.firestore.collection('typingResults').snapshotChanges().subscribe(response => {
      this.results = response.map(value => value.payload.doc.data());
    });
  }

  ngOnDestroy() {
    this.resultSub.unsubscribe();
  }

}
