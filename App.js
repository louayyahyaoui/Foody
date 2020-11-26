import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabScreen from "./screens/MainTabScreen";
import DrawerContent from "./screens/DrawerContent";
import SupportScreen from "./screens/SupportScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import BookmarkScreen from "./screens/BookmarkScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RootStackScreen from "./screens/RootStackScreen";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "./components/Context";
import { AsyncStorage } from "react-native";
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
const Drawer = createDrawerNavigator();
const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const CustomDefaultTheme = {
    ...DefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: "#ffffff",
      text: "#333333",
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...DarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: "#333333",
      text: "#ffffff",
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case "IS_LOGIN":
        return { ...prevState, userToken: action.token, isLoading: false };
      case "LOGIN":
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userName: null,
          userToken: null,
          isLoading: false,
        };
      case "REGISTER":
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          isLoading: false,
        };

      default:
        break;
    }
  };

  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);

  const authContext = useMemo(
    () => ({
      signIn: async (user) => {
        try {
          await AsyncStorage.setItem("usertoken", user.userToken);
        } catch (error) {
          console.log(error);
        }
        console.log(initialLoginState, user);

        dispatch({
          type: "LOGIN",
          userName: user.email,
          token: user.usertoken,
        });
      },
      signUp: () => {},
      signOut: async () => {
        try {
          await AsyncStorage.removeItem("usertoken");
        } catch (error) {
          console.log(error);
        }
        dispatch({ type: "LOGOUT" });
      },
      toggleTheme: () => {
        setIsDarkTheme((isdak) => !isdak);
      },
    }),
    []
  );

  useEffect(() => {
    setTimeout(async () => {
      let usertoken;
      try {
        usertoken = await AsyncStorage.getItem("usertoken");
      } catch (error) {
        console.log(error);
      }
      dispatch({ type: "REGISTER", token: usertoken });
    }, 1000);
  }, []);

  if (loginState.isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignContent: "center" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer theme={theme}>
          {loginState.userToken ? (
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContent {...props} />}
            >
              <Drawer.Screen name="Home" component={MainTabScreen} />
              <Drawer.Screen name="SupportScreen" component={SupportScreen} />
              <Drawer.Screen name="Profile" component={ProfileScreen} />
              <Drawer.Screen name="BookmarkScreen" component={BookmarkScreen} />
              <Drawer.Screen
                name="NotificationsScreen"
                component={NotificationsScreen}
              />
            </Drawer.Navigator>
          ) : (
            <RootStackScreen />
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
};

export default App;