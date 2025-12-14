import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
} from "@mui/material";
import { Facebook, Twitter, Instagram, Email } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "grey.900",
        color: "grey.300",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="white" gutterBottom>
              🍬 SugarSphere
            </Typography>
            <Typography variant="body2">
              Your one-stop destination for delicious sweets and treats. Made
              with love, delivered with care.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Email />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Shop
            </Typography>
            <Link
              component={RouterLink}
              to="/sweets"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              All Sweets
            </Link>
            <Link
              component={RouterLink}
              to="/sweets?category=chocolates"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Chocolates
            </Link>
            <Link
              component={RouterLink}
              to="/sweets?category=cakes"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Cakes
            </Link>
            <Link
              component={RouterLink}
              to="/sweets?category=indian"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Indian Sweets
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Account
            </Typography>
            <Link
              component={RouterLink}
              to="/profile"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              My Profile
            </Link>
            <Link
              component={RouterLink}
              to="/orders"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              My Orders
            </Link>
            <Link
              component={RouterLink}
              to="/cart"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Cart
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              FAQ
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Shipping Info
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="white" gutterBottom>
              Legal
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Refund Policy
            </Link>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: 1, borderColor: "grey.800", pt: 3, mt: 4 }}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} SugarSphere. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
