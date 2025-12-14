import { Box, Typography, Button, Container, keyframes } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Home, ArrowBack } from "@mui/icons-material";

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(2deg);
  }
  75% {
    transform: translateY(-5px) rotate(-2deg);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const wiggle = keyframes`
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
`;

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Candy Decorations */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          fontSize: "4rem",
          animation: `${float} 4s ease-in-out infinite`,
          opacity: 0.6,
        }}
      >
        🍭
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "15%",
          fontSize: "3rem",
          animation: `${float} 5s ease-in-out infinite 0.5s`,
          opacity: 0.6,
        }}
      >
        🍬
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          fontSize: "3.5rem",
          animation: `${float} 4.5s ease-in-out infinite 1s`,
          opacity: 0.6,
        }}
      >
        🍩
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "25%",
          right: "10%",
          fontSize: "3rem",
          animation: `${float} 3.5s ease-in-out infinite 0.3s`,
          opacity: 0.6,
        }}
      >
        🧁
      </Box>

      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* 404 Number with Candy */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "5rem", md: "8rem" },
                fontWeight: 800,
                background: "linear-gradient(45deg, #ff6b6b, #feca57)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: `${wiggle} 2s ease-in-out infinite`,
              }}
            >
              4
            </Typography>
            <Box
              sx={{
                fontSize: { xs: "4rem", md: "6rem" },
                animation: `${bounce} 2s ease-in-out infinite`,
              }}
            >
              🍪
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "5rem", md: "8rem" },
                fontWeight: 800,
                background: "linear-gradient(45deg, #ff6b6b, #feca57)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: `${wiggle} 2s ease-in-out infinite 0.5s`,
              }}
            >
              4
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#333",
              mb: 2,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Oops! This page got eaten! 🍴
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mb: 4,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.6,
            }}
          >
            Looks like someone with a sweet tooth couldn't resist this page.
            Don't worry, we have plenty more delicious treats waiting for you!
          </Typography>

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
              startIcon={<Home />}
              onClick={() => navigate("/")}
              sx={{
                background: "linear-gradient(45deg, #ff6b6b, #feca57)",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 20px rgba(255, 107, 107, 0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #ee5a5a, #f0b847)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 25px rgba(255, 107, 107, 0.5)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to Sweets
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: "#ff6b6b",
                color: "#ff6b6b",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#ee5a5a",
                  background: "rgba(255, 107, 107, 0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
