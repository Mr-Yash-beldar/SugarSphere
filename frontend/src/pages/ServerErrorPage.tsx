import { Box, Typography, Button, Container, keyframes } from "@mui/material";
import { Refresh, SupportAgent } from "@mui/icons-material";

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
`;

interface ServerErrorPageProps {
  onRetry?: () => void;
}

export const ServerErrorPage = ({ onRetry }: ServerErrorPageProps) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          animation: `${float} 5s ease-in-out infinite 1s`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          animation: `${float} 4s ease-in-out infinite 0.5s`,
        }}
      />

      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: 100, md: 140 },
                height: { xs: 100, md: 140 },
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `${pulse} 2s ease-in-out infinite`,
                boxShadow: "0 10px 40px rgba(255, 107, 107, 0.4)",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "3rem", md: "4rem" },
                  animation: `${shake} 3s ease-in-out infinite`,
                }}
              >
                🍬
              </Typography>
            </Box>
          </Box>

          {/* 505 Text */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "4rem", md: "6rem" },
              fontWeight: 800,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            505
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#333",
              mb: 2,
              fontSize: { xs: "1.3rem", md: "1.8rem" },
            }}
          >
            Our candy machine is taking a break! 🔧
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mb: 4,
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              lineHeight: 1.7,
              px: { xs: 0, md: 2 },
            }}
          >
            We couldn't connect to our sweet servers. Our team of candy
            engineers is working hard to fix this. Please try again in a moment!
          </Typography>

          {/* Status Indicator */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 4,
              p: 2,
              borderRadius: 2,
              background: "rgba(102, 126, 234, 0.1)",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ff6b6b",
                animation: `${pulse} 1.5s ease-in-out infinite`,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#667eea", fontWeight: 500 }}
            >
              Server connection failed
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={
                <Refresh
                  sx={{
                    animation: `${spin} 2s linear infinite`,
                    animationPlayState: "paused",
                    ".MuiButton-root:hover &": {
                      animationPlayState: "running",
                    },
                  }}
                />
              }
              onClick={handleRetry}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd6, #6a4190)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                  "& .MuiSvgIcon-root": {
                    animationPlayState: "running",
                  },
                },
                transition: "all 0.3s ease",
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SupportAgent />}
              onClick={() =>
                window.open("mailto:support@sugarsphere.com", "_blank")
              }
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#5a6fd6",
                  background: "rgba(102, 126, 234, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Contact Support
            </Button>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 4,
              color: "#999",
            }}
          >
            Error Code: SERVER_CONNECTION_FAILED
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
