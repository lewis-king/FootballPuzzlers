import * as RNIap from 'react-native-iap';
import ProductsDAO from '../../dao/products-dao';

export const itemSkus = [
   'com.footballwhoami.worldcup',
   'com.footballwhoami.championsleague'
 ];

export const categoryToItemSku = {
   WC: itemSkus[0],
   CL: itemSkus[1]
 };

export const getProducts = async () => {
  let products;
  let lockedProducts = null;
  try {
    products = await RNIap.getProducts(itemSkus);
    if (products == null || products.length == 0) {
      console.warn("Not got products back as expected, initialising with stub");
      products = stubProducts;
    } else {
      /*try {
        //Products returned, let's cross-check with what the user has purchased
        const purchases  = await RNIap.getAvailablePurchases();
        const purchasesProductIds = purchases.map((purchase) => purchase.productId);
        products.forEach((product) => {
          if (!purchasesProductIds.includes(product.productId)) {
            lockedProducts.push(product);
          }
        });
      } catch (err) {
        console.warn("Unable to fetch available purchases, probably because this is a dev environment");
      }*/
      const storedProducts = ProductsDAO.retrieveProducts();
      const storedProductIds = storedProducts.map((storedProduct) => storedProduct.productId);
      products.forEach((product) => {
        if (!storedProductIds.includes(product.id)) {
          lockedProducts.push(product);
        }
      });

      return lockedProducts || products;
    }
    console.log("Successfully retrieved user's products");
  } catch (err) {
    console.warn("Unable to fetch IAP products, probably because this is a dev environment");
    console.warn(err);
    products = stubProducts;
  }
  return products;
};

const stubProducts = [
  {
    title: 'Champions League',
    productId: 'com.footballwhoami.championsleague',
    price: "0.99",
    currency: "GBP"
  },
  {
    title: 'World Cup',
    productId: 'com.footballwhoami.worldcup',
    price: "0.99",
    currency: "GBP"
  }];

export const purchaseProduct = async (productId) => {
  const purchase = await RNIap.buyProduct(productId);
  return purchase;
};

export const endConnection = () => {
  RNIap.endConnection();
};