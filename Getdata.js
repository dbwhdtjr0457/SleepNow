import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Button, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import useInterval from './useInterval';
const DecisionTree = require('decision-tree');

export const Getdata = props => {
  const [training_data, setTraining_data] = useState([]);
  const [test_data, setTest_data] = useState([]);
  const [dt, setDt] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [predResult, setPredResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (training_data.length === 0 || test_data.length === 0) {
      console.log('First fetch');
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
            setTest_data(
              data.slice(Math.floor(data.length * 0.8), data.length),
            );
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  }, []);

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
  }, [training_data, test_data]);

  useEffect(() => {
    if (dt) {
      setIsLoading(false);
    }
  }, [dt]);

  useInterval(() => {
    if (dt) {
      setPredResult(dt.predict(props.data));
    }
  }, 1000);

  return (
    <View style={styles(props).container}>
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
          {isLoading ? (
            <Text>loading...</Text>
          ) : (
            <View>
              <Text>light: {props.data.light}</Text>
              <Text>predResult: {predResult ? 'awake' : 'sleep'}</Text>
              <Text>accuracy: {accuracy}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = props =>
  StyleSheet.create({
    container: {
      width: props.SCREEN_WIDTH,
      flex: 1,
      backgroundColor: props.BACKGROUNDCOLOR,
    },
    item: {
      backgroundColor: '#fff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    text: {
      fontSize: 16,
    },
  });
