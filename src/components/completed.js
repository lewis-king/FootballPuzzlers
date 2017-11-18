import React from 'React';
import {StyleSheet, Text} from 'react-native';
import Header from './header';

const Completed = () => {
    const {headerStyle} = styles;
    return (
        <View>
        <Header/>
        <Text>
            Congratulations, you have completed.
        </Text>
        </View>
    )
};

export default Completed;