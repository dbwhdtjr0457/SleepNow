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
  Button,
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
import StatusView from './StatusView';

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
  const [isDetail, setIsDetail] = React.useState(false);
  const [isUpload, setIsUpload] = React.useState(false);
  const [isService, setIsService] = React.useState(false);

  let allData = {
    light: light.toFixed(0),
    accX: accData.x.toFixed(0),
    accY: accData.y.toFixed(0),
    accZ: accData.z.toFixed(0),
    gyroX: gyroData.x.toFixed(0),
    gyroY: gyroData.y.toFixed(0),
    gyroZ: gyroData.z.toFixed(0),
    gyroMag: Math.sqrt(
      Math.pow(gyroData.x * 100, 2) +
        Math.pow(gyroData.y * 100, 2) +
        Math.pow(gyroData.z * 100, 2),
    ).toFixed(0),
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
        '배터리 제한 모드가 활성화되어있습니다.',
        '앱이 정상적으로 작동하지 않을 수 있습니다. 배터리 제한 모드를 비활성화 해주세요.',
        [
          // 3. launch intent to navigate the user to the appropriate screen
          {
            text: '설정',
            onPress: async () =>
              await notifee.openBatteryOptimizationSettings(),
          },
          {
            text: '취소',
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
          <ScrollView>
            <View style={styles.contentContainer}>
              <StatusView
                isUpload={isUpload}
                isService={isService}
                SCREEN_WIDTH={SCREEN_WIDTH}
                BACKGROUNDCOLOR={BACKGROUND_COLOR}
              />
              {/* <Text>isUpload: {isUpload ? 'true' : 'false'}</Text>
              <Text>isService: {isService ? 'true' : 'false'}</Text> */}
              <Foregroundservice setIsUpload={setIsUpload} />
              <Button
                onPress={() => {
                  setIsDetail(!isDetail);
                }}
                title="센서 데이터 보기"
              />
              {isDetail && (
                <>
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
                  <Text>light: {light}</Text>
                </>
              )}
              <Getdata
                SCREEN_WIDTH={SCREEN_WIDTH}
                BACKGROUNDCOLOR={BACKGROUND_COLOR}
                data={allData}
                isDetail={isDetail}
                setIsService={setIsService}
              />
              <Text>* 사용법 *</Text>
              <Text>1. "데이터 업로드 시작" 버튼 터치</Text>
              <Text>
                2. 자고 있지 않거나 잘 때 "깨어있음/잠자기 전환" 버튼 터치
              </Text>
              <Text>(하루에서 이틀 정도 데이터를 모아주세요.)</Text>
              <Text>3. "데이터 업로드 중지" 버튼 터치로 업로드 중지</Text>
              <Text>
                4. "데이터 분석 업데이트" 버튼 터치로 데이터 가져오고 분석
              </Text>
              <Text>5. "자세 분류 서비스 시작" 버튼 터치로 서비스 시작</Text>
              <Text>* 주의사항 *</Text>

              <Text>1. 앱 최적화 설정을 해제해야 정상 작동합니다.</Text>
              <Text>
                2. 알람, GPS, 센서 사용 권한을 허용해야 정상 작동합니다.
              </Text>
              <Text>
                3. 앱을 완전히 종료하면 데이터 업로드, 자세 분류 서비스가
                중지됩니다. 홈 버튼을 눌러 백그라운드로 전환해주세요.
              </Text>
            </View>
          </ScrollView>
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
