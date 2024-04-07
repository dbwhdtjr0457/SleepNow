import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import useInterval from './useInterval';

export default function StatusView(props) {
  // isUpload, isService가 true인 경우 시간을 증가
  const [uploadTime, setUploadTime] = React.useState(0);
  const [serviceTime, setServiceTime] = React.useState(0);

  useInterval(() => {
    if (props.isUpload) {
      setUploadTime(uploadTime + 1);
    } else {
      setUploadTime(0);
    }
    if (props.isService) {
      setServiceTime(serviceTime + 1);
    } else {
      setServiceTime(0);
    }
  }, 1000);

  return (
    <View style={styles(props).container}>
      <View style={styles(props).uploadArea}>
        <Text>데이터 업로드: {props.isUpload ? '작동 중' : '중지됨'}</Text>
        <Text>작동 시간: {uploadTime}초</Text>
      </View>
      <View style={styles(props).detailArea}>
        <Text>자세 분류 서비스: {props.isService ? '작동 중' : '중지됨'}</Text>
        <Text>작동 시간: {serviceTime}초</Text>
      </View>
    </View>
  );
}

const styles = props =>
  StyleSheet.create({
    container: {
      // 옆으로 진열
      flexDirection: 'row',
      width: props.SCREEN_WIDTH,
    },
    uploadArea: {
      width: props.SCREEN_WIDTH / 2,
      height: 100,
      backgroundColor: props.isUpload ? 'lightgreen' : 'gray',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailArea: {
      width: props.SCREEN_WIDTH / 2,
      height: 100,
      backgroundColor: props.isService ? 'lightgreen' : 'gray',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
