import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './app.settings.component.html',
  styleUrls: ['./app.settings.component.scss']
})
export class SettingsComponent {
  public galaxyAudio;
  public starAudio;

  constructor(public dialogRef: MatDialogRef<SettingsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.galaxyAudio = data.galaxyAudio;
    this.starAudio = data.starAudio;
  }

  confirm() {
    const settings = [this.galaxyAudio, this.starAudio];
    this.dialogRef.close(settings);
  }

}
