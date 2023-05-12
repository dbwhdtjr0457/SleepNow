import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

export const LoginPage = props => {
  const [email, setEmail] = useState('asdf');
  const [password, setPassword] = useState('asdf');
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userData')
      .then(data => {
        const userData = JSON.parse(data);
        if (userData.isLogin) {
          setEmail(userData.email);
          setPassword(userData.password);
          setIsLogin(userData.isLogin);
          console.log(userData.email);
          auth()
            .signInWithEmailAndPassword(userData.email, userData.password)
            .catch(err => {
              setError(err.message);
              setIsLogin(false);
              auth().signOut();
            });
        }
      })
      .catch(err => {
        setError(err.message);
      });

    auth().onAuthStateChanged(user => {
      if (user) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error,
        [{text: 'OK', onPress: () => setError(null)}],
        {cancelable: false},
      );
    }
  }, [error]);

  useEffect(() => {
    if (isLogin) {
      AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          isLogin: isLogin,
          email: email,
          password: password,
        }),
      );
    } else {
      AsyncStorage.setItem('userData', JSON.stringify({isLogin: isLogin}));
    }
  }, [isLogin, email, password]);

  return (
    <View style={styles(props).contentContainer}>
      <Text>Login Page</Text>
      {isLogin ? (
        <Text>Logged In</Text>
      ) : (
        <View>
          <Text>Not Logged In</Text>
          <TextInput
            style={styles(props).input}
            placeholder="Email"
            inputMode="email"
            onChange={e => {
              setEmail(e.nativeEvent.text);
            }}
          />
          <TextInput
            style={styles(props).input}
            placeholder="Password"
            secureTextEntry
            onChange={e => {
              setPassword(e.nativeEvent.text);
            }}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles(props).login}
        onPress={() => {
          isLogin
            ? auth().signOut()
            : auth()
                .signInWithEmailAndPassword(email, password)
                .catch(err => {
                  setError(err.message);
                });
        }}>
        {isLogin ? <Text>Logout</Text> : <Text>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          auth()
            .createUserWithEmailAndPassword(email, password)
            .catch(err => {
              setError(err.message);
            });
        }}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          AsyncStorage.getItem('userData').then(data => {
            Alert.alert('AsyncStorage', data);
          });
        }}>
        <Text>check AsyncStorage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log(auth().currentUser);
        }}>
        <Text>check auth().currentUser</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = props =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      width: props.SCREEN_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      height: 40,
      width: 200,
      marginBottom: 10,
      padding: 10,
      borderWidth: 1,
    },
    login: {
      alignItems: 'center',
      backgroundColor: '#DDDDDD',
      padding: 10,
      width: 200,
    },
  });
