import {View, Button} from 'react-native';
import notifee from '@notifee/react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

let accData = {
  x: 0,
  y: 0,
  z: 0,
  timestamp: 0,
};

let gyroData = {
  x: 0,
  y: 0,
  z: 0,
  timestamp: 0,
};

notifee.registerForegroundService(notification => {
  return new Promise(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
    setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

    const accSubscription = accelerometer.subscribe(({x, y, z, timestamp}) => {
      console.log('accSubscription', x, y, z, timestamp);
    });

    const gyroSubscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      console.log('gyroSubscription', x, y, z, timestamp);
    });

    return () => {
      accSubscription.unsubscribe();
      gyroSubscription.unsubscribe();
    };
  });
});

export default function Screen() {
  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: '데이터 수집 중...',
      body: 'SleepNow가 데이터를 수집하고 있습니다.',
      android: {
        channelId,
        // pressAction is needed if you want the notification to open the app when pressed
        asForegroundService: true,
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  return (
    <View>
      <Button
        title="Display Notification"
        onPress={() => onDisplayNotification()}
      />
      <Button
        title="Stop Foreground Service"
        onPress={() => {
          notifee.stopForegroundService();
        }}
      />
    </View>
  );
}
