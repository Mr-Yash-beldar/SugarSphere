import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Skeleton,
  Grid,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import type { Order } from "@/types";
import toast from "react-hot-toast";

// status and payment color maps were removed because they were unused.

export const OrdersManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: ordersApi.getAllAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) => ordersApi.updateStatus(orderId, newStatus),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    },
  });

  const orders = data?.data || [];

  // Filter orders based on status
  const filteredOrders = orders.filter((order: Order) => {
    if (status && order.status !== status) return false;
    return true;
  });

  // Listen for new orders via socket
  useEffect(() => {
    const handleNewOrder = () => {
      refetch();
      toast.success("New order received!");
    };

    // Listen for socket events
    const socket = (window as any).__socket;
    if (socket) {
      socket.on("order:new", handleNewOrder);
      return () => {
        socket.off("order:new", handleNewOrder);
      };
    }
  }, [refetch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Orders Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Order Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="created">Created</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <MenuItem value="">All Payments</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  {[...Array(8)].map((_, cellIdx) => (
                    <TableCell key={cellIdx}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: Order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      #{order._id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.user?.name || "Unknown"}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>
                      ₹{order.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.razorpayPaymentId ? "Paid" : "Pending"}
                      size="small"
                      color={order.razorpayPaymentId ? "success" : "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          orderId: order._id,
                          newStatus: e.target.value,
                        })
                      }
                      disabled={
                        updateStatusMutation.isPending ||
                        order.status === "cancelled" ||
                        order.status === "delivered"
                      }
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
