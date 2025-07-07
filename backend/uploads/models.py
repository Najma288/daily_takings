from django.db import models

class Store(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class DailyTaking(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='daily_takings')
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['store', 'date']  # Prevent duplicate entries for same store/date

    def __str__(self):
        return f"{self.store.name} - {self.date} - ${self.amount}"

class UploadedExcel(models.Model):
    file = models.FileField(upload_to='excel_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Excel upload at {self.uploaded_at}"
