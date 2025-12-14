import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Menu as MenuIcon,
  ChevronLeft,
} from "@mui/icons-material";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
  { text: "Products", icon: <Inventory />, path: "/admin/sweets" },
  { text: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
  { text: "Users", icon: <People />, path: "/admin/users" },
];

interface AdminSidebarProps {
  children: React.ReactNode;
}

export const AdminSidebar = ({ children }: AdminSidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          🍬 Admin Panel
        </Typography>
        {isMobile && (
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.main",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "inherit" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          SugarSphere Admin v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Mobile toggle button */}
      {isMobile && (
        <IconButton
          color="primary"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            left: 16,
            top: 80,
            zIndex: 1200,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            height: "auto",
            minHeight: "calc(100vh - 64px)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: "grey.50",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
