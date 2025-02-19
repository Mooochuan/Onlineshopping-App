import React, { Component } from "react";
import config from "../../config";
import Product from "../Product";
import "./ProductList.css";

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  async fetchProducts() {
    const res = await fetch(config.stripe.productsUrl, {
      method: "GET"
    });
    const response = await res.json();
    const products = response.data || [];

    this.setState({ products });
  }

  render() {
    const { products } = this.state;

    // For each product, pass product.default_price as "price"
    const productList = products.map((product) => (
        <Product
            key={product.id}
            id={product.id}
            name={product.name}
            caption={product.caption}
            description={product.description}
            images={product.images}
            price={product.default_price} // Now we have a single default price
        />
    ));

    return (
        <div id="products">
          {productList}
        </div>
    );
  }
}

export default ProductList;
