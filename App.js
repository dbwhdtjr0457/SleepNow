import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

import Screen from './ForegroundService';

setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

export default function App() {
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
    const accSubscription = accelerometer.subscribe(({x, y, z, timestamp}) => {
      setAccData({x, y, z, timestamp});
    });

    const gyroSubscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      setGyroData({x, y, z, timestamp});
    });

    return () => {
      accSubscription.unsubscribe();
      gyroSubscription.unsubscribe();
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
    </View>
  );
}
