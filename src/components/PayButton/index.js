import React, { Component } from "react";
import config from "../../config";
import "./PayButton.css";

class PayButton extends Component {
  constructor(props) {
    super(props);
    this.onToken = this.onToken.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.isValid = this.isValid.bind(this);

    this.state = {
      shippingInfo: false,
      addedToBasket: false,
      alreadyOrdered: false,
      // For shipping form:
      firstName: "",
      lastName: "",
      street: "",
      streetNumber: "",
      zipcode: "",
      city: ""
    };
  }

  componentDidMount() {
    // Setup old-style Stripe Checkout popup
    this.handler = window.StripeCheckout.configure({
      key: config.stripe.apiKey,
      image: "https://stripe.com/img/documentation/checkout/marketplace.png",
      locale: "auto",
      token: (token) => {
        this.onToken(token);
      }
    });
  }

  async onToken(token) {
    // "amount" is passed in from <PayButton amount={999} ... />
    // "price" could also be passed if you need a priceId
    const { amount } = this.props;
    const { firstName, lastName, street, streetNumber, zipcode, city } = this.state;

    // Build shipping info
    const shipping = {
      name: firstName + " " + lastName,
      address: {
        line1: street + " " + streetNumber,
        city: city,
        postal_code: zipcode
      }
    };

    // Send to your backend (createCharge.js):
    const res = await fetch(config.stripe.checkoutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        order: {
          currency: config.stripe.currency,
          amount,
          shipping,
          // If you want line items, pass them here:
          // items: [{ priceId: price.id, quantity: 1 }]
        }
      })
    });

    const data = await res.json();
    console.log("Payment response:", data);

    this.setState({
      alreadyOrdered: true
    });
  }

  openStripe(ev) {
    ev.preventDefault();
    const { amount, name, caption } = this.props;

    // Opens old Stripe Checkout popup
    this.handler.open({
      name: "Serverless Shop",
      description: caption,
      zipCode: true,
      currency: "eur",
      amount: amount,
      closed: () => {
        console.log("Stripe popup closed");
      }
    });
  }

  handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    this.setState({
      [name]: type === "checkbox" ? checked : value
    });
  }

  isValid() {
    const { firstName, lastName, street, streetNumber, zipcode, city } = this.state;
    if (!firstName || !lastName || !street || !streetNumber || !zipcode || !city) {
      return false;
    }
    return true;
  }

  render() {
    const { shippingInfo, addedToBasket, alreadyOrdered } = this.state;

    return (
        <div>
          {alreadyOrdered ? (
              <button
                  className="btn btn-success btn-block paybutton-success-message"
                  onClick={() => this.setState({ alreadyOrdered: false })}
              >
                Thank you for your order!
              </button>
          ) : (
              <div>
                {!addedToBasket && (
                    <button
                        onClick={() => {
                          this.setState({ addedToBasket: true });
                          // This line is just from the old code
                          setTimeout(() => window.scrollTo(0, document.body.scrollHeight + 420), 300);
                        }}
                        className="btn btn-primary btn-block paybutton-add-to-basket"
                    >
                      Add to cart
                    </button>
                )}

                {/* If we've added to basket, show shipping info */}
                {shippingInfo || !addedToBasket ? null : (
                    <form onSubmit={(ev) => this.openStripe(ev)}>
                      <p>Your shipping address</p>
                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <input
                              type="text"
                              className="form-control"
                              id="inputFirstName"
                              placeholder="Firstname"
                              name="firstName"
                              onChange={this.handleInputChange}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <input
                              type="text"
                              className="form-control"
                              id="inputLastName"
                              placeholder="Lastname"
                              name="lastName"
                              onChange={this.handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group col-md-8">
                          <input
                              type="text"
                              className="form-control"
                              id="inputStreet"
                              placeholder="Street"
                              name="street"
                              onChange={this.handleInputChange}
                          />
                        </div>
                        <div className="form-group col-md-4">
                          <input
                              type="text"
                              className="form-control"
                              id="inputStreetNumber"
                              placeholder="Number"
                              name="streetNumber"
                              onChange={this.handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group col-md-4">
                          <input
                              type="text"
                              className="form-control"
                              id="inputZip"
                              placeholder="Zip"
                              name="zipcode"
                              onChange={this.handleInputChange}
                          />
                        </div>
                        <div className="form-group col-md-8">
                          <input
                              type="text"
                              className="form-control"
                              id="inputCity"
                              placeholder="City"
                              name="city"
                              onChange={this.handleInputChange}
                          />
                        </div>
                      </div>
                      <button
                          disabled={!this.isValid()}
                          className="btn btn-primary btn-block paybutton-pay"
                          type="submit"
                      >
                        Pay
                      </button>
                    </form>
                )}
              </div>
          )}
        </div>
    );
  }
}

export default PayButton;
