from rest_framework import serializers
from .models import UploadedExcel

class UploadedExcelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedExcel
        fields = ['id', 'file', 'uploaded_at']
