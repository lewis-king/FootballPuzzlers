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
  let purchases = [];
  let purchaseIds = [];
  let lockedProductIds = [];
  const productsWithLocked = [];
  const storedProducts = ProductsDAO.retrieveProducts();
  const storedProductIds = storedProducts.map((storedProduct) => storedProduct.productId);
  try {
    products = await RNIap.getProducts(itemSkus);
    purchases = await RNIap.getAvailablePurchases();
    console.log("Number of products retrieved from server: " +products.length);
    if (products == null || products.length == 0) {
      console.warn("Not got products back as expected, initialising with stub");
      products = stubProducts;
    }
    console.log("Number of products retrieved from DB: " +storedProducts.length);
    purchaseIds = purchases.map(purchase => purchase.productId);
    products.forEach((product) => {
      if (!storedProductIds.includes(product.productId) && !purchaseIds.includes(product.productId)) {
        lockedProductIds.push(product.productId);
      }
    });
    console.log("Number of locked products: " +lockedProductIds);
  } catch (err) {
    console.warn("Unable to fetch IAP products, probably because this is a dev environment");
    console.warn(err.code);
    console.warn(err.message);
    stubProducts.forEach((product) => {
      if (!storedProductIds.includes(product.productId)) {
        lockedProductIds.push(product.productId);
      }
    });
    products = stubProducts;
  }
  products.forEach((product) => {
    product.locked = true;
    if (!lockedProductIds.includes(product.productId)) {
      product.locked = false;
    }
    productsWithLocked.push(product);
  });
  console.log("Products with locked: " +productsWithLocked);
  products = productsWithLocked;
  return products;
};

const stubProducts = [
  {
    title: 'Champions League',
    productId: 'com.footballwhoami.championsleague',
    price: "0.99",
    localizedPrice: "0.99",
    currency: "GBP"
  },
  {
    title: 'World Cup',
    productId: 'com.footballwhoami.worldcup',
    price: "0.99",
    localizedPrice: "0.99",
    currency: "GBP"
  }];

export const purchaseProduct = async (productId) => {
  const purchase = await RNIap.buyProduct(productId);
  return purchase;
};

export const finishTransaction = () => {
  RNIap.finishTransaction();
};

export const endConnection = () => {
  RNIap.endConnection();
};