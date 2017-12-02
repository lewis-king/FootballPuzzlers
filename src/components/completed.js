import React, {Component} from 'React';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Header from './header';

export default class Completed extends Component {

    constructor(props) {
        super(props);
        const {title, paragraph} = props.navigation.state.params;
        this.state = {
            title,
            paragraph
        }
    }

    render() {
        const {congrats, container, paragraphText, btnStyle, submitTxt} = styles;
        return (
            <View style={container}>
                <Header text={'Football - Who am I?'}/>
                <Text style={congrats}>{this.state.title}</Text>
                <Text style={paragraphText}>
                    {this.state.paragraph}
                </Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('MainMenu')} style={btnStyle}>
                    <Text style={submitTxt}>Main Menu</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    btnStyle: {
        alignSelf: 'stretch',
        backgroundColor: '#225c69',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2f8492',
        paddingTop: 10,
        paddingBottom: 10
    },
    congrats: {
        textAlign: 'center',
        alignItems: 'center',
        fontFamily: 'cabin',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d3d3d'
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    paragraphText: {
        fontFamily: 'cabin',
        fontSize: 19,
        margin: 5
    },
    submitTxt: {
        alignSelf: 'center',
        color: '#fffdfe',
        paddingTop: 10,
        paddingBottom: 10,
        fontFamily: 'cabin',
        fontWeight: 'bold',
        fontSize: 20
    },
});