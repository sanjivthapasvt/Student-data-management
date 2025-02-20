from django.db import models

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