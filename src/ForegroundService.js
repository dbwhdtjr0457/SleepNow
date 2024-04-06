import React, {useEffect} from 'react';
import {View, Button, DeviceEventEmitter, Text} from 'react-native';
import notifee from '@notifee/react-native';
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {throttle} from 'lodash';

import useInterval from './useInterval';
import {
  offForegroundServiceNotification,
  onForegroundServiceNotification,
} from './Notification';

export default function Foregroundservice(props) {
  const [awake, setAwake] = React.useState(true);
  const [luxsubscription, setLuxsubscription] = React.useState(null);
  const [accSubscription, setAccSubscription] = React.useState(null);
  const [gyroSubscription, setGyroSubscription] = React.useState(null);
  const [magSubscription, setMagSubscription] = React.useState(null);
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
  const [lightArray, setLightArray] = React.useState([]);
  const [accArray, setAccArray] = React.useState([]);
  const [gyroArray, setGyroArray] = React.useState([]);
  const [magArray, setMagArray] = React.useState([]);
  const [isDataOn, setIsDataOn] = React.useState(false);

  const addData = async data => {
    console.log(data);
    try {
      firestore()
        .collection(auth().currentUser.email)
        .add(data)
        .then(info => {
          console.log('Added document with ID: ', info.id);
        });
    } catch (e) {
      console.log('Error adding document: ', e);
    }
  };

  const updateTotalInfo = (
    lightArray,
    accArray,
    gyroArray,
    magArray,
    awake,
  ) => {
    const timeNow = new Date();
    const totalInfo = {
      time: timeNow,
      light: lightArray.reduce((a, b) => a + b, 0) / lightArray.length,
      awake: awake,
      s_acc: {
        x: accArray.reduce((a, b) => a + b.x, 0) / accArray.length,
        y: accArray.reduce((a, b) => a + b.y, 0) / accArray.length,
        z: accArray.reduce((a, b) => a + b.z, 0) / accArray.length,
      },
      s_gyro: {
        x: gyroArray.reduce((a, b) => a + b.x, 0) / gyroArray.length,
        y: gyroArray.reduce((a, b) => a + b.y, 0) / gyroArray.length,
        z: gyroArray.reduce((a, b) => a + b.z, 0) / gyroArray.length,
      },
      s_mag: {
        x: magArray.reduce((a, b) => a + b.x, 0) / magArray.length,
        y: magArray.reduce((a, b) => a + b.y, 0) / magArray.length,
        z: magArray.reduce((a, b) => a + b.z, 0) / magArray.length,
      },
    };
    addData(totalInfo);
  };

  useInterval(() => {
    if (accSubscription) {
      setLightArray([...lightArray, light]);
      setAccArray([...accArray, accData]);
      setGyroArray([...gyroArray, gyroData]);
      setMagArray([...magArray, magData]);
      console.log(accArray.length);
      if (accArray.length === 10) {
        updateTotalInfo(lightArray, accArray, gyroArray, magArray, awake);
        setLightArray([]);
        setAccArray([]);
        setGyroArray([]);
        setMagArray([]);
      }
    }
  }, 1000);

  async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    startLightSensor();
    setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
    setUpdateIntervalForType(SensorTypes.gyroscope, 1000);
    setUpdateIntervalForType(SensorTypes.magnetometer, 1000);

    setLuxsubscription(
      DeviceEventEmitter.addListener(
        'LightSensor',
        throttle(data => {
          setLight(data.lightValue);
        }, 1000),
      ),
    );

    setAccSubscription(
      accelerometer.subscribe(({x, y, z, timestamp}) => {
        setAccData({x, y, z, timestamp});
      }),
    );

    setGyroSubscription(
      gyroscope.subscribe(({x, y, z, timestamp}) => {
        setGyroData({x, y, z, timestamp});
      }),
    );

    setMagSubscription(
      magnetometer.subscribe(({x, y, z, timestamp}) => {
        setMagData({x, y, z, timestamp});
      }),
    );

    // Display a notification
    await onForegroundServiceNotification('upload').then(() => {
      setIsDataOn(true);
      props.setIsUpload(true);
    });
  }

  async function offDisplayNotification() {
    setAccSubscription(accSubscription => {
      accSubscription?.unsubscribe();
      return null;
    });
    setGyroSubscription(gyroSubscription => {
      gyroSubscription?.unsubscribe();
      return null;
    });
    setMagSubscription(magSubscription => {
      magSubscription?.unsubscribe();
      return null;
    });
    setLuxsubscription(luxsubscription => {
      luxsubscription?.remove();
      return null;
    });

    await offForegroundServiceNotification('upload').then(() => {
      setIsDataOn(false);
      props.setIsUpload(false);
    });
  }

  useEffect(() => {
    setLightArray([]);
    setAccArray([]);
    setGyroArray([]);
    setMagArray([]);
  }, [awake, accSubscription]);

  return (
    <View>
      <Button
        title="데이터 업로드 시작"
        onPress={() => {
          onDisplayNotification();
        }}
      />
      <Button
        title="데이터 업로드 중지"
        onPress={() => {
          offDisplayNotification();
        }}
      />
      <Button
        title="깨어있음/잠자기 전환"
        onPress={() => {
          setAwake(!awake);
        }}
      />
      <Text>데이터 업로드 중... {isDataOn ? '진행 중' : '중지됨'}</Text>
      <Text>나는 지금... {awake ? '깨어있어요!' : '잘 꺼에요!'}</Text>
    </View>
  );
}
