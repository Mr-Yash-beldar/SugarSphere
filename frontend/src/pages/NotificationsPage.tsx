import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Divider,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ShoppingCart,
  LocalShipping,
  Payment,
  Info,
  Delete,
  DoneAll,
  Circle,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import type { Notification } from "@/types";
import toast from "react-hot-toast";

const typeIcons: Record<string, JSX.Element> = {
  order: <ShoppingCart color="primary" />,
  payment: <Payment color="success" />,
  shipping: <LocalShipping color="info" />,
  system: <Info color="warning" />,
  default: <NotificationsIcon color="action" />,
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationsApi.getAll({ page, limit: 10 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });

  const notifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getIcon = (type: string) => {
    return typeIcons[type] || typeIcons.default;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            startIcon={<DoneAll />}
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      <Paper>
        <List>
          {isLoading ? (
            [...Array(5)].map((_, idx) => (
              <ListItem key={idx}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ListItem>
            ))
          ) : notifications.length === 0 ? (
            <ListItem>
              <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
                <NotificationsIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            </ListItem>
          ) : (
            notifications.map((notification: Notification, index: number) => (
              <Box key={notification._id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? "transparent" : "action.hover",
                    cursor: notification.read ? "default" : "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => {
                    if (!notification.read) {
                      markReadMutation.mutate(notification._id);
                    }
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notification._id);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {!notification.read && (
                      <Circle
                        sx={{
                          fontSize: 10,
                          color: "primary.main",
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    )}
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ pr: 4 }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "block", pr: 4 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};
