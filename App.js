import React, {useEffect} from 'react';
import {
  View,
  Text,
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  Dimensions,
  Appearance,
} from 'react-native';
import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import {
  startLightSensor,
  stopLightSensor,
} from 'react-native-ambient-light-sensor';

import Foregroundservice from './ForegroundService';
import {LoginPage} from './LoginPage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const colorScheme = Appearance.getColorScheme();
const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 400); // defaults to 100ms

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
  const [magData, setMagData] = React.useState({
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

    const magSubscription = magnetometer.subscribe(({x, y, z, timestamp}) => {
      setMagData({x, y, z, timestamp});
    });

    return () => {
      accSubscription.unsubscribe();
      gyroSubscription.unsubscribe();
      magSubscription.unsubscribe();
      stopLightSensor();
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerstyle={styles.scrollView}
        horizontal
        pagingEnabled>
        <LoginPage
          SCREEN_WIDTH={SCREEN_WIDTH}
          BACKGROUNDCOLOR={backgroundColor}
        />
        <View style={styles.contentContainer}>
          <Foregroundservice />
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
          <Text>Magnetometer:</Text>
          <Text>x: {magData.x}</Text>
          <Text>y: {magData.y}</Text>
          <Text>z: {magData.z}</Text>
          <Text>timestamp: {magData.timestamp}</Text>
          <Text>Light: {light}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    backgroundColor: '#eee',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: backgroundColor,
  },
});
