import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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
    
    this.initializeStartupAudio();
  }

  async ngOnInit() {
    // Initialize push notifications
    await this.initializePushNotifications();
  }
  
  private async initializePushNotifications() {
    // Check if platform supports push notifications
    if (Capacitor.isNativePlatform()) {
      try {
        await this.addListeners();
        await this.registerNotifications();
        console.log('Push notifications initialized successfully');
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    } else {
      console.log('Push notifications not supported on web platform');
    }
  }
  
 private addListeners = async () => {
  await PushNotifications.addListener('registration', token => {
    console.info('Registration token: ', token.value);
    // Here you should send the token to your backend server
    // this.sendTokenToServer(token.value);
  });

  await PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
    // Handle foreground notification
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
    // Handle notification tap/action
  });
}

 private registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();
  console.log('Current permission status:', permStatus);

  if (permStatus.receive === 'prompt') {
    console.log('Requesting push notification permissions...');
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.error('Push notification permissions denied');
    throw new Error('User denied permissions!');
  }

  console.log('Push notification permissions granted, registering...');
  await PushNotifications.register();
}

 private getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  console.log('delivered notifications', notificationList);
}

  // Method to test push notification setup (call this from your UI for testing)
  public async testPushNotifications() {
    console.log('Testing push notification setup...');
    
    try {
      // Check platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only work on native platforms');
        return;
      }

      // Check permissions
      const permStatus = await PushNotifications.checkPermissions();
      console.log('Permission status:', permStatus);

      // Check if registered
      if (permStatus.receive === 'granted') {
        console.log('Push notifications are enabled');
        await this.getDeliveredNotifications();
      } else {
        console.log('Push notifications not enabled');
      }
    } catch (error) {
      console.error('Error testing push notifications:', error);
    }
  }

  private async initializeStartupAudio() {
    try {
      this.loadAndPlayAudio();
    } catch (error) {
      console.error('Error initializing startup audio:', error);
    }
  }

  private async loadAndPlayAudio() {
    try {
      // Preload and play startup sound
      await NativeAudio.preload({
        assetId: "startup-sound",
        assetPath: "short-modern-logo-242224.mp3",
        audioChannelNum: 1,
        isUrl: false,
        volume: 1.0
      });
      
      await NativeAudio.play({
        assetId: 'startup-sound',
      });
      
      // Stop audio and hide splash screen after 6 seconds
      setTimeout(async () => {
        try {
          await NativeAudio.stop({
            assetId: 'startup-sound',
          });
          
          await NativeAudio.unload({
            assetId: 'startup-sound',
          });
          
          await SplashScreen.hide();
        } catch (error: any) {
          console.error('Error stopping sound or hiding splash:', error);
        }
      }, 6000);
      
    } catch (error: any) {
      console.error('Error with audio playback:', error);
      // Fallback: hide splash screen if audio fails
      setTimeout(async () => {
        try {
          await SplashScreen.hide();
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      }, 6000);
    }
  }
  
}

