from django.db import models
import os
# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100)
    roll = models.IntegerField(unique=True)
    address = models.CharField(max_length=100)
    student_class = models.CharField(max_length=100)
    section = models.CharField(max_length=20, null=True, blank=True)
    photo = models.ImageField(upload_to='images/', null=True, blank=True)
    
    class Meta:
        ordering = ['roll', 'name']
    
    def __str__(self):
        return self.name

#remove image after deleting entry in database
    def delete(self, *args, **kwargs):
        if self.photo and os.path.isfile(self.photo.path):
            os.remove(self.photo.path)
        super().delete(*args, **kwargs)
class StudentMarks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    DSA = models.DecimalField(max_digits=5, decimal_places=2)
    Java = models.DecimalField(max_digits=5, decimal_places=2)
    Prob_and_Stats = models.DecimalField(max_digits=5, decimal_places=2)
    Web_technology = models.DecimalField(max_digits=5, decimal_places=2)
    Sad = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=6, decimal_places=2, editable=False, null=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, editable=False)
    
    def save(self, *args, **kwargs):
        from decimal import Decimal
        self.total_marks = sum([self.DSA, self.Java, self.Prob_and_Stats, self.Web_technology, self.Sad])
        self.percentage = (self.total_marks / Decimal(5)) 
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.name} - {self.percentage}"