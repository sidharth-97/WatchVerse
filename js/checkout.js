
function applyCoupon(couponCode) {
    console.log('reached coupon');
    $.ajax({
      method: "post",
      url: "/coupons/validate",
      data: {
        coupon: couponCode
      },
      success: function (response) {
        if (response.status === true) {
          const newTotal = response.newTotal;
          const discount = response.discount;
          console.log("Coupon applied successfully!");

          const currentTotal = parseInt($("#finalTotal").text().replace("₹", ""));
          $("#discountAmount").text(`-₹${discount}`);
          // const newTotal = currentTotal - (discount * currentTotal);
          $("#finalTotal").text(`₹${newTotal}`);

        } else {
          $("#couponError").text(response.message);
        }
      },
      error: function (error) {
        console.error("Error applying coupon:", error);
      },
    });
  }


  $("#couponsForm").submit(function (event) {
    event.preventDefault();
    const couponCode = $("#couponCode").val();
    applyCoupon(couponCode);
  });




  function placeOrder() {
    const formData = $("#orderForm").serialize();

    $.ajax({
      method: "post",
      url: "/order",
      data: formData,
      success: function (response) {

        if (response.codSucess) {
          console.log("Order placed successfully by ajax!", response);
          location.href = "/orderSuccess"
        } else {
          razorpayPayment(response.order)
          console.log("order placed by razor pay");
        }
      },
      error: function (error) {
        console.error("Error placing order:", error);
      },
    });
  }

  $(document).ready(function () {
    $("#orderForm").submit(function (event) {
      event.preventDefault();
      placeOrder();
    });


  });


  function razorpayPayment(order) {
    console.log("goes to another method");
    var options = {
      "key": "rzp_test_FcpTaEapa4GL0L",
      "amount": order.total,
      "currency": "INR",
      "name": "Acme Corp",
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": order.id,
      "handler": function (response) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)

        verifyPayment(response, order);
      },
      "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000"
      },
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "theme": {
        "color": "#3399cc"
      }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
  }

  function verifyPayment(payment, order) {
    $.ajax({
      url: '/verify-payment',
      data: {
        payment,
        order,
      },
      method: 'post',
      success: (response) => {
        if (response.paymentSuccess == true) {
          location.href = "/orderSuccess"
        } else {
          alert('payment failed')
        }
      }
    })
  }

  function useWallet(walletBalance) {
    const orderTotal = parseInt($("#finalTotal").text().replace("₹", ""));
    const maxAmountToUse = Math.min(orderTotal, walletBalance);

    const newTotal = orderTotal - maxAmountToUse;
    const walletAmount = maxAmountToUse > 0 ? -maxAmountToUse : 0;

    $("#finalTotal").text(`₹${newTotal}`);
    $("#walletAmount").text(`₹${walletAmount}`);

    if (walletAmount < 0) {
      $("#walletField").show();
    } else {
      $("#walletField").hide();
    }
  }