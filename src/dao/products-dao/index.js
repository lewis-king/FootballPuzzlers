import realm from '../realm/schema/realm';

const ProductsDAO = {

  persistProduct: function(product, purchased) {
    realm.write(() => {
      realm.create('Product',
        {
          productId: product.id,
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