import React, {useEffect} from 'react';
import {
  View,
  Text,
  DeviceEventEmitter,
  ScrollView,
  StyleSheet,
  Dimensions,
  Appearance,
  Alert,
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
import {throttle} from 'lodash';
import {NativeBaseProvider} from 'native-base';
import notifee from '@notifee/react-native';
import {PermissionsAndroid} from 'react-native';

import Foregroundservice from './ForegroundService';
import {LoginPage} from './LoginPage';
import {Getdata} from './Getdata';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const COLOR_SCHEME = Appearance.getColorScheme();
const BACKGROUND_COLOR = COLOR_SCHEME === 'dark' ? '#000' : '#fff';

setUpdateIntervalForType(SensorTypes.accelerometer, 1000); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 1000); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 1000); // defaults to 100ms

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

  let allData = {
    light: light.toFixed(0),
    accX: accData.x.toFixed(0),
    accY: accData.y.toFixed(0),
    accZ: accData.z.toFixed(0),
    gyroX: gyroData.x.toFixed(0),
    gyroY: gyroData.y.toFixed(0),
    gyroZ: gyroData.z.toFixed(0),
    magX: magData.x.toFixed(0),
    magY: magData.y.toFixed(0),
    magZ: magData.z.toFixed(0),
  };

  const optimizationCheck = async () => {
    // 1. checks if battery optimization is enabled
    const batteryOptimizationEnabled =
      await notifee.isBatteryOptimizationEnabled();
    if (batteryOptimizationEnabled) {
      // 2. ask your users to disable the feature
      Alert.alert(
        'Restrictions Detected',
        'To ensure notifications are delivered, please disable battery optimization for the app.',
        [
          // 3. launch intent to navigate the user to the appropriate screen
          {
            text: 'OK, open settings',
            onPress: async () =>
              await notifee.openBatteryOptimizationSettings(),
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  useEffect(() => {
    optimizationCheck();
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    startLightSensor();
    const subscription = DeviceEventEmitter.addListener(
      'LightSensor',
      throttle(data => {
        setLight(data.lightValue);
      }, 1000),
    );
    // setLight(100);
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
    <NativeBaseProvider>
      <View style={styles.container}>
        <ScrollView
          contentContainerstyle={styles.scrollView}
          horizontal
          pagingEnabled>
          <LoginPage
            SCREEN_WIDTH={SCREEN_WIDTH}
            BACKGROUNDCOLOR={BACKGROUND_COLOR}
          />
          <View style={styles.contentContainer}>
            <Foregroundservice />
            <Text>Accelerometer:</Text>
            <Text>x: {accData.x}</Text>
            <Text>y: {accData.y}</Text>
            <Text>z: {accData.z}</Text>
            <Text>Gyroscope:</Text>
            <Text>x: {gyroData.x}</Text>
            <Text>y: {gyroData.y}</Text>
            <Text>z: {gyroData.z}</Text>
            <Text>Magnetometer:</Text>
            <Text>x: {magData.x}</Text>
            <Text>y: {magData.y}</Text>
            <Text>z: {magData.z}</Text>
            <Getdata
              SCREEN_WIDTH={SCREEN_WIDTH}
              BACKGROUNDCOLOR={BACKGROUND_COLOR}
              data={allData}
            />
          </View>
        </ScrollView>
      </View>
    </NativeBaseProvider>
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
    backgroundColor: BACKGROUND_COLOR,
  },
});
