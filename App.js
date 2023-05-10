import React, {useEffect} from 'react';
import {View, Text, DeviceEventEmitter} from 'react-native';
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

import Screen from './ForegroundService';

setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

export default function App() {
  const [light, setLight] = React.useState(0);
  const [accData, setAccData] = React.useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
  const [gyroData, setGyroData] = React.useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });

  useEffect(() => {
    startLightSensor();
    const subscription = DeviceEventEmitter.addListener('LightSensor', data => {
      setLight(data.lightValue);
    });
    const accSubscription = accelerometer.subscribe(({x, y, z, timestamp}) => {
      setAccData({x, y, z, timestamp});
    });

    const gyroSubscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      setGyroData({x, y, z, timestamp});
    });

    return () => {
      accSubscription.unsubscribe();
      gyroSubscription.unsubscribe();
      stopLightSensor();
      subscription?.remove();
    };
  }, []);

  return (
    <View>
      <Screen />
      <Text>Accelerometer:</Text>
      <Text>x: {accData.x}</Text>
      <Text>y: {accData.y}</Text>
      <Text>z: {accData.z}</Text>
      <Text>timestamp: {accData.timestamp}</Text>
      <Text>Gyroscope:</Text>
      <Text>x: {gyroData.x}</Text>
      <Text>y: {gyroData.y}</Text>
      <Text>z: {gyroData.z}</Text>
      <Text>timestamp: {gyroData.timestamp}</Text>
      <Text>Light: {light}</Text>
    </View>
  );
}
