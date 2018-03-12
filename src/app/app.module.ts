import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatSliderModule } from '@angular/material';

import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { HelloComponent } from './hello/hello.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    HelloComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SettingsComponent, HelloComponent]
})
export class AppModule { }
