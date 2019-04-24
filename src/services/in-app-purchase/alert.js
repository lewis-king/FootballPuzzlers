import {Alert} from "react-native";
import {endConnection, finishTransaction, purchaseProduct} from "./index";
import ProductsDAO from "../../dao/products-dao";

export const unlockAlert = (product, refresh) => {
  const productId = {product}.product.productId;
  Alert.alert(
    'Unlock ' + {product}.product.title,
    'There are two ways of unlocking questions in whoami? You must complete all questions in the active category, or pay a fee (requires data)',
    [
      {
        text: 'No thanks', onPress: () => {
        }, style: 'cancel'
      },
      {
        text: 'Let\'s do it!', onPress: () => {
          try {
            console.log('About to purchase product with product id: ' + productId);
            const purchase = purchaseProduct(productId);
            if (purchase.transactionReceipt !== undefined) {
              ProductsDAO.persistProduct(productId, true);
              refresh(true);
            }
            finishTransaction();
          } catch (err) {
            console.warn(err.message);
            alert("Something went wrong during the purchase! Please try again..");
          }
          endConnection();
        }
      },
    ],
    {cancelable: false}
  )
};