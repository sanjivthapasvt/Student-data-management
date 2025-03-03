from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.

User = get_user_model()

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent')
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances_as_student",limit_choices_to={'groups__name': 'student'})
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances_as_teacher",limit_choices_to={'groups__name': 'teacher'})
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.student.username} - {self.date} - {self.status}" 
