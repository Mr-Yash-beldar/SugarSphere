import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Payment, CheckCircle } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { useCartStore, useAuthStore } from "@/store";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ordersApi.verify,
  });

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway");
        setIsProcessing(false);
        return;
      }

      // Create order on backend
      const orderItems = items.map((item) => ({
        sweetId: item.sweet._id,
        quantity: item.quantity,
      }));

      const orderResponse = await createOrderMutation.mutateAsync({
        items: orderItems,
      });

      if (!orderResponse.data) {
        throw new Error("Failed to create order");
      }

      const { orderId, razorpayOrderId, amount } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100, // in paise
        currency: "INR",
        name: "SugarSphere",
        description: "Sweet Purchase",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyPaymentMutation.mutateAsync({
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResponse.data?.status === "paid") {
              clearCart();
              toast.success("Payment successful!");
              navigate(`/orders/${orderId}`);
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#ff6b9d",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <List>
              {items.map((item) => (
                <ListItem key={item.sweet._id} divider>
                  <Box
                    component="img"
                    src={item.sweet.imageUrl || "/placeholder-sweet.jpg"}
                    alt={item.sweet.name}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      mr: 2,
                      objectFit: "cover",
                    }}
                  />
                  <ListItemText
                    primary={item.sweet.name}
                    secondary={`Qty: ${item.quantity}`}
                  />
                  <Typography fontWeight={500}>
                    ₹{(item.sweet.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography>₹{totalAmount.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Shipping</Typography>
              <Typography color="success.main">Free</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Tax</Typography>
              <Typography>Included</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={
                isProcessing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Payment />
                )
              }
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Secure payment powered by Razorpay
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
