import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent {
  public backstory = false;

  constructor(public dialogRef: MatDialogRef<HelloComponent>) { }

  confirm() {
    this.dialogRef.close(this.backstory);
  }

}
