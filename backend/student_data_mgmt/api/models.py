from django.db import models

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100)
    roll = models.IntegerField()
    city = models.CharField(max_length=100)
    Class = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='images/', null=True, blank=True)
    
    def __str__(self):
        return self.name