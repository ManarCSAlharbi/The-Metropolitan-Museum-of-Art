import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  trashBin, 
  libraryOutline, 
  arrowForwardOutline,
  imageOutline
} from 'ionicons/icons';
import { SplashScreen } from '@capacitor/splash-screen';
import { NativeAudio } from '@capacitor-community/native-audio';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  
  constructor() {
    // Register icons used throughout the application
    addIcons({ 
      trashBin, 
      libraryOutline, 
      arrowForwardOutline,
      imageOutline
    });
    
    // Start audio immediately when app loads - don't wait for ngOnInit
    this.initializeStartupAudio();
  }

  async ngOnInit() {
    console.log('App initialized - ngOnInit called');
  }

  private async initializeStartupAudio() {
    console.log('Initializing startup audio immediately');
    
    try {
      // Start loading and playing audio immediately - no promises, no waiting
      this.loadAndPlayAudio();
      
    } catch (error) {
      console.error('Error initializing startup audio:', error);
    }
  }

  private async loadAndPlayAudio() {
    try {
      // Ultra-fast preload and play - minimize steps for instant playback
      await NativeAudio.preload({
        assetId: "startup-sound",
        assetPath: "short-modern-logo-242224.mp3",
        audioChannelNum: 1,
        isUrl: false,
        volume: 1.0  // Set volume during preload to save time
      });
      
      // Play immediately after preload
      await NativeAudio.play({
        assetId: 'startup-sound',
      });
      
      console.log('Startup sound playing immediately with splash screen');
      
      // Schedule audio stop after 6 seconds
      setTimeout(async () => {
        try {
          await NativeAudio.stop({
            assetId: 'startup-sound',
          });
          
          await NativeAudio.unload({
            assetId: 'startup-sound',
          });
          
          await SplashScreen.hide();
          
          console.log('Splash screen hidden and startup sound stopped');
        } catch (error: any) {
          console.error('Error stopping sound or hiding splash:', error);
        }
      }, 6000);
      
    } catch (error: any) {
      console.error('Error with immediate audio playback:', error);
      // Fallback: hide splash screen after timeout if audio fails
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
          console.log('Splash screen hidden (audio failed)');
        } catch (e) {
          console.log('Splash screen hide attempted');
        }
      }, 6000);
    }
  }
}

