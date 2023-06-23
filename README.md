# Sleep Now
### 소프트웨어융합캡스톤디자인 프로젝트
#### 소프트웨어융합학과 2019102111 유종석
## 개발 배경 및 목표
### 개발 배경
현대인에게 있어 스마트폰은 필수 물품이 되었고, 잠을 자기 직전 스마트폰을 사용하며 자는 것은 일상이 되었다. 시간이 가면 갈 수록 SNS, 유튜브, 넷플릭스와 같은 컨텐츠 등의 증가로 인해 자기 직전 스마트폰을 시간 가는 줄 모르고 사용하는 것이 사회적 문제점으로 대두되고 있다. '수면위상지연증후군'은 원하는 시간에 잠들지 못하고, 수면위상이 자꾸 뒤로 밀리는 증상으로, 가령 컴퓨터나 스마트폰, 텔레비전의 밝은 화면은 뇌가 햇빛으로 착각해 불면을 유발할 수 있다.

자려고 누웠을 때 스마트폰을 사용하는 상황이 문제임은 이미 여러 사람들이 인식하고 있는 문제였고, 그러한 문제를 해결하기 위해 스마트폰 제어 앱이나, 스마트폰 자체에서 지원하는 수면 기능을 사용하는 등 여러 시도를 해왔다. 하지만 "자기 직전 스마트폰을 사용하는 것을 자제"하는 기능은 존재하지 않았기에 결국 근본적인 문제를 해결하기 어려웠다.
### 목표
자려고 누웠을 때 잠을 바로 자지 않고 스마트폰을 보는 상황을 해결하기 위해, 사용자의 수면 직전 자세 및 환경이 인식될 경우 사용을 자제하고 바로 잘 것을 유도하는 서비스를 개발하는 것을 목표로 설정하였다. 이를 통해 사용자의 수면 시간대가 상황에 따라 달라질 수 있음에 대해 유연하게 동작할 수 있고, 수면위상지연증후군과 같이 생활 패턴이 망가지는 증상을 효과적으로 치료하고 예방할 수 있을 것이다.
## 개발 개요 및 가정 설정
### 가정
1. 사용자의 수면 시간대는 개인마다 다르다.
2. 사용자의 수면 자세는 개인마다 다르다.
3. 사용자는 자신이 적절한 수면을 취해야 함을 인식하고 있다.
4. 사용자는 불필요한 스마트폰의 사용이 자의적으로 쉽게 해결되지 않고 있다.
### 개발 개요
- 스마트폰의 센서를 통해 사용자의 스마트폰 사용 자세 수집 및 분석
- 사용자별 개인 맞춤 모델 수립
- 백그라운드에서 끊김 없이 동작
- 실시간 센서 값을 통해 수면 직전 여부를 판단
- 스마트폰을 사용하지 않고 바로 잘 것을 유도하는 서비스 개발
## 개발 언어 및 도구
### 개발 언어
<img src="https://img.shields.io/badge/HTML5-orange?style=flat&logo=HTML5&logoColor=white"/> <img src="https://img.shields.io/badge/CSS3-blue?style=flat&logo=CSS3&logoColor=white"/> <img src="https://img.shields.io/badge/javascript-yellow?style=flat&logo=javascript&logoColor=white"/> <img src="https://img.shields.io/badge/React Native-blue?style=flat&logo=React&logoColor=white"/>
### 개발 도구
<img src="https://img.shields.io/badge/Firebase-yellow?style=flat&logo=Firebase&logoColor=white"/> <img src="https://img.shields.io/badge/VSCode-blue?style=flat&logo=Visual Studio Code&logoColor=white"/>

### 외부 라이브러리
- [react-native-sensors](https://github.com/react-native-sensors/react-native-sensors)
  - Accelerometer, Gyroscope, Magnetometer 활용
- [react-native-ambient-light-sensor](https://github.com/Cshayan/react-native-ambient-light-sensor)
  - Light sensor 활용
- [nodejs-decision-tree](https://github.com/serendipious/nodejs-decision-tree)
  - 개인 맞춤 서비스를 위한 decision tree 모델 수립을 위해 활용
- [notifee](https://notifee.app/)
  - Foreground Service, Push Notification 활용
- [react-native-async-storage](https://github.com/react-native-async-storage/async-storage)
  - 자동 로그인, 데이터 로딩 최적화 및 비용 감소에 활용

## 개발 결과
| ![image](https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/88da728f-50d2-4a57-a2dd-8febd7eb8191) | ![image](https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/3fc2a90a-6701-4323-a4f3-36e7dfa84506) |
|----|----|

-> Sleep Now 앱 실행 시 나오는 로그인 페이지. 로그인이 되어있지 않은 경우(좌측 이미지) 회원가입을 하거나 로그인을 진행하면 로그인된 화면(우측 이미지)를 출력한다.



| ![image](https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/7afed38d-5a0d-4ce1-a31a-0658d599e0c9) | ![image](https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/362403b6-6613-40aa-a6d7-1fd4a469828e) |
|----|----|

-> 실시간으로 센서가 수집되고 있는지 확인할 수 있고, 데이터 수집 및 라벨링을 위한 토글 버튼과 서비스 동작 모드로 전환할 수 있는 버튼이 있는 메인 페이지(좌측 이미지). 실시간 예측 서비스가 동작하게 되면 백그라운드에서도 지속적으로 스마트폰의 데이터를 수집하게 되며, 데이터 수집 모드일 경우 실시간으로 데이터를 Firebase Firestore에 전송 후 저장, 자세 예측 모드일 경우 실시간 데이터 분석 및 예측을 통해 사용자의 수면 직전 상황 여부를 판단하게 된다(우측 이미지).



![image](https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/64584de1-1356-4e23-a363-c84fc7673c57)
-> 사용자가 수면 직전에 스마트폰을 사용할 경우, Sleep Now에서 이를 분석하고 예측하여 소리, 진동을 포함한 notification을 출력하여 사용자의 정상적인 스마트폰 사용을 방해하고 즉시 수면을 유도한다.


## 시연 영상

https://github.com/dbwhdtjr0457/SleepNow/assets/49023654/79e9cf9d-aee9-4f68-b748-69acedb8f9f5

## 향후 계획
### 개인화 기능 테스트 및 고도화
소프트웨어융합캡스톤디자인 진행 중 사용한 모델은 Decision Tree로, Classification 알고리즘 중 가장 간단한 알고리즘이다. 목표한 과제가 크게 복잡하지 않은 덕에 직접 수집한 데이터를 기반으로 분석한 결과 accuracy는 95% 이상을 보였으나, 실제 서비스를 동작하는 중 자려는 상황이 아니나 알림이 출력되는 것과 같은 오판단을 하는 상황이 가끔 도출되었다. 향후에는 데이터를 학습시키는 데에 있어 판단 시 중요하게 작용하는 센서 값에 대한 가중치를 설정하는 등의 parameter tuning을 진행하고, RandomForest나 SVM 등 다양한 타 알고리즘 모델을 도입한 후 성능을 테스트해보고자 한다.
### 수면 권장 시스템 강화
현재는 자려는 상황이 인식되었을 때 단순히 소리와 진동 등을 포함한 notification을 출력하는 방식으로 구현되어있다. 하지만 이는 사용자의 습관을 바꿀 충분한 동기가 되지 않을 확률이 높다. 향후에는 다음과 같은 시도를 하여 사용자의 습관에 변화를 줄 수 있는 효과적인 방법을 모색할 예정이다.
- 스마트폰을 계속 사용할 경우 알림을 주는 주기를 점차 감소
- 스마트폰을 직접 제어 (밝기 감소, 음량 감소 등)
- 성취감을 주는 요소 제공 (ex: Forest 키우기, 연속 수면일 streak)
- 스마트폰 사용 시 지인에게 메시지 자동 발송
- 커스텀 동기부여 메시지 설정, 이후 notification에 출력
)
