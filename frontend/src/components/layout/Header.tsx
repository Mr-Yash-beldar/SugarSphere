import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  InputBase,
  styled,
  alpha,
} from "@mui/material";
import {
  ShoppingCart,
  Notifications,
  Search as SearchIcon,
  Person,
  Dashboard,
  Logout,
  Store,
} from "@mui/icons-material";
import { useAuthStore, useCartStore } from "@/store";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/sweets?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: "primary.main" }}>
      <Toolbar>
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          🍬 SugarSphere
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search sweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          color="inherit"
          component={RouterLink}
          to="/sweets"
          startIcon={<Store />}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          Shop
        </Button>

        <IconButton color="inherit" component={RouterLink} to="/cart">
          <Badge badgeContent={totalItems} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {isAuthenticated ? (
          <>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/notifications"
            >
              <Badge badgeContent={0} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name}
                sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="textSecondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleMenuClose}
              >
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/orders"
                onClick={handleMenuClose}
              >
                <ShoppingCart sx={{ mr: 1 }} /> My Orders
              </MenuItem>
              {isAdmin && (
                <MenuItem
                  component={RouterLink}
                  to="/admin"
                  onClick={handleMenuClose}
                >
                  <Dashboard sx={{ mr: 1 }} /> Admin Dashboard
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/register"
              sx={{ ml: 1 }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
