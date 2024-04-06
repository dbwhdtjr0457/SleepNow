import PushNotification from 'react-native-push-notification';
import {Importance} from 'react-native-push-notification';
import notifee from '@notifee/react-native';
import {ToastAndroid} from 'react-native';

// Status Notification

export async function onPushStatusNotification(status) {
  if (status === 'dataOn') {
    ToastAndroid.showWithGravity(
      '데이터 업로드가 시작되었습니다.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  } else if (status === 'dataOff') {
    ToastAndroid.showWithGravity(
      '데이터 업로드가 중지되었습니다.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  } else if (status === 'serviceOn') {
    ToastAndroid.showWithGravity(
      '자세 감지 서비스가 시작되었습니다.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  } else if (status === 'serviceOff') {
    ToastAndroid.showWithGravity(
      '자세 감지 서비스가 중지되었습니다.',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  }
}

// Alarm Notification

export async function onPushAlarmNotification() {
  PushNotification.createChannel(
    {
      channelId: 'channel-id3', // (required)
      channelName: 'My channel', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: false, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
    },
    created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );

  await PushNotification.localNotification({
    channelId: 'channel-id3',
    message: '잘 때까지 알림을 보낼께요!',
    vibrate: true,
  });
}

// Foreground Service Notification

let uploadStatus = false;
let serviceStatus = false;

export async function onForegroundServiceNotification(mode) {
  if (mode === 'upload') {
    if (!uploadStatus) {
      uploadStatus = true;
      onPushStatusNotification('dataOn');
    } else {
      ToastAndroid.showWithGravity(
        '데이터 업로드가 이미 실행 중입니다.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      return;
    }
  } else if (mode === 'service') {
    if (!serviceStatus) {
      serviceStatus = true;
      onPushStatusNotification('serviceOn');
    } else {
      ToastAndroid.showWithGravity(
        '자세 감지 서비스가 이미 실행 중입니다.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      return;
    }
  }

  await notifee.requestPermission();

  const channelId = await notifee.createChannel({
    id: 'channel-id2',
    name: 'My Channel',
  });

  await notifee.displayNotification({
    title: 'SleepNow가 실행 중입니다.',
    android: {
      channelId,
      ongoing: true,
      asForegroundService: true,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
  });
}

export async function offForegroundServiceNotification(mode) {
  if (mode === 'upload') {
    if (uploadStatus) {
      uploadStatus = false;
      onPushStatusNotification('dataOff');
    } else {
      ToastAndroid.showWithGravity(
        '데이터 업로드가 이미 중지되었습니다.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      return;
    }
  } else if (mode === 'service') {
    if (serviceStatus) {
      serviceStatus = false;
      onPushStatusNotification('serviceOff');
    } else {
      ToastAndroid.showWithGravity(
        '자세 감지 서비스가 이미 중지되었습니다.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      return;
    }
  }

  if (!uploadStatus && !serviceStatus) {
    await notifee.stopForegroundService();
  }
}
