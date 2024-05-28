import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SideBar } from './SideBar'

const Stack = createNativeStackNavigator()

function ProfileComplete () {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name='SideBar' component={SideBar} />
    </Stack.Navigator>
  )
}

export { ProfileComplete }
