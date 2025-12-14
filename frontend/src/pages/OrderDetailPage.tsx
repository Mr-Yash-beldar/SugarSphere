import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from "@mui/material";
import {
  ArrowBack,
  LocalShipping,
  Inventory,
  CheckCircle,
  Cancel,
  RateReview,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { sweetsApi } from "@/api/sweets";
import toast from "react-hot-toast";

const orderSteps = ["Paid", "Processing", "Shipped", "Delivered"];

const statusToStep: Record<string, number> = {
  paid: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      sweetId,
      rating,
      comment,
    }: {
      sweetId: string;
      rating: number;
      comment: string;
    }) => sweetsApi.addReview(sweetId, { rating, comment }),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      if (selectedItem) {
        setReviewedItems((prev) => new Set(prev).add(selectedItem.sweetId));
      }
      setReviewDialogOpen(false);
      setSelectedItem(null);
      setRating(5);
      setComment("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleOpenReviewDialog = (item: any) => {
    setSelectedItem(item);
    setRating(5);
    setComment("");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedItem || !rating) return;
    reviewMutation.mutate({
      sweetId: selectedItem.sweetId,
      rating,
      comment,
    });
  };

  const order = data?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Order not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/orders")}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  const isCancelled = order.status === "cancelled";
  const activeStep = isCancelled ? -1 : statusToStep[order.status] ?? 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/orders")}
        sx={{ mb: 2 }}
      >
        Back to Orders
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Order #{order._id.slice(-8).toUpperCase()}
        </Typography>
        <Chip
          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          color={
            isCancelled
              ? "error"
              : order.status === "delivered"
              ? "success"
              : "primary"
          }
        />
      </Box>

      {/* Order Progress */}
      {!isCancelled && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {orderSteps.map((label, index) => (
              <Step key={label} completed={index <= activeStep}>
                <StepLabel
                  StepIconComponent={() => {
                    const isCompleted = index <= activeStep;
                    const icons: Record<number, JSX.Element> = {
                      0: (
                        <Inventory
                          color={isCompleted ? "primary" : "disabled"}
                        />
                      ),
                      1: (
                        <Inventory
                          color={isCompleted ? "primary" : "disabled"}
                        />
                      ),
                      2: (
                        <LocalShipping
                          color={isCompleted ? "primary" : "disabled"}
                        />
                      ),
                      3: (
                        <CheckCircle
                          color={isCompleted ? "success" : "disabled"}
                        />
                      ),
                    };
                    return icons[index];
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<Cancel />}>
          This order has been cancelled.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <Divider sx={{ my: 2 }} />

            <List>
              {order.items.map((item: any, index: number) => (
                <ListItem
                  key={index}
                  divider={index < order.items.length - 1}
                  sx={{ flexWrap: "wrap" }}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={item.sweet?.imageUrl || "/placeholder-sweet.jpg"}
                      alt={item.name}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight={500}>{item.name}</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        ₹{item.unitPrice || item.priceAtTime} × {item.quantity}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography fontWeight={600}>
                      ₹
                      {(
                        (item.unitPrice || item.priceAtTime) * item.quantity
                      ).toFixed(2)}
                    </Typography>
                    {order.status === "delivered" &&
                      !reviewedItems.has(item.sweetId) && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RateReview />}
                          onClick={() => handleOpenReviewDialog(item)}
                        >
                          Review
                        </Button>
                      )}
                    {reviewedItems.has(item.sweetId) && (
                      <Chip label="Reviewed" size="small" color="success" />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>₹{order.totalAmount.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Shipping</Typography>
              <Typography color="success.main">Free</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ₹{order.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Status</Typography>
              <Chip
                label={
                  order.status === "paid" || order.razorpayPaymentId
                    ? "Paid"
                    : "Pending"
                }
                color={
                  order.status === "paid" || order.razorpayPaymentId
                    ? "success"
                    : "warning"
                }
                size="small"
              />
            </Box>
            {order.razorpayPaymentId && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Payment ID</Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {order.razorpayPaymentId}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Order Date
            </Typography>
            <Typography gutterBottom>{formatDate(order.createdAt)}</Typography>

            {order.updatedAt !== order.createdAt && (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Last Updated
                </Typography>
                <Typography>{formatDate(order.updatedAt)}</Typography>
              </>
            )}
          </Paper>

          {/* Cancel Order Button */}
          {!isCancelled && order.status === "created" && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review for {selectedItem?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography component="legend" gutterBottom>
              Rating
            </Typography>
            <Rating
              name="rating"
              value={rating}
              size="large"
              onChange={(_, newValue) => setRating(newValue)}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review (Optional)"
            placeholder="Share your experience with this sweet..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!rating || reviewMutation.isPending}
          >
            {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
