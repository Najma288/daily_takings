import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import UploadedExcel, Store, DailyTaking
from rest_framework import status
import numpy as np
import os
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
import datetime

from .serializers import UploadedExcelSerializer

class UploadExcelView(APIView):
   
    parser_classes = [MultiPartParser]
    
    def get(self, request):
        """Retrieve daily takings for a specific store and date, or all stores if 'All' is selected."""
        store_name = request.query_params.get('store')
        date = request.query_params.get('date')
        
        if not date:
            return Response(
                {"detail": "Date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if store_name and store_name.lower() == 'all':
            # Return all stores' takings for the date
            takings = DailyTaking.objects.filter(date=date)
            data = [
                {
                    "store": taking.store.name,
                    "date": taking.date,
                    "daily_takings": float(taking.amount),
                    "created_at": taking.created_at,
                    "updated_at": taking.updated_at
                }
                for taking in takings
            ]
            return Response(data, status=status.HTTP_200_OK)
        
        if not store_name:
            return Response(
                {"detail": "Store name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            store = get_object_or_404(Store, name=store_name)
            taking = get_object_or_404(DailyTaking, store=store, date=date)
            data = {
                "store": store.name,
                "date": taking.date,
                "daily_takings": float(taking.amount),  # Convert Decimal to float for JSON
                "created_at": taking.created_at,
                "updated_at": taking.updated_at
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        print("in post")
        excel_file = request.FILES.get('file')
         
        if not excel_file:
            return Response(
                {"detail": "No file uploaded."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Save the uploaded file
            uploaded_excel = UploadedExcel(file=excel_file)
            uploaded_excel.save()

            # parse the Excel file into a pandas DataFrame
            print('Received file:', excel_file)
            file_ext = os.path.splitext(excel_file.name)[1]
            
            # Read the entire Excel file first
            if file_ext == '.xls':
                df_full = pd.read_excel(excel_file, engine='xlrd', header=None)
            else:
                df_full = pd.read_excel(excel_file, header=None)
            print('Parsed DataFrame (first 10 rows):')
            print(df_full.head(10))
            
            # Extract store name from C5 (row 4, column 2 in 0-based index)
            store_name = df_full.iloc[4, 2]
            print('Extracted store name:', store_name)
            
            # Get or create the store
            store, created = Store.objects.get_or_create(name=store_name)
            
            # Extract data starting from row 11
            # Create a new DataFrame with just the dates and daily takings
            dates = df_full.iloc[10:, 0]  # Column A from row 11
            daily_takings = df_full.iloc[10:, 2]  # Column C from row 11
            
            # Combine into a new DataFrame
            df = pd.DataFrame({
                'date': dates,
                'daily_takings': daily_takings
            })
            print('Extracted daily takings DataFrame (first 10 rows):')
            print(df.head(10))
            
            # Remove rows where both date and daily_takings are NaN
            df = df.dropna(how='all')
            
            # Replace NaN and infinite values with None
            df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
            
            # Save daily takings to database
            daily_takings_objects = []
            saved_data = []
            for _, row in df.iterrows():
                try:
                    date_str = str(row['date']).strip()
                    # Skip rows where the date column contains 'Weekly' (case-insensitive)
                    if 'weekly' in date_str.lower():
                        continue

                    # Try to convert daily_takings to float
                    amount = float(row['daily_takings'])

                    # Try to parse the date (accepts several formats)
                    try:
                        date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
                    except ValueError:
                        try:
                            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            try:
                                date_obj = datetime.datetime.strptime(date_str, '%A, %d %B %Y')
                            except ValueError:
                                continue  # Skip if not a valid date

                    daily_taking = DailyTaking(
                        store=store,
                        date=date_obj.date(),
                        amount=Decimal(str(amount))
                    )
                    daily_takings_objects.append(daily_taking)
                    saved_data.append({
                        'date': date_obj.strftime('%Y-%m-%d'),
                        'store': store_name,
                        'daily_takings': amount
                    })
                except (ValueError, TypeError, Exception):
                    continue
            print(f'Prepared {len(daily_takings_objects)} daily taking objects for DB save.')
            
            # Bulk create all daily takings
            if daily_takings_objects:
                DailyTaking.objects.bulk_create(
                    daily_takings_objects,
                    ignore_conflicts=True  # Skip if entry already exists
                )
                print('Saved daily takings to database.')
            else:
                print('No daily takings to save to database.')
            
            response_data = {
                "store_name": store_name,
                "daily_takings_data": saved_data,
                "message": "Data successfully saved to database"
            }
            
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as exc:
            print(f"Excel parsing error: {exc}")
            return Response(
                {"detail": f"Error parsing Excel: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class StoreListView(APIView):
    def get(self, request):
        stores = Store.objects.all().values('id', 'name')
        return Response(list(stores))
