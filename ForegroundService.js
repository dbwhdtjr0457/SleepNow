import React from 'react';
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

let subscription = null;
let accSubscription = null;
let gyroSubscription = null;

notifee.registerForegroundService(notification => {
  return new Promise(() => {
    startLightSensor();
    setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
    setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

    subscription = DeviceEventEmitter.addListener('LightSensor', data => {
      console.log(data.lightValue);
    });

    accSubscription = accelerometer.subscribe(({x, y, z, timestamp}) => {
      console.log('accSubscription', x, y, z, timestamp);
    });

    gyroSubscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      console.log('gyroSubscription', x, y, z, timestamp);
    });
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
      body: 'sleepnow가 데이터를 수집하고 있습니다.',
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
          notifee
            .stopForegroundService()
            .then(() => {
              console.log('Foreground service stopped');
            })
            .catch(err => {
              console.log('Foreground service failed to stop', err);
            });
          accSubscription.unsubscribe();
          gyroSubscription.unsubscribe();
          stopLightSensor();
          subscription.remove();
        }}
      />
    </View>
  );
}
