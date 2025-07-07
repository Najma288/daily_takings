// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack } from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to Daily Takings System
        </Typography>
        <Typography variant="body1">
          Please select an option to continue
        </Typography>
      </Box>

      <Stack spacing={3} alignItems="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/entry')}
        >
          Enter Daily Takings
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => navigate('/view')}
        >
          View Daily Takings
        </Button>


      </Stack>
    </Container>
  );
};

export default Home;
