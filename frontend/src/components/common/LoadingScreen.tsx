import { Box, Typography, CircularProgress, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface LoadingScreenProps {
  appName?: string;
  message?: string;
}

export const LoadingScreen = ({
  appName = "SugarSphere",
  message = "Connecting to server...",
}: LoadingScreenProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        zIndex: 9999,
      }}
    >
      {/* Logo/App Name */}
      <Box
        sx={{
          animation: `${fadeIn} 0.8s ease-out`,
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
            textShadow: "2px 4px 8px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.05em",
          }}
        >
          🍬 {appName}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255, 255, 255, 0.85)",
            mt: 1,
            fontWeight: 400,
            letterSpacing: "0.1em",
          }}
        >
          Sweet Delights Await
        </Typography>
      </Box>

      {/* Loading Spinner */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: `${fadeIn} 0.8s ease-out 0.3s both`,
        }}
      >
        <CircularProgress
          size={50}
          thickness={4}
          sx={{
            color: "white",
            mb: 2,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      </Box>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          Preparing your sweet experience...
        </Typography>
      </Box>
    </Box>
  );
};
