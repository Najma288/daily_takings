from django.urls import path
from .views import UploadExcelView, StoreListView

urlpatterns = [
    path('upload/', UploadExcelView.as_view(), name='upload_excel'),
    path('stores/', StoreListView.as_view(), name='store_list'),
] 