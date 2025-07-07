// Entry.tsx
import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Typography, Button, Stack, Box, Select, MenuItem,
  FormControl, InputLabel, Paper, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ExcelUploader from './ExcelUploader';
import { DailyTaking, UploadResponse } from '../types';

// Define the prop type
type EntryProps = {
  onChange: (data: DailyTaking) => void;
};

const allEntries: Record<string, any> = {}; // Simple in-memory store

function Entry({ onChange }: EntryProps) {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [store, setStore] = useState('');
  const [cashCoin, setCashCoin] = useState(0);
  const [cheques, setCheques] = useState(0);
  const [eftPos, setEftPos] = useState(0);
  const [pettyCash, setPettyCash] = useState(0);
  const [nonCacVouchers, setNonCacVouchers] = useState(0);
  const [pOrders, setPOrders] = useState(0);
  const [staffVouchers, setStaffVouchers] = useState(0);
  const [floatAdjust, setFloatAdjust] = useState(0);
  const [totalTakings, setTotalTakings] = useState(0);
  const [regRead, setRegRead] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [refunds, setRefunds] = useState(0);
  const [voids, setVoids] = useState(0);
  const [pettyCashNotes, setPettyCashNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [storeOptions, setStoreOptions] = useState<{ value: string, label: string }[]>([]);

  const [entryData, setEntryData] = useState({
    date: '',
    store: '',
    cashCoin: 0,
    cheques: 0,
    eftPos: 0,
    totalBanking: 0,
    pettyCash: 0,
    nonCacVouchers: 0,
    pOrders: 0,
    staffVouchers: 0,
    floatAdjust: 0,
    totalTakings: 0,
    regRead: 0,
    oversUnders: 0,
    totalCustomers: 0,
    refunds: 0,
    voids: 0,
    pettyCashNotes: '',
    daily_takings: 0 // Add this property for compatibility
  });

  const oversUnders = totalTakings - regRead;
  const totalBanking = cashCoin + cheques + eftPos;

  const manualEntryData = {
    date: date?.format('YYYY-MM-DD') || '',
    store,
    cashCoin,
    cheques,
    eftPos,
    totalBanking,
    pettyCash,
    nonCacVouchers,
    pOrders,
    staffVouchers,
    floatAdjust,
    totalTakings,
    regRead,
    oversUnders,
    totalCustomers,
    refunds,
    voids,
    pettyCashNotes,
    daily_takings: entryData.daily_takings ?? 0 // Ensure this property is always present
  };

  useEffect(() => {
    onChange({
      ...manualEntryData
    });
  }, [date, store, cashCoin, cheques, eftPos, pettyCash, nonCacVouchers, pOrders, staffVouchers, floatAdjust, totalTakings, regRead, totalCustomers, refunds, voids, pettyCashNotes]);

  // Fetch store options from backend on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stores/');
        if (!res.ok) throw new Error('Failed to fetch stores');
        const data = await res.json();
        setStoreOptions(data.map((store: { id: number, name: string }) => ({
          value: store.name,
          label: store.name
        })));
      } catch (err) {
        setStoreOptions([]);
      }
    };
    fetchStores();
  }, []);

  const equalInputStyle = { flex: 1, minWidth: '150px' };

  const handleApply = () => {
    if (!date || !store) return;
    const key = date.format('YYYY-MM-DD');
    if (!allEntries[key]) allEntries[key] = {};
    allEntries[key][store] = manualEntryData;
    setSnackbarOpen(true);
    resetForm();
  };

  const resetForm = () => {
    setCashCoin(0); setCheques(0); setEftPos(0); setPettyCash(0); setNonCacVouchers(0);
    setPOrders(0); setStaffVouchers(0); setFloatAdjust(0); setTotalTakings(0);
    setRegRead(0); setTotalCustomers(0); setRefunds(0); setVoids(0);
    setPettyCashNotes('');
  };

  const handleFileUpload = async (file: File) => {
    console.log("Entry.handleFileUpload invoked with", file.name);
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();
      // If we have daily takings data, use the first entry
      if (data.daily_takings_data && data.daily_takings_data.length > 0) {
        onChange(data.daily_takings_data[0]);
      }
      setFileUploadSuccess(true); // Show popup
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4, fontFamily: 'Roboto, sans-serif' }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Container maxWidth="md">
              <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Daily Takings Entry
                </Typography>
                <Stack direction="row" spacing={2} mb={3}>
                  <DatePicker label="Select Date" value={date} onChange={(newDate) => setDate(newDate)} slotProps={{ textField: { fullWidth: true } }} />
                  <FormControl fullWidth>
                    <InputLabel id="store-select-label">Select Store</InputLabel>
                    <Select labelId="store-select-label" value={store} label="Select Store" onChange={(e) => setStore(e.target.value)}>
                      {storeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <TextField label="Cash / Coin" type="number" value={cashCoin} onChange={(e) => setCashCoin(Number(e.target.value))} sx={equalInputStyle} />
                  <Typography fontWeight="bold" fontSize={28} color="gray" alignSelf="center">+</Typography>
                  <TextField label="Cheques" type="number" value={cheques} onChange={(e) => setCheques(Number(e.target.value))} sx={equalInputStyle} />
                  <Typography fontWeight="bold" fontSize={28} color="gray" alignSelf="center">+</Typography>
                  <TextField label="EFT POS" type="number" value={eftPos} onChange={(e) => setEftPos(Number(e.target.value))} sx={equalInputStyle} />
                  <Typography fontWeight="bold" fontSize={28} color="gray" alignSelf="center">=</Typography>
                  <TextField label="Total Banking" value={`$${totalBanking.toFixed(2)}`} InputProps={{ readOnly: true, sx: { color: 'red', fontWeight: 'bold' } }} variant="outlined" sx={{ width: 180 }} />
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <TextField label="Petty Cash" type="number" value={pettyCash} onChange={(e) => setPettyCash(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Non CAC Vouchers" type="number" value={nonCacVouchers} onChange={(e) => setNonCacVouchers(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="P/Orders" type="number" value={pOrders} onChange={(e) => setPOrders(Number(e.target.value))} sx={equalInputStyle} />
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <TextField label="Staff Vouchers" type="number" value={staffVouchers} onChange={(e) => setStaffVouchers(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Float Adj +/-" type="number" value={floatAdjust} onChange={(e) => setFloatAdjust(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Total Takings" type="number" value={totalTakings} onChange={(e) => setTotalTakings(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Reg Read" type="number" value={regRead} onChange={(e) => setRegRead(Number(e.target.value))} sx={equalInputStyle} />
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <Typography variant="caption" fontWeight="medium" color="textSecondary">Overs / Unders</Typography>
                  <Box sx={{ px: 2, py: 2, border: '1px solid #ccc', borderRadius: 1, bgcolor: '#fff', color: manualEntryData.oversUnders === 0 ? 'green' : 'red', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', width: '100%' }}>
                    ${manualEntryData.oversUnders.toFixed(2)}
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <TextField label="Total Customers" type="number" value={totalCustomers} onChange={(e) => setTotalCustomers(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Refunds" type="number" value={refunds} onChange={(e) => setRefunds(Number(e.target.value))} sx={equalInputStyle} />
                  <TextField label="Voids" type="number" value={voids} onChange={(e) => setVoids(Number(e.target.value))} sx={equalInputStyle} />
                </Stack>
                <Stack direction="row" spacing={2} mb={3}>
                  <Button variant="contained" color="primary" size="large" onClick={handleApply}>APPLY</Button>
                </Stack>
                <TextField
                  label="Petty Cash Notes"
                  multiline
                  rows={4}
                  fullWidth
                  value={pettyCashNotes}
                  onChange={(e) => setPettyCashNotes(e.target.value)}
                  placeholder="E.g. $10 for glasses, $15 delivery fee, $5 stamps"
                />
              </Paper>
            </Container>
            <Container maxWidth="md">
              <Paper elevation={2} sx={{ padding: 3, minWidth: 360 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Upload Excel File
                </Typography>
                <ExcelUploader onFileSelect={handleFileUpload} />
                
                {loading && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <CircularProgress size={24} />
                  </div>
                )}
                
                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
              </Paper>
            </Container>
          </Stack>
        </Container>
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSnackbarOpen(false)}>
            Daily takings submitted!
          </Alert>
        </Snackbar>
        <Snackbar open={fileUploadSuccess} autoHideDuration={4000} onClose={() => setFileUploadSuccess(false)}>
          <Alert severity="success" sx={{ width: '100%' }} onClose={() => setFileUploadSuccess(false)}>
            File submitted!
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default Entry;
