import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isRegistering, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    registerUser(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
          setRegistrationSuccess(true);
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || "Registration failed");
        },
      }
    );
  };

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, width: "100%", textAlign: "center" }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "success.light",
                borderRadius: "50%",
                width: 80,
                height: 80,
                mb: 3,
              }}
            >
              <Email sx={{ fontSize: 40, color: "success.main" }} />
            </Box>

            <Typography variant="h4" fontWeight={600} gutterBottom>
              Verify Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a verification email to:
            </Typography>

            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {registeredEmail}
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2">
                Please check your inbox and click on the verification link to
                activate your account. The link will expire in 24 hours.
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Didn't receive the email? Check your spam folder or try again.
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              size="large"
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              🍬
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join SugarSphere today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Full Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isRegistering}
              sx={{ mb: 2 }}
            >
              {isRegistering ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
