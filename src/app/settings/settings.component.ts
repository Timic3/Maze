import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public galaxyAnimation;
  public galaxyAudio;
  public starAudio;
  public fpsLimit;

  constructor(public dialogRef: MatDialogRef<SettingsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.galaxyAnimation = data.galaxyAnimation;
    this.galaxyAudio = data.galaxyAudio;
    this.starAudio = data.starAudio;
    this.fpsLimit = data.fpsLimit;
  }

  onSliderChange(event) {
    this.fpsLimit = event.value;
  }

  confirm() {
    const settings = [this.galaxyAnimation, this.galaxyAudio, this.starAudio, this.fpsLimit];
    this.dialogRef.close(settings);
  }

}
