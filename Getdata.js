import React, {useEffect, useState} from 'react';
import {View, Button, Text, ToastAndroid} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification, {Importance} from 'react-native-push-notification';
import notifee from '@notifee/react-native';

import useInterval from './useInterval';
const DecisionTree = require('decision-tree');

async function onPushNotification() {
  PushNotification.createChannel(
    {
      channelId: 'channel-id3', // (required)
      channelName: 'My channel', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: false, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
    },
    created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );

  await PushNotification.localNotification({
    channelId: 'channel-id3',
    message: '잘 때까지 알림을 보낼께요!',
    vibrate: true,
  });
}

async function onDisplayNotification() {
  const channelId = await notifee.createChannel({
    id: 'channel-id2',
    name: 'My Channel',
  });

  await notifee.displayNotification({
    title: '센서 데이터로 자세 분석 중..',
    android: {
      channelId,
      ongoing: true,
      asForegroundService: true,
    },
  });
}

export const Getdata = props => {
  const [training_data, setTraining_data] = useState([]);
  const [test_data, setTest_data] = useState([]);
  const [dt, setDt] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [predResult, setPredResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [awakeCount, setAwakeCount] = useState(0);
  const [sleepCount, setSleepCount] = useState(0);
  const [isSleep, setIsSleep] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('data_set')
      .then(data => {
        const data_set = JSON.parse(data);
        setTraining_data(data_set.training_data);
        setTest_data(data_set.test_data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (training_data.length > 0 && test_data.length > 0) {
      console.log('training data length:', training_data.length);
      console.log('test data length:', test_data.length);
      AsyncStorage.setItem(
        'data_set',
        JSON.stringify({training_data: training_data, test_data: test_data}),
      );
      const class_name = 'awake';
      const features = [
        'light',
        'accX',
        'accY',
        'accZ',
        // 'gyroX',
        // 'gyroY',
        // 'gyroZ',
        'magX',
        'magY',
        'magZ',
      ];
      const dt = new DecisionTree(training_data, class_name, features);
      dt.train(training_data);
      const accuracy = dt.evaluate(test_data);
      setDt(dt);
      setAccuracy(accuracy);
    }
  }, [test_data]);

  useEffect(() => {
    if (dt) {
      setIsLoading(false);
    }
  }, [dt]);

  useInterval(() => {
    // 20시부터 4시까지만 작동함.
    if (new Date().getHours() >= 20 || new Date().getHours() < 4) {
      setIsActive(true);
      if (dt) {
        setPredResult(dt.predict(props.data));
        if (predResult === true) {
          setAwakeCount(awakeCount + 1);
          if (awakeCount === 15) {
            setAwakeCount(0);
            setSleepCount(0);
            setIsSleep(false);
          }
        } else {
          setSleepCount(sleepCount + 1);
          if (sleepCount === 15) {
            setAwakeCount(0);
            setSleepCount(0);
            setIsSleep(false);
            setIsSleep(true);
          }
        }
        console.log(predResult);
        console.log(awakeCount, sleepCount);
        console.log(props.data.light);
      }
    } else {
      setIsActive(false);
    }
  }, 1000);

  useEffect(() => {
    if (isSleep) {
      onPushNotification();
      showToast();
    }
  }, [isSleep]);

  const getData = () => {
    console.log('Fetch data');
    if (auth().currentUser === null) {
      console.log('No user logged in');
    } else {
      firestore()
        .collection(auth().currentUser.email)
        .get()
        .then(querySnapshot => {
          console.log(querySnapshot.docs.length);
          const data = querySnapshot.docs.map(doc => {
            const convertedData = {
              awake: doc.data().awake,
              light: doc.data().light.toFixed(0),
              accX: doc.data().s_acc.x.toFixed(0),
              accY: doc.data().s_acc.y.toFixed(0),
              accZ: doc.data().s_acc.z.toFixed(0),
              gyroX: doc.data().s_gyro.x.toFixed(0),
              gyroY: doc.data().s_gyro.y.toFixed(0),
              gyroZ: doc.data().s_gyro.z.toFixed(0),
              magX: doc.data().s_mag.x.toFixed(0),
              magY: doc.data().s_mag.y.toFixed(0),
              magZ: doc.data().s_mag.z.toFixed(0),
            };
            return convertedData;
          });
          return data;
        })
        .then(data => {
          setTraining_data(data.slice(0, Math.floor(data.length * 0.8)));
          setTest_data(data.slice(Math.floor(data.length * 0.8), data.length));
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
          <Button
            title="updateData"
            onPress={() => {
              setIsLoading(true);
              getData();
            }}
          />
          {isLoading ? (
            <Text>loading...</Text>
          ) : (
            <View>
              <Text>light: {props.data.light}</Text>
              <Text>predResult: {predResult ? 'awake' : 'sleep'}</Text>
              <Text>accuracy: {accuracy}</Text>
            </View>
          )}
          {isActive ? (
            <View>
              <Text>awakeCount: {awakeCount}</Text>
              <Text>sleepCount: {sleepCount}</Text>
            </View>
          ) : (
            <Text>오후 8시부터 새벽 4시 사이에만 작동합니다!</Text>
          )}
        </View>
      )}
      <Button title="showToast" onPress={showToast} />
      <Button title="Test push notification" onPress={onPushNotification} />
      <Button title="start service" onPress={onDisplayNotification} />
      <Button
        title="stop service"
        onPress={() => {
          notifee.stopForegroundService();
        }}
      />
    </View>
  );
};
