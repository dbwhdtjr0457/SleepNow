import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function StatusView(props) {
  return (
    <View style={styles(props).container}>
      {/* 영역을 두 부분으로 나눔 */}
      {/* isUpload 영역이 왼쪽 절반, isDetail 영역이 오른쪽 절반을 차지함 */}
      {/* isUpload가 true일 경우 isUpload 영역 색깔 초록색, false일 경우 회색 */}
      {/* isDetail이 true일 경우 isDetail 영역 색깔 파란색, false일 경우 회색 */}
      <View style={styles(props).uploadArea}>
        <Text>데이터 업로드: {props.isUpload ? '작동 중' : '중지됨'}</Text>
      </View>
      <View style={styles(props).detailArea}>
        <Text>자세 분류 서비스: {props.isService ? '작동 중' : '중지됨'}</Text>
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
