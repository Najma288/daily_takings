import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

interface DailyTaking {
  store: string;
  date: string;
  daily_takings: number;
  created_at?: string;
  updated_at?: string;
}

type DisplayEntryProps = {
  data: DailyTaking;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount);
};

const DisplayEntry: React.FC<DisplayEntryProps> = ({ data }) => {
  return (
    <Paper elevation={2} sx={{ padding: 3, minWidth: 360 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Daily Taking Entry
      </Typography>
      <TableContainer>
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
              <TableCell>{data.store}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>{formatDate(data.date)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Daily Takings</TableCell>
              <TableCell>{formatCurrency(data.daily_takings)}</TableCell>
            </TableRow>
            {data.created_at && (
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>{new Date(data.created_at).toLocaleString()}</TableCell>
              </TableRow>
            )}
            {data.updated_at && (
              <TableRow>
                <TableCell>Last Updated</TableCell>
                <TableCell>{new Date(data.updated_at).toLocaleString()}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DisplayEntry;
