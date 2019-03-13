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
            console.log('About to purchase product with product id: ' +{product}.product.productId);
            const purchase = purchaseProduct(product.product.productId);
            finishTransaction();
            ProductsDAO.persistProduct(product.product.productId, true);
          } catch (err) {
            console.warn(err);
            alert("Something went wrong during the purchase");
          }
          refresh();
          endConnection();
        }
      },
    ],
    {cancelable: false}
  )
};