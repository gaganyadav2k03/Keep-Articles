import { Box, Card, CardContent, Typography } from "@mui/material";

const trendingTopics = [
  "React 19 Features",
  "AI in Education",
  "Node.js Performance",
  "Gemini vs GPT-4",
  "MUI v6 Released",
  "TypeScript Decorators",
  "Web3 Security",
  "Quantum Computing",
  "Dark Mode Trends",
  "Next.js App Router",
];

export default function TrendingCards() {
  return (
    <Box sx={{ overflow: "hidden", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          animation: "scroll 30s linear infinite",
          width: "fit-content",
        }}
      >
        {[...trendingTopics, ...trendingTopics].map((topic, index) => (
          <Card
            key={index}
            sx={{
              minWidth: 200,
              px: 2,
              py: 1,
              borderRadius: 3,
              background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
              boxShadow: "0 2px 8px rgba(141, 236, 236, 0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
                background:
                  "linear-gradient(90deg,rgb(255, 255, 255),rgb(170, 225, 255))",
              },
            }}
          >
            <CardContent sx={{ p: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, textAlign: "center" }}
              >
                {topic}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Keyframes */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </Box>
  );
}
