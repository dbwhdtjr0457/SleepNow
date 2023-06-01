import React, {useEffect, useState} from 'react';
import {View, Button, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';

import useInterval from './useInterval';
const DecisionTree = require('decision-tree');

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
    title: '자려고 누웠나요?',
    body: '자기 전까지 알림을 보낼꺼에요!',
    subtitle: '잘 시간이에요!',
    android: {
      channelId,
      showTimestamp: true,
      showChronometer: true,
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
      console.log(awakeCount, sleepCount);
      //   console.log(predResult);
    }
  }, 1000);

  useEffect(() => {
    if (isSleep) {
      onDisplayNotification();
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

  return (
    <View>
      {auth().currentUser === null ? (
        <Text>no user logged in, please log in and reload the app.</Text>
      ) : (
        <View>
          <Button
            title="checkData"
            onPress={() => {
              console.log(training_data);
              console.log(test_data);
            }}
          />
          <Button
            title="updateData"
            onPress={() => {
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
          <Text>awakeCount: {awakeCount}</Text>
          <Text>sleepCount: {sleepCount}</Text>
        </View>
      )}
    </View>
  );
};
