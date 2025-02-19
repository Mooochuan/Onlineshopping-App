import React, { Component } from "react";
import "./Product.css";
import PayButton from "../PayButton";

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentImage: 0
    };
  }

  render() {
    const { id, name, caption, images, description, price } = this.props;
    const { currentImage } = this.state;

    // Price data from Stripe's default_price
    const unitAmount = (price && price.unit_amount) || 0; // e.g. 999 => 9.99
    const currency = price && price.currency
        ? price.currency.toUpperCase()
        : "EUR";

    // Convert 999 => 9 euros, 99 cents
    const euros = Math.floor(unitAmount / 100);
    // If you want to ensure exactly two digits, do:
    const cents = (unitAmount % 100).toString().padStart(2, "0");

    const thumbnails = images.map((image, index) => {
      return (
          <img
              key={index}
              className={"product-thumbnail " + (index === currentImage ? "selected" : "")}
              onClick={() => this.setState({ currentImage: index })}
              src={image}
              width="75"
              alt=""
          />
      );
    });

    return (
        <div key={id} className="product row">
          <div className="product-images col-xs-12 col-sm-6 col-lg-8">
            <div className="product-image-wrapper row">
              <div className="col-xs-12 col-lg-2 d-none d-lg-block d-xl-block">
                <div className="product-thumbnails">{thumbnails}</div>
              </div>
              <div className="col-xs-12 col-lg-10">
                <img
                    className="product-image img-fluid"
                    src={images[currentImage]}
                    alt={name}
                />
              </div>
            </div>
          </div>
          <div className="product-details col-xs-12 col-sm-6 col-lg-4">
            <h2 className="product-name">{name}</h2>
            <h1 className="product-caption">{caption}</h1>
            <div className="product-price">
              {euros}.{cents} {currency}
              <div className="product-taxes">incl. VAT</div>
            </div>
            <p className="product-description">{description}</p>
            <hr />
            <PayButton
                amount={unitAmount}
                price={price}
                name={name}
                caption={caption}
            />
          </div>
        </div>
    );
  }
}

export default Product;
