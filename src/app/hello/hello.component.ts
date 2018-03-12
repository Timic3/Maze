import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent {

  constructor(public dialogRef: MatDialogRef<HelloComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  confirm() {
    this.dialogRef.close();
  }

}
