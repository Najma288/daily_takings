// src/components/ViewPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface Store {
  id: number;
  name: string;
}

interface DailyTaking {
  store: string;
  date: string;
  daily_takings: number;
  created_at?: string;
  updated_at?: string;
}

const ViewPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [result, setResult] = useState<DailyTaking | DailyTaking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch stores from backend
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stores/');
        if (!res.ok) throw new Error('Failed to fetch stores');
        const data = await res.json();
        setStores(data);
      } catch (err) {
        setStores([]);
      }
    };
    fetchStores();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    if (!selectedStore || !selectedDate) {
      setError('Please select a store and date.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8000/api/upload/?store=${encodeURIComponent(selectedStore)}&date=${selectedDate.format('YYYY-MM-DD')}`
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'No data found');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          View Daily Takings
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
          />
          <FormControl fullWidth>
            <InputLabel id="store-label">Select Store</InputLabel>
            <Select
              labelId="store-label"
              value={selectedStore}
              label="Select Store"
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.name}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </Stack>

        {error && (
          <Typography sx={{ mt: 2 }} color="error">
            {error}
          </Typography>
        )}

        {result && Array.isArray(result) ? (
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Takings for All Stores on {selectedDate?.format('DD MMM YYYY')}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Store</strong></TableCell>
                  <TableCell><strong>Daily Takings</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.map((row) => (
                  <TableRow key={row.store}>
                    <TableCell>{row.store}</TableCell>
                    <TableCell>{row.daily_takings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : result ? (
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Takings for {result.store} on {dayjs(result.date).format('DD MMM YYYY')}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Field</strong></TableCell>
                  <TableCell><strong>Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Store</TableCell>
                  <TableCell>{result.store}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>{dayjs(result.date).format('DD MMM YYYY')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Daily Takings</TableCell>
                  <TableCell>{result.daily_takings}</TableCell>
                </TableRow>
                {result.created_at && (
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>{dayjs(result.created_at).format('DD MMM YYYY HH:mm')}</TableCell>
                  </TableRow>
                )}
                {result.updated_at && (
                  <TableRow>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>{dayjs(result.updated_at).format('DD MMM YYYY HH:mm')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        ) : null}
      </Container>
    </LocalizationProvider>
  );
};

export default ViewPage;
