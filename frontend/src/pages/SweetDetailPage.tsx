import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  TextField,
  Paper,
  Breadcrumbs,
  Link,
  Rating,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  Star,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { sweetsApi } from "@/api/sweets";
import { useCartStore } from "@/store";
import { LoadingSpinner } from "@/components/common";
import toast from "react-hot-toast";

export const SweetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sweet", id],
    queryFn: async () => {
      const response = await sweetsApi.getById(id!);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          Sweet not found
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/sweets")}
          sx={{ mt: 2 }}
        >
          Back to Sweets
        </Button>
      </Container>
    );
  }

  const sweet = data;
  const isOutOfStock = sweet.quantity === 0;
  const maxQuantity = Math.min(sweet.quantity, 10);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(sweet, quantity);
      toast.success(`${quantity} x ${sweet.name} added to cart!`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/sweets" color="inherit">
          Sweets
        </Link>
        <Typography color="text.primary">{sweet.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Image */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={sweet.imageUrl || "/placeholder-sweet.jpg"}
              alt={sweet.name}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 500,
                objectFit: "cover",
              }}
            />
            {isOutOfStock && (
              <Chip
                label="Out of Stock"
                color="error"
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: "1rem",
                }}
              />
            )}
          </Paper>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Chip
              label={sweet.category}
              color="primary"
              sx={{ mb: 2, textTransform: "capitalize" }}
            />

            <Typography
              variant="h3"
              component="h1"
              fontWeight={600}
              gutterBottom
            >
              {sweet.name}
            </Typography>

            <Typography
              variant="h4"
              color="primary"
              fontWeight={600}
              gutterBottom
            >
              ₹{sweet.price.toFixed(2)}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {sweet.quantity > 0
                ? `${sweet.quantity} in stock`
                : "Out of stock"}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              {sweet.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Quantity Selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantity:</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Remove />
                </Button>
                <TextField
                  value={quantity}
                  size="small"
                  sx={{ width: 60 }}
                  inputProps={{
                    readOnly: true,
                    style: { textAlign: "center" },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity || isOutOfStock}
                >
                  <Add />
                </Button>
              </Box>
            </Box>

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              sx={{ py: 1.5 }}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Back Button */}
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/sweets")}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Customer Reviews
          </Typography>
          {sweet.averageRating &&
            sweet.totalReviews &&
            sweet.totalReviews > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating value={sweet.averageRating} precision={0.5} readOnly />
                <Typography color="text.secondary">
                  ({sweet.totalReviews}{" "}
                  {sweet.totalReviews === 1 ? "review" : "reviews"})
                </Typography>
              </Box>
            )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {!sweet.reviews || sweet.reviews.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Star sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No reviews yet. Be the first to review this sweet!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sweet.reviews.map((review: any, index: number) => (
              <Grid item xs={12} md={6} key={review._id || index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {review.userName?.charAt(0)?.toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={500}>
                          {review.userName || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                    {review.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};
