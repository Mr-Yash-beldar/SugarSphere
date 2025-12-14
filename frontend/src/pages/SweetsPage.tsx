import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Chip,
  Paper,
  Pagination,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { sweetsApi } from "@/api/sweets";
import { SweetGrid } from "@/components/sweets";

const categories = [
  { value: "", label: "All Categories" },
  { value: "chocolates", label: "Chocolates" },
  { value: "candies", label: "Candies" },
  { value: "cookies", label: "Cookies" },
  { value: "cakes", label: "Cakes" },
  { value: "pastries", label: "Pastries" },
  { value: "indian", label: "Indian Sweets" },
  { value: "other", label: "Other" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

export const SweetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    name: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "newest",
    priceRange: [0, 5000] as [number, number],
    page: parseInt(searchParams.get("page") || "1"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["sweets", filters],
    queryFn: async () => {
      const response = await sweetsApi.search({
        name: filters.name || undefined,
        category: filters.category || undefined,
        sort: filters.sort,
        minPrice: filters.priceRange[0] || undefined,
        maxPrice:
          filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
        page: filters.page,
        limit: 12,
      });
      return response;
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: page.toString(),
    });
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      category: "",
      sort: "newest",
      priceRange: [0, 5000],
      page: 1,
    });
    setSearchParams({});
  };

  const activeFilters = [
    filters.category && `Category: ${filters.category}`,
    filters.name && `Search: ${filters.name}`,
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) &&
      `Price: ₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`,
  ].filter(Boolean);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
        Our Sweets Collection
      </Typography>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>

            <TextField
              fullWidth
              label="Search"
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
                label="Sort By"
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={filters.priceRange}
              onChange={(_, value) => handleFilterChange("priceRange", value)}
              valueLabelDisplay="auto"
              min={0}
              max={5000}
              step={100}
              valueLabelFormat={(value) => `₹${value}`}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">₹{filters.priceRange[0]}</Typography>
              <Typography variant="body2">₹{filters.priceRange[1]}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {activeFilters.map((filter, index) => (
                <Chip key={index} label={filter} size="small" />
              ))}
              <Chip
                label="Clear All"
                size="small"
                onClick={clearFilters}
                color="primary"
              />
            </Box>
          )}

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {data?.pagination?.totalItems || 0} sweets found
          </Typography>

          {/* Products */}
          <SweetGrid
            sweets={data?.data || []}
            isLoading={isLoading}
            emptyMessage="No sweets match your filters"
          />

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={data.pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
