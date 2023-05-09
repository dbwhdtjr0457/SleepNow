import {View, Button, DeviceEventEmitter} from 'react-native';
import notifee from '@notifee/react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {
  startLightSensor,
  stopLightSensor,
} from 'react-native-ambient-light-sensor';

notifee.registerForegroundService(notification => {
  return new Promise(() => {
    startLightSensor();
    setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
    setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

    const subscription = DeviceEventEmitter.addListener('LightSensor', data => {
      console.log(data.lightValue);
    });

    const accSubscription = accelerometer.subscribe(({x, y, z, timestamp}) => {
      console.log('accSubscription', x, y, z, timestamp);
    });

    const gyroSubscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      console.log('gyroSubscription', x, y, z, timestamp);
    });

    return () => {
      accSubscription.unsubscribe();
      gyroSubscription.unsubscribe();
      stopLightSensor();
      subscription.remove();
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
      title: 'Notification Title',
      body: 'Main body content of the notification',
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
