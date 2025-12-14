import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  LocalShipping,
  Payment,
  Star,
} from "@mui/icons-material";
import { sweetsApi } from "@/api/sweets";
import { SweetGrid } from "@/components/sweets";

export const HomePage = () => {
  const theme = useTheme();

  const { data: sweetsData, isLoading } = useQuery({
    queryKey: ["featuredSweets"],
    queryFn: async () => {
      const response = await sweetsApi.search({ limit: 8, sort: "newest" });
      return response.data;
    },
  });

  const features = [
    {
      icon: <ShoppingCart sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Wide Selection",
      description: "Choose from hundreds of delicious sweets and treats",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Fast Delivery",
      description: "Get your sweets delivered fresh to your doorstep",
    },
    {
      icon: <Payment sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Secure Payment",
      description: "Safe and secure payment with Razorpay",
    },
    {
      icon: <Star sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Premium Quality",
      description: "Made with the finest ingredients and lots of love",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={700}
                gutterBottom
              >
                Sweet Treats for Every Occasion
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Discover our handcrafted collection of sweets, chocolates, and
                desserts. Made with love, delivered with care.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/sweets"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/sweets?category=chocolates"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  View Chocolates
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: "150px",
                }}
              >
                🍰🍫🍬
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Sweets Section */}
      <Box sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              Featured Sweets
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Check out our latest and most popular treats
            </Typography>
          </Box>
          <SweetGrid sweets={sweetsData || []} isLoading={isLoading} />
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/sweets"
            >
              View All Sweets
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight={600}
        >
          Shop by Category
        </Typography>
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {[
            { name: "Chocolates", emoji: "🍫", color: "#8B4513" },
            { name: "Candies", emoji: "🍬", color: "#FF69B4" },
            { name: "Cakes", emoji: "🎂", color: "#FFD700" },
            { name: "Cookies", emoji: "🍪", color: "#D2691E" },
            { name: "Pastries", emoji: "🥐", color: "#DEB887" },
            { name: "Indian", emoji: "🍯", color: "#FFA500" },
          ].map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.name}>
              <Card
                component={RouterLink}
                to={`/sweets?category=${category.name.toLowerCase()}`}
                sx={{
                  textDecoration: "none",
                  textAlign: "center",
                  py: 3,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Typography variant="h2">{category.emoji}</Typography>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 1 }}>
                  {category.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
