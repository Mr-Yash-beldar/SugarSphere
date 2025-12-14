import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Divider,
  Grid,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingBag } from "@mui/icons-material";
import { useCartStore, useAuthStore } from "@/store";

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleQuantityChange = (
    sweetId: string,
    delta: number,
    currentQty: number,
    maxQty: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      removeItem(sweetId);
    } else {
      updateQuantity(sweetId, Math.min(newQty, maxQty));
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <ShoppingBag sx={{ fontSize: 100, color: "grey.300", mb: 3 }} />
          <Typography variant="h4" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any sweets yet!
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/sweets"
          >
            Start Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
        Shopping Cart
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {totalItems} items in your cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.sweet._id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          component="img"
                          src={item.sweet.imageUrl || "/placeholder-sweet.jpg"}
                          alt={item.sweet.name}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {item.sweet.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.sweet.category}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      ₹{item.sweet.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(
                              item.sweet._id,
                              -1,
                              item.quantity,
                              item.sweet.quantity
                            )
                          }
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ width: 50 }}
                          inputProps={{
                            readOnly: true,
                            style: { textAlign: "center" },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleQuantityChange(
                              item.sweet._id,
                              1,
                              item.quantity,
                              item.sweet.quantity
                            )
                          }
                          disabled={item.quantity >= item.sweet.quantity}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={500}>
                        ₹{(item.sweet.price * item.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeItem(item.sweet._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button component={RouterLink} to="/sweets">
              Continue Shopping
            </Button>
            <Button color="error" onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
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
              onClick={handleCheckout}
            >
              {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
