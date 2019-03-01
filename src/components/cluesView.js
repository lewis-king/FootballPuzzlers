import Constants from "../utils/constants";

//TODO: Need to refactor the clues section into this separate component
const CluesView = (props) => {
    return (
        <Overlay visible={this.state.modalVisible} closeOnTouchOutside animationType="bounceInDown"
                    containerStyle={{backgroundColor: 'rgba(95, 125, 132, 0.78)'}}
                    childrenWrapperStyle={{backgroundColor: '#eee'}} onClose={this.hideCluesOverlay} >
        <Text style={{fontWeight:'300', fontSize: 20}}>Choose Clue(s)</Text>
        <View style={{borderBottomWidth: 1, width: 100, paddingTop: 10}}></View>
        <FlatList
            data={Constants.clues}
            renderItem={({item}) => <Text>{item.desc}</Text>}
        />
    </Overlay>)
};