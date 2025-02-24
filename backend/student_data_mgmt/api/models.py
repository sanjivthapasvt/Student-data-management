from django.db import models
import os
from decimal import Decimal
from django.core.validators import MinValueValidator

# Class for defining the student model
class Student(models.Model):
    name = models.CharField(max_length=100)
    roll = models.IntegerField(unique=True, validators=[MinValueValidator(1)])
    address = models.CharField(max_length=100)
    student_class = models.CharField(max_length=100)
    section = models.CharField(max_length=20, null=True, blank=True)
    photo = models.ImageField(upload_to='images/', null=True, blank=True)

    class Meta:
        ordering = ['roll', 'name']

    def __str__(self):
        return self.name

    # Remove image after deleting entry in database
    def delete(self, *args, **kwargs):
        if self.photo and hasattr(self.photo, 'path') and os.path.isfile(self.photo.path):
            os.remove(self.photo.path)
        super().delete(*args, **kwargs)


# Class for defining the student marks model
class StudentMarks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="marks")
    student_class = models.CharField(max_length=100, blank=True)
    DSA = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Java = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Prob_and_Stats = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    Web_technology = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    SAD = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    total_marks = models.DecimalField(max_digits=6, decimal_places=2, editable=False, default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, editable=False, default=0)

    class Meta:
        unique_together = ('student', 'student_class')  # Enforce one marks sheet per student per class

    def save(self, *args, **kwargs):
        self.total_marks = sum([self.DSA, self.Java, self.Prob_and_Stats, self.Web_technology, self.SAD])
        self.percentage = Decimal(self.total_marks) / Decimal(5)
        if not self.student_class and self.student:
            self.student_class = self.student.student_class
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.name} ({self.student_class}) - {self.percentage:.2f}%"
