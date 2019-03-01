import {Alert} from "react-native";
import {endConnection, finishTransaction, purchaseProduct} from "./index";
import ProductsDAO from "../../dao/products-dao";

export const unlockAlert = (product, refresh) => {
  Alert.alert(
    'Unlock ' + {product}.product.title,
    'There are two ways of unlocking questions in whoami? You must complete all questions in the current active category, or pay a fee (requires data)',
    [
      {
        text: 'No thanks', onPress: () => {
        }, style: 'cancel'
      },
      {
        text: 'Let\'s do it!', onPress: () => {
          try {
            const purchase = purchaseProduct(product);
            ProductsDAO.persistProduct(product.productId, true);
            refresh();
            finishTransaction();
            endConnection();
          } catch (err) {
            console.warn(err);
            alert("Something went wrong during the purchase");
          }
        }
      },
    ],
    {cancelable: false}
  )
};