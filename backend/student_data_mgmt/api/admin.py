from django.contrib import admin
from .models import Student
# Register your models here.

class studentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'roll', 'city', 'Class', 'photo']
    
admin.site.register(Student, studentAdmin)