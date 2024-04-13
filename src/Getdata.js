import React, {useEffect, useState} from 'react';
import {View, Button, Text, ToastAndroid} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import useInterval from './useInterval';
import {
  onPushAlarmNotification,
  onForegroundServiceNotification,
  offForegroundServiceNotification,
} from './Notification';
const DecisionTree = require('./decision-tree');

export const Getdata = props => {
  const [training_data, setTraining_data] = useState([]);
  const [test_data, setTest_data] = useState([]);
  const [dt, setDt] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [predResult, setPredResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [awakeCount, setAwakeCount] = useState(0);
  const [sleepCount, setSleepCount] = useState(0);
  const [isActiveTime, setIsActiveTime] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [dataLength, setDataLength] = useState(0);
  const [watchPositionId, setWatchPositionId] = useState(null);
  // getPosition
  const getPosition = () => {
    Geolocation.getCurrentPosition(
      positionData => {
        setPosition({
          latitude: positionData.coords.latitude,
          longitude: positionData.coords.longitude,
        });
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    AsyncStorage.getItem('dt').then(data => {
      if (data !== null) {
        const dtJson = JSON.parse(data);
        const newDt = new DecisionTree(dtJson);
        setDt(newDt);
      }
    });

    AsyncStorage.getItem('accuracy')
      .then(data => {
        setAccuracy(JSON.parse(data));
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('dataLength')
      .then(data => {
        setDataLength(data);
      })
      .catch(error => {
        console.log(error);
      });

    getPosition();

    // watchPosition
    setWatchPositionId(
      Geolocation.watchPosition(
        positionData => {
          setPosition({
            latitude: positionData.coords.latitude,
            longitude: positionData.coords.longitude,
          });
        },
        error => console.log(error),
        {enableHighAccuracy: true, distanceFilter: 0, interval: 1000},
      ),
    );

    return () => {
      if (watchPositionId !== null) {
        console.log('clear watch position');
        Geolocation.clearWatch(watchPositionId);
      }
      offForegroundServiceNotification('service', 'appclose');
      setIsServiceActive(false);
      props.setIsService(false);
      setAwakeCount(0);
      setSleepCount(0);
    };
  }, []);

  useEffect(() => {
    // dt 상태 업데이트 후 로직 처리
    if (dt) {
      console.log('Decision Tree loaded');
      setIsLoading(false);
    }
  }, [dt]); // dt 상태를 의존성 배열에 추가

  useEffect(() => {
    if (training_data.length > 0 && test_data.length > 0) {
      console.log('training data length:', training_data.length);
      console.log('test data length:', test_data.length);
      const class_name = 'awake';
      const features = [
        'light',
        'accX',
        'accY',
        'accZ',
        'gyroMag',
        'magX',
        'magY',
        'magZ',
      ];
      const newDt = new DecisionTree(training_data, class_name, features);
      const newAccuracy = newDt.evaluate(test_data);
      setDt(newDt);
      setAccuracy(newAccuracy);
      const newDtJson = newDt.toJSON();
      AsyncStorage.setItem('dt', JSON.stringify(newDtJson));
      AsyncStorage.setItem('accuracy', JSON.stringify(newAccuracy));
    }
  }, [test_data]);

  useInterval(() => {
    // 22시부터 4시까지만 작동함.
    if (new Date().getHours() >= 22 || new Date().getHours() < 4) {
      // if (true) {
      setIsActiveTime(true);
      if (isServiceActive) {
        if (dt) {
          setPredResult(dt.predict(props.data));
          if (predResult === true) {
            setAwakeCount(awakeCount + 1);
            if (awakeCount === 60) {
              setAwakeCount(0);
              setSleepCount(0);
              props.setServiceCount(props.serviceCount + 1);
            }
          } else {
            setSleepCount(sleepCount + 1);
            if (sleepCount === 60) {
              setAwakeCount(0);
              setSleepCount(0);
              onPushAlarmNotification();
              showToast();
              props.setServiceCount(props.serviceCount + 1);
            }
          }
          console.log('awakeCount: ', awakeCount, ', sleepCount: ', sleepCount);
        }
      } else {
        setAwakeCount(0);
        setSleepCount(0);
        props.setServiceCount(0);
      }
    } else {
      setIsActiveTime(false);
    }
  }, 1000);

  const getData = () => {
    console.log('Fetch data');
    if (auth().currentUser === null) {
      console.log('No user logged in');
    } else {
      firestore()
        .collection(auth().currentUser.email)
        .orderBy('time', 'desc')
        .limit(3000)
        .get()
        // .then(querySnapshot => {
        //   return querySnapshot.docs.map(doc => {
        //     let convertedData = doc.data();
        //     if (
        //       doc.data().awake === 'sleep' &&
        //       doc.data().s_acc.x >= -1 &&
        //       doc.data().s_acc.x <= 1 &&
        //       doc.data().s_acc.y >= -1 &&
        //       doc.data().s_acc.y <= 1
        //     ) {
        //       convertedData.awake = 'awake';
        //     }
        //     return convertedData;
        //   });
        // })
        .then(querySnapshot => {
          console.log(querySnapshot.docs.length);
          AsyncStorage.setItem(
            'dataLength',
            querySnapshot.docs.length.toString(),
          );
          setDataLength(querySnapshot.docs.length);
          const data = querySnapshot.docs.map(doc => {
            let convertedData = {
              awake: doc.data().awake,
              light: Number(doc.data().light.toFixed(0)),
              accX: Number(doc.data().s_acc.x.toFixed(0)),
              accY: Number(doc.data().s_acc.y.toFixed(0)),
              accZ: Number(doc.data().s_acc.z.toFixed(0)),
              gyroX: Number(doc.data().s_gyro.x.toFixed(0)),
              gyroY: Number(doc.data().s_gyro.y.toFixed(0)),
              gyroZ: Number(doc.data().s_gyro.z.toFixed(0)),
              gyroMag: Number(
                Math.sqrt(
                  Math.pow(doc.data().s_gyro.x * 100, 2) +
                    Math.pow(doc.data().s_gyro.y * 100, 2) +
                    Math.pow(doc.data().s_gyro.z * 100, 2),
                ).toFixed(0),
              ),
              magX: Number(doc.data().s_mag.x.toFixed(0)),
              magY: Number(doc.data().s_mag.y.toFixed(0)),
              magZ: Number(doc.data().s_mag.z.toFixed(0)),
              //   light: doc.data().light.toFixed(0),
              //   accX: doc.data().s_acc.x.toFixed(0),
              //   accY: doc.data().s_acc.y.toFixed(0),
              //   accZ: doc.data().s_acc.z.toFixed(0),
              //   gyroX: doc.data().s_gyro.x.toFixed(0),
              //   gyroY: doc.data().s_gyro.y.toFixed(0),
              //   gyroZ: doc.data().s_gyro.z.toFixed(0),
              //   gyroMag: Math.sqrt(
              //     Math.pow(doc.data().s_gyro.x * 100, 2) +
              //       Math.pow(doc.data().s_gyro.y * 100, 2) +
              //       Math.pow(doc.data().s_gyro.z * 100, 2),
              //   ).toFixed(0),
              //   magX: doc.data().s_mag.x.toFixed(0),
              //   magY: doc.data().s_mag.y.toFixed(0),
              //   magZ: doc.data().s_mag.z.toFixed(0),
            };
            if (
              convertedData.awake === false &&
              convertedData.accX >= -1 &&
              convertedData.accX <= 1 &&
              convertedData.accY >= -1 &&
              convertedData.accY <= 1
            ) {
              convertedData.awake = true;
            }
            return convertedData;
          });
          return data;
        })
        .then(data => {
          setTraining_data(data.filter((_, index) => index % 2 === 0));
          setTest_data(data.filter((_, index) => index % 2 !== 0));
          return data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const showToast = () => {
    ToastAndroid.showWithGravity(
      '자려고 누웠으면 자야죠!',
      ToastAndroid.LONG,
      ToastAndroid.TOP,
    );
  };

  return (
    <View>
      {auth().currentUser === null ? (
        <Text>no user logged in, please log in and reload the app.</Text>
      ) : (
        <View>
          {props.isDetail && (
            <>
              <Text>latitude: {position?.latitude}</Text>
              <Text>longitude: {position?.longitude}</Text>
            </>
          )}
          <Button
            title="데이터 분석 업데이트"
            onPress={() => {
              setIsLoading(true);
              getData();
            }}
          />
          {isLoading ? (
            <Text>loading...</Text>
          ) : dt !== null && accuracy !== null ? (
            <View>
              <Text>분석 데이터 개수: {dataLength} (최대 3000개)</Text>
              <Text>정확도: {(accuracy * 100).toFixed(2)}%</Text>
            </View>
          ) : (
            <>
              <Text>분석 데이터가 없습니다. </Text>
              <Text>
                데이터 수집 후 데이터 분석 업데이트 버튼을 눌러주세요.
              </Text>
            </>
          )}
          {isActiveTime ? (
            isServiceActive ? (
              <View>
                <Text>predResult: {predResult ? 'awake' : 'sleep'}</Text>
                <Text>awakeCount: {awakeCount}</Text>
                <Text>sleepCount: {sleepCount}</Text>
              </View>
            ) : (
              <Text>서비스가 시작되지 않았습니다.</Text>
            )
          ) : (
            <Text>오후 10시부터 새벽 4시 사이에만 작동합니다!</Text>
          )}
        </View>
      )}
      <Button
        title="자세 분류 서비스 시작"
        onPress={() => {
          onForegroundServiceNotification('service');
          setIsServiceActive(true);
          props.setIsService(true);
        }}
      />
      <Button
        title="자세 분류 서비스 중지"
        onPress={() => {
          offForegroundServiceNotification('service');
          setIsServiceActive(false);
          props.setIsService(false);
          setAwakeCount(0);
          setSleepCount(0);
        }}
      />
    </View>
  );
};
