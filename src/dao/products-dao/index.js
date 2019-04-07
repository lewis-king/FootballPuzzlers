import realm from '../realm/schema/realm';

const ProductsDAO = {

  persistProduct: function(productId, purchased) {
    realm.write(() => {
      realm.create('Product',
        {
          productId,
          purchased
        })
    })
  },
  retrieveProducts: function () {
    const products = realm.objects('Product');
    return products;
  }

};

export default ProductsDAO;